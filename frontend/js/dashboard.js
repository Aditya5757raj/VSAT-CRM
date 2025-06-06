document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(section => section.classList.remove('active'));

            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const productName = document.getElementById('productName').value.trim();
            const serialNumber = document.getElementById('serialNumber').value.trim();
            const productType = document.getElementById('productType').value.trim();
            const manufacturer = document.getElementById('manufacturer').value.trim();

            if (!productName || !serialNumber || !productType) {
                showToast('Please fill in all required fields (marked with *)', 'error');
                return;
            }

            showToast(`Product "${productName}" with Serial "${serialNumber}" added successfully!`, 'success');

            this.reset();
            addProductToList(productName, serialNumber, productType, manufacturer);
        });
    }

    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.querySelector('p').textContent;

            switch (text) {
                case 'Add Product':
                    switchToSection('add-product');
                    break;
                case 'Create Job':
                    showToast('Create Job functionality would be implemented here', 'success');
                    break;
                case 'Update Status':
                    showToast('Update Status functionality would be implemented here', 'success');
                    break;
                case 'View Reports':
                    showToast('View Reports functionality would be implemented here', 'success');
                    break;
            }
        });
    });

    document.querySelectorAll('.search-box input').forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (this.placeholder.includes('jobs')) {
                filterJobsTable(searchTerm);
            }
        });
    });

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const row = this.closest('tr');
            const jobId = row.querySelector('.job-id').textContent;

            if (icon.classList.contains('fa-eye')) {
                showToast(`Viewing details for job ${jobId}`, 'success');
            } else if (icon.classList.contains('fa-edit')) {
                showToast(`Editing job ${jobId}`, 'success');
            }
        });
    });

    document.querySelectorAll('.product-actions .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h5').textContent;

            if (this.textContent.includes('View Details')) {
                showToast(`Viewing details for ${productName}`, 'success');
            } else if (this.textContent.includes('Create Job')) {
                showToast(`Creating job for ${productName}`, 'success');
            }
        });
    });

    document.querySelectorAll('.more-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('More options menu would appear here', 'success');
        });
    });

    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showToast('Notifications panel would open here', 'success');
        });
    }

    animateStats();
    simulateRealTimeUpdates();
});

function switchToSection(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (targetNavItem) targetNavItem.classList.add('active');

    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');
}

function addProductToList(name, serial, type, manufacturer) {
    console.log('Product added:', { name, serial, type, manufacturer });
    updateStats();
}

function filterJobsTable(searchTerm) {
    document.querySelectorAll('.jobs-table tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function animateStats() {
    document.querySelectorAll('.stat-value').forEach(stat => {
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

function updateStats() {
    const totalProductsStat = document.querySelector('.stat-value');
    if (totalProductsStat) {
        const currentValue = parseInt(totalProductsStat.textContent);
        totalProductsStat.textContent = currentValue + 1;
    }
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    // You can update a clock element instead of console.log
    console.log('Current time:', timeString);
}
setInterval(updateClock, 1000);

function simulateRealTimeUpdates() {
    const activities = [
        'New service request received',
        'Job status updated',
        'Product registered',
        'Technician assigned'
    ];

    setInterval(() => {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        console.log('Real-time update:', randomActivity);
        addRecentActivity(randomActivity);
    }, 30000);
}

function addRecentActivity(activity) {
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const newActivity = document.createElement('div');
        newActivity.className = 'activity-item';
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
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateSerialNumber(serial) {
    const re = /^[A-Za-z0-9]{6,}$/;
    return re.test(serial);
}

/**
 * Modern centered toast popup with green/red colors
 * @param {string} message - Message to show
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in ms (default 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
    // Create container if doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'custom-toast ' + (type === 'error' ? 'error' : 'success');
    toast.textContent = message;

    // Append and trigger animation
    container.appendChild(toast);
    // small delay to trigger CSS transition
    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('visible');
        toast.addEventListener('transitionend', () => {
            toast.remove();
            // Remove container if no more toasts
            if (container.childElementCount === 0) {
                container.remove();
            }
        });
    }, duration);
}

window.DashboardApp = {
    switchToSection,
    addProductToList,
    filterJobsTable,
    updateStats,
    validateEmail,
    validateSerialNumber
};
function showToast(message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Prevent duplicate toast messages
    const existingToast = Array.from(container.children).find(
        toast => toast.textContent === message
    );

    if (existingToast) {
        return; // Duplicate message found, don't show again
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'custom-toast ' + (type === 'error' ? 'error' : 'success');
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });

    setTimeout(() => {
        toast.classList.remove('visible');
        toast.addEventListener('transitionend', () => {
            toast.remove();
            if (container.childElementCount === 0) {
                container.remove();
            }
        });
    }, duration);
}
