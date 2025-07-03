// Service Center JavaScript functionality
// Handles list-service-centers, service-partners, and job-transfer sections

document.addEventListener('DOMContentLoaded', function () {
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
    console.log("servicecenter->" + token)

    // Show loading indicator
    showServiceCenterLoadingIndicator(true);
    hideNoServiceCentersMessage();
    hideServiceCentersTable();

    try {
        console.log("Searching service centers for pincode:", pincode);

        const response = await fetch(`${API_URL}/admin/getserviceCenter`, {
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

        let centers = [];

        // ✅ Check the correct path where the service center list exists
        if (Array.isArray(data.data)) {
            centers = data.data;
        } else if (data.center_id) {
            centers = [data]; // fallback for single object
        }

        if (centers.length > 0) {
            displayServiceCentersInTable(centers);
            showToast(`Found ${centers.length} service center(s) for pincode ${pincode}`, "success");
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

        // Format operating pincodes from array
        const operatingPincodes = Array.isArray(center.pincodes) && center.pincodes.length > 0
            ? center.pincodes.join(", ")
            : "N/A";

        row.innerHTML = `
            <td><span class="job-id">${center.center_id || center._id || 'N/A'}</span></td>
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
                    <p class="phone">${center.phone_number || 'N/A'}</p>
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
}

function editServiceCenter(centerId) {
    showToast(`Editing service center: ${centerId}`, "success");
    // Implement service center editing functionality
}

function viewServiceCenterJobs(centerId) {
    showToast(`Viewing jobs for service center: ${centerId}`, "success");
    // Implement functionality to view jobs assigned to this service center
}

// Initialize Service Partners functionality with file uploads and CSV support
function initServicePartners() {
    const addPartnerForm = document.getElementById("addServicePartnerForm");
    const viewAllPartnersBtn = document.getElementById("viewAllPartnersBtn");
    const cancelPartnerBtn = document.getElementById("cancelPartnerBtn");

    if (!addPartnerForm) return;

    let uploadedFiles = {
        gst_certificate: null,
        pan_card_document: null,
        aadhar_card_document: null,
        company_reg_certificate: null,
        pincode_csv: null
    };

    // Enhanced field validation functions
    function validateField(fieldId, condition, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + "Error");

        if (field) {
            field.classList.toggle("input-error", !condition);
            field.classList.toggle("input-valid", condition);
        }

        if (errorDiv) {
            errorDiv.textContent = condition ? "" : errorMessage;
            errorDiv.style.display = condition ? "none" : "block";
        }

        return condition;
    }

    // Real-time validation for all form fields
    const partnerNameField = document.getElementById("partnerName");
    if (partnerNameField) {
        partnerNameField.addEventListener("input", function () {
            const value = this.value.trim();
            validateField("partnerName", value.length >= 2, "Partner name is required and must be at least 2 characters long");
        });
    }

    const contactPersonField = document.getElementById("contactPerson");
    if (contactPersonField) {
        contactPersonField.addEventListener("input", function () {
            const value = this.value.trim();
            validateField("contactPerson", value.length >= 2, "Contact person name is required and must be at least 2 characters long");
        });
    }

    const partnerMobileField = document.getElementById("partnerMobile");
    if (partnerMobileField) {
        partnerMobileField.addEventListener("input", function () {
            const value = this.value.trim();
            validateField("partnerMobile", /^\d{10}$/.test(value), "Enter a valid 10-digit mobile number");
        });
    }

    const partnerEmailField = document.getElementById("partnerEmail");
    if (partnerEmailField) {
        partnerEmailField.addEventListener("input", function () {
            const value = this.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            validateField("partnerEmail", emailRegex.test(value), "Enter a valid email address");
        });
    }

    const gstNumberField = document.getElementById("gstNumber");
    if (gstNumberField) {
        gstNumberField.addEventListener("input", function () {
            const value = this.value.trim().toUpperCase();
            this.value = value; // Convert to uppercase
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            validateField("gstNumber", gstRegex.test(value), "Enter a valid GST number (15 characters)");
        });
    }

    const panNumberField = document.getElementById("panNumber");
    if (panNumberField) {
        panNumberField.addEventListener("input", function () {
            const value = this.value.trim().toUpperCase();
            this.value = value; // Convert to uppercase
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            validateField("panNumber", panRegex.test(value), "Enter a valid PAN number (10 characters)");
        });
    }

    const aadharNumberField = document.getElementById("aadharNumber");
    if (aadharNumberField) {
        aadharNumberField.addEventListener("input", function () {
            const value = this.value.trim();
            validateField("aadharNumber", /^\d{12}$/.test(value), "Enter a valid 12-digit Aadhar number");
        });
    }

    const companyAddressField = document.getElementById("companyAddress");
    if (companyAddressField) {
        companyAddressField.addEventListener("input", function () {
            const value = this.value.trim();
            validateField("companyAddress", value.length >= 10, "Company address is required and must be at least 10 characters long");
        });
    }

    // File upload handlers for each document type
    const fileInputs = {
        'gstCertificate': 'gst_certificate',
        'panCard': 'pan_card_document',
        'aadharCard': 'aadhar_card_document',
        'companyRegCertificate': 'company_reg_certificate',
        'pincodeCSV': 'pincode_csv'
    };

    Object.keys(fileInputs).forEach(inputId => {
        const fileInput = document.getElementById(inputId);
        if (fileInput) {
            fileInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                const fieldName = fileInputs[inputId];

                if (file) {
                    // Validate file type for CSV
                    if (fieldName === 'pincode_csv' && !file.name.toLowerCase().endsWith('.csv')) {
                        showToast("Please upload a valid CSV file for pincodes", "error");
                        e.target.value = '';
                        return;
                    }

                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showToast("File size should not exceed 5MB", "error");
                        e.target.value = '';
                        return;
                    }

                    uploadedFiles[fieldName] = file;
                    showToast(`${file.name} uploaded successfully`, "success");

                    // Update file display
                    updateFileDisplay(inputId, file.name);
                } else {
                    uploadedFiles[fieldName] = null;
                }
            });
        }
    });

    // Function to update file display
    function updateFileDisplay(inputId, fileName) {
        const displayElement = document.getElementById(inputId + 'Display');
        if (displayElement) {
            displayElement.textContent = fileName;
            displayElement.style.color = '#059669';
        }
    }

    // Enhanced form validation and submission with file uploads
    addPartnerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get all form field values
        const partnerName = document.getElementById("partnerName")?.value.trim();
        const contactPerson = document.getElementById("contactPerson")?.value.trim();
        const partnerMobile = document.getElementById("partnerMobile")?.value.trim();
        const partnerEmail = document.getElementById("partnerEmail")?.value.trim();
        const gstNumber = document.getElementById("gstNumber")?.value.trim();
        const panNumber = document.getElementById("panNumber")?.value.trim();
        const aadharNumber = document.getElementById("aadharNumber")?.value.trim();
        const companyAddress = document.getElementById("companyAddress")?.value.trim();

        let isValid = true;

        // Comprehensive validation
        if (!partnerName || partnerName.length < 2) {
            validateField("partnerName", false, "Partner name is required and must be at least 2 characters long");
            isValid = false;
        } else {
            validateField("partnerName", true, "");
        }

        if (!contactPerson || contactPerson.length < 2) {
            validateField("contactPerson", false, "Contact person name is required and must be at least 2 characters long");
            isValid = false;
        } else {
            validateField("contactPerson", true, "");
        }

        if (!partnerMobile || !/^\d{10}$/.test(partnerMobile)) {
            validateField("partnerMobile", false, "Enter a valid 10-digit mobile number");
            isValid = false;
        } else {
            validateField("partnerMobile", true, "");
        }

        if (!partnerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
            validateField("partnerEmail", false, "Enter a valid email address");
            isValid = false;
        } else {
            validateField("partnerEmail", true, "");
        }

        if (!gstNumber || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber)) {
            validateField("gstNumber", false, "Enter a valid GST number (15 characters)");
            isValid = false;
        } else {
            validateField("gstNumber", true, "");
        }

        if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
            validateField("panNumber", false, "Enter a valid PAN number (10 characters)");
            isValid = false;
        } else {
            validateField("panNumber", true, "");
        }

        if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
            validateField("aadharNumber", false, "Enter a valid 12-digit Aadhar number");
            isValid = false;
        } else {
            validateField("aadharNumber", true, "");
        }

        if (!companyAddress || companyAddress.length < 10) {
            validateField("companyAddress", false, "Company address is required and must be at least 10 characters long");
            isValid = false;
        } else {
            validateField("companyAddress", true, "");
        }

        // Validate required file uploads
        if (!uploadedFiles.gst_certificate) {
            showToast("GST Certificate is required", "error");
            isValid = false;
        }

        if (!uploadedFiles.pan_card_document) {
            showToast("PAN Card document is required", "error");
            isValid = false;
        }

        if (!uploadedFiles.aadhar_card_document) {
            showToast("Aadhar Card document is required", "error");
            isValid = false;
        }

        if (!uploadedFiles.company_reg_certificate) {
            showToast("Company Registration Certificate is required", "error");
            isValid = false;
        }

        if (!uploadedFiles.pincode_csv) {
            showToast("Pincode CSV file is required", "error");
            isValid = false;
        }

        if (!isValid) {
            showToast("Please fix all validation errors before submitting", "error");
            return;
        }

        // Show loading state
        const submitBtn = addPartnerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Service Partner...';
        submitBtn.disabled = true;

        try {
            const token = getCookie("token");

            if (!token) {
                throw new Error("Authentication token not found. Please login again.");
            }

            // Create FormData for file uploads
            const formData = new FormData();

            // Add text fields
            formData.append('partner_name', partnerName);
            formData.append('contact_person', contactPerson);
            formData.append('phone_number', partnerMobile);
            formData.append('email', partnerEmail);
            formData.append('gst_number', gstNumber);
            formData.append('pan_number', panNumber);
            formData.append('aadhar_number', aadharNumber);
            formData.append('company_address', companyAddress);

            // Add files
            Object.keys(uploadedFiles).forEach(key => {
                if (uploadedFiles[key]) {
                    formData.append(key, uploadedFiles[key]);
                }
            });

            console.log("Submitting service center data with files");

            const response = await fetch(`${API_URL}/admin/register-servicecenter`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Don't set Content-Type for FormData, browser will set it automatically
                },
                body: formData
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Handle specific field errors from backend
                if (responseData.fieldErrors) {
                    Object.keys(responseData.fieldErrors).forEach(field => {
                        const errorDiv = document.getElementById(field + "Error");
                        if (errorDiv) {
                            errorDiv.textContent = responseData.fieldErrors[field];
                            errorDiv.style.display = "block";
                        }
                        showToast(`${field}: ${responseData.fieldErrors[field]}`, "error");
                    });
                } else {
                    throw new Error(responseData.message || responseData.error || "Failed to add service partner");
                }
                return;
            }

            // Success
            showToast("Service partner added successfully!", "success");
            console.log("Service center added successfully:", responseData);

            // Reset form
            resetPartnerForm();

        } catch (error) {
            console.error("Error adding service partner:", error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // View all partners button
    if (viewAllPartnersBtn) {
        viewAllPartnersBtn.addEventListener("click", function () {
            navigateToSection("list-service-centers");
            showToast("Redirected to List Service Centers", "success");
        });
    }

    // Cancel button with confirmation
    if (cancelPartnerBtn) {
        cancelPartnerBtn.addEventListener("click", function () {
            // Check if form has data
            const hasFormData = addPartnerForm.querySelector('input[value!=""], textarea[value!=""]');
            const hasFiles = Object.values(uploadedFiles).some(file => file !== null);

            if (hasFormData || hasFiles) {
                if (confirm("Are you sure you want to clear all form data and uploaded files?")) {
                    resetPartnerForm();
                }
            } else {
                resetPartnerForm();
            }
        });
    }

    // Reset partner form function
    function resetPartnerForm() {
        addPartnerForm.reset();

        // Reset uploaded files
        uploadedFiles = {
            gst_certificate: null,
            pan_card_document: null,
            aadhar_card_document: null,
            company_reg_certificate: null,
            pincode_csv: null
        };

        // Clear file displays
        Object.keys(fileInputs).forEach(inputId => {
            const displayElement = document.getElementById(inputId + 'Display');
            if (displayElement) {
                displayElement.textContent = '';
            }
        });

        // Clear all error messages
        document.querySelectorAll(".error-message").forEach(error => {
            error.textContent = "";
            error.style.display = "none";
        });

        // Clear field validation classes
        document.querySelectorAll("input, select, textarea").forEach(field => {
            field.classList.remove("input-error", "input-valid");
        });

        showToast("Form cleared", "success");
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