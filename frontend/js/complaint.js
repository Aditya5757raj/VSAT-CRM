// Complaint Management JavaScript functionality
// Handles unassigned-complaints, pending-complaints, assigned-complaints, complete-complaints, and cancelled-complaints sections

document.addEventListener('DOMContentLoaded', function () {
    // Initialize complaint management functionality
    initializeComplaintManagement();
});

function initializeComplaintManagement() {
    // Add event listeners for complaint management sections
    const unassignedComplaintsSection = document.querySelector('[data-section="unassigned-complaints"]');
    const pendingComplaintsSection = document.querySelector('[data-section="pending-complaints"]');
    const assignedComplaintsSection = document.querySelector('[data-section="assigned-complaints"]');
    const completeComplaintsSection = document.querySelector('[data-section="complete-complaints"]');
    const cancelledComplaintsSection = document.querySelector('[data-section="cancelled-complaints"]');

    if (unassignedComplaintsSection) {
        setupUnassignedComplaintsSection();
    }

    if (pendingComplaintsSection) {
        setupPendingComplaintsSection();
    }

    if (assignedComplaintsSection) {
        setupAssignedComplaintsSection();
    }

    if (completeComplaintsSection) {
        setupCompleteComplaintsSection();
    }

    if (cancelledComplaintsSection) {
        setupCancelledComplaintsSection();
    }
}

function setupUnassignedComplaintsSection() {
    console.log('Unassigned complaints section initialized');

    // Initialize unassigned complaints functionality
    initUnassignedComplaints();
}

function setupPendingComplaintsSection() {
    console.log('Pending complaints section initialized');

    // Initialize pending complaints functionality
    initPendingComplaints();
}

function setupAssignedComplaintsSection() {
    console.log('Assigned complaints section initialized');

    // Initialize assigned complaints functionality
    initAssignedComplaints();
}

function setupCompleteComplaintsSection() {
    console.log('Complete complaints section initialized');

    // Initialize complete complaints functionality
    initCompleteComplaints();
}

function setupCancelledComplaintsSection() {
    console.log('Cancelled complaints section initialized');

    // Initialize cancelled complaints functionality
    initCancelledComplaints();
}

// Initialize unassigned complaints functionality
function initUnassignedComplaints() {
    const filterButton = document.querySelector('#unassigned-complaints .btn-primary');
    const assignSelectedBtn = document.querySelector('#unassigned-complaints .btn-primary:last-of-type');
    const unassignedResetBtn = document.querySelector('#unassigned-complaints .btn-outline');
    const unassignedSection = document.querySelector('#unassigned-complaints');

    // Auto-load complaints on section initialization
    loadUnassignedComplaints();

    // Filter functionality
    if (filterButton && filterButton.textContent.includes('Apply Filter')) {
        filterButton.addEventListener("click", async function () {
            const fromDateInput = document.getElementById("unassignedFromDate");
            const toDateInput = document.getElementById("unassignedToDate");
            const serviceTypeSelect = document.getElementById("unassignedServiceType");
            const prioritySelect = document.getElementById("unassignedPriority");
            const locationInput = document.getElementById("unassignedLocation");

            const filters = {
                from_date: fromDateInput?.value || '',
                to_date: toDateInput?.value || '',
                issue_type: serviceTypeSelect?.value || '',
                priority: prioritySelect?.value || '',
                location: locationInput?.value.trim() || ''
            };

            console.log("Applying filters:", filters);
            await loadUnassignedComplaints(filters);
        });
    }

    // Assign selected functionality
    if (assignSelectedBtn && assignSelectedBtn.textContent.includes('Assign Selected')) {
        assignSelectedBtn.addEventListener('click', function () {
            const selectedCheckboxes = unassignedSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                // Get selected complaint IDs
                const selectedIds = Array.from(selectedCheckboxes).map(checkbox => {
                    const row = checkbox.closest('tr');
                    return row.querySelector('.job-id')?.textContent;
                });

                showToast(`${selectedCount} complaint(s) ready for assignment: ${selectedIds.join(', ')}`, 'success');
                // Here you would typically open a bulk assignment modal
            } else {
                showToast('Please select at least one complaint to assign.', 'warning');
            }
        });
    }

    // Reset functionality
    if (unassignedResetBtn) {
        unassignedResetBtn.addEventListener('click', function () {
            const inputs = unassignedSection.querySelectorAll('.form-group input');
            const selects = unassignedSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);

            showToast('Filters reset. Loading all unassigned complaints...', 'success');
            loadUnassignedComplaints(); // Reload without filters
        });
    }
}

