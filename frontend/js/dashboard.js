document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initDashboard();
  initForms();
  initToast();
  initUI();
  initJobSearch();
});

function initDashboard() {
  const navItems = document.querySelectorAll(".nav-item");
  const submenuTriggers = document.querySelectorAll(".submenu-trigger");
  const quickActionBtns = document.querySelectorAll(".quick-action-btn");
  const searchInputs = document.querySelectorAll(".search-box input");

  // Section navigation
  function showSection(sectionId) {
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.toggle("active", section.id === sectionId);
    });

    navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.section === sectionId);
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = this.dataset.section;
      if (sectionId) showSection(sectionId);
    });
  });

  // Submenu handling
  submenuTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      if (e.target.classList.contains("submenu-toggle")) {
        const parentLi = this.closest(".has-submenu");
        parentLi.classList.toggle("active");

        document.querySelectorAll(".has-submenu").forEach((item) => {
          if (item !== parentLi) item.classList.remove("active");
        });

        const icon = this.querySelector(".submenu-toggle");
        icon.classList.toggle("fa-chevron-up");
        icon.classList.toggle("fa-chevron-down");
        e.stopPropagation();
      }
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".has-submenu").forEach((item) => {
      item.classList.remove("active");
    });
  });

  // Updated Quick actions - removed product-related actions
  quickActionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.dataset.action;
      const actions = {
        "register-complaint": () => showSection("complaint"),
        "view-jobs": () => showSection("job-history"),
        "view-reports": () =>
          showToast("View Reports functionality would be implemented here", "success"),
      };
      if (actions[action]) actions[action]();
    });
  });

  // Search functionality
  searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      if (this.id === "jobTableSearch") {
        filterJobsTable(searchTerm);
      }
    });
  });

  // Initial setup
  showSection("overview");
  animateStats();
}

// Initialize job search functionality
function initJobSearch() {
  const customerSearchForm = document.getElementById("customerSearchForm");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const createNewJobBtn = document.getElementById("createNewJobBtn");

  if (!customerSearchForm) return;

  // Customer search form validation and submission
  customerSearchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const customerName = document.getElementById("searchCustomerName").value.trim();
    const mobile = document.getElementById("searchMobile").value.trim();
    const pincode = document.getElementById("searchPincode").value.trim();

    // Validate search fields
    let isValid = true;

    if (!customerName) {
      document.getElementById("searchCustomerNameError").textContent = "Customer name is required";
      isValid = false;
    } else {
      document.getElementById("searchCustomerNameError").textContent = "";
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      document.getElementById("searchMobileError").textContent = "Enter a valid 10-digit mobile number";
      isValid = false;
    } else {
      document.getElementById("searchMobileError").textContent = "";
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      document.getElementById("searchPincodeError").textContent = "Enter a valid 6-digit pincode";
      isValid = false;
    } else {
      document.getElementById("searchPincodeError").textContent = "";
    }

    if (!isValid) {
      showToast("Please fill all search fields correctly", "error");
      return;
    }

    // Show loading indicator
    showLoadingIndicator(true);
    hideNoResultsMessage();
    hideJobsTable();

    try {
      console.log("The job fuction is calling the api")
      const jobs = await searchCustomerJobs(customerName, mobile, pincode);
      
      if (jobs && jobs.length > 0) {
        displayJobsInTable(jobs);
        showToast(`Found ${jobs.length} job(s) for the customer`, "success");
      } else {
        showNoResultsMessage();
        showToast("No jobs found for the specified customer details", "error");
      }
    } catch (error) {
      console.error("Error searching customer jobs:", error);
      showToast("Error searching for customer jobs. Please try again.", "error");
      showNoResultsMessage();
    } finally {
      showLoadingIndicator(false);
    }
  });

  // Clear search functionality
  clearSearchBtn.addEventListener("click", function () {
    customerSearchForm.reset();
    document.querySelectorAll(".error-message").forEach(error => error.textContent = "");
    hideJobsTable();
    showNoResultsMessage();
    showToast("Search cleared", "success");
  });

  // Create new job button
  createNewJobBtn.addEventListener("click", function () {
    showSection("complaint");
    showToast("Redirected to complaint registration", "success");
  });

  // Initialize with no results message
  showNoResultsMessage();
}

