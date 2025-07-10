// Global variables
let currentSection = 'overview';

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initDashboard();
  initToast();
  initUI();
  initMenuToggle(); // Initialize menu toggle functionality
  initDeliveryChallan(); // Initialize delivery challan functionality
  console.log("🧪 Calling initDashboardCounterClicks()");
  initDashboardCounterClicks(); // Initialize dashboard counter clicks
  initUserManagement(); // Initialize user management functionality
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
document.addEventListener('click', function (event) {
  const userProfile = document.querySelector('.user-profile');
  const dropdown = document.getElementById('userDropdown');

  if (!userProfile.contains(event.target)) {
    dropdown.classList.remove('show');
  }
});

// Logout functionality
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("index.html");
  });
}

// Handle change password click
const changePasswordBtn = document.getElementById("changePasswordBtn");
if (changePasswordBtn) {
  changePasswordBtn.addEventListener('click', function () {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
      userDropdown.classList.remove('show');
    }
    navigateToSection('user-management');
  });
}

// Show toast notification
function showFieldError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

// Setup mobile menu toggle
function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');

  if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('hidden');
      mainContent.classList.toggle('expanded');
    });
  }
}

// Initialize menu toggle functionality
function initMenuToggle() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const navItems = document.querySelectorAll(".nav-item[data-section]");

  if (!menuToggle || !sidebar || !mainContent) return;

  // Track sidebar state manually to prevent conflicts
  let sidebarState = {
    isHidden: false,
    isLargeScreen: window.innerWidth > 1024
  };

  // Helper function to show sidebar (handles both large and small screens)
  function showSidebar() {
    sidebar.classList.remove("hidden");
    sidebar.classList.add("show"); // For mobile CSS
    mainContent.classList.remove("expanded");
    menuToggle.querySelector("i").className = "fas fa-times"; // Show X when sidebar is open

    // Show overlay on mobile screens (using 'show' class to match CSS)
    if (window.innerWidth <= 1024 && sidebarOverlay) {
      sidebarOverlay.classList.add("show");
    }

    sidebarState.isHidden = false;
  }

  // Helper function to hide sidebar (handles both large and small screens)
  function hideSidebar() {
    sidebar.classList.add("hidden");
    sidebar.classList.remove("show"); // For mobile CSS
    mainContent.classList.add("expanded");
    menuToggle.querySelector("i").className = "fas fa-bars"; // Show bars when sidebar is closed

    // Hide overlay (using 'show' class to match CSS)
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove("show");
    }

    sidebarState.isHidden = true;
  }

  // Toggle menu visibility - WORKS FOR ALL SCREEN SIZES
  menuToggle.addEventListener("click", function () {
    const isCurrentlyHidden = sidebar.classList.contains("hidden");

    if (isCurrentlyHidden) {
      showSidebar();
    } else {
      hideSidebar();
    }
  });

  // Close sidebar when clicking overlay (mobile only)
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function () {
      if (window.innerWidth <= 1024) {
        hideSidebar();
      }
    });
  }

  // Auto-hide menu when navigation item is clicked (on smaller screens only)
  navItems.forEach(item => {
    item.addEventListener("click", function () {
      // Only auto-hide on smaller screens
      if (window.innerWidth <= 1024) {
        hideSidebar();
      }
    });
  });

  // Handle window resize - but don't override manual toggle on large screens
  window.addEventListener("resize", function () {
    const isNowLargeScreen = window.innerWidth > 1024;

    if (isNowLargeScreen && !sidebarState.isLargeScreen) {
      // Switching from small to large screen
      // Hide overlay and show sidebar if it wasn't manually hidden
      if (sidebarOverlay) {
        sidebarOverlay.classList.remove("show");
      }

      if (!sidebarState.isHidden) {
        showSidebar();
      }
      sidebarState.isLargeScreen = true;
    } else if (!isNowLargeScreen && sidebarState.isLargeScreen) {
      // Switching from large to small screen
      // Always hide sidebar on small screens initially
      hideSidebar();
      sidebarState.isLargeScreen = false;
    }
  });

  // Initialize based on screen size
  if (window.innerWidth <= 1024) {
    hideSidebar();
    sidebarState.isLargeScreen = false;
  } else {
    // On large screens, start with sidebar visible
    showSidebar();
    sidebarState.isLargeScreen = true;
  }
}

