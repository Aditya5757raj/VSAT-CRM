document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initDashboard();
  initForms();
  initToast();
  initUI();
  initJobSearch();
  initMenuToggle(); // Initialize menu toggle functionality
  initServiceCenters(); // Initialize service centers functionality
  initServicePartners(); // Initialize service partners functionality
  initManageEngineers(); // Initialize manage engineers functionality
  initEngineerSections(); // Initialize engineer sections functionality
  initJobTransfer(); // Initialize job transfer functionality
  initDeliveryChallan(); // Initialize delivery challan functionality
  initDashboardCounterClicks(); // Initialize dashboard counter clicks
  hookViewButtons(); // Hook view buttons for job details

});

// Redirect to login if not authenticated
// if (!sessionStorage.getItem("isLoggedIn")) {
//   window.location.href = "index.html";
// }


// User dropdown functionality
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }

// Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const userProfile = document.querySelector('.user-profile');
            const dropdown = document.getElementById('userDropdown');
            
            if (!userProfile.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });

// Logout functionality
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("index.html");
  });
}

// Change password link functionality
const changePasswordLink = document.getElementById("changePasswordLink");
if (changePasswordLink) {
  changePasswordLink.addEventListener("click", function(e) {
    e.preventDefault();
    showSection("user-management"); // or the correct section ID
  });
}


// Show toast notification
function showFieldError(errorId, message) {
            const errorElement = document.getElementById(errorId);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }


const sampleComplaints = [
  {
    complaintId: 'IN170625000001',
    reportedOn: '2025-06-17',
    productName: 'Wipro Smart LED',
    productType: 'Lighting',
    dateOfPurchase: '2025-05-30',
    callType: 'Installation',
    symptoms: 'Need setup help',
    assignedTo: 'Wipro Support',
    status: 'NEW',
    assignedEngineer: '',
    customerName: 'John Doe',
    address: '14B, MG Road, Delhi',
    mobile: '9876543210',
    failure: '',
    actionDate: '',
    resolution: '',
    resolutionDetails: '',
    doc1: '',
    doc2: '',
    doc3: '',
    serial: 'WIP123456'
  },
  {
    complaintId: 'RE170625000002',
    reportedOn: '2025-06-17',
    productName: 'Voltas AC 1.5 Ton',
    productType: 'Air Conditioner',
    dateOfPurchase: '2024-11-10',
    callType: 'Repair',
    symptoms: 'Not cooling',
    assignedTo: 'CoolingCare Services',
    status: 'Pending',
    assignedEngineer: 'Raj Verma',
    customerName: 'Jane Smith',
    address: 'Sector 21, Navi Mumbai',
    mobile: '9876543211',
    failure: 'Compressor failure',
    actionDate: '2025-06-19',
    resolution: 'Replaced compressor',
    resolutionDetails: 'New compressor installed under warranty',
    doc1: 'invoice.pdf',
    doc2: 'report.pdf',
    doc3: 'signature.png',
    serial: 'AC7890VS'
  },
  {
    complaintId: 'MA170625000003',
    reportedOn: '2025-06-18',
    productName: 'Kent RO Water Purifier',
    productType: 'Water Purifier',
    dateOfPurchase: '2024-12-01',
    callType: 'Maintenance',
    symptoms: 'Filter change required',
    assignedTo: 'WaterCare Services',
    status: 'In Progress',
    assignedEngineer: 'Anita Roy',
    customerName: 'Suresh Kumar',
    address: 'Apt 204, Orchid Green, Bengaluru',
    mobile: '9823456712',
    failure: 'Filter clogged',
    actionDate: '',
    resolution: '',
    resolutionDetails: '',
    doc1: '',
    doc2: '',
    doc3: '',
    serial: 'KENT112358'
  }
];

localStorage.setItem("complaints", JSON.stringify(sampleComplaints));
let currentVisibleSectionId = '';


function viewComplaintDetail(complaintId) {
  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
  const complaint = complaints.find(c => c.complaintId === complaintId);

  const grid = document.getElementById("complaintDetailGrid");
  const container = document.getElementById("complaintDetailCard");

  if (!complaint) {
    grid.innerHTML = `<p style="color:red;">Complaint not found.</p>`;
    container.style.display = "block";
    return;
  }

  function card(label, value) {
    return `
      <div class="detail-card">
        <strong>${label}</strong>
        <span>${value || '-'}</span>
      </div>
    `;
  }

  grid.innerHTML = `
    ${card("Reported on", complaint.reportedOn)}
    ${card("Product", complaint.productName)}
    ${card("Product type", complaint.productType)}
    ${card("Date of purchase", complaint.dateOfPurchase)}
    ${card("Complaint type", complaint.callType)}
    ${card("Issue type", complaint.symptoms)}
    ${card("Assigned to", complaint.assignedTo)}
    ${card("Status", complaint.status)}
    ${card("Assigned engineer", complaint.assignedEngineer)}
    ${card("Customer name", complaint.customerName)}
    ${card("Address", complaint.address)}
    ${card("Mobile", complaint.mobile)}
    ${card("Failure", complaint.failure)}
    ${card("Action date", complaint.actionDate)}
    ${card("Resolution", complaint.resolution)}
    ${card("Resolution details", complaint.resolutionDetails)}
    ${card("Doc1", complaint.doc1)}
    ${card("Doc2", complaint.doc2)}
    ${card("Doc3", complaint.doc3)}
    ${card("Serial no.", complaint.serial)}
  `;

  // 🔄 Move the complaintDetailCard under the right section
  const targetRow = document.querySelector(`[onclick="viewComplaintDetail('${complaintId}')"]`);
  if (targetRow) {
    const section = targetRow.closest("section");
    if (section) {
      section.appendChild(container); // Move the detail card into that section
    }
  }

  container.style.display = "block";
  container.scrollIntoView({ behavior: 'smooth' });
}



function closeComplaintDetail() {
  const container = document.getElementById("complaintDetailCard");
  const grid = document.getElementById("complaintDetailGrid");
  if (container) container.style.display = "none";
  if (grid) grid.innerHTML = ""; // Optional: Clear content
}


function hookViewButtons() {
  document.querySelectorAll(".view-complaint-btn").forEach(btn => {
    btn.removeEventListener("click", btn._handler || (() => {}));
    btn._handler = () => {
      const complaintId = btn.dataset.id;
      viewComplaintDetail(complaintId);
    };
    btn.addEventListener("click", btn._handler);
  });
}


// 🔁 Hook view buttons after each complaint table is rendered
function renderJobsTable(jobs) {
  const tableBody = document.getElementById("jobsTableBody");
  tableBody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.complaintId}</td>
      <td>${job.customerName}</td>
      <td>${job.callType}</td>
      <td>${job.status}</td>
      <td>${job.priority}</td>
      <td>${job.assignedEngineer || '-'}</td>
      <td>${job.createdDate}</td>
      <td>
        <button class="action-btn view-complaint-btn" data-id="${job.complaintId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  hookViewButtons();
}

