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

            const filters = {
                from_date: fromDateInput?.value || '',
                to_date: toDateInput?.value || '',
            };

            console.log("Applying filters:", filters);
            await loadUnassignedComplaints(filters);
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
        // showToast(`Failed to fetch complaints: ${err.message}`, "error");

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

            const filters = {
                from_date: fromDateInput?.value || '',
                to_date: toDateInput?.value || '',
            };

            console.log("Applying pending filters:", filters);
            await loadPendingComplaints(filters);
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
            // showToast("No pending complaints found", "info");
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

            const filters = {
                fromDate: fromDateInput?.value || '',
                toDate: toDateInput?.value || '',
            };

            console.log("Applying assigned filters:", filters);
            await loadAssignedComplaints(filters);
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
            // showToast("No assigned complaints found", "info");
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

            const filters = {
                from_date: fromDateInput?.value || '',
                to_date: toDateInput?.value || '',
            };

            console.log("Applying completed filters:", filters);
            await loadCompleteComplaints(filters);
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
            // showToast("No completed complaints found", "info");
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
            <td class="job-id">${complaint.complaint_id}</td>
            <td>
                <div class="customer-info">
                    <strong>${complaint.customer_name || 'N/A'}</strong>
                    <br><small style="color: #64748b;">${complaint.mobile_number || 'N/A'}</small>
                </div>
            </td>
            <td><span class="badge badge-success">${complaint.issue_type || 'N/A'}</span></td>
            <td>${complaint.pincode || 'N/A'}</td>
            <td>${formatDate(complaint.req_creation_date)}</td>
            <td><span class="badge badge-success">Completed</span></td>
             <td>${formatDate(complaint.updated_at)}</td>
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
            const filters = {
                fromDate: fromDateInput?.value || '',
                toDate: toDateInput?.value || '',
            };

            console.log("Applying cancelled filters:", filters);
            await loadCancelledComplaints(filters);
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
            // showToast("No cancelled complaints found", "info");
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
            <td class="job-id">${complaint.complaint_id}</td>
            <td>
                <div class="customer-info">
                    <strong>${complaint.customer_name || 'N/A'}</strong>
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

// Call this function when the popup opens

function openAssignPopup(complaintId) {
    selectedComplaintId = complaintId;
    document.getElementById("assignPopup").style.display = "flex";
    loadEngineerList1(selectedComplaintId); // Load engineers on open

}


function closeAssignPopup() {
    document.getElementById("assignPopup").style.display = "none";
    selectedComplaintId = null;
}

// async function assignEngineer() {
//     const name = document.getElementById("engineerName1").value.trim();
//     const phone = document.getElementById("engineerPhone").value.trim();

//     console.log("👤 Engineer Name:", name);
//     console.log("📞 Engineer Phone:", phone);

//     if (!name || !phone) {
//         showToast("⚠️ Please enter both name and phone number.", "error");
//         return;
//     }

//     if (!selectedComplaintId) {
//         showToast("❌ No complaint selected.", "error");
//         return;
//     }

//     try {
//         const response = await fetch(`${API_URL}/engineer/assign`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 complaint_id: selectedComplaintId,
//                 engineer_name: name,
//                 engineer_phone_no: phone
//             })
//         });

//         const data = await response.json();

//         if (data.success) {
//             showToast(`✅ Engineer assigned to complaint ID ${selectedComplaintId}`, "success");

//             // Clear inputs
//             document.getElementById("engineerName1").value = "";
//             document.getElementById("engineerPhone").value = "";
//             closeAssignPopup();
//             setupAssignedComplaintsSection();
//             setupCancelledComplaintsSection();
//             setupCompleteComplaintsSection();
//             setupUnassignedComplaintsSection();
//             setupPendingComplaintsSection();
//         } else {
//             showToast(`❌ ${data.message}`, "error");
//         }
//     } catch (error) {
//         console.error("❌ Error assigning engineer:", error);
//         showToast("❌ Failed to assign engineer. Please try again.", "error");
//     }
// }
// async function assignEngineer() {
//     const name = document.getElementById("engineerName1").value.trim();

//     console.log("👤 Selected Engineer Name:", name);
//     console.log("📌 Selected Complaint ID:", selectedComplaintId);