// Initialize delivery challan functionality
function initDeliveryChallan() {
  const deliveryChallanForm = document.getElementById("deliveryChallanForm");
  const saveChallanDraftBtn = document.getElementById("saveChallanDraftBtn");
  const resetChallanBtn = document.getElementById("resetChallanBtn");

  if (!deliveryChallanForm) return;

  // Form validation and submission
  deliveryChallanForm.addEventListener("submit", function (e) {
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
    saveChallanDraftBtn.addEventListener("click", function () {
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
    resetChallanBtn.addEventListener("click", function () {
      deliveryChallanForm.reset();

      // Clear all error messages
      document.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
      });

      showToast("Form cleared", "success");
    });
  }
}

function initDashboard() {
  const navItems = document.querySelectorAll(".nav-item");
  const quickActionBtns = document.querySelectorAll(".quick-action-btn");
  const searchInputs = document.querySelectorAll(".search-box input");

  // Setup enhanced sidebar navigation
  setupSidebarNavigation();

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

  // Make showSection globally available
  window.showSection = showSection;
  window.navigateToSection = showSection;
}

// Enhanced sidebar navigation setup
function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    // Handle main navigation items (non-submenu items)
    if (!item.closest('.submenu')) {
      item.addEventListener('click', function (e) {
        e.preventDefault();

        const section = this.getAttribute('data-section');
        const parentLi = this.closest('li');

        // Check if this is a submenu parent
        if (parentLi && parentLi.classList.contains('has-submenu')) {
          // Toggle submenu when clicking on text
          toggleSubmenu(parentLi);
        } else if (section) {
          // Navigate to section for regular nav items
          navigateToSection(section);
        }
      });
    } else {
      // Handle submenu items
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        if (section) {
          navigateToSection(section);
        }
      });
    }
  });

  // Separate arrow click handlers for explicit arrow clicks
  const submenuToggles = document.querySelectorAll('.submenu-toggle');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation(); // Prevent parent click
      const parentLi = this.closest('li');
      if (parentLi) {
        toggleSubmenu(parentLi);
      }
    });
  });
}

// Enhanced submenu toggle function
function toggleSubmenu(parentLi) {
  const isActive = parentLi.classList.contains('active');

  // Close all other submenus first
  document.querySelectorAll('.has-submenu.active').forEach(item => {
    if (item !== parentLi) {
      item.classList.remove('active');
    }
  });

  // Toggle current submenu
  if (isActive) {
    parentLi.classList.remove('active');
  } else {
    parentLi.classList.add('active');
  }
}

// Filter jobs table based on search term
function filterJobsTable(searchTerm) {
  const tableRows = document.querySelectorAll("#jobsTableBody tr");
  tableRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
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

// User Management functionality
function initUserManagement() {
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const errorText = document.getElementById('passwordError');
  const successText = document.getElementById('passwordSuccess');
  const samePasswordError = document.getElementById('passwordSameError');

  if (!newPasswordInput || !confirmPasswordInput) return;

  // Hide all messages on load
  if (errorText) errorText.style.display = 'none';
  if (successText) successText.style.display = 'none';
  if (samePasswordError) samePasswordError.style.display = 'none';

  let lastToastStatus = ''; // 'match', 'mismatch', or ''

  confirmPasswordInput.addEventListener('input', function () {
    const newVal = newPasswordInput.value.trim();
    const confirmVal = confirmPasswordInput.value.trim();
    const oldVal = document.getElementById('oldPassword')?.value.trim() || '';

    if (samePasswordError) samePasswordError.style.display = 'none';

    if (!newVal || !confirmVal) {
      if (errorText) errorText.style.display = 'none';
      if (successText) successText.style.display = 'none';
      lastToastStatus = '';
      return;
    }

    if (newVal === oldVal) {
      if (samePasswordError) samePasswordError.style.display = 'block';
      if (errorText) errorText.style.display = 'none';
      if (successText) successText.style.display = 'none';
      return;
    }

    if (newVal !== confirmVal) {
      if (errorText) errorText.style.display = 'block';
      if (successText) successText.style.display = 'none';

      if (lastToastStatus !== 'mismatch') {
        showToast('Passwords do not match!', 'error');
        lastToastStatus = 'mismatch';
      }
    } else {
      if (errorText) errorText.style.display = 'none';
      if (successText) successText.style.display = 'block';

      if (lastToastStatus !== 'match') {
        showToast('Passwords match!', 'success');
        lastToastStatus = 'match';
      }
    }
  });
}

// Toggle Password Visibility
function togglePassword(id, el) {
  const field = document.getElementById(id);
  if (!field || !el) return;

  field.type = field.type === 'password' ? 'text' : 'password';

  const icon = el.querySelector('i');
  if (icon) {
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  }
}

// Handle Password Change Submission
function submitPasswordChange() {
  const username = document.getElementById('username')?.value.trim();
  const oldPass = document.getElementById('oldPassword')?.value.trim();
  const newPass = document.getElementById('newPassword')?.value.trim();
  const confirmPass = document.getElementById('confirmPassword')?.value.trim();
  const errorText = document.getElementById('passwordError');
  const successText = document.getElementById('passwordSuccess');
  const samePasswordError = document.getElementById('passwordSameError');

  // Reset all messages
  if (errorText) errorText.style.display = 'none';
  if (successText) successText.style.display = 'none';
  if (samePasswordError) samePasswordError.style.display = 'none';

  if (!username || !oldPass || !newPass || !confirmPass) {
    showToast('Please fill in all fields!', 'error');
    return;
  }

  if (oldPass === newPass) {
    if (samePasswordError) samePasswordError.style.display = 'block';
    showToast('New password must be different from old password!', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    if (errorText) errorText.style.display = 'block';
    showToast('Passwords do not match!', 'error');
    return;
  }

  // Success
  showToast('Password changed successfully!', 'success');
  if (errorText) errorText.style.display = 'none';
  if (successText) successText.style.display = 'none';
  if (samePasswordError) samePasswordError.style.display = 'none';
}

// Make functions globally available
window.togglePassword = togglePassword;
window.submitPasswordChange = submitPasswordChange;

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

// Refresh button functionality
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

// Dashboard status
document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Dashboard stats script loaded.");

  const apiUrl = `${API_URL}/dashboard/stats`; // Ensure API_URL is globally defined
  const token = getCookie("token");

  if (!token) {
    console.error("❌ No token found. Aborting dashboard fetch.");
    return;
  }

  console.log(`🔗 Fetching stats from: ${apiUrl}`);

  fetch(apiUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      console.log("✅ Received response from backend.");
      return response.json();
    })
    .then(data => {
      console.log("📦 Parsed data:", data);

      // Set initial values to 0 for animation
      const ids = ["totalCustomers", "activeJobs", "completedJobs", "pendingJobs"];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "0";
      });

      // Animate the stats after a short delay
      setTimeout(() => animateStats(data), 100);
      console.log("🎯 Dashboard stats animation triggered.");
    })
    .catch(error => {
      console.error("❌ Failed to fetch stats:", error);
    });
});

