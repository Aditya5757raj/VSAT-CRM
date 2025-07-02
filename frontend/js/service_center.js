// Service Center JavaScript functionality
// Handles list-service-centers, service-partners, and job-transfer sections

document.addEventListener('DOMContentLoaded', function() {
    // Initialize service center functionality
    initializeServiceCenter();
});

function initializeServiceCenter() {
    // Add event listeners for service center related sections
    const listServiceCentersSection = document.querySelector('[data-section="list-service-centers"]');
    const servicePartnersSection = document.querySelector('[data-section="service-partners"]');
    const jobTransferSection = document.querySelector('[data-section="job-transfer"]');
    
    if (listServiceCentersSection) {
        setupListServiceCentersSection();
    }
    
    if (servicePartnersSection) {
        setupServicePartnersSection();
    }
    
    if (jobTransferSection) {
        setupJobTransferSection();
    }
}

function setupListServiceCentersSection() {
    console.log('List service centers section initialized');
    
    // Initialize Service Centers functionality
    initServiceCenters();
}

function setupServicePartnersSection() {
    console.log('Service partners section initialized');
    
    // Initialize Service Partners functionality
    initServicePartners();
}

function setupJobTransferSection() {
    console.log('Job transfer section initialized');
    
    // Initialize job transfer functionality
    initJobTransfer();
}

// Initialize Service Centers functionality with backend integration
function initServiceCenters() {
    const searchBtn = document.getElementById("searchServiceCentersBtn");
    const pinCodeInput = document.getElementById("serviceCenterPinCode");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const clearSearchBtn = document.getElementById("clearServiceCenterSearchBtn");

    if (!searchBtn || !pinCodeInput) return;

    // Search service centers by pin code
    searchBtn.addEventListener("click", function () {
        const pinCode = pinCodeInput.value.trim();

        if (!pinCode) {
            showToast("Please enter a pin code", "error");
            return;
        }

        if (!/^\d{6}$/.test(pinCode)) {
            showToast("Please enter a valid 6-digit pin code", "error");
            return;
        }

        // Call the search function
        searchServiceCentersByPincode(pinCode);
    });

    // Handle Enter key in pin code input
    pinCodeInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchBtn.click();
        }
    });

    // Clear search functionality
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", function () {
            pinCodeInput.value = "";
            hideServiceCentersTable();
            showNoServiceCentersMessage();
            showToast("Search cleared", "success");
        });
    }

    // Handle tab switching for job status
    tabBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            // Remove active class from all tabs
            tabBtns.forEach(tab => tab.classList.remove("active"));

            // Add active class to clicked tab
            this.classList.add("active");

            const status = this.dataset.status;
            showToast(`Showing ${status} service centers`, "success");

            // Here you would filter the table based on the selected status
            // For now, we'll just show a message
        });
    });

    // Initialize with no results message
    showNoServiceCentersMessage();
}

// Function to search service centers via API
async function searchServiceCentersByPincode(pincode) {
    const token = getCookie("token");

    if (!token) {
        showToast("Authentication token not found", "error");
        return;
    }

    // Show loading indicator
    showServiceCenterLoadingIndicator(true);
    hideNoServiceCentersMessage();
    hideServiceCentersTable();

    try {
        console.log("Searching service centers for pincode:", pincode);
        
        const response = await fetch(`${API_URL}/service-center/search-by-pincode`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ pincode: pincode })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to search service centers");
        }

        const data = await response.json();
        console.log("Service centers data:", data);

        if (data.serviceCenters && data.serviceCenters.length > 0) {
            displayServiceCentersInTable(data.serviceCenters);
            showToast(`Found ${data.serviceCenters.length} service center(s) for pincode ${pincode}`, "success");
        } else {
            showNoServiceCentersMessage();
            showToast("No service centers found for the specified pincode", "warning");
        }
    } catch (error) {
        console.error("Error searching service centers:", error);
        showToast(`Error searching service centers: ${error.message}`, "error");
        showNoServiceCentersMessage();
    } finally {
        showServiceCenterLoadingIndicator(false);
    }
}

