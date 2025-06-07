document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard functionality
    initDashboard();

    // Initialize form functionality
    initForms();

    // Initialize toast container
    initToast();

    // Initialize other UI elements
    initUI();
});

function initDashboard() {
    // Get all navigation items
    const navItems = document.querySelectorAll('.nav-item');

    // Function to show a section and hide others
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show the selected section
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Update active state in navigation
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
    }

    // Add click event to all navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const sectionId = this.dataset.section;
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });

    // Handle submenu toggle
    const submenuTriggers = document.querySelectorAll('.submenu-trigger');
    submenuTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            // Don't navigate if clicking the dropdown arrow
            if (e.target.classList.contains('submenu-toggle')) {
                const parentLi = this.closest('.has-submenu');
                parentLi.classList.toggle('active');

                // Close other open submenus
                document.querySelectorAll('.has-submenu').forEach(item => {
                    if (item !== parentLi) {
                        item.classList.remove('active');
                    }
                });

                // Toggle icon
                this.querySelector('.submenu-toggle').classList.toggle('fa-chevron-up');
                this.querySelector('.submenu-toggle').classList.toggle('fa-chevron-down');
                e.stopPropagation();
            }
        });
    });

    // Close submenus when clicking outside
    document.addEventListener('click', function () {
        document.querySelectorAll('.has-submenu').forEach(item => {
            item.classList.remove('active');
        });
    });

    // Show the default section (overview) on page load
    showSection('overview');

    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const text = this.querySelector('p').textContent;

            switch (text) {
                case 'Add Product':
                    showSection('add-product');
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

    // Search functionality
    document.querySelectorAll('.search-box input').forEach(input => {
        input.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            if (this.placeholder.includes('jobs')) {
                filterJobsTable(searchTerm);
            }
        });
    });

    // Animate stats on load
    animateStats();
}
// call registration js 
function initForms() {
    const callForm = document.getElementById('callForm');
    if (!callForm) return;

    // Fetch locality on PIN input
    document.getElementById('pin').addEventListener('input', fetchLocality);

    // Populate products based on product type
    document.getElementById('productType').addEventListener('change', function () {
        const productType = this.value;
        const product = document.getElementById('product');
        product.innerHTML = '<option value="">-- Select Product --</option>';

        const options = {
            'AC': ['1.5 Ton Split AC', '2 Ton Window AC', 'Inverter AC'],
            'Washing Machine': ['Front Load 7kg', 'Top Load 6.5kg', 'Fully Automatic 8kg']
        };

        (options[productType] || []).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            product.appendChild(opt);
        });
    });

    // Prevent future purchase date
    document.getElementById('purchaseDate').addEventListener('input', function () {
        const input = this;
        const selectedDate = new Date(input.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            showToast('Date of Purchase cannot be in the future.', 'error');
            input.value = '';
            input.focus();
        }
    });

    // Form submit validation
    callForm.addEventListener('submit', function (e) {
        e.preventDefault();

        let isValid = true;
        let firstInvalidInput = null;

        function validate(id, condition, msg) {
            const input = document.getElementById(id);
            const error = document.getElementById(id + 'Error');

            if (condition) {
                error.textContent = '';
                input.classList.remove('input-error');
                input.classList.add('input-valid');
            } else {
                error.textContent = msg;
                input.classList.add('input-error');
                input.classList.remove('input-valid');
                if (!firstInvalidInput) firstInvalidInput = input;
                if (isValid) showToast(msg, 'error');
                isValid = false;
            }
        }

        validate('fullName', document.getElementById('fullName').value.trim() !== '', 'Full name is required');
        validate('mobile', /^\d{10}$/.test(document.getElementById('mobile').value.trim()), 'Enter a valid 10-digit mobile number');
        validate('pin', /^\d{6}$/.test(document.getElementById('pin').value.trim()), 'Enter valid 6-digit pin code');

        // Extra check: locality options and value after fetch
        const localityInput = document.getElementById('locality');
        if (
            localityInput.options.length <= 1 ||
            localityInput.value === '' ||
            localityInput.options[0].text.includes('No locality found') ||
            localityInput.options[0].text.includes('Error fetching locality')
        ) {
            const localityError = document.getElementById('localityError');
            localityError.textContent = 'No locality found for this PIN';
            localityInput.classList.add('input-error');
            localityInput.classList.remove('input-valid');
            if (!firstInvalidInput) firstInvalidInput = localityInput;
            if (isValid) showToast('No locality found for this PIN', 'error');
            isValid = false;
        } else {
            document.getElementById('localityError').textContent = '';
            localityInput.classList.remove('input-error');
            localityInput.classList.add('input-valid');
        }

        validate('address', document.getElementById('address').value.trim() !== '', 'Address is required');
        validate('productType', document.getElementById('productType').value !== '', 'Please select a product type');
        validate('product', document.getElementById('product').value !== '', 'Please select a product');
        validate('serial', document.getElementById('serial').value.trim() !== '', 'Serial number is required');

        const callType = document.querySelector('input[name="callType"]:checked');
        const callTypeError = document.getElementById('callTypeError');
        if (callType) {
            callTypeError.textContent = '';
        } else {
            callTypeError.textContent = 'Select a call type';
            if (!firstInvalidInput) firstInvalidInput = document.querySelector('input[name="callType"]');
            if (isValid) showToast('Select a call type', 'error');
            isValid = false;
        }

        const priority = document.querySelector('input[name="priority"]:checked');
        const priorityError = document.getElementById('priorityError');
        if (priority) {
            priorityError.textContent = '';
        } else {
            priorityError.textContent = 'Select priority';
            if (!firstInvalidInput) firstInvalidInput = document.querySelector('input[name="priority"]');
            if (isValid) showToast('Select priority', 'error');
            isValid = false;
        }

        if (isValid) {
            const customerData = {
                name: document.getElementById('fullName').value.trim(),
                mobile: document.getElementById('mobile').value.trim(),
                pin: document.getElementById('pin').value.trim(),
                locality: document.getElementById('locality').value,
                address: document.getElementById('address').value.trim(),
                callType: callType.value,
                productType: document.getElementById('productType').value,
                product: document.getElementById('product').value,
                serial: document.getElementById('serial').value.trim(),
                purchaseDate: document.getElementById('purchaseDate').value,
                comments: document.getElementById('comments').value.trim(),
                priority: priority.value,
                registrationDate: new Date().toISOString()
            };

            const existingCustomers = JSON.parse(localStorage.getItem('crmCustomers')) || [];
            existingCustomers.push(customerData);
            localStorage.setItem('crmCustomers', JSON.stringify(existingCustomers));

            showToast('Call Registered Successfully!', 'success');
            resetForm();
        } else if (firstInvalidInput) {
            firstInvalidInput.focus();
        }
    });

    document.getElementById('pin').addEventListener('input', function () {
    const pinInput = this;
    const pin = pinInput.value.trim();
    const error = document.getElementById('pinError');
    
    if (pin.length > 6) {
        error.textContent = 'PIN code cannot be more than 6 digits';
        pinInput.classList.add('input-error');
        pinInput.classList.remove('input-valid');
        showToast('PIN code cannot be more than 6 digits', 'error');
    } else if (pin.length === 6 && /^\d{6}$/.test(pin)) {
        error.textContent = '';
        pinInput.classList.remove('input-error');
        pinInput.classList.add('input-valid');
        // Optionally, fetch locality here or call your fetchLocality()
    } else {
        error.textContent = '';
        pinInput.classList.remove('input-error', 'input-valid');
    }
});



