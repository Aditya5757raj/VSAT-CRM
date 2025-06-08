document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initDashboard();
  initForms();
  initToast();
  initUI();
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

  // Quick actions
  quickActionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const text = this.querySelector("p").textContent;
      const actions = {
        "Add Product": () => showSection("add-product"),
        "Create Job": () =>
          showToast(
            "Create Job functionality would be implemented here",
            "success"
          ),
        "Update Status": () =>
          showToast(
            "Update Status functionality would be implemented here",
            "success"
          ),
        "View Reports": () =>
          showToast(
            "View Reports functionality would be implemented here",
            "success"
          ),
      };
      if (actions[text]) actions[text]();
    });
  });

  // Search functionality
  searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      if (this.placeholder.includes("jobs")) {
        filterTable(".jobs-table tbody tr", searchTerm);
      }
    });
  });

  // Initial setup
  showSection("overview");
  animateStats();
}

function initForms() {
  const callForm = document.getElementById("callForm");
  if (!callForm) return;

  // Field validation
  function validateField(id, condition, errorMessage) {
    const input = document.getElementById(id);
    const errorDiv = document.getElementById(id + "Error");

    input.classList.toggle("input-error", !condition);
    input.classList.toggle("input-valid", condition);
    if (errorDiv) errorDiv.textContent = condition ? "" : errorMessage;
  }

  // Real-time validation
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

  document.getElementById("address").addEventListener("input", () => {
    validateField(
      "address",
      document.getElementById("address").value.trim() !== "",
      "Address is required."
    );
  });

  document
    .getElementById("productType")
    .addEventListener("change", function () {
      validateField(
        "productType",
        this.value !== "",
        "Please select a State."
      );

      const product = document.getElementById("product");
      product.innerHTML = '<option value="">-- Select Product --</option>';

      const options = {
        AC: ["1.5 Ton Split AC", "2 Ton Window AC", "Inverter AC"],
        "Washing Machine": [
          "Front Load 7kg",
          "Top Load 6.5kg",
          "Fully Automatic 8kg",
        ],
      };

      (options[this.value] || []).forEach((p) => {
        const opt = document.createElement("option");
        opt.value = opt.textContent = p;
        product.appendChild(opt);
      });
    });

  document.getElementById("product").addEventListener("change", () => {
    validateField(
      "product",
      document.getElementById("product").value !== "",
      "Please select a product."
    );
  });

  document.getElementById("serial").addEventListener("input", () => {
    validateField(
      "serial",
      document.getElementById("serial").value.trim() !== "",
      "Serial number is required."
    );
  });

  document
    .getElementById("purchaseDate")
    .addEventListener("input", function () {
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

  // Form submission
  callForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;

    // Validate all fields
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
      "address",
      document.getElementById("address").value.trim() !== "",
      "Address is required."
    );
    validateField(
      "productType",
      document.getElementById("productType").value !== "",
      "Please select a State."
    );
    validateField(
      "product",
      document.getElementById("product").value !== "",
      "Please select a product."
    );
    validateField(
      "serial",
      document.getElementById("serial").value.trim() !== "",
      "Serial number is required."
    );
    validateField(
      "purchaseDate",
      document.getElementById("purchaseDate").value !== "",
      "Purchase date is required."
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

    const customerData = {
      name: document.getElementById("fullName").value.trim(),
      mobile: document.getElementById("mobile").value.trim(),
      pin: document.getElementById("pin").value.trim(),
      locality: document.getElementById("locality").value,
      address: document.getElementById("address").value.trim(),
      callType: document.querySelector('input[name="callType"]:checked').value,
      productType: document.getElementById("productType").value,
      product: document.getElementById("product").value,
      serial: document.getElementById("serial").value.trim(),
      purchaseDate: document.getElementById("purchaseDate").value,
      comments: document.getElementById("comments").value.trim(),
      priority: document.querySelector('input[name="priority"]:checked').value,
      registrationDate: new Date().toISOString(),
    };
    console.log(customerData);
    const url = `${API_URL}/job/registerComplaint`;
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }
    try {
      const token = getCookie("token"); // ✅ Your getCookie function
      console.log("Token:", token);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Send token in header
        },
        body: JSON.stringify(customerData),
        // credentials: "include" // ❌ Remove this if you're using Authorization header
      });

      const json = await response.json();

      if (!response.ok) {
        showToast(
          `❌ ${json.message || json.error || "Something went wrong"}`,
          "error"
        );
        throw new Error(`Status ${response.status}: ${json.message}`);
      }

      showToast("Call Registered Successfully!", "success");
      console.log(json);
      resetForm();
    } catch (error) {
      console.error("Submission failed:", error.message);
    }
  });

  // Reset button
  document.getElementById("resetBtn").addEventListener("click", resetForm);

  function fetchLocality() {
    const pin = document.getElementById("pin").value.trim();
    const localityInput = document.getElementById("locality");
    const localityError = document.getElementById("localityError");

    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((response) => response.json())
        .then((data) => {
          if (data[0].Status === "Success") {
            localityInput.innerHTML =
              '<option value="">-- Select locality --</option>';
            data[0].PostOffice.forEach((po) => {
              const option = document.createElement("option");
              option.value = `${po.Name}, ${po.District}`;
              option.textContent = `${po.Name}, ${po.District}`;
              localityInput.appendChild(option);
            });
            localityError.textContent = "";
          } else {
            localityInput.innerHTML =
              '<option value="">-- No locality found --</option>';
            localityError.textContent = "No locality found for this PIN";
            showToast("No locality found for this PIN", "error");
          }
        })
        .catch(() => {
          localityInput.innerHTML =
            '<option value="">-- Error fetching locality --</option>';
          localityError.textContent = "Error fetching locality!";
          showToast("Error fetching locality!", "error");
        });
    } else {
      localityInput.innerHTML =
        '<option value="">-- Select locality --</option>';
      localityError.textContent = "";
    }
  }

  function resetForm() {
    callForm.reset();
    document.getElementById("locality").innerHTML =
      '<option value="">-- Select locality --</option>';
    document.getElementById("product").innerHTML =
      '<option value="">-- Select Product --</option>';

    document.querySelectorAll(".error-message").forEach((error) => {
      error.textContent = "";
    });

    document.querySelectorAll("input, select, textarea").forEach((input) => {
      input.classList.remove("input-error", "input-valid");
    });
  }
}