// Function to display service centers in the table
function displayServiceCentersInTable(serviceCenters) {
    const tableBody = document.getElementById("partnersListTable");
    const tableContainer = document.getElementById("serviceCentersTableContainer");

    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    serviceCenters.forEach((center, index) => {
        const row = document.createElement("tr");
        
        // Format operating pincodes
        const operatingPincodes = center.operating_pincodes 
            ? (Array.isArray(center.operating_pincodes) 
                ? center.operating_pincodes.join(", ") 
                : center.operating_pincodes)
            : "N/A";

        // Format services
        const services = center.services 
            ? (Array.isArray(center.services) 
                ? center.services.join(", ") 
                : center.services)
            : "N/A";

        row.innerHTML = `
            <td><span class="job-id">${center.center_id || 'N/A'}</span></td>
            <td>
                <div class="service-center-cell">
                    <p class="partner-name">${center.partner_name || 'N/A'}</p>
                    <p class="contact-person">Contact: ${center.contact_person || 'N/A'}</p>
                </div>
            </td>
            <td>
                <div class="pincode-cell">
                    <span class="pincode-list">${operatingPincodes}</span>
                </div>
            </td>
            <td>${center.contact_person || 'N/A'}</td>
            <td>
                <div class="contact-cell">
                    <p class="email">${center.email || 'N/A'}</p>
                    <p class="services">${services}</p>
                </div>
            </td>
            <td>
                <div class="phone-cell">
                    <i class="fas fa-phone"></i>
                    ${center.phone_number || 'N/A'}
                </div>
            </td>
            <td><span class="badge ${getServiceCenterStatusBadgeClass(center.status)}">${center.status || 'Active'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewServiceCenterDetails('${center.center_id || center._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editServiceCenter('${center.center_id || center._id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="viewServiceCenterJobs('${center.center_id || center._id}')" title="View Jobs">
                        <i class="fas fa-tasks"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Show the table
    if (tableContainer) {
        tableContainer.style.display = "block";
    }
}

// Helper function for service center status badge classes
function getServiceCenterStatusBadgeClass(status) {
    const statusClasses = {
        'active': 'badge-success',
        'approved': 'badge-success',
        'inactive': 'badge-warning',
        'pending': 'badge-warning',
        'suspended': 'badge-danger',
        'rejected': 'badge-danger'
    };
    return statusClasses[status?.toLowerCase()] || 'badge-success';
}

// UI helper functions for service center search
function showServiceCenterLoadingIndicator(show) {
    const indicator = document.getElementById("serviceCenterLoadingIndicator");
    if (indicator) {
        indicator.style.display = show ? "block" : "none";
    } else if (show) {
        // Create loading indicator if it doesn't exist
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "serviceCenterLoadingIndicator";
        loadingDiv.style.cssText = "display: block; text-align: center; padding: 20px;";
        loadingDiv.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2563eb;"></i>
            <p style="margin-top: 10px; color: #64748b;">Searching for service centers...</p>
        `;
        
        const tableContainer = document.getElementById("serviceCentersTableContainer");
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(loadingDiv, tableContainer);
        }
    }
}

function showNoServiceCentersMessage() {
    const message = document.getElementById("noServiceCentersMessage");
    if (message) {
        message.style.display = "block";
    } else {
        // Create no results message if it doesn't exist
        const noResultsDiv = document.createElement("div");
        noResultsDiv.id = "noServiceCentersMessage";
        noResultsDiv.style.cssText = "display: block; text-align: center; padding: 40px;";
        noResultsDiv.innerHTML = `
            <i class="fas fa-building" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px;"></i>
            <h4 style="color: #64748b; margin-bottom: 8px;">No Service Centers Found</h4>
            <p style="color: #9ca3af;">Enter a pincode above to search for service centers in that area.</p>
        `;
        
        const tableContainer = document.getElementById("serviceCentersTableContainer");
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(noResultsDiv, tableContainer);
        }
    }
}