function validateField(id, condition, errorMessage) {
    const input = document.getElementById(id);
    const errorDiv = document.getElementById(id + "Error");
    if (condition) {
      input.classList.add("valid-input");
      input.classList.remove("invalid-input");
      if (errorDiv) errorDiv.textContent = "";
    } else {
      input.classList.remove("valid-input");
      input.classList.add("invalid-input");
      if (errorDiv) errorDiv.textContent = errorMessage;
    }
  }

  // Event listeners for real-time validation
  document.getElementById("fullName").addEventListener("input", () => {
    validateField("fullName", document.getElementById("fullName").value.trim() !== " ", "Full name is required.");
  });

  document.getElementById("mobile").addEventListener("input", () => {
    validateField("mobile", /^\d{10}$/.test(document.getElementById("mobile").value.trim()), "Enter a valid 10-digit mobile number.");
  });

  document.getElementById("pin").addEventListener("input", () => {
    validateField("pin", /^\d{6}$/.test(document.getElementById("pin").value.trim()), "Enter a valid 6-digit pin code.");
  });

  document.getElementById("locality").addEventListener("change", () => {
    validateField("locality", document.getElementById("locality").value !== "", "Please select a locality.");
  });

  document.getElementById("address").addEventListener("input", () => {
    validateField("address", document.getElementById("address").value.trim() !== "", "Address is required.");
  });

  document.getElementById("productType").addEventListener("change", () => {
    validateField("productType", document.getElementById("productType").value !== "", "Please select a product type.");
  });

  document.getElementById("product").addEventListener("change", () => {
    validateField("product", document.getElementById("product").value !== "", "Please select a product.");
  });

  document.getElementById("serial").addEventListener("input", () => {
    validateField("serial", document.getElementById("serial").value.trim() !== "", "Serial number is required.");
  });

  document.getElementById("purchaseDate").addEventListener("change", () => {
    validateField("purchaseDate", document.getElementById("purchaseDate").value !== "", "Purchase date is required.");
  });

  // Radio buttons: Call Type
  document.querySelectorAll('input[name="callType"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const callTypeSelected = document.querySelector('input[name="callType"]:checked');
      const callTypeError = document.getElementById("callTypeError");
      if (!callTypeSelected) {
        callTypeError.textContent = "Please select a call type.";
      } else {
        callTypeError.textContent = "";
      }
    });
  });

  // Radio buttons: Priority
  document.querySelectorAll('input[name="priority"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const prioritySelected = document.querySelector('input[name="priority"]:checked');
      const priorityError = document.getElementById("priorityError");
      if (!prioritySelected) {
        priorityError.textContent = "Please select call priority.";
      } else {
        priorityError.textContent = "";
      }
    });
  });

    // Fetch locality by PIN
    function fetchLocality() {
        const pin = document.getElementById('pin').value.trim();
        const localityInput = document.getElementById('locality');
        const localityError = document.getElementById('localityError');
        const pinInput = document.getElementById('pin');

        if (pin.length === 6 && /^\d{6}$/.test(pin)) {
            fetch(`https://api.postalpincode.in/pincode/${pin}`)
                .then(response => response.json())
                .then(data => {
                    if (data[0].Status === 'Success') {
                        localityInput.innerHTML = '<option value="">-- Select locality --</option>';
                        data[0].PostOffice.forEach(po => {
                            const option = document.createElement('option');
                            option.value = `${po.Name}, ${po.District}`;
                            option.textContent = `${po.Name}, ${po.District}`;
                            localityInput.appendChild(option);
                        });
                        localityError.textContent = '';
                        localityInput.classList.remove('input-error');
                        localityInput.classList.add('input-valid');
                        pinInput.classList.remove('input-error');
                        pinInput.classList.add('input-valid');
                    } else {
                        localityInput.innerHTML = '<option value="">-- No locality found --</option>';
                        localityError.textContent = 'No locality found for this PIN';
                        localityInput.classList.add('input-error');
                        localityInput.classList.remove('input-valid');
                        pinInput.classList.add('input-error');
                        pinInput.classList.remove('input-valid');
                        showToast('No locality found for this PIN', 'error');
                    }
                })
                .catch(() => {
                    localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
                    localityError.textContent = 'Error fetching locality!';
                    localityInput.classList.add('input-error');
                    localityInput.classList.remove('input-valid');
                    pinInput.classList.add('input-error');
                    pinInput.classList.remove('input-valid');
                    showToast('Error fetching locality!', 'error');
                });
        } else {
            localityInput.innerHTML = '<option value="">-- Select locality --</option>';
            localityError.textContent = '';
            localityInput.classList.remove('input-error', 'input-valid');
            pinInput.classList.remove('input-error', 'input-valid');
        }
    }

    // Live validation for mobile
    document.getElementById('mobile').addEventListener('input', function () {
        const mobile = this.value.trim();
        const error = document.getElementById('mobileError');

        if (mobile === '') {
            error.textContent = 'Mobile number is required';
            this.classList.add('input-error');
            this.classList.remove('input-valid');
        } else if (!/^\d{10}$/.test(mobile)) {
            error.textContent = 'Enter a valid 10-digit mobile number';
            this.classList.add('input-error');
            this.classList.remove('input-valid');
        } else {
            error.textContent = '';
            this.classList.remove('input-error');
            this.classList.add('input-valid');
        }
    });

    // Reset form on button click
    document.getElementById('resetBtn').addEventListener('click', resetForm);

    // Reset form helper
    function resetForm() {
        callForm.reset();

        // Clear errors and styles
        ['fullName', 'mobile', 'pin', 'locality', 'address', 'productType', 'product', 'serial', 'purchaseDate', 'comments'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.classList.remove('input-error', 'input-valid');
            }
            const error = document.getElementById(id + 'Error');
            if (error) error.textContent = '';
        });

        // Clear radio errors
        document.getElementById('callTypeError').textContent = '';
        document.getElementById('priorityError').textContent = '';
    }
}

