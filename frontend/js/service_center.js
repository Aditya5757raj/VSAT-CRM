// Service Center JavaScript functionality
// Handles list-service-centers, service-partners, and job-transfer sections

// Global variable to store all service centers for filtering
let allServiceCenters = [];

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

    // Initialize Service Centers functionality with auto-load
    initServiceCenters();

    // Auto-load service centers when section is initialized
    loadAllServiceCenters();
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
    // Initialize filter buttons with new labels and functionality
    const filterBtns = document.querySelectorAll(".tab-btn");

    // Update button labels and data attributes
    filterBtns.forEach(btn => {
        const currentText = btn.textContent.trim();
        if (currentText === "All centers") {
            btn.textContent = "All Centers";
            btn.dataset.status = "all";
        } else if (currentText === "Active Centers") {
            btn.textContent = "Active Centers";
            btn.dataset.status = "active";
        } else if (currentText === "Inactive Centers") {
            btn.textContent = "Inactive Centers";
            btn.dataset.status = "inactive";
        }
    });

    // Handle filter button clicks
    filterBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            // Remove active class from all tabs
            filterBtns.forEach(tab => tab.classList.remove("active"));

            // Add active class to clicked tab
            this.classList.add("active");

            const status = this.dataset.status;
            filterServiceCentersByStatus(status);
            // showToast(`Showing ${status === 'all' ? 'all' : status} service centers`, "success");
        });
    });

    // Set "All Centers" as default active
    const allCentersBtn = document.querySelector('.tab-btn[data-status="all"]');
    if (allCentersBtn) {
        allCentersBtn.classList.add("active");
    }

    // Initialize search functionality (keep existing search by pincode)
    initServiceCenterSearch();
}

// Initialize search functionality
function initServiceCenterSearch() {
    const searchBtn = document.getElementById("searchServiceCentersBtn");
    const pinCodeInput = document.getElementById("serviceCenterPinCode");
    const clearSearchBtn = document.getElementById("clearServiceCenterSearchBtn");

    if (searchBtn && pinCodeInput) {
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
    }

    // Clear search functionality
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", function () {
            if (pinCodeInput) pinCodeInput.value = "";

            // Show all service centers again
            loadAllServiceCenters();
            // showToast("Search cleared - showing all service centers", "success");
        });
    }
}

// Load all service centers from backend (similar to loadEngineersList)
async function loadAllServiceCenters() {
    const serviceLoadingIndicator = document.getElementById("serviceCenterLoadingIndicator");
    const tableContainer = document.getElementById("serviceCentersTableContainer");
    const resultCard = document.getElementById("serviceCentersResultCard");

    try {
        const token = getCookie("token");

        if (!token) {
            // showToast("Authentication token not found", "error");
            return;
        }

        // Show loading indicator
        showServiceCenterLoadingIndicator(true);
        hideNoServiceCentersMessage();

        console.log("Loading all service centers from backend");

        const response = await fetch(`${API_URL}/admin/getAllServiceCenters`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to load service centers");
        }

        const resData = await response.json();
        const serviceCenters = resData.data || resData || [];

        // Store all service centers globally for filtering
        allServiceCenters = serviceCenters;

        if (serviceCenters.length === 0) {
            displayEmptyServiceCentersTable('all');
            return;
        }

        // Display all service centers
        displayServiceCentersInTable(serviceCenters);

        // Show result card
        if (resultCard) resultCard.style.display = "block";
        if (tableContainer) tableContainer.style.display = "block";

        // showToast(`Loaded ${serviceCenters.length} service center(s)`, "success");

    } catch (error) {
        console.error("Error loading service centers:", error);
        showToast(`Error loading service centers: ${error.message}`, "error");
        displayEmptyServiceCentersTable('error');

    } finally {
        showServiceCenterLoadingIndicator(false);
    }
}

// Filter service centers by status
function filterServiceCentersByStatus(status) {
    let filteredCenters = [];

    if (status === "all") {
        filteredCenters = allServiceCenters;
    } else {
        filteredCenters = allServiceCenters.filter(center => {
            const centerStatus = (center.status || 'active').toLowerCase();
            return centerStatus === status.toLowerCase();
        });
    }

    if (filteredCenters.length === 0) {
        displayEmptyServiceCentersTable(status);
        // showToast(`No ${status === 'all' ? '' : status} service centers found`, "warning");
    } else {
        hideNoServiceCentersMessage();
        displayServiceCentersInTable(filteredCenters);
        const resultCard = document.getElementById("serviceCentersResultCard");
        if (resultCard) resultCard.style.display = "block";
    }
}