//     if (!name) {
//         showToast("⚠ Please select an engineer name.", "error");
//         console.warn("⚠ No engineer name selected");
//         return;
//     }

//     if (!selectedComplaintId) {
//         showToast("❌ No complaint selected.", "error");
//         console.warn("❌ No complaint ID provided");
//         return;
//     }

//     try {
//         console.log("📤 Sending assign request to:", `${API_URL}/engineer/assign`);

//         const response = await fetch(`${API_URL}/engineer/assign`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 complaint_id: selectedComplaintId,
//                 engineer_name: name
//             })
//         });

//         console.log("📥 Response received:", response);

//         const data = await response.json();

//         console.log("🧾 Parsed response JSON:", data);

//         if (data.success) {
//             showToast(`✅ Engineer assigned to complaint ID ${selectedComplaintId}`, "success");
//             console.log(`✅ Engineer "${name}" successfully assigned to complaint ID ${selectedComplaintId}`);

//             // Clear input
//             document.getElementById("engineerName1").value = "";
//             closeAssignPopup();
//             setupAssignedComplaintsSection();
//             setupCancelledComplaintsSection();
//             setupCompleteComplaintsSection();
//             setupUnassignedComplaintsSection();
//             setupPendingComplaintsSection();
//         } else {
//             showToast(`❌ ${data.message}`, "error");
//             console.error("❌ Assignment failed:", data.message);
//         }
//     } catch (error) {
//         console.error("❌ Error assigning engineer:", error);
//         showToast("❌ Failed to assign engineer. Please try again.", "error");
//     }
// }
async function assignEngineer() {
    const name = document.getElementById("engineerName1").value.trim();

    console.log("👤 Engineer Name:", name);
    console.log("📌 Selected Complaint ID:", selectedComplaintId);

    if (!name) {
        showToast("⚠ Please select an engineer name.", "error");
        return;
    }

    if (!selectedComplaintId) {
        showToast("❌ No complaint selected.", "error");
        return;
    }

    try {
        const token = getCookie("token");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        console.log("🔐 Token: " + token);
        console.log("📤 Sending assign request to:", `${API_URL}/engineer/assign`);

        const response = await fetch(`${API_URL}/engineer/assign`, {
            method: 'POST',  // 🔁 This is still POST because you're assigning a complaint
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                complaint_id: selectedComplaintId,
                engineer_name: name
            })
        });

        const data = await response.json();
        console.log("📥 Server response:", data);

        if (data.success) {
            showToast(`✅ Engineer assigned to complaint ID ${selectedComplaintId}`, "success");

            // Clear input
            document.getElementById("engineerName1").value = "";
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


async function loadEngineerList1(selectedComplaintId) {
    try {
        console.log("🚀 loadEngineerList1() called with complaint ID:", selectedComplaintId);

        const token = getCookie("token");
        if (!token) {
            console.error("❌ Authentication token not found in cookies.");
            throw new Error("Authentication token not found");
        }

        console.log("🔐 Token found:", token);

        const requestUrl = `${API_URL}/engineer/listassignengineer?complaintId=${selectedComplaintId}`;
        console.log("📤 Sending GET request to:", requestUrl);

        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("📥 Response received. Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text(); // Read error message if any
            console.error("❌ Failed to fetch engineer list. Server says:", errorText);
            throw new Error(`Failed to fetch engineer list. Status: ${response.status}`);
        }

        const resData = await response.json();
        console.log("📦 Response JSON:", resData);

        const engineers = resData.data || [];
        console.log(`👷 Number of engineers fetched: ${engineers.length}`);

        const dropdown = document.getElementById("engineerName1");
        if (!dropdown) {
            console.error("❌ Dropdown element #engineerName1 not found in DOM.");
            throw new Error("Dropdown element not found.");
        }

        // Clear existing options
        dropdown.innerHTML = '<option value="">Select Engineer</option>';
        console.log("🔄 Dropdown cleared.");

        // Populate dropdown
        engineers.forEach((engineer, index) => {
            const option = document.createElement("option");
            option.value = engineer.eng_name;
            option.textContent = engineer.eng_name;
            dropdown.appendChild(option);
            console.log(`✅ Added engineer [${index + 1}]: ${engineer.eng_name}`);
        });

        console.log("✅ Engineer list successfully populated in dropdown.");

    } catch (error) {
        console.error("❌ Error in loadEngineerList1():", error);
        showToast("❌ Failed to load engineer list.", "error");
    }
}


// View complaint details function
// View complaint details modal
async function viewComplaintDetail(complaintdata) {
    try {
        const complaint = JSON.parse(decodeURIComponent(complaintdata));
        showToast(`Loading details for complaint ${complaint.complaint_id}...`, 'info');

        // Fetch engineer data for this complaint
        const response = await fetch(`${API_URL}/engineer/${complaint.complaint_id}`);
        let engineer = null;

        if (response.ok) {
            engineer = await response.json();
        } else {
            console.warn('No engineer assigned to this complaint.');
        }

        // Log both objects for debugging
        console.log('Complaint:', complaint);
        console.log('Engineer:', engineer);

        // Pass data to modal rendering function
        populateViewModal(complaint, engineer);

        // Show the modal
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
function populateViewModal(complaint, engineer) {
    
    // Basic Information
  document.getElementById('viewComplaintId').textContent = complaint.complaint_id || '-';
  document.getElementById('viewRootRequestId').textContent = complaint.root_request_id || '-';
  document.getElementById('viewRequestType').textContent = complaint.request_type || '-';
  document.getElementById('viewCustomerRequestId').textContent = complaint.customer_request_id || '-';
  document.getElementById('viewEcomOrderId').textContent = complaint.ecom_order_id || '-';
  document.getElementById('viewIssueType').textContent = complaint.issue_type || '-';
  
  // Customer Information
  document.getElementById('viewCustomerName').textContent = complaint.customer_name || '-';
  document.getElementById('viewMobileNumber').textContent = complaint.mobile_number || '-';
  document.getElementById('viewAddress').textContent = complaint.address || '-';
  document.getElementById('viewCity').textContent = complaint.city || '-';
  document.getElementById('viewPincode').textContent = complaint.pincode || '-';
  
  // Product Information
  document.getElementById('viewProductType').textContent = complaint.product_type || '-';
  document.getElementById('viewProductName').textContent = complaint.product_name || '-';
  document.getElementById('viewSymptoms').textContent = complaint.symptoms || '-';
  document.getElementById('viewModelNo').textContent = complaint.model_no || '-';
  document.getElementById('viewSerialNumber').textContent = complaint.serial_number || '-';
  document.getElementById('viewBrand').textContent = complaint.brand || '-';
  document.getElementById('viewDateOfPurchase').textContent = formatDate(complaint.date_of_purchase) || '-';
  document.getElementById('viewWarranty').textContent = complaint.warranty || '-';
  
  // Job Information
  document.getElementById('viewReqCreationDate').textContent = formatDate(complaint.req_creation_date) || '-';
  document.getElementById('viewBookingTime').textContent = complaint.booking_time || '-';
  document.getElementById('viewBookingDate').textContent = formatDate(complaint.booking_date) || '-';
  document.getElementById('viewEstimatedProductDeliveryDate').textContent = formatDate(complaint.estimated_product_delivery_date) || '-';
  document.getElementById('viewFinalCustomerPartnerAlignmentDate').textContent = formatDate(complaint.final_Customer_partner_alignment_Date) || '-';
  document.getElementById('viewFinalTimeSlotCommitted').textContent = complaint.Final_Time_slot_committed_with_Cx_Px || '-';
  document.getElementById('viewPartnerName').textContent = complaint.service_partner || '-';
  document.getElementById('viewAssignedEngineer').textContent = engineer?.engineer_name || 'Not Assigned';
  document.getElementById('viewJobEndDate').textContent = formatDate(complaint.job_end_date) || '-';
  
  // Status Information
  document.getElementById('viewPreJobConnectWithCx').textContent = complaint.Pre_job_connect_with_Cx || '-';
  document.getElementById('viewTechnicianAvailability').textContent = complaint.technician_availability || '-';
  document.getElementById('viewJobStatus').textContent = complaint.job_status || '-';
  document.getElementById('viewUnproductiveVisit').textContent = complaint.Unproductive_visit_if_any || '-';
  document.getElementById('viewOGMStatus').textContent = complaint.OGM_Status || '-';
  document.getElementById('viewRescheduledDate').textContent = formatDate(complaint.rescheduled_date) || '-';
  document.getElementById('viewReasonForRescheduling').textContent = complaint.reason_for_rescheduling || '-';
  document.getElementById('viewRemarkForRescheduling').textContent = complaint.remark_for_rescheduling || '-';
  document.getElementById('viewReasonForCancelled').textContent = complaint.reason_for_cancelled || '-';
  document.getElementById('viewRemarkForCancelled').textContent = complaint.remark_for_cancelled || '-';
  
  // Technical Information
  document.getElementById('viewRfModuleInstallationStatus').textContent = complaint.rf_module_installation_status || '-';
  document.getElementById('viewReasonForRfNotInstalled').textContent = complaint.reason_for_rf_not_installed || '-';
  document.getElementById('viewRemarkForRfNotInstalled').textContent = complaint.remark_for_rf_not_installed || '-';
  document.getElementById('viewConfigurationDone').textContent = complaint.configuration_done || '-';
  document.getElementById('viewWifiConnected').textContent = complaint.wifi_connected || '-';
  document.getElementById('viewAzRating').textContent = complaint.az_rating || '-';
  document.getElementById('viewFinalInstallationPossibility').textContent = complaint.final_installation_possibility || '-';
  document.getElementById('viewInformedCustomerForReturn').textContent = complaint.informed_customer_for_return || '-';
  
  // Additional Information
  document.getElementById('viewSmeRemark').textContent = complaint.sme_Remark || '-';
  document.getElementById('viewRemarkForExtraMile').textContent = complaint.remark_for_extra_mile || '-';
  document.getElementById('viewPhotoProofOfInstalledRFModule').textContent = complaint.photo_proof_of_installed_RF_Module || '-';
  document.getElementById('viewVideoProofOfInstalledLock').textContent = complaint.video_proof_of_installed_lock_open || '-';
  document.getElementById('viewVideoOfBellNotificationComing').textContent = complaint.video_of_bell_notification_coming || '-';
  document.getElementById('viewOtherRemark').textContent = complaint.other_remark_if_any || '-';
  document.getElementById('viewUpdatedAt').textContent = formatDate(complaint.updated_at) || '-';
}

// Populate edit modal with complaint data
function populateEditModal(complaint,eng) {
    
     // Basic Information (readonly)
  document.getElementById('editComplaintId').value = complaint.complaint_id || '';

  // Job Information (some editable)
  document.getElementById('editBookingTime').value = complaint.booking_time || '';
  document.getElementById('editBookingDate').value = formatDateForInput(complaint.booking_date);
  document.getElementById('editEstimatedDelivery').value = formatDateForInput(complaint.estimated_product_delivery_date);
  document.getElementById('editFinalCustomerPartnerAlignmentDate').value = formatDateForInput(complaint.final_Customer_partner_alignment_Date);
  document.getElementById('editFinalAlignmentTime').value = complaint.Final_Time_slot_committed_with_Cx_Px || '';
  document.getElementById('editPartnerName').value = complaint.service_partner || '';
  document.getElementById('editJobEndDate').value = formatDateForInput(complaint.job_end_date);
  
  // Status Information (editable)
  document.getElementById('editPreJobConnectWithCx').value = complaint.Pre_job_connect_with_Cx || '';
  document.getElementById('editTechnicianAvailability').value = complaint.technician_availability || '';
  document.getElementById('editJobStatus').value = complaint.job_status || '';
  document.getElementById('editUnproductiveVisit').value = complaint.Unproductive_visit_if_any || '';
  document.getElementById('editOGMStatus').value = complaint.OGM_Status || '';
  document.getElementById('editRescheduledDate').value = formatDateForInput(complaint.rescheduled_date);
  document.getElementById('editReasonForRescheduling').value = complaint.reason_for_rescheduling || '';
  document.getElementById('editRemarkForRescheduling').value = complaint.remark_for_rescheduling || '';
  document.getElementById('editReasonForCancelled').value = complaint.reason_for_cancelled || '';
  document.getElementById('editRemarkForCancelled').value = complaint.remark_for_cancelled || '';
  
  // Technical Information (editable)
  document.getElementById('editRfModuleInstallationStatus').value = complaint.rf_module_installation_status || '';
  document.getElementById('editReasonForRfNotInstalled').value = complaint.reason_for_rf_not_installed || '';
  document.getElementById('editRemarkForRfNotInstalled').value = complaint.remark_for_rf_not_installed || '';
  document.getElementById('editConfigurationDone').value = complaint.configuration_done || '';
  document.getElementById('editWifiConnected').value = complaint.wifi_connected || '';
  document.getElementById('editAzRating').value = complaint.az_rating || '';
  document.getElementById('editFinalInstallationPossibility').value = complaint.final_installation_possibility || '';
  document.getElementById('editInformedCustomerForReturn').value = complaint.informed_customer_for_return || '';
  
  // Additional Information (editable)
  document.getElementById('editSmeRemark').value = complaint.sme_Remark || '';
  document.getElementById('editRemarkForExtraMile').value = complaint.remark_for_extra_mile || '';
  document.getElementById('editOtherRemark').value = complaint.other_remark_if_any || '';

  const fileInput1 = document.getElementById('editPhotoProofOfInstalledRFModule');
if (fileInput1 && fileInput1.type !== 'file') {
    fileInput1.value = complaint.photo_proof_of_installed_RF_Module || '';
}

const fileInput2 = document.getElementById('editVideoProofOfInstalledLock');
if (fileInput2 && fileInput2.type !== 'file') {
    fileInput2.value = complaint.video_proof_of_installed_lock_open || '';
}

const fileInput3 = document.getElementById('editVideoOfBellNotificationComing');
if (fileInput3 && fileInput3.type !== 'file') {
    fileInput3.value = complaint.video_of_bell_notification_coming || '';
}


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
        const complaintId = document.getElementById('editComplaintId').value;

        if (!complaintId) {
            showToast('Complaint ID is required', 'error');
            return;
        }

        // Collect form data
        const updateData = {
            complaint_id: complaintId,

            // Job Information
            booking_time: document.getElementById('editBookingTime').value,
            booking_date: document.getElementById('editBookingDate').value,
            estimated_product_delivery_date: document.getElementById('editEstimatedDelivery').value,
            final_Customer_partner_alignment_Date: document.getElementById('editFinalCustomerPartnerAlignmentDate').value,
            Final_Time_slot_committed_with_Cx_Px: document.getElementById('editFinalAlignmentTime').value,
            job_end_date: document.getElementById('editJobEndDate').value,

            // Status Information
            Pre_job_connect_with_Cx: document.getElementById('editPreJobConnectWithCx').value,
            technician_availability: document.getElementById('editTechnicianAvailability').value,
            job_status: document.getElementById('editJobStatus').value,
            Unproductive_visit_if_any: document.getElementById('editUnproductiveVisit').value,
            OGM_Status: document.getElementById('editOGMStatus').value,
            rescheduled_date: document.getElementById('editRescheduledDate').value,
            reason_for_rescheduling: document.getElementById('editReasonForRescheduling').value,
            remark_for_rescheduling: document.getElementById('editRemarkForRescheduling').value,
            reason_for_cancelled: document.getElementById('editReasonForCancelled').value,
            remark_for_cancelled: document.getElementById('editRemarkForCancelled').value,

            // Technical Information
            rf_module_installation_status: document.getElementById('editRfModuleInstallationStatus').value,
            reason_for_rf_not_installed: document.getElementById('editReasonForRfNotInstalled').value,
            remark_for_rf_not_installed: document.getElementById('editRemarkForRfNotInstalled').value,
            configuration_done: document.getElementById('editConfigurationDone').value,
            wifi_connected: document.getElementById('editWifiConnected').value,
            az_rating: document.getElementById('editAzRating').value,
            final_installation_possibility: document.getElementById('editFinalInstallationPossibility').value,
            informed_customer_for_return: document.getElementById('editInformedCustomerForReturn').value,

            // Additional Information
            sme_Remark: document.getElementById('editSmeRemark').value,
            remark_for_extra_mile: document.getElementById('editRemarkForExtraMile').value,
            photo_proof_of_installed_RF_Module: document.getElementById('editPhotoProofOfInstalledRFModule').value,
            video_proof_of_installed_lock_open: document.getElementById('editVideoProofOfInstalledLock').value,
            video_of_bell_notification_coming: document.getElementById('editVideoOfBellNotificationComing').value,
            other_remark_if_any: document.getElementById('editOtherRemark').value
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