// Call initForms on DOM load
document.addEventListener('DOMContentLoaded', initForms);

// Add Product Form
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', function (e) {
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


function initUI() {
    // Action buttons in tables
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
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

    // Product action buttons
    document.querySelectorAll('.product-actions .btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h5').textContent;

            if (this.textContent.includes('View Details')) {
                showToast(`Viewing details for ${productName}`, 'success');
            } else if (this.textContent.includes('Create Job')) {
                showToast(`Creating job for ${productName}`, 'success');
            }
        });
    });

    // More buttons
    document.querySelectorAll('.more-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            showToast('More options menu would appear here', 'success');
        });
    });

    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function () {
            showToast('Notifications panel would open here', 'success');
        });
    }

    // Simulate real-time updates
    simulateRealTimeUpdates();
}

function initToast() {
    // Toast container will be created when needed
}

// Utility Functions

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
        return;
    }

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

// function validateField(id, condition, msg) {
//     const input = document.getElementById(id);
//     const error = document.getElementById(id + 'Error');
//     if (condition) {
//         error.textContent = '';
//         input.classList.remove('input-error');
//         input.classList.add('input-valid');
//     } else {
//         error.textContent = msg;
//         input.classList.remove('input-valid');
//         input.classList.add('input-error');
//     }
// }