// Function to animate stats
function animateStats(data) {
  const statsMap = {
    totalCustomers: data.customers || 0,
    activeJobs: data.activeJobs || 0,
    completedJobs: data.completedJobs || 0,
    pendingJobs: data.pendingJobs || 0
  };

  Object.entries(statsMap).forEach(([id, finalValue]) => {
    const el = document.getElementById(id);
    if (!el) return;

    let currentValue = 0;
    const increment = Math.max(finalValue / 20, 1); // Minimum increment of 1

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= finalValue) {
        el.textContent = finalValue.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(currentValue).toLocaleString();
      }
    }, 50);
  });
}

function initDashboardCounterClicks() {
  console.log("🚀 initDashboardCounterClicks called");

  const counterMap = {
    customers: "job-history",
    active: "pending-complaints",
    completed: "complete-complaints",
    pending: "unassigned-complaints"
  };

  const cards = document.querySelectorAll(".clickable-counter");
  console.log(`🧩 Found ${cards.length} clickable counters`);

  cards.forEach(card => {
    const counter = card.dataset.counter;
    const sectionId = counterMap[counter];

    console.log(`🔗 Mapping counter: ${counter} → ${sectionId}`);

    card.addEventListener("click", () => {
      console.log(`🖱️ Clicked counter: ${counter}`);

      document.querySelectorAll(".section").forEach(sec =>
        sec.classList.remove("active")
      );
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.classList.add("active");
        targetSection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error(`❌ Section not found for ID: ${sectionId}`);
      }
    });
  });
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", function () {
    const sectionId = this.getAttribute("data-section");

    // Hide all sections
    document.querySelectorAll(".section").forEach(sec => {
      sec.style.display = "none";
    });

    // Show only the matched section
    const target = document.getElementById(sectionId);
    if (target) {
      target.style.display = "block";
    } else {
      console.warn(`No section found with ID: ${sectionId}`);
      // Optional fallback: show default section
      const defaultSection = document.getElementById("complaint");
      if (defaultSection) defaultSection.style.display = "block";
    }
  });
});

function downloadComplaints(filter,event) {
  const url = `${API_URL}/dashboard/downloadComplaints?filter=${filter}`;

  // Optional: get the button element to show loading state
  const button = event.target;
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
  button.disabled = true;

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob(); // Get file data
  })
  .then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;

    const today = new Date().toISOString().split('T')[0];
    a.download = filter === 'today'
      ? `complaints_${today}.csv`
      : `complaints_all_${today}.csv`;

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    showToast(`✅ ${filter === 'today' ? "Today's" : "All"} complaints downloaded`, 'success');
  })
  .catch(error => {
    console.error('Download error:', error);
    showToast('❌ Failed to download complaints', 'error');
  })
  .finally(() => {
    button.innerHTML = originalText;
    button.disabled = false;
  });
}


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = getCookie("token"); // Or localStorage.getItem("token");

        if (!token) throw new Error("Token not found");

        const response = await fetch(`${API_URL}/dashboard/userinfo`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // ✅ Use backticks
                "Content-Type": "application/json"
            },
            credentials: "include" // Optional
        });

        if (!response.ok) throw new Error("Failed to fetch user info");

        const user = await response.json();

       const fullName = user.name || "N/A";
        const role = user.role || "N/A";
        const initials=user.initials || "N/A"
       

        // ✅ Set values in DOM
        document.getElementById("userAvatar").textContent = initials;
        document.getElementById("userName").textContent = fullName;
        document.getElementById("userRole").textContent = role;

    } catch (error) {
        console.error("Error loading user info:", error);
        document.getElementById("userAvatar").textContent = "--";
        document.getElementById("userName").textContent = "Guest";
        document.getElementById("userRole").textContent = "Visitor";
    }
});


// Make downloadComplaints globally available
window.downloadComplaints = downloadComplaints;
