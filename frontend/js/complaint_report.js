document.addEventListener('DOMContentLoaded', function () {
  // Initialize complaint report functionality
  initializeComplaintReport();
});

function initializeComplaintReport() {
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

  initializeReportsDropdown();
}

function setupComplaintReportOverviewSection() {
  console.log('📦 Complaint Report Overview initialized');
  initComplaintReportOverview();
}

function setupComplaintReportFilterSection() {
  console.log('📦 Complaint Report Filter initialized');
  initComplaintReportFilter();
}

function setupComplaintReportTatSection() {
  console.log('📦 Complaint Report TAT initialized');
  const tatReportForm = document.getElementById('tatReportForm');
  const generateTatReportBtn = document.getElementById('generateTatReportBtn');
  const tatRangeSelect = document.getElementById('tatRangeSelect');

  if (!tatReportForm || !generateTatReportBtn || !tatRangeSelect) {
    console.warn('⚠️ TAT Report form elements not found in DOM');
    return;
  }

  tatReportForm.addEventListener('submit', function (e) {
    e.preventDefault();
    downloadTatReport();
  });

  async function downloadTatReport() {
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
  }
}

// Initialize Reports dropdown functionality
function initializeReportsDropdown() {
  const reportsNavItem = document.querySelector(
    '.nav-item[data-section="reports"]'
  );
  const reportsSubmenu = document.querySelector('.reports-submenu');

  if (!reportsNavItem || !reportsSubmenu) return;

  reportsNavItem.addEventListener('click', function (e) {
    e.preventDefault();
    const parentLi = this.closest('li');

    if (parentLi) {
      const isActive = parentLi.classList.contains('active');
      document.querySelectorAll('.has-submenu.active').forEach((item) => {
        if (item !== parentLi) {
          item.classList.remove('active');
        }
      });
      parentLi.classList.toggle('active', !isActive);
    }
  });

  const submenuItems = reportsSubmenu.querySelectorAll('.nav-item');
  submenuItems.forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) {
        navigateToSection(section);
        const parentLi = reportsNavItem.closest('li');
        if (parentLi) {
          parentLi.classList.remove('active');
        }
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!reportsNavItem.contains(e.target)) {
      const parentLi = reportsNavItem.closest('li');
      if (parentLi) {
        parentLi.classList.remove('active');
      }
    }
  });
}

function initComplaintReportOverview() {
  window.downloadComplaints = function (filter, event) {
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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        const today = new Date().toISOString().split('T')[0];
        a.download = `complaints_${filter}_${today}.csv`;
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
  console.log('✅ Complaint Report Overview ready');
}

function initComplaintReportFilter() {
  console.log('✅ Complaint Report Filter ready');
  // ... (your existing filter logic)
}

// Utility functions
function navigateToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
    section.classList.add('active');
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (navItem) {
      navItem.classList.add('active');
    }
    console.log(`📌 Navigated to section: ${sectionId}`);
  }
}

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
  })) return;

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