// Function to search service centers via API
async function searchServiceCentersByPincode(pincode) {
    const token = getCookie("token");

    if (!token) {
        showToast("Authentication token not found", "error");
        return;
    }

    console.log("servicecenter->" + token);

    // Hide any existing messages and prepare for search results
    hideNoServiceCentersMessage();

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

        if (Array.isArray(data.data)) {
            centers = data.data;
        } else if (data.center_id) {
            centers = [data];
        }

        if (centers.length > 0) {
            displayServiceCentersInTable(centers);
            showToast(`Found ${centers.length} service center(s) for pincode ${pincode}`, "success");
            
            // Show result card when data found
            const resultCard = document.getElementById("serviceCentersResultCard");
            if (resultCard) resultCard.style.display = "block";
        } else {
            displayEmptyServiceCentersTable('search');
            showToast("No service centers found for the specified pincode", "warning");
            
            // Show result card even when no data found (to show empty table)
            const resultCard = document.getElementById("serviceCentersResultCard");
            if (resultCard) resultCard.style.display = "block";
        }

    } catch (error) {
        console.error("Error searching service centers:", error);
        // showToast(`Error searching service centers: ${error.message}`, "error");
        displayEmptyServiceCentersTable('error');
        
        // Show result card even on error (to show error message in table)
        const resultCard = document.getElementById("serviceCentersResultCard");
        if (resultCard) resultCard.style.display = "block";
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
        const centerdata = encodeURIComponent(JSON.stringify(center));
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
                </div>
            </td>
            <td>
                <div class="phone-cell">
                    <i class="fas fa-phone"></i>
                    ${center.phone_number || 'N/A'}
                </div>
            </td>
            <td><span class="badge ${getServiceCenterStatusBadgeClass(center.status)}">${center.status || 'N/A'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewServiceCenterDetails1('${centerdata}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editServiceCenter('${centerdata}')" title="Edit">
                        <i class="fas fa-edit"></i>
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

// Function to display empty table with message
function displayEmptyServiceCentersTable(status) {
    const tableBody = document.getElementById("partnersListTable");
    const tableContainer = document.getElementById("serviceCentersTableContainer");
    const resultCard = document.getElementById("serviceCentersResultCard");

    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    // Add empty state row
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
        <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fas fa-building" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px; display: block;"></i>
            <h4 style="color: #64748b; margin-bottom: 8px;">No ${status === 'all' ? '' : status.charAt(0).toUpperCase() + status.slice(1)} Service Centers Found</h4>
            <p style="color: #9ca3af;">No service centers match the current filter criteria.</p>
        </td>
    `;
    tableBody.appendChild(emptyRow);

    // Show the table and result card
    if (tableContainer) {
        tableContainer.style.display = "block";
    }
    if (resultCard) {
        resultCard.style.display = "block";
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


// Service center action functions
function viewServiceCenterDetails1(centerdata) {
    console.log("🟢 Raw service center data:", centerdata);

    let center;
    try {
        center = JSON.parse(decodeURIComponent(centerdata));
        console.log("✅ Decoded & parsed:", center);
    } catch (err) {
        console.error("❌ Failed to parse service center data:", err);
        return;
    }

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`⚠ Element with id '${id}' not found`);
            return;
        }
        el.innerText = value || 'N/A';
    };

    setText("scCenterId", center.center_id || center._id);
    setText("scPartnerName", center.partner_name);
    setText("scContactPerson", center.contact_person);
    setText("scEmail", center.email);
    setText("scPhone", center.phone_number);
    setText(
        "scOperatingPincodes",
        Array.isArray(center.pincodes) && center.pincodes.length > 0
            ? center.pincodes.join(", ")
            : "N/A"
    );
    setText("scStatus", center.status || 'Active');
    // 🔥 Add Identity Info here
    setText("scGstNumber", center.gst_number);
    setText("scPanNumber", center.pan_number);
    setText("scAadharNumber", center.aadhar_number);

    document.getElementById("serviceCenterModal").style.display = "block";
}

function closeServiceCenterModal() {
    document.getElementById("serviceCenterModal").style.display = "none";
}


window.editServiceCenter = async function (centerdata) {
    try {
        const center = JSON.parse(decodeURIComponent(centerdata));
        console.log("editServiceCenter", center);

        document.getElementById("editServiceCenterId").value = center.center_id || center._id || "";
        document.getElementById("editcompanyName").value = center.partner_name || "";
        document.getElementById("editcontactPerson").value = center.contact_person || "";
        document.getElementById("editpartnerEmail").value = center.email || "";
        document.getElementById("editpartnerPhone").value = center.phone_number || "";
        document.getElementById("editgstNumber").value = center.gst_number || "";
        document.getElementById("editpanNumber").value = center.pan_number || "";
        document.getElementById("editaadharNumber").value = center.aadhar_number || "";
        document.getElementById("editpartnerAddress").value = center.company_address || "";
        document.getElementById("status").value = center.status || "Active";
        document.getElementById("service_newPassword").value = "";

        const token = getCookie("token");
        const passwordResponse = await fetch(`${API_URL}/admin/getServiceCenterPassword/${center.center_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (passwordResponse.ok) {
            const passwordResult = await passwordResponse.json();
            document.getElementById("service_oldPassword").value = passwordResult.password || "";
        } else {
            console.error("Failed to fetch old password");
            document.getElementById("service_oldPassword").value = "";
        }

        document.getElementById("editServiceCenterModal").style.display = "flex";
        document.getElementById("editServiceCenterModal").style.opacity = "1";

    } catch (error) {
        console.error("Error parsing service center data or fetching password:", error);
        showToast(`❌ ${error.message}`, "error");
    }
};

document.getElementById("saveServiceCenterBtn").addEventListener("click", async function () {
    const centerId = document.getElementById("editServiceCenterId").value;
    console.log(`📦 Save button clicked, preparing request for centerId: ${centerId}`);

    const formData = new FormData();
    formData.append("partner_name", document.getElementById("editcompanyName").value.trim());
    formData.append("contact_person", document.getElementById("editcontactPerson").value.trim());
    formData.append("email", document.getElementById("editpartnerEmail").value.trim());
    formData.append("phone_number", document.getElementById("editpartnerPhone").value.trim());
    formData.append("gst_number", document.getElementById("editgstNumber").value.trim());
    formData.append("pan_number", document.getElementById("editpanNumber").value.trim());
    formData.append("aadhar_number", document.getElementById("editaadharNumber").value.trim());
    formData.append("company_address", document.getElementById("editpartnerAddress").value.trim());
    formData.append("status", document.getElementById("status").value);

    const newPassword = document.getElementById("service_newPassword").value.trim();
    if (newPassword) {
        formData.append("new_password", newPassword);
    }

    const gstFile = document.getElementById("editGSTFile").files[0];
    const panFile = document.getElementById("editPANFile").files[0];
    const aadharFile = document.getElementById("editAadharFile").files[0];
    const companyRegFile = document.getElementById("editCompanyRegFile").files[0];

    if (gstFile) formData.append("gst_certificate", gstFile);
    if (panFile) formData.append("pan_card", panFile);
    if (aadharFile) formData.append("aadhar_card", aadharFile);
    if (companyRegFile) formData.append("company_registration_certificate", companyRegFile);

    // Debug output
    console.log('📦 FormData about to be sent:');
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`🗂 ${key}: [File] ${value.name}`);
        } else {
            console.log(`📄 ${key}: ${value}`);
        }
    }

    const saveBtn = this;
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    saveBtn.disabled = true;

    try {
        const token = getCookie("token");
        const response = await fetch(`${API_URL}/admin/updateServiceCenter/${centerId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Failed to update service center");

        // showToast("✅ Service Center updated successfully!", "success");
        document.getElementById("editServiceCenterModal").style.display = "none";

        // ✅ Instead of reloading the page, re-render the service center list
        setTimeout(() => {
            setupListServiceCentersSection(); // Refresh the list dynamically
        }, 500); // Optional delay for better UX
    } catch (error) {
        console.error("❌ Error updating service center:", error);
        showToast(`❌ ${error.message}`, "error");
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }

});


document.getElementById("saveServiceCenterBtn").addEventListener("click", async function () {
    const centerId = document.getElementById("editServiceCenterId").value;
    console.log('📦 Save button clicked, preparing request for centerId:', centerId);

    formData.append("partner_name", document.getElementById("editcompanyName").value.trim());
    formData.append("contact_person", document.getElementById("editcontactPerson").value.trim());
    formData.append("email", document.getElementById("editpartnerEmail").value.trim());
    formData.append("phone_number", document.getElementById("editpartnerPhone").value.trim());
    formData.append("gst_number", document.getElementById("editgstNumber").value.trim());
    formData.append("pan_number", document.getElementById("editpanNumber").value.trim());
    formData.append("aadhar_number", document.getElementById("editaadharNumber").value.trim());
    formData.append("company_address", document.getElementById("editpartnerAddress").value.trim());
    formData.append("status", document.getElementById("status").value);

    // Only send new password if user entered it
    const newPassword = document.getElementById("newPassword").value.trim();
    if (newPassword) {
        formData.append("new_password", newPassword);
    }

    // Attach files if selected
    const gstFile = document.getElementById("editGSTFile").files[0];
    const panFile = document.getElementById("editPANFile").files[0];
    const aadharFile = document.getElementById("editAadharFile").files[0];
    const companyRegFile = document.getElementById("editCompanyRegFile").files[0];

    if (gstFile) formData.append("gst_certificate", gstFile);
    if (panFile) formData.append("pan_card", panFile);
    if (aadharFile) formData.append("aadhar_card", aadharFile);
    if (companyRegFile) formData.append("company_registration_certificate", companyRegFile);

    // 🔥 Log all FormData key-value pairs
    console.log('📦 FormData about to be sent:');
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`🗂 ${key}: [File] ${value.name}`);
        } else {
            console.log(`📄 ${key}: ${value}`);
        }
    }

    const saveBtn = this;
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    saveBtn.disabled = true;

    try {
        const token = getCookie("token");

        const response = await fetch(`${API_URL}/admin/updateServiceCenter/${centerId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
                // Content-Type is NOT set manually for FormData
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Failed to update service center");

        showToast("✅ Service Center updated successfully!", "success");
        document.getElementById("editServiceCenterModal").style.display = "none";
        setTimeout(() => window.location.reload(), 1000);


    } catch (error) {
        console.error("❌ Error updating service center:", error);
        showToast(`❌ ${error.message}`, "error");
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
});



// Initialize Service Partners functionality with VERY RELAXED validation
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

    // VERY LIGHT validation function - minimal checks only
    function validateField(fieldId, condition, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + "Error");

        // Only show visual feedback for critical errors
        if (field && !condition) {
            field.classList.add("input-error");
            field.classList.remove("input-valid");
        } else if (field) {
            field.classList.remove("input-error");
            field.classList.add("input-valid");
        }

        if (errorDiv) {
            errorDiv.textContent = condition ? "" : errorMessage;
            errorDiv.style.display = condition ? "none" : "block";
        }

        return condition;
    }

    // Remove all real-time validation - only validate on submit
    // This prevents annoying users while they're typing

    // File upload handlers - ALL files are now OPTIONAL
    const fileInputs = {
        'gstCertificate': 'gst_certificate',
        'panCard': 'pan_card_document',
        'aadharCard': 'aadhar_card_document',
        'companyCertificate': 'company_reg_certificate',
        'pinCodesCSV': 'pincode_csv'
    };

    Object.keys(fileInputs).forEach(inputId => {
        const fileInput = document.getElementById(inputId);
        if (fileInput) {
            fileInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                const fieldName = fileInputs[inputId];

                if (file) {
                    // Very relaxed file validation - only check extreme size
                    if (file.size > 50 * 1024 * 1024) { // 50MB limit
                        showToast("File size should not exceed 50MB", "warning");
                        e.target.value = '';
                        return;
                    }

                    uploadedFiles[fieldName] = file;
                    showToast(`${file.name} uploaded successfully`, "success");

                    // Clear any error for this field
                    const errorDiv = document.getElementById(inputId + 'Error');
                    if (errorDiv) {
                        errorDiv.style.display = 'none';
                        errorDiv.textContent = '';
                    }
                } else {
                    uploadedFiles[fieldName] = null;
                }
            });
        }
    });

    // EXTREMELY RELAXED form validation and submission
    addPartnerForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // ✅ PREVENT PAGE REFRESH

        // Get all form field values
        const companyName = document.getElementById("companyName")?.value.trim();
        const contactPerson = document.getElementById("contactPerson")?.value.trim();
        const partnerEmail = document.getElementById("partnerEmail")?.value.trim();
        const partnerPhone = document.getElementById("partnerPhone")?.value.trim();
        const gstNumber = document.getElementById("gstNumber")?.value.trim();
        const panNumber = document.getElementById("panNumber")?.value.trim();
        const aadharNumber = document.getElementById("aadharNumber")?.value.trim();
        const partnerAddress = document.getElementById("partnerAddress")?.value.trim();

        let isValid = true;
        let errorMessages = [];

        // ABSOLUTE MINIMUM validation - only the most critical fields
        if (!companyName) {
            errorMessages.push("Company name is required");
            validateField("companyName", false, "Company name is required");
            isValid = false;
        } else {
            validateField("companyName", true, "");
        }

        if (!contactPerson) {
            errorMessages.push("Contact person is required");
            validateField("contactPerson", false, "Contact person is required");
            isValid = false;
        } else {
            validateField("contactPerson", true, "");
        }

        if (!partnerEmail || !partnerEmail.includes('@')) {
            errorMessages.push("Valid email is required");
            validateField("partnerEmail", false, "Valid email is required");
            isValid = false;
        } else {
            validateField("partnerEmail", true, "");
        }

        if (!partnerPhone || partnerPhone.length < 10) {
            errorMessages.push("Valid phone number is required");
            validateField("partnerPhone", false, "Valid phone number is required");
            isValid = false;
        } else {
            validateField("partnerPhone", true, "");
        }

        if (!partnerAddress) {
            errorMessages.push("Company address is required");
            validateField("partnerAddress", false, "Company address is required");
            isValid = false;
        } else {
            validateField("partnerAddress", true, "");
        }

        // Clear all file upload errors - make them all optional
        Object.keys(fileInputs).forEach(inputId => {
            const errorDiv = document.getElementById(inputId + 'Error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
                errorDiv.textContent = '';
            }
        });

        if (!isValid) {
            showToast(`Please fix: ${errorMessages.join(', ')}`, "error");
            return; // ✅ STOP HERE - NO PAGE REFRESH
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

            // Add required text fields
            formData.append('partner_name', companyName);
            formData.append('contact_person', contactPerson);
            formData.append('phone_number', partnerPhone);
            formData.append('email', partnerEmail);
            formData.append('company_address', partnerAddress);

            // Add optional fields only if they have values
            if (gstNumber) formData.append('gst_number', gstNumber);
            if (panNumber) formData.append('pan_number', panNumber);
            if (aadharNumber) formData.append('aadhar_number', aadharNumber);

            // Add files only if they exist - ALL OPTIONAL
            Object.keys(uploadedFiles).forEach(key => {
                if (uploadedFiles[key]) {
                    formData.append(key, uploadedFiles[key]);
                }
            });

            console.log("Submitting service center data");

            const response = await fetch(`${API_URL}/admin/register-servicecenter`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Don't set Content-Type for FormData
                },
                body: formData
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || "Failed to add service partner");
            }

            // ✅ SUCCESS - NO PAGE REFRESH
            showToast("Service partner added successfully! 🎉", "success");
            console.log("Service center added successfully:", responseData);
            setupListServiceCentersSection();
            // ✅ ONLY RESET FORM - NO PAGE REFRESH
            resetPartnerForm();

        } catch (error) {
            console.error("Error adding service partner:", error);
            showToast(`Error: ${error.message}`, "error");
            // ✅ NO PAGE REFRESH ON ERROR EITHER
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

    // Cancel button
    if (cancelPartnerBtn) {
        cancelPartnerBtn.addEventListener("click", function () {
            resetPartnerForm();
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

// Also set up navigation listener to load data when section becomes active
document.addEventListener('click', function (e) {
    if (e.target.matches('[data-section="list-service-centers"]')) {
        setTimeout(() => {
            // Load service centers when navigating to the section
            if (allServiceCenters.length === 0) {
                loadAllServiceCenters();
            }
        }, 100);
    } else if (e.target.matches('[data-section="engineer-list"]')) {
        setTimeout(() => {
            const tableBody = document.getElementById("engineersTableBody");
            if (tableBody && tableBody.children.length === 0) {
                loadEngineersList();
            }
        }, 100);
    }
});