function renderUnassignedComplaints(jobs) {
  const tableBody = document.getElementById("unassignedComplaintsTable");
  tableBody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.complaintId}</td>
      <td>${job.customerName}</td>
      <td>${job.productName}</td>
      <td>${job.callType}</td>
      <td>${job.status}</td>
      <td>
        <button class="action-btn view-complaint-btn" data-id="${job.complaintId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  hookViewButtons();
}

function renderPendingComplaints(jobs) {
  const tableBody = document.getElementById("pendingComplaintsTable");
  tableBody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.complaintId}</td>
      <td>${job.customerName}</td>
      <td>${job.productName}</td>
      <td>${job.callType}</td>
      <td>${job.status}</td>
      <td>
        <button class="action-btn view-complaint-btn" data-id="${job.complaintId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  hookViewButtons();
}

function renderRepairComplaints(jobs) {
  const tableBody = document.getElementById("repairComplaintsTable");
  tableBody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.complaintId}</td>
      <td>${job.customerName}</td>
      <td>${job.productName}</td>
      <td>${job.callType}</td>
      <td>${job.status}</td>
      <td>
        <button class="action-btn view-complaint-btn" data-id="${job.complaintId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  hookViewButtons();
}

function renderCompletedComplaints(jobs) {
  const tableBody = document.getElementById("completedComplaintsTable");
  tableBody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.complaintId}</td>
      <td>${job.customerName}</td>
      <td>${job.productName}</td>
      <td>${job.callType}</td>
      <td>${job.status}</td>
      <td>
        <button class="action-btn view-complaint-btn" data-id="${job.complaintId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  hookViewButtons();
}

function renderCancelledComplaints(jobs) {
  const tableBody = document.getElementById("cancelledComplaintsTable");
  tableBody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.complaintId}</td>
      <td>${job.customerName}</td>
      <td>${job.productName}</td>
      <td>${job.callType}</td>
      <td>${job.status}</td>
      <td>
        <button class="action-btn view-complaint-btn" data-id="${job.complaintId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  hookViewButtons();
}

function renderTransferHistory(jobs) {
  const tableBody = document.getElementById("transferHistoryTable");
  tableBody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.complaintId}</td>
      <td>${job.fromPincode}</td>
      <td>${job.toPincode}</td>
      <td>${job.transferReason}</td>
      <td>${job.status}</td>
      <td>
        <button class="action-btn view-complaint-btn" data-id="${job.complaintId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  hookViewButtons();
}

window.addEventListener("DOMContentLoaded", () => {
  hookViewButtons();
});


// NEW: Initialize job transfer functionality
function initJobTransfer() {
  const jobTransferForm = document.getElementById("jobTransferForm");
  const findServiceCentersBtn = document.getElementById("findServiceCentersBtn");
  const resetTransferBtn = document.getElementById("resetTransferBtn");

  if (!jobTransferForm) return;

  // Form validation and submission
  jobTransferForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const fromPincode = document.getElementById("fromPincode").value.trim();
    const toPincode = document.getElementById("toPincode").value.trim();
    const complaintNumber = document.getElementById("complaintNumber").value.trim();
    const transferReason = document.getElementById("transferReason").value.trim();

    let isValid = true;

    // Validate from pincode
    if (!fromPincode || !/^\d{6}$/.test(fromPincode)) {
      document.getElementById("fromPincodeError").textContent = "Enter a valid 6-digit pincode";
      isValid = false;
    } else {
      document.getElementById("fromPincodeError").textContent = "";
    }

    // Validate to pincode
    if (!toPincode || !/^\d{6}$/.test(toPincode)) {
      document.getElementById("toPincodeError").textContent = "Enter a valid 6-digit pincode";
      isValid = false;
    } else {
      document.getElementById("toPincodeError").textContent = "";
    }

    // Check if pincodes are different
    if (fromPincode === toPincode && fromPincode && toPincode) {
      document.getElementById("toPincodeError").textContent = "Target pincode must be different from current pincode";
      isValid = false;
    }

    // Validate complaint number
    if (!complaintNumber) {
      document.getElementById("complaintNumberError").textContent = "Complaint number is required";
      isValid = false;
    } else {
      document.getElementById("complaintNumberError").textContent = "";
    }

    // Validate transfer reason
    if (!transferReason || transferReason.length < 10) {
      document.getElementById("transferReasonError").textContent = "Please provide a detailed reason (minimum 10 characters)";
      isValid = false;
    } else {
      document.getElementById("transferReasonError").textContent = "";
    }

    if (!isValid) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    // Prepare transfer data
    const transferData = {
      fromPincode,
      toPincode,
      complaintNumber,
      transferReason
    };

    // Simulate API call
    showToast("Job transfer request submitted successfully!", "success");
    
    // Reset form
    jobTransferForm.reset();
    
    // Clear all error messages
    document.querySelectorAll(".error-message").forEach(error => {
      error.textContent = "";
    });

    console.log("Transfer data:", transferData);
  });

  // Find service centers button
  if (findServiceCentersBtn) {
    findServiceCentersBtn.addEventListener("click", function() {
      const toPincode = document.getElementById("toPincode").value.trim();
      
      if (!toPincode) {
        showToast("Please enter target pincode first", "warning");
        return;
      }

      if (!/^\d{6}$/.test(toPincode)) {
        showToast("Please enter a valid 6-digit pincode", "error");
        return;
      }

      showToast(`Searching for service centers in area: ${toPincode}`, "success");
      // Here you would typically make an API call to find service centers
    });
  }

  // Reset button
  if (resetTransferBtn) {
    resetTransferBtn.addEventListener("click", function() {
      jobTransferForm.reset();
      
      // Clear all error messages
      document.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
      });
      
      showToast("Form cleared", "success");
    });
  }
}

