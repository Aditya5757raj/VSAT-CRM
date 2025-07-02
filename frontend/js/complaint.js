// Complaint Management JavaScript functionality
// Handles unassigned-complaints, pending-complaints, repair-complaints, complete-complaints, and cancelled-complaints sections

document.addEventListener('DOMContentLoaded', function() {
    // Initialize complaint management functionality
    initializeComplaintManagement();
});

function initializeComplaintManagement() {
    // Add event listeners for complaint management sections
    const unassignedComplaintsSection = document.querySelector('[data-section="unassigned-complaints"]');
    const pendingComplaintsSection = document.querySelector('[data-section="pending-complaints"]');
    const repairComplaintsSection = document.querySelector('[data-section="repair-complaints"]');
    const completeComplaintsSection = document.querySelector('[data-section="complete-complaints"]');
    const cancelledComplaintsSection = document.querySelector('[data-section="cancelled-complaints"]');
    
    if (unassignedComplaintsSection) {
        setupUnassignedComplaintsSection();
    }
    
    if (pendingComplaintsSection) {
        setupPendingComplaintsSection();
    }
    
    if (repairComplaintsSection) {
        setupRepairComplaintsSection();
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

function setupRepairComplaintsSection() {
    console.log('Repair complaints section initialized');
    
    // Initialize repair complaints functionality
    initRepairComplaints();
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
    const assignSelectedBtn = document.querySelector('#unassigned-complaints .btn-primary:last-of-type');
    const unassignedResetBtn = document.querySelector('#unassigned-complaints .btn-outline');
    const unassignedSection = document.querySelector('#unassigned-complaints');

    if (assignSelectedBtn) {
        assignSelectedBtn.addEventListener('click', function () {
            const selectedCheckboxes = unassignedSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`${selectedCount} complaint(s) assigned successfully!`, 'success');
            } else {
                showToast('Please select at least one complaint to assign.', 'warning');
            }
        });
    }

    if (unassignedResetBtn) {
        unassignedResetBtn.addEventListener('click', function () {
            const inputs = unassignedSection.querySelectorAll('.form-group input');
            const selects = unassignedSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Unassigned filters reset.', 'success');
        });
    }
}

// Initialize pending complaints functionality
function initPendingComplaints() {
    const bulkUpdateBtn = document.querySelector('#pending-complaints .btn-primary:last-of-type');
    const pendingResetBtn = document.querySelector('#pending-complaints .btn-outline');
    const pendingSection = document.querySelector('#pending-complaints');

    if (bulkUpdateBtn) {
        bulkUpdateBtn.addEventListener('click', function () {
            const selectedCheckboxes = pendingSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`${selectedCount} complaint(s) updated successfully!`, 'success');
            } else {
                showToast('Please select at least one complaint to update.', 'warning');
            }
        });
    }

    if (pendingResetBtn) {
        pendingResetBtn.addEventListener('click', function () {
            const inputs = pendingSection.querySelectorAll('.form-group input');
            const selects = pendingSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Pending filters reset.', 'success');
        });
    }
}

// Initialize repair complaints functionality
function initRepairComplaints() {
    const repairPartsBtn = document.querySelector('#repair-complaints .btn-primary:last-of-type');
    const repairResetBtn = document.querySelector('#repair-complaints .btn-outline');
    const repairSection = document.querySelector('#repair-complaints');

    if (repairPartsBtn) {
        repairPartsBtn.addEventListener('click', function () {
            const selectedCheckboxes = repairSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`Parts requested for ${selectedCount} repair job(s)!`, 'success');
            } else {
                showToast('Please select at least one repair job for parts request.', 'warning');
            }
        });
    }

    if (repairResetBtn) {
        repairResetBtn.addEventListener('click', function () {
            const inputs = repairSection.querySelectorAll('.form-group input');
            const selects = repairSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Repair filters reset.', 'success');
        });
    }
}

// Initialize complete complaints functionality
function initCompleteComplaints() {
    const generateReportBtn = document.querySelector('#complete-complaints .btn-primary:last-of-type');
    const completeResetBtn = document.querySelector('#complete-complaints .btn-outline');
    const completeSection = document.querySelector('#complete-complaints');

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function () {
            const selectedCheckboxes = completeSection.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length;

            if (selectedCount > 0) {
                showToast(`Report generated for ${selectedCount} completed job(s)!`, 'success');
            } else {
                showToast('Generating report for all completed jobs...', 'info');
            }
        });
    }

    if (completeResetBtn) {
        completeResetBtn.addEventListener('click', function () {
            const inputs = completeSection.querySelectorAll('.form-group input');
            const selects = completeSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Complete filters reset.', 'success');
        });
    }
}