function hideNoServiceCentersMessage() {
    const message = document.getElementById("noServiceCentersMessage");
    if (message) {
        message.style.display = "none";
    }
}

function hideServiceCentersTable() {
    const tableContainer = document.getElementById("serviceCentersTableContainer");
    if (tableContainer) {
        tableContainer.style.display = "none";
    }
}

// Service center action functions
function viewServiceCenterDetails(centerId) {
    showToast(`Viewing details for service center: ${centerId}`, "success");
    // Implement service center details view functionality
    // You can create a modal or navigate to a details page
}

function editServiceCenter(centerId) {
    showToast(`Editing service center: ${centerId}`, "success");
    // Implement service center editing functionality
}

function viewServiceCenterJobs(centerId) {
    showToast(`Viewing jobs for service center: ${centerId}`, "success");
    // Implement functionality to view jobs assigned to this service center
}

// Initialize Service Partners functionality
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
        if (!pinCodesDisplay) return;
        
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
            btn.addEventListener("click", function () {
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
        pinCodeInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                addPinCode();
            }
        });
    }

    // Form validation and submission
    addPartnerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const partnerName = document.getElementById("partnerName")?.value.trim();
        const partnerMobile = document.getElementById("partnerMobile")?.value.trim();
        const partnerPassword = document.getElementById("partnerPassword")?.value;
        const partnerConfirmPassword = document.getElementById("partnerConfirmPassword")?.value;
        const serviceType = document.getElementById("serviceType")?.value;

        let isValid = true;


        // Validate partner name
        if (!partnerName) {
            const errorDiv = document.getElementById("partnerNameError");
            if (errorDiv) errorDiv.textContent = "Partner name is required";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("partnerNameError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Validate mobile number
        if (!partnerMobile || !/^\d{10}$/.test(partnerMobile)) {
            const errorDiv = document.getElementById("partnerMobileError");
            if (errorDiv) errorDiv.textContent = "Enter a valid 10-digit mobile number";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("partnerMobileError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Validate password
        if (!partnerPassword || partnerPassword.length < 6) {
            const errorDiv = document.getElementById("partnerPasswordError");
            if (errorDiv) errorDiv.textContent = "Password must be at least 6 characters";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("partnerPasswordError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Validate confirm password
        if (partnerPassword !== partnerConfirmPassword) {
            const errorDiv = document.getElementById("partnerConfirmPasswordError");
            if (errorDiv) errorDiv.textContent = "Passwords do not match";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("partnerConfirmPasswordError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Validate pin codes
        if (selectedPinCodes.length === 0) {
            const errorDiv = document.getElementById("operatingPinCodesError");
            if (errorDiv) errorDiv.textContent = "At least one pin code is required";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("operatingPinCodesError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Validate service type
        if (!serviceType) {
            const errorDiv = document.getElementById("serviceTypeError");
            if (errorDiv) errorDiv.textContent = "Please select a service type";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("serviceTypeError");
            if (errorDiv) errorDiv.textContent = "";
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
        e.target.reset();
        selectedPinCodes = [];
        updatePinCodesDisplay();

        // Clear all error messages
        document.querySelectorAll(".error-message").forEach(error => {
            error.textContent = "";
        });

        console.log("Partner data:", partnerData);
    });

    // View all partners button
    
        viewAllPartnersBtn.addEventListener("click", function () {
            navigateToSection("list-service-centers");
            showToast("Redirected to List service Centers", "success");
        });
    

    // Cancel button
    if (cancelPartnerBtn) {
        cancelPartnerBtn.addEventListener("click", function () {
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

// Initialize job transfer functionality
function initJobTransfer() {
    const jobTransferForm = document.getElementById("jobTransferForm");
    const findServiceCentersBtn = document.getElementById("findServiceCentersBtn");
    const resetTransferBtn = document.getElementById("resetTransferBtn");

    if (!jobTransferForm) return;

    // Form validation and submission
    jobTransferForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const transferComplaintId = document.getElementById("transferComplaintId")?.value.trim();
        const currentServiceCenter = document.getElementById("currentServiceCenter")?.value.trim();
        const targetServiceCenter = document.getElementById("targetServiceCenter")?.value.trim();
        const transferReason = document.getElementById("transferReason")?.value.trim();

        let isValid = true;

        // Validate complaint ID
        if (!transferComplaintId) {
            const errorDiv = document.getElementById("transferComplaintIdError");
            if (errorDiv) errorDiv.textContent = "Complaint ID is required";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("transferComplaintIdError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Validate current service center
        if (!currentServiceCenter) {
            const errorDiv = document.getElementById("currentServiceCenterError");
            if (errorDiv) errorDiv.textContent = "Current service center is required";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("currentServiceCenterError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Validate target service center
        if (!targetServiceCenter) {
            const errorDiv = document.getElementById("targetServiceCenterError");
            if (errorDiv) errorDiv.textContent = "Target service center is required";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("targetServiceCenterError");
            if (errorDiv) errorDiv.textContent = "";
        }

        // Check if service centers are different
        if (currentServiceCenter === targetServiceCenter && currentServiceCenter && targetServiceCenter) {
            const errorDiv = document.getElementById("targetServiceCenterError");
            if (errorDiv) errorDiv.textContent = "Target service center must be different from current service center";
            isValid = false;
        }

        // Validate transfer reason
        if (!transferReason || transferReason.length < 10) {
            const errorDiv = document.getElementById("transferReasonError");
            if (errorDiv) errorDiv.textContent = "Please provide a detailed reason (minimum 10 characters)";
            isValid = false;
        } else {
            const errorDiv = document.getElementById("transferReasonError");
            if (errorDiv) errorDiv.textContent = "";
        }

        if (!isValid) {
            showToast("Please fill all required fields correctly", "error");
            return;
        }

        // Prepare transfer data
        const transferData = {
            transferComplaintId,
            currentServiceCenter,
            targetServiceCenter,
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
        findServiceCentersBtn.addEventListener("click", function () {
            const targetServiceCenter = document.getElementById("targetServiceCenter")?.value.trim();

            if (!targetServiceCenter) {
                showToast("Please enter target service center first", "warning");
                return;
            }

            showToast(`Searching for service centers: ${targetServiceCenter}`, "success");
            // Here you would typically make an API call to find service centers
        });
    }

    // Reset button
    if (resetTransferBtn) {
        resetTransferBtn.addEventListener("click", function () {
            jobTransferForm.reset();

            // Clear all error messages
            document.querySelectorAll(".error-message").forEach(error => {
                error.textContent = "";
            });

            showToast("Form cleared", "success");
        });
    }
}

// Service center action functions
function viewPartnerDetails(partnerId) {
    showToast(`Viewing details for partner: ${partnerId}`, "success");
    // Implement partner details view functionality
}

function editPartner(partnerId) {
    showToast(`Editing partner: ${partnerId}`, "success");
    // Implement partner editing functionality
}

function viewTransferDetails(complaintId) {
    showToast(`Viewing transfer details for: ${complaintId}`, "success");
    // Implement transfer details view functionality
}

function filterTransferJobs() {
    showToast("Filtering transfer jobs...", "success");
    // Implement transfer jobs filtering functionality
}

// CSV upload handler for service partners
function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
        showToast(`CSV file "${file.name}" uploaded successfully`, "success");
        // Here you would process the CSV file
    } else {
        showToast("Please upload a valid CSV file", "error");
        event.target.value = '';
    }
}

// Reset partner form function
function resetPartnerForm() {
    const form = document.getElementById("addServicePartnerForm");
    if (form) {
        form.reset();
        showToast("Partner form reset", "success");
    }
}

// Utility function to get cookie (if not already defined)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// Export functions if needed for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeServiceCenter,
        setupListServiceCentersSection,
        setupServicePartnersSection,
        setupJobTransferSection
    };
}