// NEW: Initialize delivery challan functionality
function initDeliveryChallan() {
  const deliveryChallanForm = document.getElementById("deliveryChallanForm");
  const saveChallanDraftBtn = document.getElementById("saveChallanDraftBtn");
  const resetChallanBtn = document.getElementById("resetChallanBtn");

  if (!deliveryChallanForm) return;

  // Form validation and submission
  deliveryChallanForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const complaintNumber = document.getElementById("challanComplaintNumber").value.trim();
    const serviceCharges = document.getElementById("serviceCharges").value.trim();
    const assignedEngineer = document.getElementById("assignedEngineer").value;
    const quantityRequired = document.getElementById("quantityRequired").value.trim();
    const goodsDescription = document.getElementById("goodsDescription").value.trim();

    let isValid = true;

    // Validate complaint number
    if (!complaintNumber) {
      document.getElementById("challanComplaintNumberError").textContent = "Complaint number is required";
      isValid = false;
    } else {
      document.getElementById("challanComplaintNumberError").textContent = "";
    }

    // Validate service charges
    if (!serviceCharges || parseFloat(serviceCharges) < 0) {
      document.getElementById("serviceChargesError").textContent = "Enter valid service charges";
      isValid = false;
    } else {
      document.getElementById("serviceChargesError").textContent = "";
    }

    // Validate assigned engineer
    if (!assignedEngineer) {
      document.getElementById("assignedEngineerError").textContent = "Please select an engineer";
      isValid = false;
    } else {
      document.getElementById("assignedEngineerError").textContent = "";
    }

    // Validate quantity
    if (!quantityRequired || parseInt(quantityRequired) < 1) {
      document.getElementById("quantityRequiredError").textContent = "Enter valid quantity (minimum 1)";
      isValid = false;
    } else {
      document.getElementById("quantityRequiredError").textContent = "";
    }

    // Validate goods description
    if (!goodsDescription || goodsDescription.length < 10) {
      document.getElementById("goodsDescriptionError").textContent = "Please provide detailed description (minimum 10 characters)";
      isValid = false;
    } else {
      document.getElementById("goodsDescriptionError").textContent = "";
    }

    if (!isValid) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    // Prepare challan data
    const challanData = {
      complaintNumber,
      serviceCharges: parseFloat(serviceCharges),
      assignedEngineer,
      quantityRequired: parseInt(quantityRequired),
      goodsDescription
    };

    // Simulate API call for generating challan
    showToast("Delivery challan generated successfully!", "success");
    
    // Reset form
    deliveryChallanForm.reset();
    
    // Clear all error messages
    document.querySelectorAll(".error-message").forEach(error => {
      error.textContent = "";
    });

    console.log("Challan data:", challanData);
  });

  // Save as draft button
  if (saveChallanDraftBtn) {
    saveChallanDraftBtn.addEventListener("click", function() {
      const complaintNumber = document.getElementById("challanComplaintNumber").value.trim();
      
      if (!complaintNumber) {
        showToast("Please enter complaint number to save draft", "warning");
        return;
      }

      showToast("Challan saved as draft", "success");
      // Here you would save the current form data as draft
    });
  }

  // Reset button
  if (resetChallanBtn) {
    resetChallanBtn.addEventListener("click", function() {
      deliveryChallanForm.reset();
      
      // Clear all error messages
      document.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
      });
      
      showToast("Form cleared", "success");
    });
  }
}

// NEW: Initialize menu toggle functionality
function initMenuToggle() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const navItems = document.querySelectorAll(".nav-item[data-section]");

  if (!menuToggle || !sidebar || !mainContent) return;

  // Toggle menu visibility
  menuToggle.addEventListener("click", function() {
    const isHidden = sidebar.classList.contains("hidden");
    
    if (isHidden) {
      // Show sidebar
      sidebar.classList.remove("hidden");
      mainContent.classList.remove("expanded");
      menuToggle.querySelector("i").className = "fas fa-bars";
    } else {
      // Hide sidebar
      sidebar.classList.add("hidden");
      mainContent.classList.add("expanded");
      menuToggle.querySelector("i").className = "fas fa-times";
    }
  });

  // Auto-hide menu when navigation item is clicked (on smaller screens)
  navItems.forEach(item => {
    item.addEventListener("click", function() {
      // Only auto-hide on smaller screens
      if (window.innerWidth <= 1024) {
        sidebar.classList.add("hidden");
        mainContent.classList.add("expanded");
        menuToggle.querySelector("i").className = "fas fa-times";
      }
    });
  });

  // Handle window resize
  window.addEventListener("resize", function() {
    if (window.innerWidth > 1024) {
      // On larger screens, always show sidebar
      sidebar.classList.remove("hidden");
      mainContent.classList.remove("expanded");
      menuToggle.querySelector("i").className = "fas fa-bars";
    } else {
      // On smaller screens, start with hidden sidebar
      sidebar.classList.add("hidden");
      mainContent.classList.add("expanded");
      menuToggle.querySelector("i").className = "fas fa-times";
    }
  });

  // Initialize based on screen size
  if (window.innerWidth <= 1024) {
    sidebar.classList.add("hidden");
    mainContent.classList.add("expanded");
    menuToggle.querySelector("i").className = "fas fa-times";
  }
}


// NEW: Initialize Service Centers functionality
function initServiceCenters() {
  const searchBtn = document.getElementById("searchServiceCentersBtn");
  const pinCodeInput = document.getElementById("serviceCenterPinCode");
  const tabBtns = document.querySelectorAll(".tab-btn");

  if (!searchBtn || !pinCodeInput) return;

  // Search service centers by pin code
  searchBtn.addEventListener("click", function() {
    const pinCode = pinCodeInput.value.trim();
    
    if (!pinCode) {
      showToast("Please enter a pin code", "error");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      showToast("Please enter a valid 6-digit pin code", "error");
      return;
    }

    // Simulate search functionality
    showToast(`Searching service centers for pin code: ${pinCode}`, "success");
    
    // Here you would typically make an API call to search service centers
    // For now, we'll just show a success message
  });

  // Handle Enter key in pin code input
  pinCodeInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  // Handle tab switching for job status
  tabBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      // Remove active class from all tabs
      tabBtns.forEach(tab => tab.classList.remove("active"));
      
      // Add active class to clicked tab
      this.classList.add("active");
      
      const status = this.dataset.status;
      showToast(`Showing ${status} jobs`, "success");
      
      // Here you would filter the table based on the selected status
    });
  });
}