// Initialize cancelled complaints functionality
function initCancelledComplaints() {
    const analysisReportBtn = document.querySelector('#cancelled-complaints .btn-primary:last-of-type');
    const cancelledResetBtn = document.querySelector('#cancelled-complaints .btn-outline');
    const cancelledSection = document.querySelector('#cancelled-complaints');

    if (analysisReportBtn) {
        analysisReportBtn.addEventListener('click', function () {
            showToast('Cancellation analysis report generated!', 'success');
        });
    }

    if (cancelledResetBtn) {
        cancelledResetBtn.addEventListener('click', function () {
            const inputs = cancelledSection.querySelectorAll('.form-group input');
            const selects = cancelledSection.querySelectorAll('.form-group select');
            inputs.forEach(input => input.value = '');
            selects.forEach(select => select.selectedIndex = 0);
            showToast('Cancelled filters reset.', 'success');
        });
    }
}

// Complaint assignment functionality
function openAssignEngineerModal(complaintId) {
    const modal = document.getElementById('assignEngineerModal');
    const complaintIdInput = document.getElementById('assignComplaintId');
    
    if (modal && complaintIdInput) {
        // Set the complaint ID
        complaintIdInput.value = complaintId;
        
        // Set current date as default scheduled date
        const scheduledDate = document.getElementById('scheduledDate');
        if (scheduledDate) {
            const today = new Date().toISOString().split('T')[0];
            scheduledDate.value = today;
        }
        
        // Set default time
        const scheduledTime = document.getElementById('scheduledTime');
        if (scheduledTime) {
            scheduledTime.value = '09:00';
        }
        
        // Show modal
        modal.style.display = 'flex';
        
        // Add fade-in animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        showToast(`Opening assignment modal for complaint ${complaintId}`, 'info');
    }
}

function closeAssignEngineerModal() {
    const modal = document.getElementById('assignEngineerModal');
    
    if (modal) {
        // Add fade-out animation
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
            
            // Reset form
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
            
            // Reset select elements
            const engineerSelect = document.getElementById('engineerSelect');
            const prioritySelect = document.getElementById('prioritySelect');
            const assignmentNotes = document.getElementById('assignmentNotes');
            
            if (engineerSelect) engineerSelect.value = '';
            if (prioritySelect) prioritySelect.value = 'medium';
            if (assignmentNotes) assignmentNotes.value = '';
        }, 300);
    }
}

function assignEngineerToComplaint() {
    const complaintId = document.getElementById('assignComplaintId')?.value;
    const engineerId = document.getElementById('engineerSelect')?.value;
    const priority = document.getElementById('prioritySelect')?.value;
    const scheduledDate = document.getElementById('scheduledDate')?.value;
    const scheduledTime = document.getElementById('scheduledTime')?.value;
    const notes = document.getElementById('assignmentNotes')?.value;
    
    // Validation
    if (!engineerId) {
        showToast('Please select an engineer', 'error');
        return;
    }
    
    if (!scheduledDate) {
        showToast('Please select a scheduled date', 'error');
        return;
    }
    
    if (!scheduledTime) {
        showToast('Please select a scheduled time', 'error');
        return;
    }
    
    // Simulate assignment process
    const assignmentData = {
        complaintId: complaintId,
        engineerId: engineerId,
        priority: priority,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        notes: notes,
        assignedAt: new Date().toISOString(),
        assignedBy: 'Admin User'
    };
    
    // Show loading state
    const assignButton = document.querySelector('#assignEngineerModal .btn-primary');
    if (assignButton) {
        const originalText = assignButton.textContent;
        assignButton.textContent = 'Assigning...';
        assignButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset button
            assignButton.textContent = originalText;
            assignButton.disabled = false;
            
            // Close modal
            closeAssignEngineerModal();
            
            // Show success message
            showToast(`Engineer successfully assigned to complaint ${complaintId}`, 'success');
            
            // Update UI to reflect assignment
            updateComplaintStatus(complaintId, 'assigned');
            
            console.log('Assignment Data:', assignmentData);
        }, 1500);
    }
}

function updateComplaintStatus(complaintId, newStatus) {
    // Find the complaint row in the table
    const complaintRows = document.querySelectorAll('.jobs-table tbody tr');
    
    complaintRows.forEach(row => {
        const idCell = row.querySelector('.job-id');
        if (idCell && idCell.textContent === complaintId) {
            // Update status or remove from unassigned list
            if (newStatus === 'assigned') {
                // In a real app, this would move to assigned complaints section
                // For demo, we'll just update the actions
                const actionsCell = row.querySelector('.action-buttons');
                if (actionsCell) {
                    actionsCell.innerHTML = `
                        <button class="action-btn" onclick="viewComplaintDetails('${complaintId}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <span class="badge badge-success">Assigned</span>
                    `;
                }
            }
        }
    });
}