function fetchLocality() {
    const pin = document.getElementById('pin').value.trim();
    const localityInput = document.getElementById('locality');

    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
        fetch(`https://api.postalpincode.in/pincode/${pin}`)
            .then(response => response.json())
            .then(data => {
                if (data[0].Status === 'Success') {
                    localityInput.innerHTML = '<option value="">-- Select locality --</option>';
                    data[0].PostOffice.forEach(po => {
                        const option = document.createElement('option');
                        option.value = `${po.Name}, ${po.District}`;
                        option.textContent = `${po.Name}, ${po.District}`;
                        localityInput.appendChild(option);
                    });
                } else {
                    localityInput.innerHTML = '<option value="">-- No locality found --</option>';
                    showToast('No locality found for this PIN', 'error');
                }
            })
            .catch(() => {
                localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
                showToast('Error fetching locality!', 'error');
            });
    } else {
        localityInput.innerHTML = '<option value="">-- Select locality --</option>';
    }
}

function resetForm() {
    document.getElementById('callForm').reset();
    document.getElementById('locality').innerHTML = '<option value="">-- Select locality --</option>';
    document.getElementById('product').innerHTML = '<option value="">-- Select Product --</option>';

    // Clear all error messages
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });

    // Reset border colors
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.style.borderColor = '#d1d5db';
    });
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

function simulateRealTimeUpdates() {
    const activities = [
        'New service request received',
        'Job status updated',
        'Product registered',
        'Technician assigned'
    ];

    setInterval(() => {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
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

// Expose public methods
window.DashboardApp = {
    showSection: function (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            section.classList.add('active');

            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.section === sectionId) {
                    item.classList.add('active');
                }
            });
        }
    },
    showToast,
    resetForm
};