// NEW: Initialize Service Partners functionality
function initServicePartners() {
  const addPartnerForm = document.getElementById("addServicePartnerForm");
  const pinCodeInput = document.getElementById("pinCodeInput");
  const addPinCodeBtn = document.getElementById("addPinCodeBtn");
  const pinCodesDisplay = document.getElementById("pinCodesDisplay");
  const viewAllPartnersBtn = document.getElementById("viewAllPartnersBtn");
  const cancelPartnerBtn = document.getElementById("cancelPartnerBtn");

  if (!addPartnerForm) return;

  let selectedPinCodes = [];

  // Add pin code functionality
  function addPinCode() {
    const pinCode = pinCodeInput.value.trim();
    
    if (!pinCode) {
      showToast("Please enter a pin code", "error");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      showToast("Please enter a valid 6-digit pin code", "error");
      return;
    }

    if (selectedPinCodes.includes(pinCode)) {
      showToast("Pin code already added", "warning");
      return;
    }

    selectedPinCodes.push(pinCode);
    updatePinCodesDisplay();
    pinCodeInput.value = "";
    showToast(`Pin code ${pinCode} added`, "success");
  }

  // Update pin codes display
  function updatePinCodesDisplay() {
    pinCodesDisplay.innerHTML = "";
    
    selectedPinCodes.forEach(pinCode => {
      const tag = document.createElement("div");
      tag.className = "pin-code-tag";
      tag.innerHTML = `
        ${pinCode}
        <span class="remove-pin" data-pin="${pinCode}">&times;</span>
      `;
      pinCodesDisplay.appendChild(tag);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll(".remove-pin").forEach(btn => {
      btn.addEventListener("click", function() {
        const pinToRemove = this.dataset.pin;
        selectedPinCodes = selectedPinCodes.filter(pin => pin !== pinToRemove);
        updatePinCodesDisplay();
        showToast(`Pin code ${pinToRemove} removed`, "success");
      });
    });
  }

  // Add pin code button click
  if (addPinCodeBtn) {
    addPinCodeBtn.addEventListener("click", addPinCode);
  }

  // Add pin code on Enter key
  if (pinCodeInput) {
    pinCodeInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addPinCode();
      }
    });
  }

  // Form validation and submission
  addPartnerForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const partnerName = document.getElementById("partnerName").value.trim();
    const partnerMobile = document.getElementById("partnerMobile").value.trim();
    const partnerPassword = document.getElementById("partnerPassword").value;
    const partnerConfirmPassword = document.getElementById("partnerConfirmPassword").value;
    const serviceType = document.getElementById("serviceType").value;

    let isValid = true;

    // Validate partner name
    if (!partnerName) {
      document.getElementById("partnerNameError").textContent = "Partner name is required";
      isValid = false;
    } else {
      document.getElementById("partnerNameError").textContent = "";
    }

    // Validate mobile number
    if (!partnerMobile || !/^\d{10}$/.test(partnerMobile)) {
      document.getElementById("partnerMobileError").textContent = "Enter a valid 10-digit mobile number";
      isValid = false;
    } else {
      document.getElementById("partnerMobileError").textContent = "";
    }

    // Validate password
    if (!partnerPassword || partnerPassword.length < 6) {
      document.getElementById("partnerPasswordError").textContent = "Password must be at least 6 characters";
      isValid = false;
    } else {
      document.getElementById("partnerPasswordError").textContent = "";
    }

    // Validate confirm password
    if (partnerPassword !== partnerConfirmPassword) {
      document.getElementById("partnerConfirmPasswordError").textContent = "Passwords do not match";
      isValid = false;
    } else {
      document.getElementById("partnerConfirmPasswordError").textContent = "";
    }

    // Validate pin codes
    if (selectedPinCodes.length === 0) {
      document.getElementById("operatingPinCodesError").textContent = "At least one pin code is required";
      isValid = false;
    } else {
      document.getElementById("operatingPinCodesError").textContent = "";
    }

    // Validate service type
    if (!serviceType) {
      document.getElementById("serviceTypeError").textContent = "Please select a service type";
      isValid = false;
    } else {
      document.getElementById("serviceTypeError").textContent = "";
    }

    if (!isValid) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    // Prepare partner data
    const partnerData = {
      partnerName,
      partnerMobile,
      partnerPassword,
      operatingPinCodes: selectedPinCodes,
      serviceType
    };

    // Simulate API call
    showToast("Service partner added successfully!", "success");
    
    // Reset form
    addPartnerForm.reset();
    selectedPinCodes = [];
    updatePinCodesDisplay();
    
    // Clear all error messages
    document.querySelectorAll(".error-message").forEach(error => {
      error.textContent = "";
    });

    console.log("Partner data:", partnerData);
  });

  // View all partners button
  if (viewAllPartnersBtn) {
    viewAllPartnersBtn.addEventListener("click", function() {
      showToast("View All Partners functionality would be implemented here", "success");
    });
  }

  // Cancel button
  if (cancelPartnerBtn) {
    cancelPartnerBtn.addEventListener("click", function() {
      addPartnerForm.reset();
      selectedPinCodes = [];
      updatePinCodesDisplay();
      
      // Clear all error messages
      document.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
      });
      
      showToast("Form cleared", "success");
    });
  }
}

