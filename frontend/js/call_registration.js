// Call Registration JavaScript functionality
// Handles complaint and job-history sections

document.addEventListener('DOMContentLoaded', function () {
    // Initialize call registration functionality
    initializeCallRegistration();
});

function initializeCallRegistration() {
    // Add event listeners for complaint and job-history sections
    const complaintSection = document.querySelector('[data-section="complaint"]');
    const jobHistorySection = document.querySelector('[data-section="job-history"]');

    if (complaintSection) {
        setupComplaintSection();
    }

    if (jobHistorySection) {
        setupJobHistorySection();
    }
}

function setupComplaintSection() {
    console.log('Complaint section initialized');

    // Initialize complaint form functionality
    initComplaintForms();
}

function setupJobHistorySection() {
    console.log('Job history section initialized');

    // Initialize job search functionality
    initJobSearch();
}

// Enhanced form initialization with product storage functionality
function initComplaintForms() {
    const callForm = document.getElementById("callForm");
    if (!callForm) return;

    // Field validation functions
    function validateField(id, condition, errorMessage) {
        const input = document.getElementById(id);
        const errorDiv = document.getElementById(id + "Error");

        input.classList.toggle("input-error", !condition);
        input.classList.toggle("input-valid", condition);

        if (errorDiv) {
            errorDiv.textContent = condition ? "" : errorMessage;
        }

        if (!condition) {
            showToast(errorMessage, "error");
        }
    }

    // Real-time validation for complaint form
    document.getElementById("fullName").addEventListener("input", () => {
        validateField(
            "fullName",
            document.getElementById("fullName").value.trim() !== "",
            "Full name is required."
        );
    });

    document.getElementById("mobile").addEventListener("input", () => {
        validateField(
            "mobile",
            /^\d{10}$/.test(document.getElementById("mobile").value.trim()),
            "Enter a valid 10-digit mobile number."
        );
    });

    document.getElementById("pin").addEventListener("input", function () {
        const pin = this.value.trim();
        validateField(
            "pin",
            /^\d{6}$/.test(pin),
            "Enter a valid 6-digit pin code."
        );
        if (pin.length === 6) {
            fetchLocality()
            fetchservicecenter(pin);
        };
    });

    document.getElementById("locality").addEventListener("change", () => {
        validateField(
            "locality",
            document.getElementById("locality").value !== "",
            "Please select a locality."
        );
    });

    // Enhanced address validation
    document.getElementById("houseNo").addEventListener("input", () => {
        validateField(
            "houseNo",
            document.getElementById("houseNo").value.trim() !== "",
            "House/Flat number is required."
        );
    });

    document.getElementById("street").addEventListener("input", () => {
        validateField(
            "street",
            document.getElementById("street").value.trim() !== "",
            "Street/Area is required."
        );
    });

    document.getElementById("stateSelect").addEventListener("change", function () {
        validateField("stateSelect", this.value !== "", "Please select a State.");
    });

    // Product validation
    document.getElementById("productType").addEventListener("input", () => {
        validateField(
            "productType",
            document.getElementById("productType").value.trim() !== "",
            "Product type is required."
        );
    });

    document.getElementById("productName").addEventListener("input", () => {
        validateField(
            "productName",
            document.getElementById("productName").value.trim() !== "",
            "Product name is required."
        );
    });

    document.getElementById("modelNo").addEventListener("input", () => {
        validateField(
            "modelNo",
            document.getElementById("modelNo").value.trim() !== "",
            "Model number is required."
        );
    });

    document.getElementById("manufacturer").addEventListener("input", () => {
        validateField(
            "manufacturer",
            document.getElementById("manufacturer").value.trim() !== "",
            "Brand is required."
        );
    });

    document.getElementById("purchaseDate").addEventListener("input", function () {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
            showToast("Date of Purchase cannot be in the future.", "error");
            this.value = "";
        }
        validateField(
            "purchaseDate",
            this.value !== "",
        );
    });

    document.getElementById("warrantyExpiry").addEventListener("input", function () {
        validateField(
            "warrantyExpiry",
            this.value !== "",
            "Warranty is required."
        );
    });

    document.getElementById("availableDate").addEventListener("input", function () {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showToast("Available date cannot be in the past.", "error");
            this.value = "";
        }
        validateField(
            "availableDate",
            this.value !== "",
        );
    });

    document.getElementById("preferredTime").addEventListener("change", function () {
        validateField(
            "preferredTime",
            this.value !== "",
            "Please select a preferred time slot."
        );
    });

    // Radio button validation
    document.querySelectorAll('input[name="callType"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            const callTypeError = document.getElementById("callTypeError");
            callTypeError.textContent = document.querySelector(
                'input[name="callType"]:checked'
            )
                ? ""
                : "Please select a call type.";
        });
    });

    document.querySelectorAll('input[name="priority"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            const priorityError = document.getElementById("priorityError");
            priorityError.textContent = document.querySelector(
                'input[name="priority"]:checked'
            )
                ? ""
                : "Please select call priority.";
        });
    });

    // Enhanced form submission with product storage
    callForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        let isValid = true;

        // Validate all customer fields
        validateField(
            "fullName",
            document.getElementById("fullName").value.trim() !== "",
            "Full name is required."
        );
        validateField(
            "mobile",
            /^\d{10}$/.test(document.getElementById("mobile").value.trim()),
            "Enter a valid 10-digit mobile number."
        );
        validateField(
            "pin",
            /^\d{6}$/.test(document.getElementById("pin").value.trim()),
            "Enter a valid 6-digit pin code."
        );
        validateField(
            "locality",
            document.getElementById("locality").value !== "",
            "Please select a locality."
        );
        validateField(
            "houseNo",
            document.getElementById("houseNo").value.trim() !== "",
            "House/Flat number is required."
        );
        validateField(
            "street",
            document.getElementById("street").value.trim() !== "",
            "Street/Area is required."
        );
        validateField(
            "stateSelect",
            document.getElementById("stateSelect").value !== "",
            "Please select a State."
        );

        // Validate all product fields
        validateField(
            "productType",
            document.getElementById("productType").value.trim() !== "",
            "Product type is required."
        );
        validateField(
            "productName",
            document.getElementById("productName").value.trim() !== "",
            "Product name is required."
        );
        validateField(
            "modelNo",
            document.getElementById("modelNo").value.trim() !== "",
            "Model number is required."
        );
        validateField(
            "serial",
            document.getElementById("serial").value.trim() !== "",
            "Serial number is required."
        );
        validateField(
            "manufacturer",
            document.getElementById("manufacturer").value.trim() !== "",
            "Brand is required."
        );
        validateField(
            "purchaseDate",
            document.getElementById("purchaseDate").value !== "",
            "Purchase date is required."
        );
        validateField(
            "warrantyExpiry",
            document.getElementById("warrantyExpiry").value !== "",
            "Warranty is required."
        );
        validateField(
            "availableDate",
            document.getElementById("availableDate").value !== "",
            "Available date is required."
        );
        validateField(
            "preferredTime",
            document.getElementById("preferredTime").value !== "",
            "Please select a preferred time slot."
        );

        // Check radio buttons
        if (!document.querySelector('input[name="callType"]:checked')) {
            document.getElementById("callTypeError").textContent =
                "Please select a call type.";
            isValid = false;
        }
        if (!document.querySelector('input[name="priority"]:checked')) {
            document.getElementById("priorityError").textContent =
                "Please select call priority.";
            isValid = false;
        }

        if (!isValid) {
            showToast("Please fill all required fields correctly", "error");
            return;
        }
        const issue_type = document.querySelector('input[name="callType"]:checked')?.value || '';
        const selectedRadio = document.querySelector('input[name="callType"]:checked');

        if (selectedRadio) {
            console.log("✔ VALUE:", selectedRadio.value);
            console.log("✔ TEXT:", selectedRadio.nextElementSibling?.innerText);
        } else {
            console.log("⚠ No option selected");
        }

        const call_priority = document.querySelector('input[name="priority"]:checked')?.value || '';


        // Request Information - Real-time validation

        document.getElementById("rootRequestId").addEventListener("input", () => {
            validateField(
                "rootRequestId",
                document.getElementById("rootRequestId").value.trim() !== "",
                "Root Request ID is required."
            );
        });

        document.getElementById("customerRequestId").addEventListener("input", () => {
            validateField(
                "customerRequestId",
                document.getElementById("customerRequestId").value.trim() !== "",
                "Customer Request ID is required."
            );
        });

        document.getElementById("ecommerceId").addEventListener("input", () => {
            validateField(
                "ecommerceId",
                document.getElementById("ecommerceId").value.trim() !== "",
                "E-commerce ID is required."
            );
        });

        document.getElementById("estimatedDelivery").addEventListener("change", () => {
            validateField(
                "estimatedDelivery",
                document.getElementById("estimatedDelivery").value.trim() !== "",
                "Estimated delivery date is required."
            );
        });


        // Get other field values
        const customer_name = document.getElementById("fullName").value.trim();
        const mobile_number = document.getElementById("mobile").value.trim();
        const flat_no = document.getElementById("houseNo").value.trim();
        const street_area = document.getElementById("street").value.trim();
        const landmark = document.getElementById("landmark").value.trim();
        const pincode = document.getElementById("pin").value.trim();
        const locality = document.getElementById("locality").value;
        const city = document.getElementById("city").value;
        const state = document.getElementById("stateVisible").value;
        const product_type = document.getElementById("productType").value.trim();
        const product_name = document.getElementById("productName").value.trim();
        const symptoms = document.getElementById("symptoms").value.trim();
        const model_no = document.getElementById("modelNo").value.trim();
        const serial_number = document.getElementById("serial").value.trim();
        const brand = document.getElementById("manufacturer").value.trim();
        const date_of_purchase = document.getElementById("purchaseDate").value;
        const warranty = document.getElementById("warrantyExpiry").value;
        const booking_date = document.getElementById("availableDate").value;
        const booking_time = document.getElementById("preferredTime").value;
        // Request Information
        const root_request_id = document.getElementById("rootRequestId").value.trim();
        const customer_request_id = document.getElementById("customerRequestId").value.trim();
        const ecom_order_id = document.getElementById("ecommerceId").value.trim();
        const estimated_product_delivery_date = document.getElementById("estimatedDelivery").value;
        // Service Partner (auto-assigned)
        const service_partner = document.getElementById("servicePartner").value.trim();


        // Create object to send
        const CustomerComplaintData = {
            issue_type,
            customer_name,
            mobile_number,
            flat_no,
            street_area,
            landmark,
            pincode,
            locality,
            product_type,
            city,
            state,
            booking_date,
            booking_time,
            call_priority,
            symptoms,
            product_name,
            model_no,
            serial_number,
            brand,
            date_of_purchase,
            warranty,
            root_request_id,
            customer_request_id,
            ecom_order_id,
            estimated_product_delivery_date,
            service_partner: document.getElementById("servicePartner").value.trim(),
        };
        console.log(CustomerComplaintData)

        // // Start collecting toast messages
        // const toastMessages = [];
        // let finalToastType = "success";
        // const submitBtn = document.querySelector('button[type="submit"]');
        // const originalText = submitBtn.innerHTML;
        // try {
        //     const token = getCookie("token");
        //     submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        //     submitBtn.disabled = true;

        //     // Register complaint
        //     const response = await fetch(`${API_URL}/job/registerComplaint`, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             Authorization: `Bearer ${token}`,
        //         },
        //         body: JSON.stringify(CustomerComplaintData),
        //     });

        //     const json = await response.json();

        //     if (!response.ok) {
        //         throw new Error(json.message || json.error || "Complaint registration failed");
        //     }

        //     toastMessages.push("Complaint registered successfully!");
        //     resetForm();

        // } catch (error) {
        //     console.error("Submission failed:", error.message);
        //      toastMessages.push(`❌ Error: ${error.message}`);
        //     finalToastType = "error";
        // } finally {
        //     showToast(toastMessages.join('\n'), finalToastType);
        //     submitBtn.innerHTML = originalText;
        //     submitBtn.disabled = false;
        // }
        // Start collecting toast messages
        const toastMessages = [];
        let finalToastType = "success";
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            const token = getCookie("token");
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Register complaint
            const response = await fetch(`${API_URL}/job/registerComplaint`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(CustomerComplaintData),
            });

            const json = await response.json();

            if (!response.ok) {
                // More specific error extraction
                const serverMessage = json?.message || json?.error || json?.errors?.[0]?.msg;
                throw new Error(serverMessage || "Complaint registration failed. Please try again later.");
            }

            toastMessages.push("✅ Complaint registered successfully!");
            resetForm();

        } catch (error) {
            console.error("Submission failed:", error);

            // More readable, fallback-safe error message
            const errorMessage =
                error?.message && typeof error.message === "string"
                    ? `❌ ${error.message}`
                    : "❌ An unexpected error occurred while registering the complaint.";

            toastMessages.push(errorMessage);
            finalToastType = "error";

        } finally {
            showToast(toastMessages.join('\n'), finalToastType);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

    })

    // Reset button
    document.getElementById("resetBtn").addEventListener("click", resetForm);

    function fetchLocality() {
        const pin = document.getElementById("pin").value.trim();
        const localityInput = document.getElementById("locality");
        const cityInput = document.getElementById("city");
        const stateSelect = document.getElementById("stateSelect");
        const stateVisible = document.getElementById("stateVisible");
        const localityError = document.getElementById("localityError");
        const stateSelectError = document.getElementById("stateSelectError");

        if (pin.length === 6 && /^\d{6}$/.test(pin)) {
            localityInput.innerHTML = '<option value="">Loading...</option>';
            localityError.textContent = "";
            stateSelectError.textContent = "";
            cityInput.value = "";
            stateSelect.value = "";
            stateVisible.value = "";

            fetch(`https://api.postalpincode.in/pincode/${pin}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data && data.length > 0 && data[0].Status === "Success" && data[0].PostOffice) {
                        localityInput.innerHTML = '<option value="">-- Select locality --</option>';

                        const postOffices = data[0].PostOffice;

                        // Set city
                        if (postOffices.length > 0) {
                            cityInput.value = postOffices[0].District || "";
                        }

                        // Populate localities
                        const uniqueLocalities = new Set();
                        postOffices.forEach((po) => {
                            if (po.Name && po.District) {
                                const localityValue = `${po.Name}, ${po.District}`;
                                if (!uniqueLocalities.has(localityValue)) {
                                    uniqueLocalities.add(localityValue);
                                    const option = document.createElement("option");
                                    option.value = localityValue;
                                    option.textContent = localityValue;
                                    localityInput.appendChild(option);
                                }
                            }
                        });

                        // Set state
                        const stateName = postOffices[0].State?.toUpperCase();
                        let foundState = false;
                        for (let i = 0; i < stateSelect.options.length; i++) {
                            const optionText = stateSelect.options[i].text.toUpperCase();
                            if (optionText.includes(stateName)) {
                                stateSelect.selectedIndex = i;
                                stateVisible.value = stateSelect.options[i].text;
                                foundState = true;
                                break;
                            }
                        }

                        if (!foundState) {
                            stateSelectError.textContent = "State not found in dropdown.";
                            stateVisible.value = "";
                            showToast("State not matched in the dropdown list.", "error");
                        }

                        if (localityInput.children.length === 1) {
                            localityInput.innerHTML = '<option value="">-- No locality found --</option>';
                            localityError.textContent = "No locality found for this PIN";
                            showToast("No locality found for this PIN", "error");
                        } else {
                            localityError.textContent = "";
                        }
                    } else {
                        localityInput.innerHTML = '<option value="">-- No locality found --</option>';
                        cityInput.value = "";
                        stateSelect.value = "";
                        stateVisible.value = "";
                        localityError.textContent = "No locality found for this PIN";
                        showToast("No locality found for this PIN", "error");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching locality:", error);
                    localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
                    cityInput.value = "";
                    stateSelect.value = "";
                    stateVisible.value = "";
                    localityError.textContent = "Error fetching locality. Please try again.";
                    showToast("Error fetching locality. Please check your internet connection.", "error");
                });
        } else {
            localityInput.innerHTML = '<option value="">-- Select locality --</option>';
            cityInput.value = "";
            stateSelect.value = "";
            stateVisible.value = "";
            localityError.textContent = "";
            stateSelectError.textContent = "";
        }
    }

    // Enhanced reset form function
    function resetForm() {
        callForm.reset();
        document.getElementById("locality").innerHTML =
            '<option value="">-- Select locality --</option>';
        document.getElementById("city").value = "";

        document.querySelectorAll(".error-message").forEach((error) => {
            error.textContent = "";
        });

        document.querySelectorAll("input, select, textarea").forEach((input) => {
            input.classList.remove("input-error", "input-valid");
        });
    }
}
// Initialize job search functionality
function initJobSearch() {
    const customerSearchForm = document.getElementById("customerSearchForm");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const createNewJobBtn = document.getElementById("createNewJobBtn");

    if (!customerSearchForm) return;

    // Customer search form validation and submission
    customerSearchForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const customerName = document.getElementById("searchCustomerName").value.trim();
        const mobile = document.getElementById("searchMobile").value.trim();
        const pincode = document.getElementById("searchPincode").value.trim();

        // Validate search fields
        let isValid = true;

        if (!customerName) {
            document.getElementById("searchCustomerNameError").textContent = "Customer name is required";
            isValid = false;
        } else {
            document.getElementById("searchCustomerNameError").textContent = "";
        }

        if (!mobile || !/^\d{10}$/.test(mobile)) {
            document.getElementById("searchMobileError").textContent = "Enter a valid 10-digit mobile number";
            isValid = false;
        } else {
            document.getElementById("searchMobileError").textContent = "";
        }

        if (!pincode || !/^\d{6}$/.test(pincode)) {
            document.getElementById("searchPincodeError").textContent = "Enter a valid 6-digit pincode";
            isValid = false;
        } else {
            document.getElementById("searchPincodeError").textContent = "";
        }

        if (!isValid) {
            showToast("Please fill all search fields correctly", "error");
            return;
        }

        // Show loading indicator
        showLoadingIndicator(true);
        hideNoResultsMessage();
        hideJobsTable();

        try {
            console.log("The job function is calling the API");
            const jobs = await searchCustomerJobs(customerName, mobile, pincode);
            console.log(jobs);

            if (jobs && jobs.length > 0) {
                displayJobsInTable(jobs);
                showJobsResultCard();
                showToast(`Found ${jobs.length} job(s) for the customer`, "success");
            } else {
                hideJobsResultCard();
                showNoResultsMessage();
                showToast("No jobs found for the specified customer details", "error");
            }
        } catch (error) {
            console.error("Error searching customer jobs:", error);
            const errormsg = error?.message || "Error searching for customer jobs. Please try again.";
            showToast(errormsg, "error");
            hideJobsResultCard();
            showNoResultsMessage();
        } finally {
            showLoadingIndicator(false);
        }
    });

    // Clear search functionality
    clearSearchBtn.addEventListener("click", function () {
        customerSearchForm.reset();
        document.querySelectorAll(".error-message").forEach(error => error.textContent = "");
        hideJobsTable();
        hideJobsResultCard();
        showNoResultsMessage();
        showToast("Search cleared", "success");
    });

    // Create new job button
    createNewJobBtn.addEventListener("click", function () {
        navigateToSection("complaint");
        showToast("Redirected to complaint registration", "success");
    });

    // Initialize with no results message
    showNoResultsMessage();
}

// Function to search customer jobs via API
async function searchCustomerJobs(customerName, mobile, pincode) {
    const token = getCookie("token");

    if (!token) {
        throw new Error("Authentication token not found");
    }
    console.log("Token" + token);
    const searchParams = {
        full_name: customerName,
        mobile_number: mobile,
        pincode: pincode
    };

    try {
        const response = await fetch(`${API_URL}/job/complaint-details`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(searchParams)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to search customer jobs");
        }

        const data = await response.json();
        console.log(data);
        return data.complaints || [];
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

// Function to display jobs in the table
function displayJobsInTable(jobs) {
    const tableBody = document.getElementById("jobsTableBody");
    const tableContainer = document.getElementById("jobsTableContainer");

    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    jobs.forEach((job) => {
        const row = document.createElement("tr");
        const complaintData = encodeURIComponent(JSON.stringify(job));

        row.innerHTML = `
      <td><span class="job-id">#${job.complaint_id}</span></td>
      <td>
        <div class="product-cell">
          <p class="product-name">${job.customer_name || 'N/A'}</p>
          <p class="serial-number">Mobile: ${job.mobile_number || 'N/A'}</p>
          <p class="serial-number">Pin: ${job.pincode || 'N/A'}</p>
        </div>
      </td>
      <td>${job.issue_type || 'N/A'}</td>
      <td><span class="badge ${getStatusBadgeClass(job.job_status)}">${job.job_status || 'Pending'}</span></td>
      <td><span class="badge ${getPriorityBadgeClass(job.call_priority)}">${job.call_priority || 'Normal'}</span></td>
      <td>${job.technician || 'Not Assigned'}</td>
      <td>
        <div class="date-cell">
          <i class="fas fa-calendar"></i>
          ${job.req_creation_date ? formatDate(job.req_creation_date) : 'Not Available'}
        </div>
      </td>
      <td>
        <div class="action-buttons">
            <button class="action-btn" onclick="viewComplaintDetail('${complaintData}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
        </div>
      </td>
    `;
        tableBody.appendChild(row);
    });

    // Show the table
    tableContainer.style.display = "block";
}


// Visibility helpers
function showJobsResultCard() {
    const resultCard = document.getElementById("jobsResultCard");
    if (resultCard) resultCard.style.display = "block";
}

function hideJobsResultCard() {
    const resultCard = document.getElementById("jobsResultCard");
    if (resultCard) resultCard.style.display = "none";
}

function hideJobsTable() {
    const tableContainer = document.getElementById("jobsTableContainer");
    if (tableContainer) tableContainer.style.display = "none";
    hideJobsResultCard();
}

// Helper functions for job display
function getStatusBadgeClass(status) {
    const statusClasses = {
        'completed': 'badge-success',
        'in progress': 'badge-primary',
        'pending': 'badge-warning',
        'cancelled': 'badge-danger'
    };
    return statusClasses[status?.toLowerCase()] || 'badge-warning';
}

function getPriorityBadgeClass(priority) {
    const priorityClasses = {
        'urgent': 'badge-danger',
        'high': 'badge-danger',
        'medium': 'badge-warning',
        'normal': 'badge-success',
        'low': 'badge-success'
    };
    return priorityClasses[priority?.toLowerCase()] || 'badge-success';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

// UI helper functions for job search
function showLoadingIndicator(show) {
    const indicator = document.getElementById("loadingIndicator");
    if (indicator) {
        indicator.style.display = show ? "block" : "none";
    }
}

function showNoResultsMessage() {
    const message = document.getElementById("noResultsMessage");
    if (message) {
        message.style.display = "block";
    }
}

function hideNoResultsMessage() {
    const message = document.getElementById("noResultsMessage");
    if (message) {
        message.style.display = "none";
    }
}

function hideJobsTable() {
    const tableContainer = document.getElementById("jobsTableContainer");
    if (tableContainer) {
        tableContainer.style.display = "none";
    }
}

// Job action functions
function viewJobDetails(jobId) {
    showToast(`Viewing details for job ${jobId}`, "success");
    // Implement job details view functionality
}

function editJob(jobId) {
    showToast(`Editing job ${jobId}`, "success");
    // Implement job editing functionality
}

// Product type and name mapping
document.addEventListener('DOMContentLoaded', function () {
    const productTypeSelect = document.getElementById("productType");
    if (productTypeSelect) {
        productTypeSelect.addEventListener("change", function () {
            const productType = this.value;
            const productNameSelect = document.getElementById("productName");

            // Reset product name dropdown
            productNameSelect.innerHTML = '<option value="">-- Select Product Name --</option>';

            const productMap = {
                "GATEWAY": [
                    "Wipro Garnet LED Smart Gateway (SG2000)"
                ],
                "IR BLASTER": [
                    "Wipro Next Smart IR Blaster (DSIR100)"
                ],
                "SMART RETROFIT": [
                    "Wipro Smart Switch 2N Module (DSP2200)",
                    "Wipro Smart Switch 4N Module (DSP2400)",
                    "Wipro Smart Switch 4N FN Module (DSP410)"
                ],
                "SMART COB": [
                    "Wipro Garnet 6W Smart Trimless COB (DS50610)",
                    "Wipro Garnet 10W Smart Module COB (DS51000)",
                    "Wipro Garnet 10W Smart Trimless COB (DS51010)",
                    "Wipro Garnet 15W Smart Module COB (DS51500)",
                    "Wipro Garnet 15W Smart Trimless COB (DS51510)",
                    "WIPRO-10W Smart Trimless COB Black (DS51011)"
                ],
                "SMART PANEL": [
                    "WIPRO-Garnet 6W Smart Panel CCT (DS70600)",
                    "WIPRO-Garnet 10W Smart Panel CCT (DS71000)",
                    "WIPRO-Garnet 15W Smart Panel CCT (DS71500)"
                ],
                "SMART STRIP": [
                    "Wipro Garnet 40W Smart WiFi CCT RGB Strip (DS44000)",
                    "Wipro Garnet 40W Smart CCT RGB LED Strip (DS45000)",
                    "Wipro Garnet 40W Smart CCT RGB LED Strip New (SS01000)"
                ],
                "SMART CAMERA": [
                    "Wipro 3MP WiFi Smart Camera (SC020203)",
                    "Wipro 3MP WiFi Smart Camera. Alexa (SC020303)"
                ],
                "SMART DOORBELL": [
                    "Wipro Smart Doorbell 1080P (SD02010)",
                    "Wipro Smart Wifi AC Doorbell 2MP (SD03000)"
                ],
                "SMART DOOR LOCK": [
                    "Native Lock Pro",
                    "Native Lock S"
                ]
            };

            if (productMap[productType]) {
                productMap[productType].forEach(name => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.textContent = name;
                    productNameSelect.appendChild(option);
                });
            } else {
                showToast("No product names found for selected type", "error");
            }
        });
    }

    // Validate symptoms dropdown
    const symptomsSelect = document.getElementById("symptoms");
    if (symptomsSelect) {
        symptomsSelect.addEventListener("change", function () {
            const val = this.value;
            const errorDiv = document.getElementById("symptomsError");

            if (val === "") {
                errorDiv.textContent = "Please select a valid symptom.";
                showToast("Symptom selection is required", "error");
            } else {
                errorDiv.textContent = "";
            }
        });
    }
});

// Export functions if needed for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCallRegistration,
        setupComplaintSection,
        setupJobHistorySection
    };
}
//csv section
const requiredHeaders = [
    "call_type", "full_name", "mobile_number", "flat_no", "street_area", "landmark",
    "pincode", "locality", "product_type", "city", "state", "customer_available_at",
    "preferred_time_slot", "call_priority", "symptoms", "product_name", "model_number",
    "serial_number", "brand", "date_of_purchase", "warranty", "root_request_id",
    "customer_request_id", "ecommerce_id", "estimated_delivery"
];

// function renderCSVPreview(headers, rows) {
//     const previewContainer = document.getElementById("csvPreviewContainer");
//     const table = document.getElementById("csvPreviewTable");
//     table.innerHTML = "";

//     // Header
//     const headerRow = table.insertRow();
//     headers.forEach(header => {
//         const th = document.createElement("th");
//         th.textContent = header;
//         headerRow.appendChild(th);
//     });

//     // Rows
//     rows.forEach(row => {
//         const tr = table.insertRow();
//         headers.forEach(header => {
//             const td = tr.insertCell();
//             const val = row[header] || "";
//             td.textContent = val;

//             if (requiredHeaders.includes(header) && val.trim() === "") {
//                 td.style.backgroundColor = "#fee2e2";
//                 td.style.color = "#991b1b";
//             }
//         });
//     });

//     previewContainer.style.display = "block";
// }
function renderCSVPreview(headers, rows) {
    const previewContainer = document.getElementById("csvPreviewContainer");
    const table = document.getElementById("csvPreviewTable");
    table.innerHTML = "";

    let invalidHeaderCount = 0;
    let invalidFieldCount = 0;

    // 🔹 Header Row
    const headerRow = table.insertRow();
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;

        if (!requiredHeaders.includes(header)) {
            th.style.backgroundColor = "#fef3c7"; // light yellow
            th.style.color = "#92400e";           // dark orange
            th.title = "Unexpected column: not in required header list";
            invalidHeaderCount++;
        }

        th.style.padding = "10px";
        th.style.border = "1px solid #e2e8f0";
        th.style.fontWeight = "600";
        headerRow.appendChild(th);
    });

    // 🔹 Data Rows
    rows.forEach((row, rowIndex) => {
        const tr = table.insertRow();
        headers.forEach(header => {
            const td = tr.insertCell();
            const val = row[header] || "";
            td.textContent = val;

            td.style.padding = "8px";
            td.style.border = "1px solid #e2e8f0";

            if (requiredHeaders.includes(header) && val.trim() === "") {
                td.style.backgroundColor = "#fee2e2"; // light red
                td.style.color = "#991b1b";           // dark red
                td.style.fontWeight = "bold";
                td.title = `Missing value in row ${rowIndex + 2} for "${header}"`;
                invalidFieldCount++;
            }
        });
    });

    previewContainer.style.display = "block";

    // 🔔 Toast messages
    if (invalidHeaderCount > 0 && invalidFieldCount > 0) {
        showToast(`⚠️ ${invalidHeaderCount} invalid header(s) & ${invalidFieldCount} missing field(s) found.`, "warning");
    } else if (invalidHeaderCount > 0) {
        showToast(`⚠️ ${invalidHeaderCount} invalid header(s) found in the file.`, "warning");
    } else if (invalidFieldCount > 0) {
        showToast(`⚠️ ${invalidFieldCount} missing required field(s) in the CSV.`, "warning");
    } else {
        showToast("✅ CSV parsed successfully! All fields look good.", "success");
    }
}

function submitCSVFile() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];
    const fileNameDisplay = document.getElementById('csvFileName');
    const submitBtn = document.querySelector('#csvUploadForm .btn-success');
    const originalText = submitBtn.innerHTML;

    if (!file) {
        showToast("⚠️ Please select a CSV file to upload.", "warning");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (e) {
        const content = e.target.result;
        const lines = content.split(/\r?\n/).filter(l => l.trim() !== "");
        const headers = lines[0]?.split(',').map(h => h.trim());

        const missingHeaders = requiredHeaders.filter(field => !headers.includes(field));
        if (missingHeaders.length > 0) {
            showToast(`❌ Missing required columns: ${missingHeaders.join(', ')}`, "error");
            return;
        }

        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const rowObj = {};
            headers.forEach((header, idx) => {
                rowObj[header] = values[idx] || "";
            });
            return rowObj;
        });

        renderCSVPreview(headers, rows); // show parsed preview

        // Start upload
        const formData = new FormData();
        formData.append('csvFile', file);

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        try {
            const res = await fetch('/upload-csv', {
                method: 'POST',
                body: formData,
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server did not return valid JSON.");
            }

            const result = await res.json();

            if (!res.ok || result.success === false) {
                throw new Error(result?.message || result?.error || "Upload failed.");
            }

            showToast("✅ CSV uploaded successfully!", "success");
            fileInput.value = "";
            fileNameDisplay.textContent = "";
            document.getElementById("csvPreviewContainer").style.display = "none";
        } catch (error) {
            console.error("❌ Upload error:", error);
            showToast(`❌ ${error.message}`, "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    };

    reader.readAsText(file);
}

document.getElementById("csvFileInput").addEventListener("change", function () {
    const file = this.files[0];
    document.getElementById("csvFileName").textContent = file ? `Selected: ${file.name}` : "";
});

function downloadTemplate() {
    window.open('../assets/complaint_template.csv', '_blank');
}


function fetchservicecenter(pin) {
    const servicePartnerInput = document.getElementById("servicePartner");
    servicePartnerInput.value = "Loading...";

    fetch(`${API_URL}/job/getPartnerByPincode?pin=${pin}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                servicePartnerInput.value = data[0].name || "Partner found";
            } else {
                servicePartnerInput.value = "No partner found";
            }
        })
        .catch(error => {
            console.error("Error fetching service partner:", error);
            servicePartnerInput.value = "Error loading partner";
        });
}