// Function to search customer jobs via API
async function searchCustomerJobs(customerName, mobile, pincode) {
  const token = getCookie("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  console.log("Token"+token)
  const searchParams = {
    customerName: customerName,
    mobile: mobile,
    pincode: pincode
  };

  try {
    const response = await fetch(`${API_URL}/job/fetchcustomerJobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to search customer jobs");
    }

    const data = await response.json();
    console.log(data.jobs);
    return data.jobs || [];
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Function to display jobs in the table
function displayJobsInTable(jobs) {
  const tableBody = document.getElementById("jobsTableBody");
  const tableContainer = document.getElementById("jobsTableContainer");
  
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = "";

  jobs.forEach((job, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="job-id">#${job.job_id}</span></td>
      <td>
        <div class="product-cell">
          <p class="product-name">${job.full_name || 'N/A'}</p>
          <p class="serial-number">Mobile: ${job.mobile_number || 'N/A'}</p>
          <p class="serial-number">Pin: ${job.pin_code || 'N/A'}</p>
        </div>
      </td>
      <td>${job.call_type || job.serviceType || 'N/A'}</td>
      <td><span class="badge ${getStatusBadgeClass(job.status)}">${job.status || 'Pending'}</span></td>
      <td><span class="badge ${getPriorityBadgeClass(job.priority)}">${job.priority || 'Normal'}</span></td>
      <td>${job.technician || 'Not Assigned'}</td>
      <td>
        <div class="date-cell">
          <i class="fas fa-calendar"></i>
          ${formatDate(job.created_at)}
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="viewJobDetails('${job.jobId || job._id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn" onclick="editJob('${job.jobId || job._id}')">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Show the table
  tableContainer.style.display = "block";
}

// Helper functions for job display
function getStatusBadgeClass(status) {
  const statusClasses = {
    'completed': 'badge-success',
    'in progress': 'badge-primary',
    'pending': 'badge-warning',
    'cancelled': 'badge-danger'
  };
  return statusClasses[status?.toLowerCase()] || 'badge-warning';
}

function getPriorityBadgeClass(priority) {
  const priorityClasses = {
    'urgent': 'badge-danger',
    'high': 'badge-danger',
    'medium': 'badge-warning',
    'normal': 'badge-success',
    'low': 'badge-success'
  };
  return priorityClasses[priority?.toLowerCase()] || 'badge-success';
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
}

// UI helper functions for job search
function showLoadingIndicator(show) {
  const indicator = document.getElementById("loadingIndicator");
  if (indicator) {
    indicator.style.display = show ? "block" : "none";
  }
}

function showNoResultsMessage() {
  const message = document.getElementById("noResultsMessage");
  if (message) {
    message.style.display = "block";
  }
}

function hideNoResultsMessage() {
  const message = document.getElementById("noResultsMessage");
  if (message) {
    message.style.display = "none";
  }
}

function hideJobsTable() {
  const tableContainer = document.getElementById("jobsTableContainer");
  if (tableContainer) {
    tableContainer.style.display = "none";
  }
}

// Job action functions
function viewJobDetails(jobId) {
  showToast(`Viewing details for job ${jobId}`, "success");
  // Implement job details view functionality
}

function editJob(jobId) {
  showToast(`Editing job ${jobId}`, "success");
  // Implement job editing functionality
}

// Filter jobs table based on search term
function filterJobsTable(searchTerm) {
  const tableRows = document.querySelectorAll("#jobsTableBody tr");
  tableRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Enhanced form initialization with product storage functionality
function initForms() {
  const callForm = document.getElementById("callForm");
  if (!callForm) return;

  // Field validation functions
  function validateField(id, condition, errorMessage) {
    const input = document.getElementById(id);
    const errorDiv = document.getElementById(id + "Error");

    input.classList.toggle("input-error", !condition);
    input.classList.toggle("input-valid", condition);
    if (errorDiv) errorDiv.textContent = condition ? "" : errorMessage;
  }

  // Real-time validation for complaint form
  document.getElementById("fullName").addEventListener("input", () => {
    validateField(
      "fullName",
      document.getElementById("fullName").value.trim() !== "",
      "Full name is required."
    );
  });

  document.getElementById("mobile").addEventListener("input", () => {
    validateField(
      "mobile",
      /^\d{10}$/.test(document.getElementById("mobile").value.trim()),
      "Enter a valid 10-digit mobile number."
    );
  });

  document.getElementById("pin").addEventListener("input", function () {
    const pin = this.value.trim();
    validateField(
      "pin",
      /^\d{6}$/.test(pin),
      "Enter a valid 6-digit pin code."
    );
    if (pin.length === 6) fetchLocality();
  });

  document.getElementById("locality").addEventListener("change", () => {
    validateField(
      "locality",
      document.getElementById("locality").value !== "",
      "Please select a locality."
    );
  });

  // Enhanced address validation
  document.getElementById("houseNo").addEventListener("input", () => {
    validateField(
      "houseNo",
      document.getElementById("houseNo").value.trim() !== "",
      "House/Flat number is required."
    );
  });

  document.getElementById("street").addEventListener("input", () => {
    validateField(
      "street",
      document.getElementById("street").value.trim() !== "",
      "Street/Area is required."
    );
  });

  document.getElementById("stateSelect").addEventListener("change", function () {
    validateField("stateSelect", this.value !== "", "Please select a State.");
  });

  // Product validation
  document.getElementById("productType").addEventListener("input", () => {
    validateField(
      "productType",
      document.getElementById("productType").value.trim() !== "",
      "Product type is required."
    );
  });

  document.getElementById("productName").addEventListener("input", () => {
    validateField(
      "productName",
      document.getElementById("productName").value.trim() !== "",
      "Product name is required."
    );
  });

  document.getElementById("modelNo").addEventListener("input", () => {
    validateField(
      "modelNo",
      document.getElementById("modelNo").value.trim() !== "",
      "Model number is required."
    );
  });

  document.getElementById("manufacturer").addEventListener("input", () => {
    validateField(
      "manufacturer",
      document.getElementById("manufacturer").value.trim() !== "",
      "Manufacturer is required."
    );
  });

  document.getElementById("purchaseDate").addEventListener("input", function () {
    const selectedDate = new Date(this.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      showToast("Date of Purchase cannot be in the future.", "error");
      this.value = "";
    }
    validateField(
      "purchaseDate",
      this.value !== "",
      "Purchase date is required."
    );
  });

  document.getElementById("warrantyExpiry").addEventListener("input", function () {
    validateField(
      "warrantyExpiry",
      this.value !== "",
      "Warranty expiry date is required."
    );
  });

  document.getElementById("availableDate").addEventListener("input", function () {
    const selectedDate = new Date(this.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      showToast("Available date cannot be in the past.", "error");
      this.value = "";
    }
    validateField(
      "availableDate",
      this.value !== "",
      "Available date is required."
    );
  });

  document.getElementById("preferredTime").addEventListener("change", function () {
    validateField(
      "preferredTime",
      this.value !== "",
      "Please select a preferred time slot."
    );
  });

  // Radio button validation
  document.querySelectorAll('input[name="callType"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const callTypeError = document.getElementById("callTypeError");
      callTypeError.textContent = document.querySelector(
        'input[name="callType"]:checked'
      )
        ? ""
        : "Please select a call type.";
    });
  });

  document.querySelectorAll('input[name="priority"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const priorityError = document.getElementById("priorityError");
      priorityError.textContent = document.querySelector(
        'input[name="priority"]:checked'
      )
        ? ""
        : "Please select call priority.";
    });
  });

  // Enhanced form submission with product storage
  callForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;

    // Validate all customer fields
    validateField(
      "fullName",
      document.getElementById("fullName").value.trim() !== "",
      "Full name is required."
    );
    validateField(
      "mobile",
      /^\d{10}$/.test(document.getElementById("mobile").value.trim()),
      "Enter a valid 10-digit mobile number."
    );
    validateField(
      "pin",
      /^\d{6}$/.test(document.getElementById("pin").value.trim()),
      "Enter a valid 6-digit pin code."
    );
    validateField(
      "locality",
      document.getElementById("locality").value !== "",
      "Please select a locality."
    );
    validateField(
      "houseNo",
      document.getElementById("houseNo").value.trim() !== "",
      "House/Flat number is required."
    );
    validateField(
      "street",
      document.getElementById("street").value.trim() !== "",
      "Street/Area is required."
    );
    validateField(
      "stateSelect",
      document.getElementById("stateSelect").value !== "",
      "Please select a State."
    );

    // Validate all product fields
    validateField(
      "productType",
      document.getElementById("productType").value.trim() !== "",
      "Product type is required."
    );
    validateField(
      "productName",
      document.getElementById("productName").value.trim() !== "",
      "Product name is required."
    );
    validateField(
      "modelNo",
      document.getElementById("modelNo").value.trim() !== "",
      "Model number is required."
    );
    validateField(
      "serial",
      document.getElementById("serial").value.trim() !== "",
      "Serial number is required."
    );
    validateField(
      "manufacturer",
      document.getElementById("manufacturer").value.trim() !== "",
      "Manufacturer is required."
    );
    validateField(
      "purchaseDate",
      document.getElementById("purchaseDate").value !== "",
      "Purchase date is required."
    );
    validateField(
      "warrantyExpiry",
      document.getElementById("warrantyExpiry").value !== "",
      "Warranty expiry date is required."
    );
    validateField(
      "availableDate",
      document.getElementById("availableDate").value !== "",
      "Available date is required."
    );
    validateField(
      "preferredTime",
      document.getElementById("preferredTime").value !== "",
      "Please select a preferred time slot."
    );

    // Check radio buttons
    if (!document.querySelector('input[name="callType"]:checked')) {
      document.getElementById("callTypeError").textContent =
        "Please select a call type.";
      isValid = false;
    }
    if (!document.querySelector('input[name="priority"]:checked')) {
      document.getElementById("priorityError").textContent =
        "Please select call priority.";
      isValid = false;
    }

    if (!isValid) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }
    const callType = document.querySelector('input[name="callType"]:checked')?.value || '';
    const priority = document.querySelector('input[name="priority"]:checked')?.value || '';

    // Get other field values
    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const houseNo = document.getElementById("houseNo").value.trim();
    const street = document.getElementById("street").value.trim();
    const landmark = document.getElementById("landmark").value.trim();
    const pin = document.getElementById("pin").value.trim();
    const locality = document.getElementById("locality").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("stateSelect").value;

    const productType = document.getElementById("productType").value.trim();
    const productName = document.getElementById("productName").value.trim();
    const modelNo = document.getElementById("modelNo").value.trim();
    const serial = document.getElementById("serial").value.trim();
    const manufacturer = document.getElementById("manufacturer").value.trim();
    const purchaseDate = document.getElementById("purchaseDate").value;
    const warrantyExpiry = document.getElementById("warrantyExpiry").value;

    const availableDate = document.getElementById("availableDate").value;
    const preferredTime = document.getElementById("preferredTime").value;
    const comments = document.getElementById("comments").value.trim();
    const   registrationDate=Date.now();
    // Create object to send
    const CustomerComplaintData = {
        callType,
        fullName,
        mobile,
        houseNo,
        street,
        landmark,
        pin,
        locality,
        productType,
        city,
        state, 
        availableDate,
        preferredTime,
        comments,
        priority,
        registrationDate
    };
    // Prepare product data for storage
    const productData = {
        productType,
        productName,
        modelNo,
        serial,
        manufacturer,
        purchaseDate,
        warrantyExpiry,
    };
    console.log(productData)

   // Start collecting toast messages
  const toastMessages = [];
  let finalToastType = "success";

  try {
    const token = getCookie("token");
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    // Try to add product
    try {
      await addProductToDatabase(productData, token);
      toastMessages.push("✅ Product saved successfully!");
    } catch (productError) {
      console.warn("Product save warning:", productError.message);
      toastMessages.push(
        productError.message.includes("already exists") 
          ? "ℹ️ Product already exists" 
          : "⚠️ Product not saved (continuing with complaint)"
      );
      if (!productError.message.includes("already exists")) {
        finalToastType = "warning";
      }
    }

    // Register complaint
    const response = await fetch(`${API_URL}/job/registerComplaint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(CustomerComplaintData),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || json.error || "Complaint registration failed");
    }

    toastMessages.push("✅ Complaint registered successfully!");
    resetForm();

  } catch (error) {
    console.error("Submission failed:", error.message);
    toastMessages.push(`❌ Error: ${error.message}`);
    finalToastType = "error";
  } finally {
    showToast(toastMessages.join('\n'), finalToastType);
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }
})

  // Reset button
  document.getElementById("resetBtn").addEventListener("click", resetForm);

  // Function to add product to database
  async function addProductToDatabase(productData, token) {
    const productUrl = `${API_URL}/product/addProduct`;
    
    const response = await fetch(productUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || json.error || "Failed to save product");
    }

    return json;
  }

  // Fixed function to fetch locality based on PIN code
  function fetchLocality() {
    const pin = document.getElementById("pin").value.trim();
    const localityInput = document.getElementById("locality");
    const cityInput = document.getElementById("city");
    const localityError = document.getElementById("localityError");

    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
      // Show loading state
      localityInput.innerHTML = '<option value="">Loading...</option>';
      localityError.textContent = "";

      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.length > 0 && data[0].Status === "Success" && data[0].PostOffice) {
            localityInput.innerHTML = '<option value="">-- Select locality --</option>';
            
            // Set city from first post office
            if (data[0].PostOffice.length > 0) {
              cityInput.value = data[0].PostOffice[0].District || "";
            }
            
            // Add unique localities to avoid duplicates
            const uniqueLocalities = new Set();
            data[0].PostOffice.forEach((po) => {
              if (po.Name && po.District) {
                const localityValue = `${po.Name}, ${po.District}`;
                if (!uniqueLocalities.has(localityValue)) {
                  uniqueLocalities.add(localityValue);
                  const option = document.createElement("option");
                  option.value = localityValue;
                  option.textContent = localityValue;
                  localityInput.appendChild(option);
                }
              }
            });
            
            if (localityInput.children.length === 1) {
              localityInput.innerHTML = '<option value="">-- No locality found --</option>';
              localityError.textContent = "No locality found for this PIN";
              showToast("No locality found for this PIN", "error");
            } else {
              localityError.textContent = "";
            }
          } else {
            localityInput.innerHTML = '<option value="">-- No locality found --</option>';
            cityInput.value = "";
            localityError.textContent = "No locality found for this PIN";
            showToast("No locality found for this PIN", "error");
          }
        })
        .catch((error) => {
          console.error("Error fetching locality:", error);
          localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
          cityInput.value = "";
          localityError.textContent = "Error fetching locality. Please try again.";
          showToast("Error fetching locality. Please check your internet connection.", "error");
        });
    } else {
      localityInput.innerHTML = '<option value="">-- Select locality --</option>';
      cityInput.value = "";
      localityError.textContent = "";
    }
  }

  // Enhanced reset form function
  function resetForm() {
    callForm.reset();
    document.getElementById("locality").innerHTML =
      '<option value="">-- Select locality --</option>';
    document.getElementById("city").value = "";

    document.querySelectorAll(".error-message").forEach((error) => {
      error.textContent = "";
    });

    document.querySelectorAll("input, select, textarea").forEach((input) => {
      input.classList.remove("input-error", "input-valid");
    });

    // showToast("Form reset successfully", "success");
  }
}