// NEW: Initialize Manage Engineers functionality
function initManageEngineers() {
  const engineerTabs = document.querySelectorAll(".engineer-tabs .tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const addEngineerForm = document.getElementById("addEngineerForm");
  const locationInput = document.getElementById("locationInput");
  const addLocationBtn = document.getElementById("addLocationBtn");
  const locationsDisplay = document.getElementById("locationsDisplay");
  const fileInput = document.getElementById("fileInput");
  const browseFilesBtn = document.getElementById("browseFilesBtn");
  const fileUploadArea = document.getElementById("fileUploadArea");

  let selectedLocations = [];
  let uploadedFiles = [];

  // Tab switching functionality
  engineerTabs.forEach(tab => {
    tab.addEventListener("click", function() {
      const targetTab = this.dataset.tab;
      
      // Remove active class from all tabs and contents
      engineerTabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(content => content.classList.remove("active"));
      
      // Add active class to clicked tab
      this.classList.add("active");
      
      // Show corresponding content
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // Location management
  function addLocation() {
    const location = locationInput.value.trim();
    
    if (!location) {
      showToast("Please enter a location", "error");
      return;
    }

    if (selectedLocations.includes(location)) {
      showToast("Location already added", "warning");
      return;
    }

    selectedLocations.push(location);
    updateLocationsDisplay();
    locationInput.value = "";
    showToast(`Location "${location}" added`, "success");
  }

  function updateLocationsDisplay() {
    if (!locationsDisplay) return;
    
    locationsDisplay.innerHTML = "";
    
    selectedLocations.forEach(location => {
      const tag = document.createElement("div");
      tag.className = "location-tag";
      tag.innerHTML = `
        ${location}
        <span class="remove-location" data-location="${location}">&times;</span>
      `;
      locationsDisplay.appendChild(tag);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll(".remove-location").forEach(btn => {
      btn.addEventListener("click", function() {
        const locationToRemove = this.dataset.location;
        selectedLocations = selectedLocations.filter(loc => loc !== locationToRemove);
        updateLocationsDisplay();
        showToast(`Location "${locationToRemove}" removed`, "success");
      });
    });
  }

  // Add location button click
  if (addLocationBtn) {
    addLocationBtn.addEventListener("click", addLocation);
  }

  // Add location on Enter key
  if (locationInput) {
    locationInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addLocation();
      }
    });
  }

  // File upload functionality
  if (browseFilesBtn && fileInput) {
    browseFilesBtn.addEventListener("click", function() {
      fileInput.click();
    });

    fileInput.addEventListener("change", function(e) {
      const files = Array.from(e.target.files);
      uploadedFiles = [...uploadedFiles, ...files];
      updateUploadedFilesDisplay();
      showToast(`${files.length} file(s) selected`, "success");
    });
  }

  // Drag and drop functionality
  if (fileUploadArea) {
    fileUploadArea.addEventListener("dragover", function(e) {
      e.preventDefault();
      this.style.borderColor = "#2563eb";
    });

    fileUploadArea.addEventListener("dragleave", function(e) {
      e.preventDefault();
      this.style.borderColor = "#d1d5db";
    });

    fileUploadArea.addEventListener("drop", function(e) {
      e.preventDefault();
      this.style.borderColor = "#d1d5db";
      
      const files = Array.from(e.dataTransfer.files);
      uploadedFiles = [...uploadedFiles, ...files];
      updateUploadedFilesDisplay();
      showToast(`${files.length} file(s) uploaded`, "success");
    });
  }

  function updateUploadedFilesDisplay() {
    const uploadedFilesDiv = document.getElementById("uploadedFiles");
    if (!uploadedFilesDiv) return;

    uploadedFilesDiv.innerHTML = "";
    
    uploadedFiles.forEach((file, index) => {
      const fileDiv = document.createElement("div");
      fileDiv.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #f8fafc; border-radius: 4px; margin-bottom: 4px;";
      fileDiv.innerHTML = `
        <span style="font-size: 14px;">${file.name}</span>
        <button type="button" onclick="removeFile(${index})" style="background: none; border: none; color: #dc2626; cursor: pointer;">
          <i class="fas fa-times"></i>
        </button>
      `;
      uploadedFilesDiv.appendChild(fileDiv);
    });
  }

  // Make removeFile function global
  window.removeFile = function(index) {
    uploadedFiles.splice(index, 1);
    updateUploadedFilesDisplay();
    showToast("File removed", "success");
  };

  // Form submission
  if (addEngineerForm) {
    addEngineerForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const engineerName = document.getElementById("engineerName").value.trim();
      const engineerMobile = document.getElementById("engineerMobile").value.trim();
      const engineerEmail = document.getElementById("engineerEmail").value.trim();
      const employeeId = document.getElementById("employeeId").value.trim();

      let isValid = true;

      // Validate engineer name
      if (!engineerName) {
        document.getElementById("engineerNameError").textContent = "Engineer name is required";
        isValid = false;
      } else {
        document.getElementById("engineerNameError").textContent = "";
      }

      // Validate mobile number
      if (!engineerMobile || !/^\d{10}$/.test(engineerMobile)) {
        document.getElementById("engineerMobileError").textContent = "Enter a valid 10-digit mobile number";
        isValid = false;
      } else {
        document.getElementById("engineerMobileError").textContent = "";
      }

      // Validate locations
      if (selectedLocations.length === 0) {
        document.getElementById("operatingLocationsError").textContent = "At least one operating location is required";
        isValid = false;
      } else {
        document.getElementById("operatingLocationsError").textContent = "";
      }

      if (!isValid) {
        showToast("Please fill all required fields correctly", "error");
        return;
      }

      // Prepare engineer data
      const engineerData = {
        engineerName,
        engineerMobile,
        engineerEmail,
        employeeId,
        operatingLocations: selectedLocations,
        attachments: uploadedFiles.map(file => file.name)
      };

      // Simulate API call
      showToast("Engineer added successfully!", "success");
      
      // Reset form
      addEngineerForm.reset();
      selectedLocations = [];
      uploadedFiles = [];
      updateLocationsDisplay();
      updateUploadedFilesDisplay();
      
      // Clear all error messages
      document.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
      });

      console.log("Engineer data:", engineerData);
    });
  }

  // Cancel button
  const cancelEngineerBtn = document.getElementById("cancelEngineerBtn");
  if (cancelEngineerBtn) {
    cancelEngineerBtn.addEventListener("click", function() {
      addEngineerForm.reset();
      selectedLocations = [];
      uploadedFiles = [];
      updateLocationsDisplay();
      updateUploadedFilesDisplay();
      
      // Clear all error messages
      document.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
      });
      
      showToast("Form cleared", "success");
    });
  }
}
//adi
// NEW: Initialize Engineer Sections functionality
function initEngineerSections() {
  // Current Assignment functionality
  const refreshAssignmentBtn = document.getElementById("refreshAssignmentBtn");
  const markCompleteBtn = document.getElementById("markCompleteBtn");
  const viewDetailsBtn = document.getElementById("viewDetailsBtn");
  const updateStatusBtn = document.getElementById("updateStatusBtn");

  if (refreshAssignmentBtn) {
    refreshAssignmentBtn.addEventListener("click", function() {
      showToast("Assignment refreshed", "success");
    });
  }

  if (markCompleteBtn) {
    markCompleteBtn.addEventListener("click", function() {
      showToast("Job marked as complete", "success");
    });
  }

  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener("click", function() {
      showToast("Viewing job details", "success");
    });
  }

  if (updateStatusBtn) {
    updateStatusBtn.addEventListener("click", function() {
      showSection("update-status");
    });
  }

  // Update Status functionality
  const jobSelect = document.getElementById("jobSelect");
  const selectedJobDetails = document.getElementById("selectedJobDetails");
  const updateJobStatusForm = document.getElementById("updateJobStatusForm");

  if (jobSelect) {
    jobSelect.addEventListener("change", function() {
      if (this.value) {
        selectedJobDetails.style.display = "block";
        showToast(`Selected job: ${this.options[this.selectedIndex].text}`, "success");
      } else {
        selectedJobDetails.style.display = "none";
      }
    });
  }

  if (updateJobStatusForm) {
    updateJobStatusForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const jobStatus = document.querySelector('input[name="jobStatus"]:checked')?.value;
      const completionPercentage = document.getElementById("completionPercentage").value;
      const timeSpent = document.getElementById("timeSpent").value;
      const workCompleted = document.getElementById("workCompleted").value;
      const issuesEncountered = document.getElementById("issuesEncountered").value;

      if (!jobStatus) {
        showToast("Please select a job status", "error");
        return;
      }

      const statusData = {
        jobStatus,
        completionPercentage,
        timeSpent,
        workCompleted,
        issuesEncountered
      };

      showToast("Job status updated successfully!", "success");
      console.log("Status update data:", statusData);
    });
  }

  // Request Parts functionality
  const partsJobSelect = document.getElementById("partsJobSelect");
  const partsJobDetails = document.getElementById("partsJobDetails");
  const addPartBtn = document.getElementById("addPartBtn");
  const submitPartsRequestBtn = document.getElementById("submitPartsRequestBtn");
  const newRequestBtn = document.getElementById("newRequestBtn");

  // Parts tabs functionality
  const partsTabs = document.querySelectorAll(".parts-tabs .tab-btn");
  const partsTabContents = document.querySelectorAll("#request-parts .tab-content");

  partsTabs.forEach(tab => {
    tab.addEventListener("click", function() {
      const targetTab = this.dataset.tab;
      
      // Remove active class from all tabs and contents
      partsTabs.forEach(t => t.classList.remove("active"));
      partsTabContents.forEach(content => content.classList.remove("active"));
      
      // Add active class to clicked tab
      this.classList.add("active");
      
      // Show corresponding content
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  if (partsJobSelect) {
    partsJobSelect.addEventListener("change", function() {
      if (this.value) {
        partsJobDetails.style.display = "block";
        showToast(`Selected job: ${this.options[this.selectedIndex].text}`, "success");
      } else {
        partsJobDetails.style.display = "none";
      }
    });
  }

  if (addPartBtn) {
    addPartBtn.addEventListener("click", function() {
      showToast("Add Part functionality would open a modal here", "success");
    });
  }

  if (submitPartsRequestBtn) {
    submitPartsRequestBtn.addEventListener("click", function() {
      const requestUrgency = document.getElementById("requestUrgency").value;
      const deliveryLocation = document.getElementById("deliveryLocation").value;
      const requestReason = document.getElementById("requestReason").value;

      if (!requestUrgency || !deliveryLocation) {
        showToast("Please fill all required fields", "error");
        return;
      }

      showToast("Parts request submitted successfully!", "success");
    });
  }

  if (newRequestBtn) {
    newRequestBtn.addEventListener("click", function() {
      // Switch to new request tab
      partsTabs.forEach(t => t.classList.remove("active"));
      partsTabContents.forEach(content => content.classList.remove("active"));
      
      document.querySelector('[data-tab="new-request"]').classList.add("active");
      document.getElementById("new-request").classList.add("active");
    });
  }
}

// Global functions for engineer management
window.editEngineer = function(engineerId) {
  showToast(`Editing engineer: ${engineerId}`, "success");
};

window.viewEngineerJobs = function(engineerId) {
  showToast(`Viewing jobs for engineer: ${engineerId}`, "success");
};

window.removePart = function(button) {
  const row = button.closest("tr");
  const partName = row.cells[0].textContent;
  row.remove();
  showToast(`Removed part: ${partName}`, "success");
};

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

  // Updated Quick actions - added new service center action
  quickActionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.dataset.action;
      const actions = {
        "register-complaint": () => showSection("complaint"),
        "view-jobs": () => showSection("job-history"),
        "view-service-centers": () => showSection("list-service-centers"),
        "add-engineer": () => showSection("add-engineer"),
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

  // Make showSection globally available
  window.showSection = showSection;
}

// Initialize dashboard counter clicks
// This function allows clicking on dashboard counters to navigate to specific sections
function initDashboardCounterClicks() {
  const counterMap = {
    customers: "job-history",
    active: "pending-complaints",
    completed: "complete-complaints",
    pending: "unassigned-complaints"
  };

  document.querySelectorAll(".clickable-counter").forEach(card => {
    card.addEventListener("click", () => {
      const counter = card.dataset.counter;
      const sectionId = counterMap[counter];
      if (sectionId) {
        document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
        document.getElementById(sectionId).classList.add("active");

        // Optional: scroll into view
        document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
      }
    });
  });
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
  console.log("Token" + token)
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

// NEW: Service center action functions
function viewServiceCenterDetails(centerId) {
  showToast(`Viewing details for service center: ${centerId}`, "success");
  // Implement service center details view functionality
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
      "Warranty is required."
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
      "Warranty is required."
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
    const registrationDate = Date.now();
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
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    try {
      const token = getCookie("token");
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;

      // Try to add product
      try {
        await addProductToDatabase(productData, token);
        toastMessages.push("Product saved successfully!");
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

      toastMessages.push("Complaint registered successfully!");
      resetForm();

    } catch (error) {
      console.error("Submission failed:", error.message);
      toastMessages.push(`❌ Error: ${error.message}`);
      finalToastType = "error";
    } finally {
      showToast(toastMessages.join('\n'), finalToastType);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
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
  // function fetchLocality() {
  //   const pin = document.getElementById("pin").value.trim();
  //   const localityInput = document.getElementById("locality");
  //   const cityInput = document.getElementById("city");
  //   const localityError = document.getElementById("localityError");

  //   if (pin.length === 6 && /^\d{6}$/.test(pin)) {
  //     // Show loading state
  //     localityInput.innerHTML = '<option value="">Loading...</option>';
  //     localityError.textContent = "";

  //     fetch(`https://api.postalpincode.in/pincode/${pin}`)
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  //         if (data && data.length > 0 && data[0].Status === "Success" && data[0].PostOffice) {
  //           localityInput.innerHTML = '<option value="">-- Select locality --</option>';

  //           // Set city from first post office
  //           if (data[0].PostOffice.length > 0) {
  //             cityInput.value = data[0].PostOffice[0].District || "";
  //           }

  //           // Add unique localities to avoid duplicates
  //           const uniqueLocalities = new Set();
  //           data[0].PostOffice.forEach((po) => {
  //             if (po.Name && po.District) {
  //               const localityValue = `${po.Name}, ${po.District}`;
  //               if (!uniqueLocalities.has(localityValue)) {
  //                 uniqueLocalities.add(localityValue);
  //                 const option = document.createElement("option");
  //                 option.value = localityValue;
  //                 option.textContent = localityValue;
  //                 localityInput.appendChild(option);
  //               }
  //             }
  //           });

  //           if (localityInput.children.length === 1) {
  //             localityInput.innerHTML = '<option value="">-- No locality found --</option>';
  //             localityError.textContent = "No locality found for this PIN";
  //             showToast("No locality found for this PIN", "error");
  //           } else {
  //             localityError.textContent = "";
  //           }
  //         } else {
  //           localityInput.innerHTML = '<option value="">-- No locality found --</option>';
  //           cityInput.value = "";
  //           localityError.textContent = "No locality found for this PIN";
  //           showToast("No locality found for this PIN", "error");
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching locality:", error);
  //         localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
  //         cityInput.value = "";
  //         localityError.textContent = "Error fetching locality. Please try again.";
  //         showToast("Error fetching locality. Please check your internet connection.", "error");
  //       });
  //   } else {
  //     localityInput.innerHTML = '<option value="">-- Select locality --</option>';
  //     cityInput.value = "";
  //     localityError.textContent = "";
  //   }
  // }

  function fetchLocality() {
  const pin = document.getElementById("pin").value.trim();
  const localityInput = document.getElementById("locality");
  const cityInput = document.getElementById("city");
  const stateSelect = document.getElementById("stateSelect");
  const stateVisible = document.getElementById("stateVisible");
  const localityError = document.getElementById("localityError");
  const stateSelectError = document.getElementById("stateSelectError");

  if (pin.length === 6 && /^\d{6}$/.test(pin)) {
    localityInput.innerHTML = '<option value="">Loading...</option>';
    localityError.textContent = "";
    stateSelectError.textContent = "";
    cityInput.value = "";
    stateSelect.value = "";
    stateVisible.value = "";

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

          const postOffices = data[0].PostOffice;

          // Set city
          if (postOffices.length > 0) {
            cityInput.value = postOffices[0].District || "";
          }

          // Populate localities
          const uniqueLocalities = new Set();
          postOffices.forEach((po) => {
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

          // Set state
          const stateName = postOffices[0].State?.toUpperCase();
          let foundState = false;
          for (let i = 0; i < stateSelect.options.length; i++) {
            const optionText = stateSelect.options[i].text.toUpperCase();
            if (optionText.includes(stateName)) {
              stateSelect.selectedIndex = i;
              stateVisible.value = stateSelect.options[i].text;
              foundState = true;
              break;
            }
          }

          if (!foundState) {
            stateSelectError.textContent = "State not found in dropdown.";
            stateVisible.value = "";
            showToast("State not matched in the dropdown list.", "error");
          }

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
          stateSelect.value = "";
          stateVisible.value = "";
          localityError.textContent = "No locality found for this PIN";
          showToast("No locality found for this PIN", "error");
        }
      })
      .catch((error) => {
        console.error("Error fetching locality:", error);
        localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
        cityInput.value = "";
        stateSelect.value = "";
        stateVisible.value = "";
        localityError.textContent = "Error fetching locality. Please try again.";
        showToast("Error fetching locality. Please check your internet connection.", "error");
      });
  } else {
    localityInput.innerHTML = '<option value="">-- Select locality --</option>';
    cityInput.value = "";
    stateSelect.value = "";
    stateVisible.value = "";
    localityError.textContent = "";
    stateSelectError.textContent = "";
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

document.addEventListener('DOMContentLoaded', function () {
    // === Unassigned Complaints ===
    const assignSelectedBtn = document.querySelector('#unassigned-complaints .btn-primary:last-of-type');
    const unassignedResetBtn = document.querySelector('#unassigned-complaints .btn-outline');
    const unassignedSection = document.querySelector('#unassigned-complaints');

    if (assignSelectedBtn) {
        assignSelectedBtn.addEventListener('click', function () {
            const selectedCheckboxes = unassignedSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`${selectedCount} complaint(s) assigned successfully!`, 'success');
            } else {
                showToast('Please select at least one complaint to assign.', 'warning');
            }
        });
    }

    if (unassignedResetBtn) {
        unassignedResetBtn.addEventListener('click', function () {
            const inputs = unassignedSection.querySelectorAll('.form-group input');
            const selects = unassignedSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Unassigned filters reset.', 'success');
        });
    }
    
    // === Pending Complaints ===
    const bulkUpdateBtn = document.querySelector('#pending-complaints .btn-primary:last-of-type');
    const pendingResetBtn = document.querySelector('#pending-complaints .btn-outline');
    const pendingSection = document.querySelector('#pending-complaints');

    if (bulkUpdateBtn) {
        bulkUpdateBtn.addEventListener('click', function () {
            const selectedCheckboxes = pendingSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`${selectedCount} complaint(s) updated successfully!`, 'success');
            } else {
                showToast('Please select at least one complaint to update.', 'warning');
            }
        });
    }

    if (pendingResetBtn) {
        pendingResetBtn.addEventListener('click', function () {
            const inputs = pendingSection.querySelectorAll('.form-group input');
            const selects = pendingSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Pending filters reset.', 'success');
        });
    }

    // === Repair Complaints ===
    const repairPartsBtn = document.querySelector('#repair-complaints .btn-primary:last-of-type');
    const repairResetBtn = document.querySelector('#repair-complaints .btn-outline');
    const repairSection = document.querySelector('#repair-complaints');

    if (repairPartsBtn) {
        repairPartsBtn.addEventListener('click', function () {
            const selectedCheckboxes = repairSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`Parts requested for ${selectedCount} repair job(s)!`, 'success');
            } else {
                showToast('Please select at least one repair job for parts request.', 'warning');
            }
        });
    }

    if (repairResetBtn) {
        repairResetBtn.addEventListener('click', function () {
            const inputs = repairSection.querySelectorAll('.form-group input');
            const selects = repairSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Repair filters reset.', 'success');
        });
    }

    // === Complete Complaints ===
    const generateReportBtn = document.querySelector('#complete-complaints .btn-primary:last-of-type');
    const completeResetBtn = document.querySelector('#complete-complaints .btn-outline');
    const completeSection = document.querySelector('#complete-complaints');

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function () {
            const selectedCheckboxes = completeSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`Report generated for ${selectedCount} completed job(s)!`, 'success');
            } else {
                showToast('Generating report for all completed jobs...', 'info');
            }
        });
    }

    if (completeResetBtn) {
        completeResetBtn.addEventListener('click', function () {
            const inputs = completeSection.querySelectorAll('.form-group input');
            const selects = completeSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Complete filters reset.', 'success');
        });
    }

    // === Cancelled Complaints ===
    const analysisReportBtn = document.querySelector('#cancelled-complaints .btn-primary:last-of-type');
    const cancelledResetBtn = document.querySelector('#cancelled-complaints .btn-outline');
    const cancelledSection = document.querySelector('#cancelled-complaints');

    if (analysisReportBtn) {
        analysisReportBtn.addEventListener('click', function () {
            showToast('Cancellation analysis report generated!', 'success');
        });
    }

    if (cancelledResetBtn) {
        cancelledResetBtn.addEventListener('click', function () {
            const inputs = cancelledSection.querySelectorAll('.form-group input');
            const selects = cancelledSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Cancelled filters reset.', 'success');
        });
    }

    // === Common Action Buttons (View, Update, etc.) ===
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function () {
            const action = this.getAttribute('title');
            const row = this.closest('tr');
            const complaintId = row.querySelector('.job-id')?.textContent || 'N/A';

            switch (action) {
                case 'View':
                    showToast(`Viewing details for ${complaintId}`, 'info');
                    break;
                case 'Update':
                    showToast(`Updating status for ${complaintId}`, 'success');
                    break;
                case 'Download Report':
                    showToast(`Downloading report for ${complaintId}`, 'success');
                    break;
                case 'Reopen':
                    showToast(`Reopening complaint ${complaintId}`, 'warning');
                    break;
                case 'Assign':
                    showToast(`Assigning complaint ${complaintId} to technician`, 'success');
                    break;
                default:
                    showToast(`${action} action performed for ${complaintId}`, 'info');
            }
        });
    });

    // === Select All Checkboxes ===
    document.querySelectorAll('thead input[type="checkbox"]').forEach(selectAll => {
        selectAll.addEventListener('change', function () {
            const table = this.closest('table');
            const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    });
});
// refresh button js 
$(document).ready(function () {
  const headerRefreshBtn = $('#headerRefreshBtn');
  const pageTransition = $('#pageTransition');
  const fullPageLoader = $('#fullPageLoader');
  const confirmModal = $('#confirmModal');
  let formModified = false;

  // 1. Track form changes
  $('form input, form textarea, form select').on('input change', function () {
    formModified = true;
    const key = $(this).attr('name');
    if (key) localStorage.setItem(`form-${key}`, $(this).val());
  });

  // 2. Restore form data on load
  $('form input, form textarea, form select').each(function () {
    const key = $(this).attr('name');
    const saved = localStorage.getItem(`form-${key}`);
    if (key && saved !== null) $(this).val(saved);
  });

  // 3. Handle Refresh Button
  headerRefreshBtn.click(function () {
    if (formModified) {
      showToast('<i class="fas fa-exclamation-triangle"></i> You have unsaved changes!', 'warning');

      setTimeout(() => {
        // Ensure flex layout for proper centering
        confirmModal.css('display', 'flex').hide().fadeIn(200);
      }, 300);
    } else {
      startRefresh();
    }
  });

  // 4. Handle Modal Buttons
  $('#confirmYes').click(function () {
    confirmModal.fadeOut(200);
    localStorage.clear();
    startRefresh();
  });

  $('#confirmNo').click(function () {
    confirmModal.fadeOut(200);
    showToast('<i class="fas fa-info-circle"></i> Refresh cancelled. Your work is safe.', 'info');
  });

  // 5. Refresh Logic
  function startRefresh() {
    // Remove the beforeunload warning so browser alert doesn't appear
    window.removeEventListener('beforeunload', beforeUnloadHandler);

    // Disable button visually and animate it
    headerRefreshBtn.addClass('loading');
    pageTransition.addClass('active');

    // Show full-page loader with slight delay
    setTimeout(() => {
      fullPageLoader.addClass('active');

      // Delay before actual page reload
      setTimeout(() => {
        // Optional: store toast message to show after reload
        localStorage.setItem('postReloadToast', 'Dashboard refreshed successfully');

        // Reload page
        window.location.reload();
      }, 1200); // Loader visible for at least 1.2s

    }, 300); // Delay for page bar animation
  }

  // 6. Toast Notification
  function showToast(message, type = 'success') {
    const toast = $(`<div class="toast ${type}">${message}</div>`);
    $('body').append(toast);
    setTimeout(() => toast.addClass('show'), 10);
    setTimeout(() => {
      toast.removeClass('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // 7. Loader on initial page load
  $(window).on('load', function () {
    setTimeout(() => {
      fullPageLoader.removeClass('active');

      // Show post-refresh toast if available
      const postReloadToast = localStorage.getItem('postReloadToast');
      if (postReloadToast) {
        showToast(`<i class="fas fa-check-circle"></i> ${postReloadToast}`, 'success');
        localStorage.removeItem('postReloadToast');
      }
    }, 400);
  });

  // 8. Warn on manual reload or tab close if form is modified
  function beforeUnloadHandler(e) {
    if (formModified) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  }

  // Attach the event handler
  window.addEventListener('beforeunload', beforeUnloadHandler);
});


document.getElementById("productType").addEventListener("change", function () {
  const productType = this.value;
  const productNameSelect = document.getElementById("productName");

  // Reset product name dropdown
  productNameSelect.innerHTML = '<option value="">-- Select Product Name --</option>';

  const productMap = {
    "GATEWAY": [
      "Wipro Garnet LED Smart Gateway (SG2000)"
    ],
    "IR BLASTER": [
      "Wipro Next Smart IR Blaster (DSIR100)"
    ],
    "SMART RETROFIT": [
      "Wipro Smart Switch 2N Module (DSP2200)",
      "Wipro Smart Switch 4N Module (DSP2400)",
      "Wipro Smart Switch 4N FN Module (DSP410)"
    ],
    "SMART COB": [
      "Wipro Garnet 6W Smart Trimless COB (DS50610)",
      "Wipro Garnet 10W Smart Module COB (DS51000)",
      "Wipro Garnet 10W Smart Trimless COB (DS51010)",
      "Wipro Garnet 15W Smart Module COB (DS51500)",
      "Wipro Garnet 15W Smart Trimless COB (DS51510)",
      "WIPRO-10W Smart Trimless COB Black (DS51011)"
    ],
    "SMART PANEL": [
      "WIPRO-Garnet 6W Smart Panel CCT (DS70600)",
      "WIPRO-Garnet 10W Smart Panel CCT (DS71000)",
      "WIPRO-Garnet 15W Smart Panel CCT (DS71500)"
    ],
    "SMART STRIP": [
      "Wipro Garnet 40W Smart WiFi CCT RGB Strip (DS44000)",
      "Wipro Garnet 40W Smart CCT RGB LED Strip (DS45000)",
      "Wipro Garnet 40W Smart CCT RGB LED Strip New (SS01000)"
    ],
    "SMART CAMERA": [
      "Wipro 3MP WiFi Smart Camera (SC020203)",
      "Wipro 3MP WiFi Smart Camera. Alexa (SC020303)"
    ],
    "SMART DOORBELL": [
      "Wipro Smart Doorbell 1080P (SD02010)",
      "Wipro Smart Wifi AC Doorbell 2MP (SD03000)"
    ],
  "SMART DOOR LOCK": [
    "Native Lock Pro",
    "Native Lock S"
  ]
  };

  if (productMap[productType]) {
    productMap[productType].forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      productNameSelect.appendChild(option);
    });
  } else {
    showToast("No product names found for selected type", "error");
  }
});

// Validate symptoms dropdown
document.getElementById("symptoms").addEventListener("change", function () {
  const val = this.value;
  const errorDiv = document.getElementById("symptomsError");

  if (val === "") {
    errorDiv.textContent = "Please select a valid symptom.";
    showToast("Symptom selection is required", "error");
  } else {
    errorDiv.textContent = "";
  }
});

// User Management Password Logic
document.addEventListener("DOMContentLoaded", function () {
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const errorText = document.getElementById('passwordError');
  const successText = document.getElementById('passwordSuccess');
  const samePasswordError = document.getElementById('passwordSameError');

  // Hide all messages on load
  errorText.style.display = 'none';
  successText.style.display = 'none';
  samePasswordError.style.display = 'none';

  let lastToastStatus = ''; // 'match', 'mismatch', or ''

  confirmPasswordInput.addEventListener('input', function () {
    const newVal = newPasswordInput.value.trim();
    const confirmVal = confirmPasswordInput.value.trim();
    const oldVal = document.getElementById('oldPassword').value.trim();

    samePasswordError.style.display = 'none';

    if (!newVal || !confirmVal) {
      errorText.style.display = 'none';
      successText.style.display = 'none';
      lastToastStatus = '';
      return;
    }

    if (newVal === oldVal) {
      samePasswordError.style.display = 'block';
      errorText.style.display = 'none';
      successText.style.display = 'none';
      return;
    }

    if (newVal !== confirmVal) {
      errorText.style.display = 'block';
      successText.style.display = 'none';

      if (lastToastStatus !== 'mismatch') {
        showToast('Passwords do not match!', 'error');
        lastToastStatus = 'mismatch';
      }
    } else {
      errorText.style.display = 'none';
      successText.style.display = 'block';

      if (lastToastStatus !== 'match') {
        showToast('Passwords match!', 'success');
        lastToastStatus = 'match';
      }
    }
  });
});

// Toggle Password Visibility
function togglePassword(id, el) {
  const field = document.getElementById(id);
  field.type = field.type === 'password' ? 'text' : 'password';

  const icon = el.querySelector('i');
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
}

// Handle Password Change Submission
function submitPasswordChange() {
  const username = document.getElementById('username').value.trim();
  const oldPass = document.getElementById('oldPassword').value.trim();
  const newPass = document.getElementById('newPassword').value.trim();
  const confirmPass = document.getElementById('confirmPassword').value.trim();
  const errorText = document.getElementById('passwordError');
  const successText = document.getElementById('passwordSuccess');
  const samePasswordError = document.getElementById('passwordSameError');

  // Reset all messages
  errorText.style.display = 'none';
  successText.style.display = 'none';
  samePasswordError.style.display = 'none';

  if (!username || !oldPass || !newPass || !confirmPass) {
    showToast('Please fill in all fields!', 'error');
    return;
  }

  if (oldPass === newPass) {
    samePasswordError.style.display = 'block';
    showToast('New password must be different from old password!', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    errorText.style.display = 'block';
    showToast('Passwords do not match!', 'error');
    return;
  }

  // Success
  showToast('Password changed successfully!', 'success');
  errorText.style.display = 'none';
  successText.style.display = 'none';
  samePasswordError.style.display = 'none';

  // Optional: Reset form
  // document.getElementById('passwordChangeForm').reset();
}