function initUI() {
  // Table actions
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const icon = this.querySelector("i");
      const row = this.closest("tr");
      const jobId = row.querySelector(".job-id").textContent;

      if (icon.classList.contains("fa-eye")) {
        showToast(`Viewing details for job ${jobId}`, "success");
      } else if (icon.classList.contains("fa-edit")) {
        showToast(`Editing job ${jobId}`, "success");
      }
    });
  });

  // Product actions
  document.querySelectorAll(".product-actions .btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productName =
        this.closest(".product-card").querySelector("h5").textContent;
      const action = this.textContent.includes("View Details")
        ? "Viewing"
        : "Creating job";
      showToast(`${action} details for ${productName}`, "success");
    });
  });

  // Other UI elements
  document.querySelectorAll(".more-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      showToast("More options menu would appear here", "success")
    );
  });

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
function showToast(message, type = "success", duration = 3000) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Prevent duplicate toast messages
  if (
    Array.from(container.children).some(
      (toast) => toast.textContent === message
    )
  ) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type === "error" ? "error" : "success"}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 10);

  setTimeout(() => {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => {
      toast.remove();
      if (!container.childElementCount) container.remove();
    });
  }, duration);
}

function filterTable(selector, searchTerm) {
  document.querySelectorAll(selector).forEach((row) => {
    row.style.display = row.textContent.toLowerCase().includes(searchTerm)
      ? ""
      : "none";
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
    "Product registered",
    "Technician assigned",
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
      document.getElementById("product").innerHTML =
        '<option value="">-- Select Product --</option>';

      document
        .querySelectorAll(".error-message")
        .forEach((el) => (el.textContent = ""));
      document.querySelectorAll("input, select, textarea").forEach((el) => {
        el.classList.remove("input-error", "input-valid");
      });
    }
  },
};

//input validation of state in complaint/job sheet


function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = `toast ${type}`;  // Assuming your CSS styles for .toast .success and .error
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}