// Load unassigned complaints with optional filters
async function loadUnassignedComplaints(filters = {}) {
    try {
        showLoadingIndicator('unassigned', true);

        const response = await fetch(`${API_URL}/complain/getUnassigned`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        const complaints = responseData.complaints;

        if (complaints && complaints.length > 0) {
            renderUnassignedComplaints(complaints);
            // showToast(`Found ${complaints.length} unassigned complaints`, "success");
        } else {
            const tableBody = document.getElementById("unassignedComplaintsTable");
            if (tableBody) {
                tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #64748b;'>No unassigned complaints found</td></tr>";
            }
            // showToast("No unassigned complaints found", "info");
        }
    } catch (err) {
        console.error("Error fetching unassigned complaints:", err);
        showToast(`Failed to fetch complaints: ${err.message}`, "error");

        const tableBody = document.getElementById("unassignedComplaintsTable");
        if (tableBody) {
            tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #dc2626;'>Error loading complaints</td></tr>";
        }
    } finally {
        showLoadingIndicator('unassigned', false);
    }

}
let selectedComplaintId = null;
function renderUnassignedComplaints(complaints) {
    const tableBody = document.getElementById("unassignedComplaintsTable");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    complaints.forEach(complaint => {
        const complaintData = encodeURIComponent(JSON.stringify(complaint));

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" class="complaint-checkbox" data-complaint-id="${complaint.complaint_id}"></td>
            <td class="job-id">${complaint.complaint_id}</td>
            <td>
                <div class="customer-info">
                    <strong>${complaint.customer_name || 'N/A'}</strong>
                    <br><small style="color: #64748b;">${complaint.mobile_number || 'N/A'}</small>
                </div>
            </td>
            <td><span class="badge badge-primary">${complaint.issue_type || 'N/A'}</span></td>
            <td>${complaint.location || complaint.pincode || 'N/A'}</td>
            <td>${formatDate(complaint.date || complaint.req_creation_date)}</td>
            <td><span class="badge badge-${getPriorityClass(complaint.call_priority)}">${complaint.call_priority || 'Normal'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewComplaintDetail('${complaintData}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="openAssignPopup('${complaint.complaint_id}')" title="Assign Engineer">
                        <i class="fas fa-user-plus"></i> Assign
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize pending complaints functionality
function initPendingComplaints() {
    const filterButton = document.querySelector('#pending-complaints .btn-primary');
    const bulkUpdateBtn = document.querySelector('#pending-complaints .btn-primary:last-of-type');
    const pendingResetBtn = document.querySelector('#pending-complaints .btn-outline');
    const pendingSection = document.querySelector('#pending-complaints');

    // Auto-load complaints on section initialization
    loadPendingComplaints();

    // Filter functionality
    if (filterButton && filterButton.textContent.includes('Apply Filter')) {
        filterButton.addEventListener("click", async function () {
            const fromDateInput = document.getElementById("pendingFromDate");
            const toDateInput = document.getElementById("pendingToDate");
            const serviceTypeSelect = document.getElementById("pendingServiceType");
            const engineerSelect = document.getElementById("pendingEngineer");

            const filters = {
                from_date: fromDateInput?.value || '',
                to_date: toDateInput?.value || '',
                call_type: serviceTypeSelect?.value || '',
                engineer: engineerSelect?.value || ''
            };

            console.log("Applying pending filters:", filters);
            await loadPendingComplaints(filters);
        });
    }

    // Bulk update functionality
    if (bulkUpdateBtn && bulkUpdateBtn.textContent.includes('Bulk Update')) {
        bulkUpdateBtn.addEventListener('click', function () {
            const selectedCheckboxes = pendingSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                const selectedIds = Array.from(selectedCheckboxes).map(checkbox => {
                    const row = checkbox.closest('tr');
                    return row.querySelector('.job-id')?.textContent;
                });

                showToast(`${selectedCount} complaint(s) selected for bulk update: ${selectedIds.join(', ')}`, 'success');
                // Here you would typically open a bulk update modal
            } else {
                showToast('Please select at least one complaint to update.', 'warning');
            }
        });
    }

    // Reset functionality
    if (pendingResetBtn) {
        pendingResetBtn.addEventListener('click', function () {
            const inputs = pendingSection.querySelectorAll('.form-group input');
            const selects = pendingSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);

            showToast('Filters reset. Loading all pending complaints...', 'success');
            loadPendingComplaints(); // Reload without filters
        });
    }
}

// Load pending complaints with optional filters
async function loadPendingComplaints(filters = {}) {
    try {
        showLoadingIndicator('pending', true);

        const response = await fetch(`${API_URL}/complain/getPending`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        const complaints = responseData.complaints;

        if (complaints && complaints.length > 0) {
            renderPendingComplaints(complaints);
            // showToast(`Found ${complaints.length} pending complaints`, "success");
        } else {
            const tableBody = document.getElementById("pendingComplaintsTable");
            if (tableBody) {
                tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #64748b;'>No pending complaints found</td></tr>";
            }
            showToast("No pending complaints found", "info");
        }
    } catch (err) {
        console.error("Error fetching pending complaints:", err);
        showToast(`Failed to fetch complaints: ${err.message}`, "error");

        const tableBody = document.getElementById("pendingComplaintsTable");
        if (tableBody) {
            tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #dc2626;'>Error loading complaints</td></tr>";
        }
    } finally {
        showLoadingIndicator('pending', false);
    }
}

function renderPendingComplaints(complaints) {
    const tableBody = document.getElementById("pendingComplaintsTable");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    complaints.forEach(complaint => {
        const complaintData = encodeURIComponent(JSON.stringify(complaint));
        const row = document.createElement("tr");
        row.innerHTML = `
        <td><input type="checkbox" class="complaint-checkbox" data-complaint-id="${complaint.complaint_id}"></td>
        <td class="job-id">${complaint.complaint_id}</td>
        <td>
            <div class="customer-info">
                <strong>${complaint.customer_name || 'N/A'}</strong>
                <br><small style="color: #64748b;">${complaint.mobile_number || 'N/A'}</small>
            </div>
        </td>
        <td><span class="badge badge-primary">${complaint.issue_type || 'N/A'}</span></td>
        <td>${complaint.pincode || 'N/A'}</td>
        <td>${formatDate(complaint.req_creation_date)}</td>
        <td><span class="badge badge-${getStatusClass(complaint.job_status)}">${complaint.job_status || 'Pending'}</span></td>
        <td>${formatDate(complaint.updated_at)}</td>
        <td>
            <div class="action-buttons">
                <button class="action-btn" onclick="viewComplaintDetail('${complaintData}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editComplaintDetails('${complaintData}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </td>
    `;
        tableBody.appendChild(row);
    });

}

// Initialize assigned complaints functionality (formerly repair complaints)
function initAssignedComplaints() {
    const filterButton = document.querySelector('#assigned-complaints .btn-primary');
    const requestPartsBtn = document.querySelector('#assigned-complaints .btn-primary:last-of-type');
    const assignedResetBtn = document.querySelector('#assigned-complaints .btn-outline');
    const assignedSection = document.querySelector('#assigned-complaints');

    // Auto-load complaints on section initialization
    loadAssignedComplaints();

    // Filter functionality
    if (filterButton && filterButton.textContent.includes('Apply Filter')) {
        filterButton.addEventListener("click", async function () {
            const fromDateInput = document.getElementById("assignedFromDate");
            const toDateInput = document.getElementById("assignedToDate");
            const engineerSelect = document.getElementById("assignedEngineer");
            const statusSelect = document.getElementById("assignedStatus");

            const filters = {
                fromDate: fromDateInput?.value || '',
                toDate: toDateInput?.value || '',
                engineer: engineerSelect?.value || '',
                status: statusSelect?.value || ''
            };

            console.log("Applying assigned filters:", filters);
            await loadAssignedComplaints(filters);
        });
    }

    // Request parts functionality
    if (requestPartsBtn && requestPartsBtn.textContent.includes('Request Parts')) {
        requestPartsBtn.addEventListener('click', function () {
            const selectedCheckboxes = assignedSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                const selectedIds = Array.from(selectedCheckboxes).map(checkbox => {
                    const row = checkbox.closest('tr');
                    return row.querySelector('.job-id')?.textContent;
                });

                showToast(`Parts request initiated for ${selectedCount} assigned job(s): ${selectedIds.join(', ')}`, 'success');
                // Here you would typically open a parts request modal
            } else {
                showToast('Please select at least one assigned job for parts request.', 'warning');
            }
        });
    }

    // Reset functionality
    if (assignedResetBtn) {
        assignedResetBtn.addEventListener('click', function () {
            const inputs = assignedSection.querySelectorAll('.form-group input');
            const selects = assignedSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);

            showToast('Filters reset. Loading all assigned complaints...', 'success');
            loadAssignedComplaints(); // Reload without filters
        });
    }
}

// Load assigned complaints with optional filters
async function loadAssignedComplaints(filters = {}) {
    try {
        showLoadingIndicator('assigned', true);

        const response = await fetch(`${API_URL}/complain/getAssigned`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        const complaints = responseData.complaints;

        if (complaints && complaints.length > 0) {
            renderAssignedComplaints(complaints);
            // showToast(`Found ${complaints.length} assigned complaints`, "success");
        } else {
            const tableBody = document.getElementById("assignedComplaintsTable");
            if (tableBody) {
                tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #64748b;'>No assigned complaints found</td></tr>";
            }
            showToast("No assigned complaints found", "info");
        }
    } catch (err) {
        console.error("Error fetching assigned complaints:", err);
        showToast(`Failed to fetch complaints: ${err.message}`, "error");

        const tableBody = document.getElementById("assignedComplaintsTable");
        if (tableBody) {
            tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #dc2626;'>Error loading complaints</td></tr>";
        }
    } finally {
        showLoadingIndicator('assigned', false);
    }
}

function renderAssignedComplaints(complaints) {
    const tableBody = document.getElementById("assignedComplaintsTable");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    complaints.forEach(complaint => {
        const complaintData = encodeURIComponent(JSON.stringify(complaint));
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" class="complaint-checkbox" data-complaint-id="${complaint.complaint_id}"></td>
            <td class="job-id">${complaint.complaint_id}</td>
            <td>
                <div class="customer-info">
                    <strong>${complaint.customer_name || 'N/A'}</strong>
                    <br><small style="color: #64748b;">${complaint.mobile_number || 'N/A'}</small>
                </div>
            </td>
            <td><span class="badge badge-info">${complaint.issue_type || 'N/A'}</span></td>
            <td>${complaint.assigned_engineer || 'Not Assigned'}</td>
            <td>${formatDate(complaint.req_creation_date)}</td>
            <td><span class="badge badge-${getStatusClass(complaint.job_status)}">${complaint.job_status || 'Assigned'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewComplaintDetail('${complaintData}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editComplaintDetails('${complaintData}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="requestParts('${complaint.complaint_id}')" title="Request Parts">
                        <i class="fas fa-tools"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize complete complaints functionality
function initCompleteComplaints() {
    const filterButton = document.querySelector('#complete-complaints .btn-primary');
    const generateReportBtn = document.querySelector('#complete-complaints .btn-primary:last-of-type');
    const completeResetBtn = document.querySelector('#complete-complaints .btn-outline');
    const completeSection = document.querySelector('#complete-complaints');

    // Auto-load complaints on section initialization
    loadCompleteComplaints();

    // Filter functionality
    if (filterButton && filterButton.textContent.includes('Apply Filter')) {
        filterButton.addEventListener("click", async function () {
            const fromDateInput = document.getElementById("completedFromDate");
            const toDateInput = document.getElementById("completedToDate");
            const serviceTypeSelect = document.getElementById("completedServiceType");
            const engineerSelect = document.getElementById("completedEngineer");

            const filters = {
                from_date: fromDateInput?.value || '',
                to_date: toDateInput?.value || '',
                call_type: serviceTypeSelect?.value || '',
                engineer: engineerSelect?.value || ''
            };

            console.log("Applying completed filters:", filters);
            await loadCompleteComplaints(filters);
        });
    }

    // Generate report functionality
    if (generateReportBtn && generateReportBtn.textContent.includes('Generate Report')) {
        generateReportBtn.addEventListener('click', function () {
            const selectedCheckboxes = completeSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                const selectedIds = Array.from(selectedCheckboxes).map(checkbox => {
                    const row = checkbox.closest('tr');
                    return row.querySelector('.job-id')?.textContent;
                });

                showToast(`Report generated for ${selectedCount} completed job(s): ${selectedIds.join(', ')}`, 'success');
                // Here you would typically generate and download the report
            } else {
                showToast('Generating report for all completed jobs...', 'info');
                // Generate report for all visible complaints
            }
        });
    }

    // Reset functionality
    if (completeResetBtn) {
        completeResetBtn.addEventListener('click', function () {
            const inputs = completeSection.querySelectorAll('.form-group input');
            const selects = completeSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);

            showToast('Filters reset. Loading all completed complaints...', 'success');
            loadCompleteComplaints(); // Reload without filters
        });
    }
}

// Load complete complaints with optional filters
async function loadCompleteComplaints(filters = {}) {
    try {
        showLoadingIndicator('complete', true);

        const response = await fetch(`${API_URL}/complain/getCompleted`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        const complaints = responseData.complaints;


        if (complaints && complaints.length > 0) {
            renderCompleteComplaints(complaints);
            // showToast(`Found ${complaints.length} completed complaints`, "success");
        } else {
            const tableBody = document.getElementById("completedComplaintsTable");
            if (tableBody) {
                tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #64748b;'>No completed complaints found</td></tr>";
            }
            showToast("No completed complaints found", "info");
        }
    } catch (err) {
        console.error("Error fetching completed complaints:", err);
        showToast(`Failed to fetch complaints: ${err.message}`, "error");

        const tableBody = document.getElementById("completedComplaintsTable");
        if (tableBody) {
            tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #dc2626;'>Error loading complaints</td></tr>";
        }
    } finally {
        showLoadingIndicator('complete', false);
    }
}

function renderCompleteComplaints(complaints) {
    const tableBody = document.getElementById("completedComplaintsTable");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    complaints.forEach(complaint => {
        const complaintData = encodeURIComponent(JSON.stringify(complaint));
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" class="complaint-checkbox" data-complaint-id="${complaint.complaint_id}"></td>
            <td class="job-id">${complaint.complaint_id}</td>
            <td>
                <div class="customer-info">
                    <strong>${complaint.customer_name || 'N/A'}</strong>
                    <br><small style="color: #64748b;">${complaint.mobile_number || 'N/A'}</small>
                </div>
            </td>
            <td><span class="badge badge-success">${complaint.issue_type|| 'N/A'}</span></td>
            <td>${complaint.pincode || 'N/A'}</td>
            <td>${formatDate(complaint.req_creation_date)}</td>
            <td><span class="badge badge-success">Completed</span></td>
             <td>${formatDate(complaint.updated_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewComplaintDetail('${complaintData}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="downloadReport('${complaint.complaint_id}')" title="Download Report">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize cancelled complaints functionality
function initCancelledComplaints() {
    const filterButton = document.querySelector('#cancelled-complaints .btn-primary');
    const analysisReportBtn = document.querySelector('#cancelled-complaints .btn-primary:last-of-type');
    const cancelledResetBtn = document.querySelector('#cancelled-complaints .btn-outline');
    const cancelledSection = document.querySelector('#cancelled-complaints');

    // Auto-load complaints on section initialization
    loadCancelledComplaints();

    // Filter functionality
    if (filterButton && filterButton.textContent.includes('Apply Filter')) {
        filterButton.addEventListener("click", async function () {
            const fromDateInput = document.getElementById("cancelledFromDate");
            const toDateInput = document.getElementById("cancelledToDate");
            const reasonSelect = document.getElementById("cancelledReason");

            const filters = {
                fromDate: fromDateInput?.value || '',
                toDate: toDateInput?.value || '',
                cancel_reason: reasonSelect?.value || ''
            };

            console.log("Applying cancelled filters:", filters);
            await loadCancelledComplaints(filters);
        });
    }

    // Analysis report functionality
    if (analysisReportBtn && analysisReportBtn.textContent.includes('Analysis Report')) {
        analysisReportBtn.addEventListener('click', function () {
            showToast('Cancellation analysis report generated!', 'success');
            // Here you would typically generate and download the analysis report
        });
    }

    // Reset functionality
    if (cancelledResetBtn) {
        cancelledResetBtn.addEventListener('click', function () {
            const inputs = cancelledSection.querySelectorAll('.form-group input');
            const selects = cancelledSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);

            showToast('Filters reset. Loading all cancelled complaints...', 'success');
            loadCancelledComplaints(); // Reload without filters
        });
    }
}

// Load cancelled complaints with optional filters
async function loadCancelledComplaints(filters = {}) {
    try {
        showLoadingIndicator('cancelled', true);

        const response = await fetch(`${API_URL}/complain/getCancelled`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        const complaints = responseData.complaints;


        if (complaints && complaints.length > 0) {
            renderCancelledComplaints(complaints);
            // showToast(`Found ${complaints.length} cancelled complaints`, "success");
        } else {
            const tableBody = document.getElementById("cancelledComplaintsTable");
            if (tableBody) {
                tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #64748b;'>No cancelled complaints found</td></tr>";
            }
            showToast("No cancelled complaints found", "info");
        }
    } catch (err) {
        console.error("Error fetching cancelled complaints:", err);
        showToast(`Failed to fetch complaints: ${err.message}`, "error");

        const tableBody = document.getElementById("cancelledComplaintsTable");
        if (tableBody) {
            tableBody.innerHTML = "<tr><td colspan='8' style='text-align: center; padding: 20px; color: #dc2626;'>Error loading complaints</td></tr>";
        }
    } finally {
        showLoadingIndicator('cancelled', false);
    }
}

function renderCancelledComplaints(complaints) {
    const tableBody = document.getElementById("cancelledComplaintsTable");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    complaints.forEach(complaint => {
        const complaintData = encodeURIComponent(JSON.stringify(complaint));
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" class="complaint-checkbox" data-complaint-id="${complaint.complaint_id}"></td>
            <td class="job-id">${complaint.complaint_id}</td>
            <td>
                <div class="customer-info">
                    <strong>${complaint.customer_name|| 'N/A'}</strong>
                    <br><small style="color: #64748b;">${complaint.mobile_number || 'N/A'}</small>
                </div>
            </td>
            <td><span class="badge badge-danger">${complaint.issue_type || 'N/A'}</span></td>
            <td>${complaint.pincode || 'N/A'}</td>
            <td>${formatDate(complaint.req_creation_date)}</td>
            <td><span class="badge badge-danger">${complaint.job_status || 'Cancelled'}</span></td>
            <td>${formatDate(complaint.updated_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewComplaintDetail('${complaintData}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="reactivateComplaint('${complaint.complaint_id}')" title="Reactivate">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// // Complaint assignment functionality
// function openAssignEngineerModal(complaintId) {
//     const modal = document.getElementById('assignEngineerModal');
//     const complaintIdInput = document.getElementById('assignComplaintId');

//     if (modal && complaintIdInput) {
//         // Set the complaint ID
//         complaintIdInput.value = complaintId;

//         // Set current date as default scheduled date
//         const scheduledDate = document.getElementById('scheduledDate');
//         if (scheduledDate) {
//             const today = new Date().toISOString().split('T')[0];
//             scheduledDate.value = today;
//         }

//         // Set default time
//         const scheduledTime = document.getElementById('scheduledTime');
//         if (scheduledTime) {
//             scheduledTime.value = '09:00';
//         }

//         // Show modal
//         modal.style.display = 'flex';

//         // Add fade-in animation
//         setTimeout(() => {
//             modal.style.opacity = '1';
//         }, 10);

//         showToast(`Opening assignment modal for complaint ${complaintId}`, 'info');
//     }
// }

// function closeAssignEngineerModal() {
//     const modal = document.getElementById('assignEngineerModal');

//     if (modal) {
//         // Add fade-out animation
//         modal.style.opacity = '0';

//         setTimeout(() => {
//             modal.style.display = 'none';

//             // Reset form
//             const form = modal.querySelector('form');
//             if (form) {
//                 form.reset();
//             }

//             // Reset select elements
//             const engineerSelect = document.getElementById('engineerSelect');
//             const prioritySelect = document.getElementById('prioritySelect');
//             const assignmentNotes = document.getElementById('assignmentNotes');

//             if (engineerSelect) engineerSelect.value = '';
//             if (prioritySelect) prioritySelect.value = 'medium';
//             if (assignmentNotes) assignmentNotes.value = '';
//         }, 300);
//     }
// }

// function assignEngineerToComplaint() {
//     const complaintId = document.getElementById('assignComplaintId')?.value;
//     const engineerId = document.getElementById('engineerSelect')?.value;
//     const priority = document.getElementById('prioritySelect')?.value;
//     const scheduledDate = document.getElementById('scheduledDate')?.value;
//     const scheduledTime = document.getElementById('scheduledTime')?.value;
//     const notes = document.getElementById('assignmentNotes')?.value;

//     // Validation
//     if (!engineerId) {
//         showToast('Please select an engineer', 'error');
//         return;
//     }

//     if (!scheduledDate) {
//         showToast('Please select a scheduled date', 'error');
//         return;
//     }

//     if (!scheduledTime) {
//         showToast('Please select a scheduled time', 'error');
//         return;
//     }

//     // Simulate assignment process
//     const assignmentData = {
//         complaintId: complaintId,
//         engineerId: engineerId,
//         priority: priority,
//         scheduledDate: scheduledDate,
//         scheduledTime: scheduledTime,
//         notes: notes,
//         assignedAt: new Date().toISOString(),
//         assignedBy: 'Admin User'
//     };

//     // Show loading state
//     const assignButton = document.querySelector('#assignEngineerModal .btn-primary');
//     if (assignButton) {
//         const originalText = assignButton.textContent;
//         assignButton.textContent = 'Assigning...';
//         assignButton.disabled = true;

//         // Simulate API call
//         setTimeout(() => {
//             // Reset button
//             assignButton.textContent = originalText;
//             assignButton.disabled = false;

//             // Close modal
//             closeAssignEngineerModal();

//             // Show success message
//             showToast(`Engineer successfully assigned to complaint ${complaintId}`, 'success');

//             // Update UI to reflect assignment
//             updateComplaintStatus(complaintId, 'assigned');

//             console.log('Assignment Data:', assignmentData);
//         }, 1500);
//     }
// }

// function updateComplaintStatus(complaintId, newStatus) {
//     // Find the complaint row in the table
//     const complaintRows = document.querySelectorAll('.jobs-table tbody tr');

//     complaintRows.forEach(row => {
//         const idCell = row.querySelector('.job-id');
//         if (idCell && idCell.textContent === complaintId) {
//             // Update status or remove from unassigned list
//             if (newStatus === 'assigned') {
//                 // In a real app, this would move to assigned complaints section
//                 // For demo, we'll just update the actions
//                 const actionsCell = row.querySelector('.action-buttons');
//                 if (actionsCell) {
//                     actionsCell.innerHTML = `
//                         <button class="action-btn" onclick="viewComplaintDetail('${complaintId}')" title="View Details">
//                             <i class="fas fa-eye"></i>
//                         </button>
//                         <span class="badge badge-success">Assigned</span>
//                     `;
//                 }
//             }
//         }
//     });
// }


function openViewPopup(encodedComplaint) {
    const complaint = JSON.parse(decodeURIComponent(encodedComplaint));
    const container = document.getElementById("complaintDetails");

    container.innerHTML = `
        <p><strong>Complaint ID:</strong> ${complaint.complaint_id}</p>
        <p><strong>Customer Name:</strong> ${complaint.Customer?.full_name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${complaint.Customer?.mobile_number || 'N/A'}</p>
        <p><strong>Call Type:</strong> ${complaint.call_type || 'N/A'}</p>
        <p><strong>Location:</strong> ${complaint.location || complaint.pincode || 'N/A'}</p>
        <p><strong>Date:</strong> ${formatDate(complaint.date || complaint.created_at)}</p>
        <p><strong>Priority:</strong> ${complaint.priority || 'Normal'}</p>
        ${complaint.product_name ? `<p><strong>Product:</strong> ${complaint.product_name}</p>` : ''}
        ${complaint.model_number ? `<p><strong>Model Number:</strong> ${complaint.model_number}</p>` : ''}
        ${complaint.serial_number ? `<p><strong>Serial Number:</strong> ${complaint.serial_number}</p>` : ''}
    `;

    document.getElementById("viewPopup").style.display = "flex";
}

// function closeViewPopup() {
//     document.getElementById("viewPopup").style.display = "none";
// }

// function openAssignPopup(complaintId) {
//     selectedComplaintId = complaintId;
//     document.getElementById("assignPopup").style.display = "flex";
// }

// function closeAssignPopup() {
//     document.getElementById("assignPopup").style.display = "none";
//     selectedComplaintId = null;
// }

// function assignEngineer() {
//     const name = document.getElementById("engineerName1").value.trim();
//     const phone = document.getElementById("engineerPhone").value.trim();
//     console.log(name);
//     console.log(phone);

//     if (!name || !phone) {
//         alert("Please enter both name and phone number.");
//         return;
//     }

//     if (!selectedComplaintId) {
//         alert("No complaint selected.");
//         return;
//     }

//     // 👇 Send data to backend or just console log for now
//     console.log(`Assigned Engineer ${name} (${phone}) to Complaint ID: ${selectedComplaintId}`);
//     alert(`Engineer assigned to complaint ID ${selectedComplaintId}`);

//     closeAssignPopup();
// }

function closeViewPopup() {
    document.getElementById("viewPopup").style.display = "none";
}

function openAssignPopup(complaintId) {
    selectedComplaintId = complaintId;
    document.getElementById("assignPopup").style.display = "flex";
}

function closeAssignPopup() {
    document.getElementById("assignPopup").style.display = "none";
    selectedComplaintId = null;
}

async function assignEngineer() {
    const name = document.getElementById("engineerName1").value.trim();
    const phone = document.getElementById("engineerPhone").value.trim();

    console.log("👤 Engineer Name:", name);
    console.log("📞 Engineer Phone:", phone);

    if (!name || !phone) {
        showToast("⚠️ Please enter both name and phone number.", "error");
        return;
    }

    if (!selectedComplaintId) {
        showToast("❌ No complaint selected.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/engineer/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                complaint_id: selectedComplaintId,
                engineer_name: name,
                engineer_phone_no: phone
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(`✅ Engineer assigned to complaint ID ${selectedComplaintId}`, "success");

            // Clear inputs
            document.getElementById("engineerName1").value = "";
            document.getElementById("engineerPhone").value = "";
            closeAssignPopup();
            setupAssignedComplaintsSection();
            setupCancelledComplaintsSection();
            setupCompleteComplaintsSection();
            setupUnassignedComplaintsSection();
            setupPendingComplaintsSection();
        } else {
            showToast(`❌ ${data.message}`, "error");
        }
    } catch (error) {
        console.error("❌ Error assigning engineer:", error);
        showToast("❌ Failed to assign engineer. Please try again.", "error");
    }
}

// View complaint details function
// View complaint details modal
async function viewComplaintDetail(complaintdata) {
    try {
        const complaint = JSON.parse(decodeURIComponent(complaintdata));
        showToast(`Loading details for complaint ${complaint.complaint_id}...`, 'info');

        // Fetch complaint details
        // const complaintData = await fetchComplaintById(complaintId);

        // if (!complaintData) {
        //     showToast('Complaint details not found', 'error');
        //     return;
        // }

        // Populate view modal
        populateViewModal(complaint);

        // Show modal
        const modal = document.getElementById('viewComplaintModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.style.opacity = '1', 10);
        }
    } catch (error) {
        console.error('Error viewing complaint details:', error);
        showToast('Error loading complaint details', 'error');
    }
}

// Edit complaint details modal
async function editComplaintDetails(complaintdata) {
    try {
        const complaint = JSON.parse(decodeURIComponent(complaintdata));
        console.log(complaint);
        showToast(`Loading complaint ${complaint.complaint_id} for editing...`, 'info');

        // Fetch complaint details
        // const complaintData = await fetchComplaintById(complaintId);

        // if (!complaintData) {
        //     showToast('Complaint details not found', 'error');
        //     return;
        // }

        // Populate edit modal
        console.log(complaint);
        populateEditModal(complaint);

        // Show modal
        const modal = document.getElementById('editComplaintModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.style.opacity = '1', 10);
        }
    } catch (error) {
        console.error('Error loading complaint for editing:', error);
        showToast('Error loading complaint for editing', 'error');
    }
}


// Fetch complaint by ID
// async function fetchComplaintById(complaintId) {
//     try {
//         const token = getCookie("token");
//         if (!token) {
//             throw new Error("Authentication token not found");
//         }

//         // Try to fetch from different endpoints
//         const endpoints = [
//             `${API_URL}/complain/getUnassigned`,
//             `${API_URL}/complain/getAssigned`,
//             `${API_URL}/complain/getPending`,
//             `${API_URL}/complain/getCompleted`,
//             `${API_URL}/complain/getCancelled`
//         ];

//         for (const endpoint of endpoints) {
//             try {
//                 const response = await fetch(endpoint, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "Authorization": `Bearer ${token}`
//                     },
//                     body: JSON.stringify({})
//                 });

//                 if (response.ok) {
//                     const data = await response.json();
//                     const complaint = data.complaints?.find(c => c.complaint_id === complaintId);
//                     if (complaint) {
//                         return complaint;
//                     }
//                 }
//             } catch (error) {
//                 console.warn(`Failed to fetch from ${endpoint}:`, error);
//             }
//         }

//         return null;
//     } catch (error) {
//         console.error('Error fetching complaint:', error);
//         throw error;
//     }
// }

// Populate view modal with complaint data
function populateViewModal(complaint) {
    // Basic complaint info
    document.getElementById('viewComplaintId').textContent = complaint.complaint_id || 'N/A';
    document.getElementById('viewReportedOn').textContent = formatDate(complaint.req_creation_date) || 'N/A';

    // Product details
    document.getElementById('viewProduct').textContent = complaint.product_name || 'N/A';
    document.getElementById('viewProductType').textContent = complaint.product_type || 'N/A';
    document.getElementById('viewDateOfPurchase').textContent = formatDate(complaint.date_of_purchase) || 'N/A';

    // Complaint details
    document.getElementById('viewComplaintType').textContent = complaint.call_priority || 'N/A';
    document.getElementById('viewIssueType').textContent = complaint.issue_type || 'N/A';
    document.getElementById('viewAssignedTo').textContent = complaint.assigned_engineer || 'Not Assigned';
    document.getElementById('viewStatus').textContent = complaint.job_status || 'Open';
    document.getElementById('viewAssignedEngineer').textContent = complaint.assigned_engineer || 'Not Assigned';

    // Customer details
    document.getElementById('viewCustomerName').textContent = complaint.customer_name || 'N/A';
    document.getElementById('viewAddress').textContent = complaint.address || 'N\A';
    document.getElementById('viewMobile').textContent = complaint.mobile_number || 'N/A';
}

// Populate edit modal with complaint data
function populateEditModal(complaint) {
    document.getElementById('editComplaintIdField').value = complaint.complaint_id || '';
    document.getElementById('editRequestTypeField').value=complaint.request_type || '';
    document.getElementById('editBookingDate').value = formatDateForInput(complaint.booking_date);
    document.getElementById('editBookingSlot').value = complaint.booking_time || '';

    // Delivery details
    document.getElementById('editEstimatedDelivery').value = formatDateForInput(complaint.estimated_product_delivery_date);
    document.getElementById('editActualDelivery').value = ''; // No corresponding DB field provided

    // Job details
    document.getElementById('editPreJobConnect').value = complaint.Pre_job_connect_with_Cx || '';
    document.getElementById('editFinalAlignmentDate').value = formatDateForInput(complaint.final_Customer_partner_alignment_Date);
    document.getElementById('editFinalAlignmentTime').value = complaint.Final_Time_slot_committed_with_Cx_Px || '';

    // Visit and partner details
    document.getElementById('editUnproductiveVisit').value = complaint.Unproductive_visit_if_any || '';
    document.getElementById('editPartnerName').value = complaint.partner_name || '';

    // Status details
    document.getElementById('editJobEndDate').value = formatDateForInput(complaint.job_end_date);
    document.getElementById('editOgmStatus').value = complaint.OGM_Status || '';
    document.getElementById('editJobStatus').value = complaint.job_status || '';

    // Reschedule details
    document.getElementById('editRescheduleDate').value = formatDateForInput(complaint.rescheduled_date);
    document.getElementById('editRescheduleReason').value = complaint.reason_for_rescheduling || '';
    document.getElementById('editRescheduleRemark').value = complaint.remark_for_rescheduling || '';

    // Cancellation details
    document.getElementById('editCancelReason').value = complaint.reason_for_cancelled || '';
    document.getElementById('editCancelRemark').value = complaint.remark_for_cancelled || '';

    // Technical details
    document.getElementById('editRfInstallationStatus').value = complaint.rf_module_installation_status || '';
    document.getElementById('editRfNotInstalledReason').value = complaint.reason_for_rf_not_installed || '';

    // Configuration and connectivity
    const configurationDone = complaint.configuration_done;
    if (configurationDone !== undefined) {
        document.querySelector(`input[name="configurationDone"][value="${configurationDone === 'Yes' ? 'Yes' : 'No'}"]`).checked = true;
    }

    const wifiConnected = complaint.wifi_connected;
    if (wifiConnected !== undefined) {
        document.querySelector(`input[name="wifiConnected"][value="${wifiConnected === 'Yes' ? 'Yes' : 'No'}"]`).checked = true;
    }

    // Remarks and ratings
    document.getElementById('editSmeRemark').value = complaint.sme_Remark || '';
    document.getElementById('editExtraMileRemark').value = complaint.remark_for_extra_mile || '';
    document.getElementById('editAzRating').value = complaint.az_rating || '';
    document.getElementById('editOtherRemark').value = complaint.other_remark_if_any || '';
}


// Close modals
function closeViewModal() {
    const modal = document.getElementById('viewComplaintModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

function closeEditModal() {
    const modal = document.getElementById('editComplaintModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// Update complaint
async function updateComplaint() {
    try {
        const complaintId = document.getElementById('editComplaintIdField').value;

        if (!complaintId) {
            showToast('Complaint ID is required', 'error');
            return;
        }

        // Collect form data
        const updateData = {
            complaint_id: complaintId,
            booking_date: document.getElementById('editBookingDate').value,
            booking_time: document.getElementById('editBookingSlot').value,
            estimated_product_delivery_date: document.getElementById('editEstimatedDelivery').value,
            job_end_date: document.getElementById('editActualDelivery').value,
            Pre_job_connect_with_Cx: document.getElementById('editPreJobConnect').value,
            final_Customer_partner_alignment_Date: document.getElementById('editFinalAlignmentDate').value,
            Final_Time_slot_committed_with_Cx_Px: document.getElementById('editFinalAlignmentTime').value,
            Unproductive_visit_if_any: document.getElementById('editUnproductiveVisit').value,
            partner_name: document.getElementById('editPartnerName').value,
            OGM_Status: document.getElementById('editOgmStatus').value,
            job_status: document.getElementById('editJobStatus').value,
            rescheduled_date: document.getElementById('editRescheduleDate').value,
            reason_for_rescheduling: document.getElementById('editRescheduleReason').value,
            remark_for_rescheduling: document.getElementById('editRescheduleRemark').value,
            reason_for_cancelled: document.getElementById('editCancelReason').value,
            remark_for_cancelled: document.getElementById('editCancelRemark').value,
            rf_module_installation_status: document.getElementById('editRfInstallationStatus').value,
            reason_for_rf_not_installed: document.getElementById('editRfNotInstalledReason').value,
            configuration_done: document.querySelector('input[name="configurationDone"]:checked')?.value === 'Yes' ? 'Yes' : 'No',
            wifi_connected: document.querySelector('input[name="wifiConnected"]:checked')?.value === 'Yes' ? 'Yes' : 'No',
            sme_Remark: document.getElementById('editSmeRemark').value,
            remark_for_extra_mile: document.getElementById('editExtraMileRemark').value,
            az_rating: document.getElementById('editAzRating').value,
            other_remark_if_any: document.getElementById('editOtherRemark').value,
            updated_at: new Date()
        };

        // Show loading state
        const updateBtn = document.querySelector('#editComplaintModal .btn-primary');
        const originalText = updateBtn.textContent;
        updateBtn.textContent = 'Updating...';
        updateBtn.disabled = true;

        // Replace with your actual API URL
        const response = await fetch(`${API_URL}/complain/update`, {
            method: 'PUT', // or POST, depending on backend
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        // Handle API response
        if (response.ok && result.success) {
            updateBtn.textContent = originalText;
            updateBtn.disabled = false;
            closeEditModal();
            showToast(`✅ Complaint ${complaintId} updated successfully!`, 'success');
            setupAssignedComplaintsSection();
            setupCancelledComplaintsSection();
            setupCompleteComplaintsSection();
            setupUnassignedComplaintsSection();
            setupPendingComplaintsSection();
            // Reload complaints based on current section
            const currentSection = document.querySelector('.section.active');
            if (currentSection) {
                const sectionId = currentSection.id;
                if (sectionId === 'edit-complaints') {
                    loadEditComplaints();
                } else if (sectionId === 'cancelled-complaints') {
                    loadCancelledComplaints();
                } else if (sectionId === 'complete-complaints') {
                    loadCompleteComplaints();
                }
            }
        } else {
            updateBtn.textContent = originalText;
            updateBtn.disabled = false;
            showToast(`❌ ${result.message || 'Update failed'}`, 'error');
        }

        console.log('Update data sent:', updateData);

    } catch (error) {
        console.error('Error updating complaint:', error);
        showToast('❌ Error updating complaint', 'error');

        const updateBtn = document.querySelector('#editComplaintModal .btn-primary');
        updateBtn.textContent = 'Update';
        updateBtn.disabled = false;
    }
}



// Common action buttons functionality
function assignComplaint(complaint) {
    openAssignEngineerModal(complaint);
}

function updateAssignedStatus(complaint) {
    showToast(`Updating assigned status for complaint ${complaint}`, 'success');
    // Implement assigned status update functionality
}

function requestParts(complaint) {
    showToast(`Requesting parts for complaint ${complaint}`, 'success');
    // Implement parts request functionality
}

function downloadReport(complaintId) {
    showToast(`Downloading report for complaint ${complaintId}`, 'success');
    // Implement report download functionality
}

function reactivateComplaint(complaintId) {
    showToast(`Reactivating complaint ${complaintId}`, 'warning');
    // Implement complaint reactivation functionality
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function getPriorityClass(priority) {
    const priorityClasses = {
        'urgent': 'danger',
        'high': 'danger',
        'medium': 'warning',
        'normal': 'success',
        'low': 'success'
    };
    return priorityClasses[priority?.toLowerCase()] || 'success';
}

function getStatusClass(status) {
    const statusClasses = {
        'completed': 'success',
        'in progress': 'primary',
        'assigned': 'info',
        'pending': 'warning',
        'cancelled': 'danger'
    };
    return statusClasses[status?.toLowerCase()] || 'warning';
}

function showLoadingIndicator(section, show) {
    const indicator = document.getElementById(`${section}LoadingIndicator`);
    if (indicator) {
        indicator.style.display = show ? "block" : "none";
    } else if (show) {
        // Create loading indicator if it doesn't exist
        const loadingDiv = document.createElement("div");
        loadingDiv.id = `${section}LoadingIndicator`;
        loadingDiv.style.cssText = "display: block; text-align: center; padding: 20px;";
        loadingDiv.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2563eb;"></i>
            <p style="margin-top: 10px; color: #64748b;">Loading ${section} complaints...</p>
        `;

        const tableContainer = document.getElementById(`${section}ComplaintsTable`);
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(loadingDiv, tableContainer);
        }
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// Select all checkboxes functionality
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('thead input[type="checkbox"]').forEach(selectAll => {
        selectAll.addEventListener('change', function () {
            const table = this.closest('table');
            const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    });

    // Common Action Buttons (View, Update, etc.)
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function () {
            const action = this.getAttribute('title');
            const row = this.closest('tr');
            const complaintId = row.querySelector('.job-id')?.textContent || 'N/A';

            switch (action) {
                case 'View':
                case 'View Details':
                    showToast(`Viewing details for ${complaintId}`, 'info');
                    break;
                case 'Update':
                case 'Update Status':
                    showToast(`Updating status for ${complaintId}`, 'success');
                    break;
                case 'Download Report':
                    showToast(`Downloading report for ${complaintId}`, 'success');
                    break;
                case 'Reopen':
                case 'Reactivate':
                    showToast(`Reopening complaint ${complaintId}`, 'warning');
                    break;
                case 'Assign':
                case 'Assign Engineer':
                    showToast(`Assigning complaint ${complaintId} to technician`, 'success');
                    break;
                default:
                    showToast(`${action} action performed for ${complaintId}`, 'info');
            }
        });
    });
});

// Make functions globally available
window.viewComplaintDetail = viewComplaintDetail;
window.editComplaintDetails = editComplaintDetails;
window.closeViewModal = closeViewModal;
window.closeEditModal = closeEditModal;
window.updateComplaint = updateComplaint;
window.downloadReport = downloadReport;
window.reactivateComplaint = reactivateComplaint;

// Export functions if needed for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeComplaintManagement,
        setupUnassignedComplaintsSection,
        setupPendingComplaintsSection,
        setupAssignedComplaintsSection,
        setupCompleteComplaintsSection,
        setupCancelledComplaintsSection
    };
}