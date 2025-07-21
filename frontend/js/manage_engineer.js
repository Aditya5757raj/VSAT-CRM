// Manage Engineer JavaScript functionality
// Handles add-engineer and engineer-list sections

document.addEventListener('DOMContentLoaded', function () {
    // Initialize manage engineer functionality
    initializeManageEngineer();

});

function initializeManageEngineer() {
    // Add event listeners for manage engineer sections
    const addEngineerSection = document.querySelector('[data-section="add-engineer"]');
    const engineerListSection = document.querySelector('[data-section="engineer-list"]');

    if (addEngineerSection) {
        setupAddEngineerSection();
    }

    if (engineerListSection) {
        setupEngineerListSection();
        // Try to load from backend first, fallback to sample data
        loadEngineersList().catch(() => {
            console.log("Backend not available, loading sample data");
        });
    }

    // Also set up navigation listener to load data when section becomes active
    document.addEventListener('click', function (e) {
        if (e.target.matches('[data-section="engineer-list"]')) {
            setTimeout(() => {
                const tableBody = document.getElementById("engineersTableBody");
                if (tableBody && tableBody.children.length === 0) {
                    loadEngineersList()
                }
            }, 100);
        }
    });
}

function setupAddEngineerSection() {
    console.log('Add engineer section initialized');
    initManageEngineers();
}

function setupEngineerListSection() {
    console.log('Engineer list section initialized');
    initEngineerSections();

    // Also load sample data when section is set up
    setTimeout(() => {
        loadEngineersList();
    }, 100);
}

