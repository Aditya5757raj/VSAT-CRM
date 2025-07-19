// Complaint Report JavaScript functionality
// Handles complaint-report-overview and complaint-report-filter sections

document.addEventListener('DOMContentLoaded', function () {
  // Initialize complaint report functionality
  initializeComplaintReport();
});

function initializeComplaintReport() {
  // Add event listeners for complaint report sections
  const complaintReportOverviewSection = document.querySelector(
    '[data-section="complaint-report-overview"]'
  );
  const complaintReportFilterSection = document.querySelector(
    '[data-section="complaint-report-filter"]'
  );

  if (complaintReportOverviewSection) {
    setupComplaintReportOverviewSection();
  }

  if (complaintReportFilterSection) {
    setupComplaintReportFilterSection();
  }

  // Initialize dropdown functionality for Reports navigation
  initializeReportsDropdown();
}

function setupComplaintReportOverviewSection() {
  console.log('Complaint report overview section initialized');

  // Initialize existing complaint report functionality
  initComplaintReportOverview();
}

function setupComplaintReportFilterSection() {
  console.log('Complaint report filter section initialized');

  // Initialize new complaint report filter functionality
  initComplaintReportFilter();
}

// Initialize Reports dropdown functionality
function initializeReportsDropdown() {
  const reportsNavItem = document.querySelector(
    '.nav-item[data-section="reports"]'
  );
  const reportsSubmenu = document.querySelector('.reports-submenu');

  if (!reportsNavItem || !reportsSubmenu) return;

  // Toggle submenu when clicking on Reports
  reportsNavItem.addEventListener('click', function (e) {
    e.preventDefault();
    const parentLi = this.closest('li');

    if (parentLi) {
      const isActive = parentLi.classList.contains('active');

      // Close all other submenus
      document.querySelectorAll('.has-submenu.active').forEach((item) => {
        if (item !== parentLi) {
          item.classList.remove('active');
        }
      });

      // Toggle current submenu
      parentLi.classList.toggle('active', !isActive);
    }
  });

  // Handle submenu item clicks
  const submenuItems = reportsSubmenu.querySelectorAll('.nav-item');
  submenuItems.forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) {
        navigateToSection(section);

        // Close the submenu after navigation
        const parentLi = reportsNavItem.closest('li');
        if (parentLi) {
          parentLi.classList.remove('active');
        }
      }
    });
  });

  // Close submenu when clicking outside
  document.addEventListener('click', function (e) {
    if (!reportsNavItem.contains(e.target)) {
      const parentLi = reportsNavItem.closest('li');
      if (parentLi) {
        parentLi.classList.remove('active');
      }
    }
  });
}

// Initialize complaint report overview (existing functionality)
function initComplaintReportOverview() {
  // Make downloadComplaints globally available
  window.downloadComplaints = function(filter, event) {
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
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob(); // Get file data
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;

        const today = new Date().toISOString().split('T')[0];
        a.download =
          filter === 'today'
            ? `complaints_${today}.csv`
            : `complaints_all_${today}.csv`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        showToast(
          `✅ ${filter === 'today' ? "Today's" : 'All'} complaints downloaded`,
          'success'
        );
      })
      .catch((error) => {
        console.error('Download error:', error);
        showToast('❌ Failed to download complaints', 'error');
      })
      .finally(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      });
  };
  
  console.log('Complaint report overview functionality initialized');
}

// Initialize complaint report filter (new functionality)
function initComplaintReportFilter() {
  const filterForm = document.getElementById('complaintReportFilterForm');
  const downloadReportBtn = document.getElementById(
    'downloadFilteredReportBtn'
  );
  const fromDateInput = document.getElementById('reportFromDate');
  const toDateInput = document.getElementById('reportToDate');
  const reportNameSelect = document.getElementById('reportNameSelect');

  if (!filterForm) return;

  // Set default dates (current month)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (fromDateInput && !fromDateInput.value) {
    fromDateInput.value = firstDayOfMonth.toISOString().split('T')[0];
  }
  if (toDateInput && !toDateInput.value) {
    toDateInput.value = today.toISOString().split('T')[0];
  }

  // Date validation
  if (fromDateInput && toDateInput) {
    fromDateInput.addEventListener('change', validateDateRange);
    toDateInput.addEventListener('change', validateDateRange);
  }

  function validateDateRange() {
    const fromDate = new Date(fromDateInput.value);
    const toDate = new Date(toDateInput.value);
    const today = new Date();

    // Clear previous errors
    clearFieldError('reportFromDateError');
    clearFieldError('reportToDateError');

    if (fromDate > today) {
      showFieldError(
        'reportFromDateError',
        'From date cannot be in the future'
      );
      fromDateInput.value = '';
      return false;
    }

    if (toDate > today) {
      showFieldError('reportToDateError', 'To date cannot be in the future');
      toDateInput.value = '';
      return false;
    }

    if (fromDate && toDate && fromDate > toDate) {
      showFieldError('reportToDateError', 'To date must be after from date');
      return false;
    }

    return true;
  }

  // Form submission
  filterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    downloadFilteredReport();
  });

  // Download button click
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', function (e) {
      e.preventDefault();
      downloadFilteredReport();
    });
  }

  async function downloadFilteredReport() {
  const fromDate = fromDateInput?.value;
  const toDate = toDateInput?.value;
  const reportName = reportNameSelect?.value;

  console.log("📅 Selected Filters =>", fromDate, toDate, reportName);

  let isValid = true;

  if (!fromDate) {
    showFieldError('reportFromDateError', 'From date is required');
    isValid = false;
  } else {
    clearFieldError('reportFromDateError');
  }

  if (!toDate) {
    showFieldError('reportToDateError', 'To date is required');
    isValid = false;
  } else {
    clearFieldError('reportToDateError');
  }

  if (!reportName) {
    showFieldError('reportNameSelectError', 'Please select a report type');
    isValid = false;
  } else {
    clearFieldError('reportNameSelectError');
  }

  if (!validateDateRange()) {
    isValid = false;
  }

  if (!isValid) {
    showToast('Please fill all required fields correctly', 'error');
    return;
  }

  const originalText = downloadReportBtn.innerHTML;
  downloadReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Report...';
  downloadReportBtn.disabled = true;

  try {
    const token = getCookie('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('📡 Sending POST request to backend route...');

    const response = await fetch(`${API_URL}/dashboard/downloadFilteredComplaints`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', // ✅ important
      },
      body: JSON.stringify({
        fromDate,
        toDate,
        reportType: reportName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = `${reportName}_complaints_${fromDate}_to_${toDate}.csv`;

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    showToast(`✅ ${reportName} report downloaded successfully`, 'success');
  } catch (error) {
    console.error('❌ Error downloading filtered report:', error);
    showToast(`❌ Error: ${error.message}`, 'error');
  } finally {
    downloadReportBtn.innerHTML = originalText;
    downloadReportBtn.disabled = false;
  }
}

}

// Utility functions
function showFieldError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.color = '#dc2626';
  }
}

