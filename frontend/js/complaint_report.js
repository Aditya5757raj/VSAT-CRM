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
  const complaintReportTatSection = document.querySelector(
    '[data-section="complaint-report-tat"]'
  );

  if (complaintReportOverviewSection) {
    setupComplaintReportOverviewSection();
  }

  if (complaintReportFilterSection) {
    setupComplaintReportFilterSection();
  }

  if (complaintReportTatSection) {
    setupComplaintReportTatSection();
  }
}

function setupComplaintReportOverviewSection() {
  console.log('Complaint report overview section initialized');
  initComplaintReportOverview();
}

function setupComplaintReportFilterSection() {
  console.log('Complaint report filter section initialized');
  initComplaintReportFilter();
}

function setupComplaintReportTatSection() {
  console.log('Complaint report TAT section initialized');
  initComplaintReportTat();
}

// =============================
// Existing Today/All report JS
// =============================
function initComplaintReportOverview() {
  window.downloadComplaints = function(filter, event) {
    const url = `${API_URL}/dashboard/downloadComplaints?filter=${filter}`;
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    button.disabled = true;

    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        const today = new Date().toISOString().split('T')[0];
        a.download = filter === 'today' ? `complaints_${today}.csv` : `complaints_all_${today}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        showToast(`✅ ${filter === 'today' ? "Today's" : 'All'} complaints downloaded`, 'success');
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

// =============================
// Existing Filter report JS
// =============================
function initComplaintReportFilter() {
  const filterForm = document.getElementById('complaintReportFilterForm');
  const downloadReportBtn = document.getElementById('downloadFilteredReportBtn');
  const fromDateInput = document.getElementById('reportFromDate');
  const toDateInput = document.getElementById('reportToDate');
  const reportNameSelect = document.getElementById('reportNameSelect');

  if (!filterForm) return;

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (fromDateInput && !fromDateInput.value) {
    fromDateInput.value = firstDayOfMonth.toISOString().split('T')[0];
  }
  if (toDateInput && !toDateInput.value) {
    toDateInput.value = today.toISOString().split('T')[0];
  }

  if (fromDateInput && toDateInput) {
    fromDateInput.addEventListener('change', validateDateRange);
    toDateInput.addEventListener('change', validateDateRange);
  }

  function validateDateRange() {
    const fromDate = new Date(fromDateInput.value);
    const toDate = new Date(toDateInput.value);
    const today = new Date();

    clearFieldError('reportFromDateError');
    clearFieldError('reportToDateError');

    if (fromDate > today) {
      showFieldError('reportFromDateError', 'From date cannot be in the future');
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

  filterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    downloadFilteredReport();
  });

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
      if (!token) throw new Error('Authentication token not found');

      console.log('📡 Sending POST request to backend route...');
      const response = await fetch(`${API_URL}/dashboard/downloadFilteredComplaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromDate, toDate, reportType: reportName }),
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

// =============================
// 🔥 New TAT report JS
// =============================
function initComplaintReportTat() {
  const tatReportForm = document.getElementById('tatReportForm');
  const generateTatReportBtn = document.getElementById('generateTatReportBtn');
  const tatRangeSelect = document.getElementById('tatRangeSelect');

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

  if (Array.from(container.children).some((toast) => {
    const toastMsg = toast.querySelector('.toast-message')?.textContent || toast.textContent;
    return toastMsg.trim() === message.trim();
  })) {
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
  if (duration > 0) setTimeout(() => dismissToast(toast, container), duration);
}

function dismissToast(toast, container) {
  toast.classList.remove('visible');
  toast.addEventListener('transitionend', () => {
    toast.remove();
    if (container && !container.childElementCount) container.remove();
  });
}