// Initialize Manage Engineers functionality with updated fields
function initManageEngineers() {
    const addEngineerForm = document.getElementById("addEngineerForm");
    const cancelEngineerBtn = document.getElementById("cancelEngineerBtn");
    const operatingPincodeInput = document.getElementById("operating_pincode");
    const assignedServicePartnerInput = document.getElementById("assignedServicePartner");

    if (!addEngineerForm) return;

    // Add event listener for operating pincode to auto-fetch service partner (similar to call_registration.js)
    if (operatingPincodeInput) {
        operatingPincodeInput.addEventListener('input', function () {
            const input = this.value.trim();

            // Extract first valid 6-digit pincode from input
            const matches = input.match(/\b\d{6}\b/);
            if (matches) {
                const pincode = matches[0];
                console.log('Valid pincode found:', pincode);
                fetchServicePartnerByPincode(pincode);
            } else {
                console.log('No valid 6-digit pincode found');
                clearServicePartnerField();
            }
        });

        // Optional: on blur, double-check for first valid pincode again
        operatingPincodeInput.addEventListener('blur', function () {
            const input = this.value.trim();
            const matches = input.match(/\b\d{6}\b/);
            if (matches) {
                const pincode = matches[0];
                console.log('Valid pincode on blur:', pincode);
                fetchServicePartnerByPincode(pincode);
            } else {
                console.log('No valid pincode on blur');
                clearServicePartnerField();
            }
        });
    }

    // Form submission with updated fields
    addEngineerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get form field values - only the specified fields
        const eng_name = document.getElementById("eng_name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const contact = document.getElementById("contact")?.value.trim();
        const qualification = document.getElementById("qualification")?.value.trim();
        const product = document.getElementById("product")?.value.trim();
        const operating_pincode = document.getElementById("operating_pincode")?.value.trim();
        const pan_number = document.getElementById("pan_number")?.value.trim();
        const aadhar_number = document.getElementById("aadhar_number")?.value.trim();
        const driving_license_number = document.getElementById("driving_license_number")?.value.trim();
        const assignedServicePartner = document.getElementById("assignedServicePartner")?.value.trim();

        // File inputs
        const pan_card = document.getElementById("pan_card")?.files[0];
        const aadhar_card = document.getElementById("aadhar_card")?.files[0];
        const driving_licence = document.getElementById("driving_licence")?.files[0];

        let isValid = true;

        // Validate required fields
        // if (!eng_name) {
        //     showFieldError("eng_nameError", "Engineer name is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("eng_nameError");
        // }

        // if (!email || !isValidEmail(email)) {
        //     showFieldError("emailError", "Valid email is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("emailError");
        // }

        // if (!contact || !/^\d{10}$/.test(contact)) {
        //     showFieldError("contactError", "Valid 10-digit contact number is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("contactError");
        // }

        // if (!qualification) {
        //     showFieldError("qualificationError", "Qualification is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("qualificationError");
        // }

        // if (!product) {
        //     showFieldError("productError", "Product specialization is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("productError");
        // }

        // if (!operating_pincode || !/^\d{6}$/.test(operating_pincode)) {
        //     showFieldError("operating_pincodeError", "Valid 6-digit pincode is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("operating_pincodeError");
        // }

        // if (!pan_number || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number)) {
        //     showFieldError("pan_numberError", "Valid PAN number is required (e.g., ABCDE1234F)");
        //     isValid = false;
        // } else {
        //     clearFieldError("pan_numberError");
        // }

        // if (!aadhar_number || !/^\d{12}$/.test(aadhar_number)) {
        //     showFieldError("aadhar_numberError", "Valid 12-digit Aadhar number is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("aadhar_numberError");
        // }

        // if (!driving_license_number) {
        //     showFieldError("driving_license_numberError", "Driving license number is required");
        //     isValid = false;
        // } else {
        //     clearFieldError("driving_license_numberError");
        // }

        // if (!isValid) {
        //     showToast("Please fill all required fields correctly", "error");
        //     return;
        // }

        // Show loading state
        const submitBtn = addEngineerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Engineer...';
        submitBtn.disabled = true;

        try {
            const token = getCookie("token");

            if (!token) {
                throw new Error("Authentication token not found. Please login again.");
            }

            // Create FormData for file uploads
            const formData = new FormData();

            // Add text fields
            formData.append('eng_name', eng_name);
            formData.append('email', email);
            formData.append('contact', contact);
            formData.append('qualification', qualification);
            formData.append('product', product);
            formData.append('operating_pincode', operating_pincode);
            formData.append('pan_number', pan_number);
            formData.append('aadhar_number', aadhar_number);
            formData.append('driving_license_number', driving_license_number);
            if (assignedServicePartner) {
                formData.append('assigned_service_partner', assignedServicePartner);
            }

            // Add files if selected
            if (pan_card) formData.append('pan_card', pan_card);
            if (aadhar_card) formData.append('aadhar_card', aadhar_card);
            if (driving_licence) formData.append('driving_licence', driving_licence);

            console.log("Submitting engineer data to backend");

            const response = await fetch(`${API_URL}/engineer/addEngineer`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Don't set Content-Type for FormData
                },
                body: formData
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || "Failed to add engineer");
            }

            // Success
            showToast("Engineer added successfully! 🎉", "success");
            console.log("Engineer added successfully:", responseData);

            // Reset form
            resetEngineerForm();

            // Reload engineers list if on engineer-list section
            if (document.getElementById("engineer-list")?.classList.contains("active")) {
                loadEngineersList();
            }

        } catch (error) {
            console.error("Error adding engineer:", error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Cancel button
    if (cancelEngineerBtn) {
        cancelEngineerBtn.addEventListener("click", function () {
            resetEngineerForm();
        });
    }
}

// Fetch service partner by pincode
async function fetchServicePartnerByPincode(pincode) {
    const servicePartnerInput = document.getElementById("assignedServicePartner");
    const errorDiv = document.getElementById("assignedServicePartnerError");

    if (!servicePartnerInput) {
        console.error('Service partner input field not found');
        return;
    }

    console.log(`🔍 Fetching service partner for pincode: ${pincode}`);

    try {
        // Show loading state
        servicePartnerInput.value = "Searching...";
        servicePartnerInput.disabled = true;

        if (errorDiv) {
            errorDiv.textContent = "";
            errorDiv.style.display = "none";
        }

        const token = getCookie("token");
        if (!token) {
            throw new Error("Authentication token not found");
        }

        console.log('🌐 Making API request to fetch service partner');

        // Use the same API endpoint as call_registration.js
        const response = await fetch(`${API_URL}/admin/getserviceCenter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ pincode: pincode })
        });

        console.log('📡 API Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch service partner");
        }

        const data = await response.json();
        console.log("Service partner data:", data);

        // Handle response similar to call_registration.js
        let servicePartnerName = null;

        // Check different possible response structures
        if (data.partner_name) {
            servicePartnerName = data.partner_name;
        } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            servicePartnerName = data.data[0].partner_name || data.data[0].company_name;
        } else if (data.data && data.data.partner_name) {
            servicePartnerName = data.data.partner_name;
        }

        console.log('🏢 Service partner name found:', servicePartnerName);

        if (servicePartnerName) {
            servicePartnerInput.value = servicePartnerName;
            console.log('✅ Service partner assigned successfully');
            //showToast(`✅ Service partner assigned: ${servicePartnerName}`, "success");
        } else {
            servicePartnerInput.value = "No service partner found";
            console.log('⚠️ No service partner found for this pincode');

            if (errorDiv) {
                errorDiv.textContent = "No service partner found for this pincode";
                errorDiv.style.display = "block";
            }
            //showToast("⚠️ No service partner found for this pincode", "warning");
        }

    } catch (error) {
        console.error("Error fetching service partner:", error);
        servicePartnerInput.value = "Error fetching service partner";

        if (errorDiv) {
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.style.display = "block";
        }

        showToast(`❌ Error: ${error.message}`, "error");
    } finally {
        // Re-enable the input field
        servicePartnerInput.disabled = false;
    }
}

// Clear service partner field
function clearServicePartnerField() {
    const servicePartnerInput = document.getElementById("assignedServicePartner");
    const errorDiv = document.getElementById("assignedServicePartnerError");

    if (servicePartnerInput) {
        servicePartnerInput.value = "Service partner will be auto-assigned";
        servicePartnerInput.disabled = false;
    }
    if (errorDiv) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    }
}

// Load engineers list from backend
async function loadEngineersList() {
    const engineersTableBody = document.getElementById("engineersTableBody");
    const engineersLoadingIndicator = document.getElementById("engineersLoadingIndicator");
    console.log("Request coming to loadEngineerLst manage_engineer");
    if (!engineersTableBody) {
        console.error("❌ engineersTableBody element not found in DOM.");
        return;
    } else {
        console.log("✅ engineersTableBody element found.");
    }
    console.log("Request coming to loadEngineerLst manage_engineer");
    try {
        const token = getCookie("token");

        if (!token) {
            showToast("Authentication token not found", "error");
            return;
        }

        // Show loading indicator
        if (engineersLoadingIndicator) {
            engineersLoadingIndicator.style.display = "block";
        }

        console.log("Loading engineers from backend");

        const response = await fetch(`${API_URL}/engineer/listengineer`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to load engineers");
        }

        const resData = await response.json();
        const engineers = resData.data || [];
        // Clear existing rows
        engineersTableBody.innerHTML = "";

        if (engineers.length === 0) {
            engineersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">
                        <i class="fas fa-users" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                        No engineers found
                    </td>
                </tr>
            `;
            return;
        }

        // Display engineers in table with updated format
        engineers.forEach((engineer, index) => {
            const row = document.createElement("tr");
            const engineerdata = encodeURIComponent(JSON.stringify(engineer).replace(/'/g, "\\'"));

            row.innerHTML = `
    <td><span class="engineer-id">#${engineer.engineer_id || engineer._id || (index + 1)}</span></td>
    <td>
        <div class="engineer-cell">
            <p class="engineer-name">${engineer.eng_name || 'N/A'}</p>
        </div>
    </td>
    <td>
        <div class="contact-cell">
            <i class="fas fa-phone"></i>
            ${engineer.contact || 'N/A'}
        </div>
    </td>
    <td>${engineer.email || 'N/A'}</td>
    <td>
        <div class="location-cell">
            <i class="fas fa-map-marker-alt"></i>
            ${Array.isArray(engineer.pincodes) && engineer.pincodes.length > 0
                    ? engineer.pincodes.map(p => p.pincode).join(', ')
                    : 'N/A'}
        </div>
    </td>
    <td>
        <span class="badge badge-success">${engineer.status || 'N/A'}</span>
    </td>
    <td>
        <div class="action-buttons">
            <button class="action-btn" onclick="viewEngineerDetails('${engineerdata}')" title="View Details">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn" onclick="editEngineer('${engineerdata}')" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn" onclick="deleteEngineer('${engineer.engineer_id || engineer._id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </td>
`;

            engineersTableBody.appendChild(row);
        });

        showToast(`Loaded ${engineers.length} engineer(s)`, "success");

    } catch (error) {
        console.error("Error loading engineers:", error);
        showToast(`Error loading engineers: ${error.message}`, "error");

        if (engineersTableBody) {
            engineersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #dc2626;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                        Error loading engineers
                    </td>
                </tr>
            `;
        }
    } finally {
        // Hide loading indicator
        if (engineersLoadingIndicator) {
            engineersLoadingIndicator.style.display = "none";
        }
    }
}

// Initialize Engineer Sections functionality (for engineer-list section)
function initEngineerSections() {
    const refreshEngineersBtn = document.getElementById("refreshEngineersBtn");
    const searchEngineersInput = document.getElementById("searchEngineersInput");

    // Refresh engineers list
    if (refreshEngineersBtn) {
        refreshEngineersBtn.addEventListener("click", function () {
            loadEngineersList();
            showToast("Engineers list refreshed", "success");
        });
    }

    // Search engineers
    if (searchEngineersInput) {
        searchEngineersInput.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            filterEngineersTable(searchTerm);
        });
    }

    // Load sample data immediately
    loadEngineersList()
}

// Filter engineers table based on search term
function filterEngineersTable(searchTerm) {
    const tableRows = document.querySelectorAll("#engineersTableBody tr");
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
    });
}

// Global functions for engineer management
window.viewEngineerDetails = function (engineerdata) {
    loadEngineerDetailsModal(engineerdata);
};

window.editEngineer = function (engineerId) {
    showToast(`Editing engineer: ${engineerId}`, "success");
    // TODO: Implement engineer editing functionality
};

window.deleteEngineer = async function (engineerId) {
    if (!confirm("Are you sure you want to delete this engineer?")) {
        return;
    }

    try {
        const token = getCookie("token");

        if (!token) {
            showToast("Authentication token not found", "error");
            return;
        }

        const response = await fetch(`${API_URL}/engineer/delete/${engineerId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete engineer");
        }

        showToast("Engineer deleted successfully", "success");
        loadEngineersList(); // Reload the list

    } catch (error) {
        console.error("Error deleting engineer:", error);
        showToast(`Error: ${error.message}`, "error");
    }
};

// Load engineer details into modal
async function loadEngineerDetailsModal(engineerdata) {
    try {
        const engineer = JSON.parse(decodeURIComponent(engineerdata));
        console.log("Engineer-data-->", engineer)
        showEngineerDetailsModal();
        document.getElementById("detailEngineerId").textContent = "Loading...";
        document.getElementById("detailEngineerId").textContent = engineer.engineer_id || engineer._id || 'N/A';
        document.getElementById("detailEngineerName").textContent = engineer.eng_name || 'N/A';
        document.getElementById("detailEngineerEmail").textContent = engineer.email || 'N/A';
        document.getElementById("detailEngineerContact").textContent = engineer.contact || 'N/A';
        document.getElementById("detailEngineerQualification").textContent = engineer.qualification || 'N/A';
        document.getElementById("detailEngineerProduct").textContent = engineer.product || 'N/A';
        document.getElementById("detailEngineerPincode").textContent =
            Array.isArray(engineer.pincodes) && engineer.pincodes.length > 0
                ? engineer.pincodes.map(p => p.pincode).join(', ')
                : engineer.operating_pincode || 'N/A';
        document.getElementById("detailPanNumber").textContent = engineer.pan_number || 'N/A';
        document.getElementById("detailAadharNumber").textContent = engineer.aadhar_number || 'N/A';
        document.getElementById("detailDrivingLicenseNumber").textContent = engineer.driving_license_number || 'N/A';
        document.getElementById("detailEngineerRegDate").textContent = engineer.created_at ?
            new Date(engineer.created_at).toLocaleDateString() : 'N/A';

        // Update document status
        updateDocumentStatus('detailPanCard', 'viewPanCardBtn', engineer.pan_card);
        updateDocumentStatus('detailAadharCard', 'viewAadharCardBtn', engineer.aadhar_card);
        updateDocumentStatus('detailDrivingLicense', 'viewDrivingLicenseBtn', engineer.driving_licence);

        // Store engineer ID for edit functionality
        document.getElementById("engineerDetailsModal").dataset.engineerId = engineer.engineer_id || engineer._id || '';


    } catch (error) {
        console.error("Error loading engineer details:", error);
        showToast(`Error: ${error.message}`, "error");
        closeEngineerDetailsModal();
    }
}

// Update document status in modal
function updateDocumentStatus(statusElementId, buttonElementId, documentPath) {
    const statusElement = document.getElementById(statusElementId);
    const buttonElement = document.getElementById(buttonElementId);

    if (documentPath) {
        statusElement.textContent = "Uploaded";
        statusElement.className = "doc-status uploaded";
        buttonElement.style.display = "inline-block";
    } else {
        statusElement.textContent = "Not uploaded";
        statusElement.className = "doc-status not-uploaded";
        buttonElement.style.display = "none";
    }
}

// Show engineer details modal
function showEngineerDetailsModal() {
    const modal = document.getElementById("engineerDetailsModal");
    if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

// Close engineer details modal
window.closeEngineerDetailsModal = function () {
    const modal = document.getElementById("engineerDetailsModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

// Edit engineer from modal
// Edit engineer from modal
window.editEngineer = async function (engineerdata) {
    try {
        const engineer = JSON.parse(decodeURIComponent(engineerdata));
        console.log('editengineer', engineer)

        openEngineerEditModal(engineer); // 👈 opens and fills the modal

    } catch (error) {
        console.error("Error fetching engineer:", error);
        showToast(`❌ ${error.message}`, "error");
    }
};

function openEngineerEditModal(engineer) {
    document.getElementById("editEngineerId").value = engineer.engineer_id || engineer._id || "";
    document.getElementById("editFullName").value = engineer.eng_name || "";
    document.getElementById("editEmail").value = engineer.email || "";
    document.getElementById("editPhone").value = engineer.contact || "";
    document.getElementById("editQualification").value = engineer.qualification || "";
    document.getElementById("editProductSpecialization").value = engineer.product || "";
    document.getElementById("editPincode").value =
        Array.isArray(engineer.pincodes) && engineer.pincodes.length > 0
            ? engineer.pincodes.map(p => p.pincode).join(', ')
            : engineer.operating_pincode || "";

    document.getElementById("editPAN").value = engineer.pan_number || "";
    document.getElementById("editAadhar").value = engineer.aadhar_number || "";
    document.getElementById("editLicense").value = engineer.driving_license_number || "";
    document.getElementById("editStatus").value = engineer.status || "Active";
    // Show modal
    const modal = document.getElementById("editEngineerModal");
    modal.style.display = "flex";
    modal.style.opacity = "1";
}


document.getElementById("saveEditBtn").addEventListener("click", async function () {
    const engineerId = document.getElementById("editEngineerId").value;

    const formData = new FormData();
    formData.append("eng_name", document.getElementById("editFullName").value.trim());
    formData.append("email", document.getElementById("editEmail").value.trim());
    formData.append("contact", document.getElementById("editPhone").value.trim());
    formData.append("qualification", document.getElementById("editQualification").value.trim());
    formData.append("product", document.getElementById("editProductSpecialization").value.trim());
    formData.append("operating_pincode", document.getElementById("editPincode").value.trim());
    formData.append("pan_number", document.getElementById("editPAN").value.trim());
    formData.append("aadhar_number", document.getElementById("editAadhar").value.trim());
    formData.append("driving_license_number", document.getElementById("editLicense").value.trim());
    formData.append("status", document.getElementById("editStatus").value);

    // Append only selected files
    const panFile = document.getElementById("editPANFile").files[0];
    const aadharFile = document.getElementById("editAadharFile").files[0];
    const licenseFile = document.getElementById("editLicenseFile").files[0];

    if (panFile) formData.append("pan_card", panFile);
    if (aadharFile) formData.append("aadhar_card", aadharFile);
    if (licenseFile) formData.append("driving_licence", licenseFile);

    const saveBtn = this;
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    saveBtn.disabled = true;

    try {
        const token = getCookie("token");

        const response = await fetch(`${API_URL}/engineer/update/${engineerId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}` // Don't set Content-Type for FormData
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Failed to update engineer");

        showToast("✅ Engineer updated successfully!", "success");
        document.getElementById("editEngineerModal").style.display = "none";
        loadEngineersList();

    } catch (error) {
        console.error("Error updating engineer:", error);
        showToast(`❌ ${error.message}`, "error");
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
});


// View document
window.viewDocument = function (documentType) {
    const engineerId = document.getElementById("engineerDetailsModal").dataset.engineerId;
    if (engineerId && documentType) {
        // Open document in new tab
        const documentUrl = `${API_URL}/engineer/document/${engineerId}/${documentType}`;
        window.open(documentUrl, '_blank');
    }
};

// Close modal when clicking outside
document.addEventListener('click', function (event) {
    const modal = document.getElementById("engineerDetailsModal");
    if (event.target === modal) {
        closeEngineerDetailsModal();
    }
});

// Helper functions
function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Reset engineer form function
// function resetEngineerForm() {
//     const form = document.getElementById("addEngineerForm");
//     if (form) {
//         form.reset();

//         // Clear all error messages
//         document.querySelectorAll(".error-message").forEach(error => {
//             error.textContent = "";
//             error.style.display = "none";
//         });

//         showToast("Engineer form reset", "success");
//     }
// }
function resetEngineerForm() {
    // Text and dropdown inputs
    const fieldsToClear = [
        "eng_name",
        "email",
        "contact",
        "qualification",
        "product",
        "operating_pincode",
        "pan_number",
        "aadhar_number",
        "driving_license_number",
        "assignedServicePartner"
    ];

    fieldsToClear.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.value = ""; // Clears text and select values
        }
    });

    // File inputs
    const fileInputs = ["pan_card", "aadhar_card", "driving_licence"];
    fileInputs.forEach(id => {
        const fileInput = document.getElementById(id);
        if (fileInput) {
            fileInput.value = ""; // Clears file selection
        }
    });

    // Clear error messages if any
    document.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
        error.style.display = "none";
    });

    // Optional: show confirmation
    showToast("Engineer form reset", "success");
}


// Make functions globally available
window.resetEngineerForm = resetEngineerForm;
window.loadEngineersList = loadEngineersList;

// Utility function to get cookie (if not already defined)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// Utility function for toast notifications (if not already defined)
function showToast(message, type = "success", duration = 3000) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    // Prevent duplicate toast messages
    if (Array.from(container.children).some(toast => {
        const toastMsg = toast.querySelector('.toast-message')?.textContent || toast.textContent;
        return toastMsg.trim() === message.trim();
    })) {
        return;
    }

    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;

    // Create message element
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

// Navigation function (if not already defined)
function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
        section.classList.add("active");

        document.querySelectorAll(".nav-item").forEach((item) => {
            item.classList.toggle("active", item.dataset.section === sectionId);
        });
    }
}

// Export functions if needed for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeManageEngineer,
        setupAddEngineerSection,
        setupEngineerListSection,
        initManageEngineers,
        initEngineerSections,
        loadEngineersList
    };
}