function clearFieldError(errorId) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

// Navigation function (if not already defined)
function navigateToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    // Hide all sections
    document
      .querySelectorAll('.section')
      .forEach((s) => s.classList.remove('active'));

    // Show target section
    section.classList.add('active');

    // Update navigation active states
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.remove('active');
    });

    // Find and activate the corresponding nav item
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (navItem) {
      navItem.classList.add('active');
    }

    showToast(`Navigated to ${sectionId.replace('-', ' ')}`, 'success');
  }
}

// Utility function to get cookie (if not already defined)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Utility function for toast notifications (if not already defined)
function showToast(message, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Prevent duplicate toast messages
  if (
    Array.from(container.children).some((toast) => {
      const toastMsg =
        toast.querySelector('.toast-message')?.textContent || toast.textContent;
      return toastMsg.trim() === message.trim();
    })
  ) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    dismissToast(toast, container);
  });
  toast.appendChild(closeBtn);

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 10);

  // Auto-dismiss if duration > 0
  if (duration > 0) {
    setTimeout(() => dismissToast(toast, container), duration);
  }
}

// Helper function for dismissal
function dismissToast(toast, container) {
  toast.classList.remove('visible');
  toast.addEventListener('transitionend', () => {
    toast.remove();
    if (container && !container.childElementCount) {
      container.remove();
    }
  });
}

// Export functions if needed for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeComplaintReport,
    setupComplaintReportOverviewSection,
    setupComplaintReportFilterSection,
    initializeReportsDropdown,
  };
}

// TAT REPORT
document.querySelectorAll('.nav-item[data-section]').forEach(button => {
  button.addEventListener('click', () => {
    const targetSectionId = button.getAttribute('data-section');
    document.querySelectorAll('.section').forEach(section => {
      section.style.display = 'none';
    });
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  initializeTatReport();
});

function initializeTatReport() {
  const tatReportForm = document.getElementById('tatReportForm');
  const generateTatReportBtn = document.getElementById('generateTatReportBtn');
  const tatRangeSelect = document.getElementById('tatRangeSelect');
  const tatRangeSelectError = document.getElementById('tatRangeSelectError');

  if (!tatReportForm) return;

  tatReportForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const tatRange = tatRangeSelect.value;
    if (!tatRange) {
      showFieldError('tatRangeSelectError', 'Please select a TAT range');
      return;
    } else {
      clearFieldError('tatRangeSelectError');
    }

    const originalText = generateTatReportBtn.innerHTML;
    generateTatReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateTatReportBtn.disabled = true;

    try {
      const token = getCookie('token');
      if (!token) throw new Error('Authentication token not found');

      console.log('📡 Sending POST request for TAT report...');

      const response = await fetch(`${API_URL}/dashboard/downloadTatReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tatRange }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate TAT report');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;

      const today = new Date().toISOString().split('T')[0];
      a.download = `TAT_Report_${tatRange}_${today}.csv`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      showToast(`✅ TAT report (${tatRange}) downloaded successfully`, 'success');
    } catch (error) {
      console.error('❌ Error downloading TAT report:', error);
      showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
      generateTatReportBtn.innerHTML = originalText;
      generateTatReportBtn.disabled = false;
    }
  });
}

// Utility functions
function showFieldError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.color = '#dc2626';
  }
}

function clearFieldError(errorId) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function showToast(message, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  if (
    Array.from(container.children).some((toast) => {
      const toastMsg = toast.querySelector('.toast-message')?.textContent || toast.textContent;
      return toastMsg.trim() === message.trim();
    })
  ) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => dismissToast(toast, container));
  toast.appendChild(closeBtn);

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 10);

  if (duration > 0) {
    setTimeout(() => dismissToast(toast, container), duration);
  }
}

function dismissToast(toast, container) {
  toast.classList.remove('visible');
  toast.addEventListener('transitionend', () => {
    toast.remove();
    if (container && !container.childElementCount) {
      container.remove();
    }
  });
}