// Complaint detail viewing functionality
function viewComplaintDetail(complaintId) {
    const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
    const complaint = complaints.find(c => c.complaintId === complaintId);

    const grid = document.getElementById("complaintDetailGrid");
    const container = document.getElementById("complaintDetailCard");

    if (!complaint) {
        if (grid) grid.innerHTML = `<p style="color:red;">Complaint not found.</p>`;
        if (container) container.style.display = "block";
        return;
    }

    function card(label, value) {
        return `
      <div class="detail-card">
        <strong>${label}</strong>
        <span>${value || '-'}</span>
      </div>
    `;
    }

    if (grid) {
        grid.innerHTML = `
        ${card("Reported on", complaint.reportedOn)}
        ${card("Product", complaint.productName)}
        ${card("Product type", complaint.productType)}
        ${card("Date of purchase", complaint.dateOfPurchase)}
        ${card("Complaint type", complaint.callType)}
        ${card("Issue type", complaint.symptoms)}
        ${card("Assigned to", complaint.assignedTo)}
        ${card("Status", complaint.status)}
        ${card("Assigned engineer", complaint.assignedEngineer)}
        ${card("Customer name", complaint.customerName)}
        ${card("Address", complaint.address)}
        ${card("Mobile", complaint.mobile)}
        ${card("Failure", complaint.failure)}
        ${card("Action date", complaint.actionDate)}
        ${card("Resolution", complaint.resolution)}
        ${card("Resolution details", complaint.resolutionDetails)}
        ${card("Doc1", complaint.doc1)}
        ${card("Doc2", complaint.doc2)}
        ${card("Doc3", complaint.doc3)}
        ${card("Serial no.", complaint.serial)}
      `;
    }

    // Move the complaintDetailCard under the right section
    const targetRow = document.querySelector(`[onclick="viewComplaintDetail('${complaintId}')"]`);
    if (targetRow && container) {
        const section = targetRow.closest("section");
        if (section) {
            section.appendChild(container); // Move the detail card into that section
        }
    }

    if (container) {
        container.style.display = "block";
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeComplaintDetail() {
    const container = document.getElementById("complaintDetailCard");
    const grid = document.getElementById("complaintDetailGrid");
    if (container) container.style.display = "none";
    if (grid) grid.innerHTML = ""; // Optional: Clear content
}

// Common action buttons functionality
function updateComplaintStatus(complaintId) {
    showToast(`Updating status for complaint ${complaintId}`, 'success');
    // Implement status update functionality
}

function updateRepairStatus(complaintId) {
    showToast(`Updating repair status for complaint ${complaintId}`, 'success');
    // Implement repair status update functionality
}

function downloadReport(complaintId) {
    showToast(`Downloading report for complaint ${complaintId}`, 'success');
    // Implement report download functionality
}

function reactivateComplaint(complaintId) {
    showToast(`Reactivating complaint ${complaintId}`, 'warning');
    // Implement complaint reactivation functionality
}

// Filter functions for different complaint sections
function filterUnassignedComplaints() {
    showToast('Filtering unassigned complaints...', 'success');
    // Implement filtering logic
}

function filterPendingComplaints() {
    showToast('Filtering pending complaints...', 'success');
    // Implement filtering logic
}

function filterRepairComplaints() {
    showToast('Filtering repair complaints...', 'success');
    // Implement filtering logic
}

function filterCompletedComplaints() {
    showToast('Filtering completed complaints...', 'success');
    // Implement filtering logic
}

function filterCancelledComplaints() {
    showToast('Filtering cancelled complaints...', 'success');
    // Implement filtering logic
}

// Select all checkboxes functionality
document.addEventListener('DOMContentLoaded', function() {
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

// Sample complaints data initialization
const sampleComplaints = [
    {
        complaintId: 'IN170625000001',
        reportedOn: '2025-06-17',
        productName: 'Wipro Smart LED',
        productType: 'Lighting',
        dateOfPurchase: '2025-05-30',
        callType: 'Installation',
        symptoms: 'Need setup help',
        assignedTo: 'Wipro Support',
        status: 'NEW',
        assignedEngineer: '',
        customerName: 'John Doe',
        address: '14B, MG Road, Delhi',
        mobile: '9876543210',
        failure: '',
        actionDate: '',
        resolution: '',
        resolutionDetails: '',
        doc1: '',
        doc2: '',
        doc3: '',
        serial: 'WIP123456'
    },
    {
        complaintId: 'RE170625000002',
        reportedOn: '2025-06-17',
        productName: 'Voltas AC 1.5 Ton',
        productType: 'Air Conditioner',
        dateOfPurchase: '2024-11-10',
        callType: 'Repair',
        symptoms: 'Not cooling',
        assignedTo: 'CoolingCare Services',
        status: 'Pending',
        assignedEngineer: 'Raj Verma',
        customerName: 'Jane Smith',
        address: 'Sector 21, Navi Mumbai',
        mobile: '9876543211',
        failure: 'Compressor failure',
        actionDate: '2025-06-19',
        resolution: 'Replaced compressor',
        resolutionDetails: 'New compressor installed under warranty',
        doc1: 'invoice.pdf',
        doc2: 'report.pdf',
        doc3: 'signature.png',
        serial: 'AC7890VS'
    },
    // Add more sample complaints as needed
];

// Initialize sample data if not exists
if (!localStorage.getItem("complaints")) {
    localStorage.setItem("complaints", JSON.stringify(sampleComplaints));
}

// Export functions if needed for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeComplaintManagement,
        setupUnassignedComplaintsSection,
        setupPendingComplaintsSection,
        setupRepairComplaintsSection,
        setupCompleteComplaintsSection,
        setupCancelledComplaintsSection
    };
}