function initUI() {
  // Notification button
  const notificationBtn = document.querySelector(".notification-btn");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () =>
      showToast("Notifications panel would open here", "success")
    );
  }

  simulateRealTimeUpdates();
}

function initToast() {
  // Toast container will be created when needed
}

// Utility Functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// function showToast(message, type = "success", duration = 3000) {
//   let container = document.querySelector(".toast-container");
//   if (!container) {
//     container = document.createElement("div");
//     container.className = "toast-container";
//     document.body.appendChild(container);
//   }

//   // Prevent duplicate toast messages
//   if (
//     Array.from(container.children).some(
//       (toast) => toast.textContent === message
//     )
//   ) {
//     return;
//   }

//   const toast = document.createElement("div");
//   toast.className = `custom-toast ${type === "error" ? "error" : "success"}`;
//   toast.textContent = message;

//   container.appendChild(toast);
//   setTimeout(() => toast.classList.add("visible"), 10);

//   setTimeout(() => {
//     toast.classList.remove("visible");
//     toast.addEventListener("transitionend", () => {
//       toast.remove();
//       if (!container.childElementCount) container.remove();
//     });
//   }, duration);
// }

function showToast(message, type = "success", duration = 3000) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Prevent duplicate toast messages (case-insensitive comparison)
  if (Array.from(container.children).some(toast => {
    const toastMsg = toast.querySelector('.toast-message')?.textContent || toast.textContent;
    return toastMsg.trim() === message.trim();
  })) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`; // Now supports 'warning' type
  
  // Create message element (for multi-line support)
  const messageEl = document.createElement("div");
  messageEl.className = "toast-message";
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "toast-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => {
    dismissToast(toast, container);
  });
  toast.appendChild(closeBtn);

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 10);

  // Auto-dismiss if duration > 0
  if (duration > 0) {
    setTimeout(() => dismissToast(toast, container), duration);
  }
}

// Helper function for dismissal
function dismissToast(toast, container) {
  toast.classList.remove("visible");
  toast.addEventListener("transitionend", () => {
    toast.remove();
    if (container && !container.childElementCount) {
      container.remove();
    }
  });
}

function animateStats() {
  document.querySelectorAll(".stat-value").forEach((stat) => {
    const finalValue = parseInt(stat.textContent);
    let currentValue = 0;
    const increment = finalValue / 20;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= finalValue) {
        stat.textContent = finalValue;
        clearInterval(timer);
      } else {
        stat.textContent = Math.floor(currentValue);
      }
    }, 50);
  });
}

function simulateRealTimeUpdates() {
  const activities = [
    "New service request received",
    "Job status updated",
    "Customer complaint registered",
    "Technician assigned",
    "Product added to database",
  ];

  setInterval(() => {
    const randomActivity =
      activities[Math.floor(Math.random() * activities.length)];
    addRecentActivity(randomActivity);
  }, 30000);
}

function addRecentActivity(activity) {
  const activityList = document.querySelector(".activity-list");
  if (!activityList) return;

  const newActivity = document.createElement("div");
  newActivity.className = "activity-item";
  newActivity.innerHTML = `
        <div class="activity-dot blue"></div>
        <div class="activity-content">
            <p class="activity-title">${activity}</p>
            <p class="activity-subtitle">System notification</p>
        </div>
        <span class="activity-time">Just now</span>
    `;

  activityList.insertBefore(newActivity, activityList.firstChild);
  if (activityList.children.length > 5) {
    activityList.removeChild(activityList.lastChild);
  }
}

// Public API
window.DashboardApp = {
  showSection: function (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      document
        .querySelectorAll(".section")
        .forEach((s) => s.classList.remove("active"));
      section.classList.add("active");

      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.section === sectionId);
      });
    }
  },
  showToast,
  resetForm: function () {
    const callForm = document.getElementById("callForm");
    if (callForm) {
      callForm.reset();
      document.getElementById("locality").innerHTML =
        '<option value="">-- Select locality --</option>';
      document.getElementById("city").value = "";

      document
        .querySelectorAll(".error-message")
        .forEach((el) => (el.textContent = ""));
      document.querySelectorAll("input, select, textarea").forEach((el) => {
        el.classList.remove("input-error", "input-valid");
      });
    }
  },
};