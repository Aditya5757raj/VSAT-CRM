// Inventory Management JavaScript // Handles Create PO, PO Status, GRM, and Warehouse Dashboard functionality
// Initialize inventory module
document.addEventListener('DOMContentLoaded', function() {
    initializeInventoryModule();
});

function initializeInventoryModule() {
    console.log('Initializing Inventory Module');
    // Initialize all inventory sections
    initCreatePO();
    initPOStatus();
    initGRM();
    initWarehouseDashboard();

    // Set up navigation listeners
    setupInventoryNavigation();
}

// =============================
// Create PO Functionality
// =============================
function initCreatePO() {
    const createPOForm = document.getElementById('createPOForm');
    const modelNumberInput = document.getElementById('poModelNumber');
    const partCodeInput = document.getElementById('poPartCode');

    if (!createPOForm) return;

    // Form submission
    createPOForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleCreatePO();
    });

    console.log('Create PO functionality initialized');
}

async function handleCreatePO() {
    const modelNumber = document.getElementById('poModelNumber').value.trim();
    const partCode = document.getElementById('poPartCode').value.trim();
    const complaintId = document.getElementById('poComplaintId').value.trim();
    const requestedQuantity = parseInt(document.getElementById('poRequestedQuantity').value);

    // Validation
    if (!modelNumber || !partCode || !complaintId || !requestedQuantity) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    if (requestedQuantity <= 0) {
        showToast('Requested quantity must be greater than 0', 'error');
        return;
    }

    // Show loading state
    const submitBtn = createPOForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = ' Creating PO...';
    submitBtn.disabled = true;

    try {
        const token = getCookie('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await fetch(`${API_URL}/warehouse/addparts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model_number: modelNumber,
                part_code: partCode,
                requested_quantity: requestedQuantity,
                complaint_id: complaintId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create purchase order');
        }

        const result = await response.json();
        showToast('Purchase Order created successfully!', 'success');
        resetPOForm();

        // Refresh PO Status if currently viewing
        if (document.getElementById('po-status').classList.contains('active')) {
            loadPOStatusData();
        }

    } catch (error) {
        console.error('Error creating PO:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function resetPOForm() {
    const form = document.getElementById('createPOForm');
    if (form) {
        form.reset();
    }
}
// =============================
// PO Status Functionality
// =============================
function initPOStatus() {
    const tabButtons = document.querySelectorAll('#po-status .tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Load data for selected status
            const status = this.dataset.status || this.textContent.toLowerCase();
            loadPOStatusData(status);
        });
    });

    // Set default active tab to "Pending"
    const defaultTab = document.querySelector('#po-status .tab-btn[data-status="pending"]') ||
        document.querySelector('#po-status .tab-btn');
    if (defaultTab) {
        defaultTab.classList.add('active');
    }
    console.log('PO Status functionality initialized');
}

async function loadPOStatusData(status = 'pending') {
    const tableBody = document.getElementById('poStatusTableBody');
    if (!tableBody) return;

    // Show loading state
    showPOStatusLoading(true);

    try {
        const token = getCookie('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        console.log(`Loading PO data for status: ${status}`);
        const response = await fetch(`${API_URL}/warehouse/getparts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch purchase orders');
        }
        const pos = await response.json();
        console.log('Fetched POs:', pos);

        // Filter POs by status
        const filteredPOs = Array.isArray(pos) ? pos.filter(po => {
            const poStatus = (po.status || 'pending').toLowerCase();
            return poStatus === status.toLowerCase();
        }) : [];

        // Clear existing rows
        tableBody.innerHTML = '';
        if (filteredPOs.length === 0) {
            displayEmptyPOStatusTable(status);
            return;
        }

        // Display POs in table
        filteredPOs.forEach(po => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="job-id">${po.po_number || 'N/A'}</span></td>
                <td>${po.model_number || 'N/A'}</td>
                <td>${po.part_code || 'N/A'}</td>
                <td>${po.complaint_id || 'N/A'}</td>
                <td>${po.requested_quantity || 0}</td>
                <td><span class="badge badge-${getStatusBadgeClass(po.status)}">${(po.status || 'pending').charAt(0).toUpperCase() + (po.status || 'pending').slice(1)}</span></td>
                <td>${formatDate(po.createdAt || po.created_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewPODetails('${po.po_number}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${po.status === 'pending' || po.status === 'Pending' ? `
                            <button class="action-btn" onclick="editPOStatus('${po.po_number}')" title="Edit Status">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading PO status data:', error);
        showToast(`Error loading PO data: ${error.message}`, 'error');
        displayEmptyPOStatusTable('error');
    } finally {
        showPOStatusLoading(false);
    }
}

function displayEmptyPOStatusTable(status) {
    const tableBody = document.getElementById('poStatusTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fas fa-clipboard-list" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px; display: block;"></i>
            <h4 style="color: #64748b; margin-bottom: 8px;">No ${status === 'error' ? '' : status.charAt(0).toUpperCase() + status.slice(1)} Purchase Orders Found</h4>
            <p style="color: #9ca3af;">${status === 'error' ? 'Error loading purchase orders' : `No ${status} purchase orders match the current criteria.`}</p>
        </td>
    `;
    tableBody.appendChild(emptyRow);
}

function showPOStatusLoading(show) {
    const tableBody = document.getElementById('poStatusTableBody');
    if (!tableBody) return;
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2563eb; margin-bottom: 8px; display: block;"></i>
                    <p style="color: #64748b;">Loading purchase orders...</p>
                </td>
            </tr>
        `;
    }
}

// =============================
// GRM Functionality
// =============================
function initGRM() {
    console.log('GRM functionality initialized');
    // Setup received status change handler
    const receivedStatusSelect = document.getElementById('grmReceivedStatus');
    if (receivedStatusSelect) {
        receivedStatusSelect.addEventListener('change', function() {
            const shortQuantityGroup = document.getElementById('shortQuantityGroup');
            if (this.value === 'received_short') {
                shortQuantityGroup.style.display = 'block';
                document.getElementById('grmShortQuantity').required = true;
            } else {
                shortQuantityGroup.style.display = 'none';
                document.getElementById('grmShortQuantity').required = false;
                document.getElementById('grmShortQuantity').value = '';
            }
        });
    }
}

async function loadGRMData() {
    const tableBody = document.getElementById('grmTableBody');
    if (!tableBody) return;

    // Show loading state
    showGRMLoading(true);

    try {
        const token = getCookie('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        console.log('Loading GRM data for dispatched orders');
        const response = await fetch(`${API_URL}/warehouse/getparts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch purchase orders');
        }
        const pos = await response.json();
        console.log('Fetched POs for GRM:', pos);

        // Filter for dispatched orders only
        const dispatchedPOs = Array.isArray(pos) ? pos.filter(po => {
            const poStatus = (po.status || '').toLowerCase();
            return poStatus === 'dispatched';
        }) : [];

        // Clear existing rows
        tableBody.innerHTML = '';
        if (dispatchedPOs.length === 0) {
            displayEmptyGRMTable();
            return;
        }

        // Display dispatched POs in table
        dispatchedPOs.forEach(po => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="job-id">${po.po_number || 'N/A'}</span></td>
                <td>${po.model_number || 'N/A'}</td>
                <td>${po.part_code || 'N/A'}</td>
                <td>${po.requested_quantity || 0}</td>
                <td>${po.docket_name || po.docket_number || '-'}</td>
                <td>${po.courier_name || '-'}</td>
                <td><span class="badge badge-info">Dispatched</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewPODetails('${po.po_number}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="editGRMStatus('${po.po_number}')" title="Update Receipt">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading GRM data:', error);
        showToast(`Error loading GRM data: ${error.message}`, 'error');
        displayEmptyGRMTable('error');
    } finally {
        showGRMLoading(false);
    }
}

function displayEmptyGRMTable(isError = false) {
    const tableBody = document.getElementById('grmTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fas fa-shipping-fast" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px; display: block;"></i>
            <h4 style="color: #64748b; margin-bottom: 8px;">${isError ? 'Error Loading Data' : 'No Dispatched Orders Available'}</h4>
            <p style="color: #9ca3af;">${isError ? 'Failed to load dispatched orders for receipt' : 'No dispatched orders available for goods receipt'}</p>
        </td>
    `;
    tableBody.appendChild(emptyRow);
}

function showGRMLoading(show) {
    const tableBody = document.getElementById('grmTableBody');
    if (!tableBody) return;
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2563eb; margin-bottom: 8px; display: block;"></i>
                    <p style="color: #64748b;">Loading dispatched orders...</p>
                </td>
            </tr>
        `;
    }
}

// =============================
// Warehouse Dashboard Functionality
// =============================
function initWarehouseDashboard() {
    console.log('Warehouse Dashboard functionality initialized');
}

async function loadWarehouseData() {
    const tableBody = document.getElementById('warehouseTableBody');
    if (!tableBody) return;

    // Show loading state
    showWarehouseLoading(true);

    try {
        const token = getCookie('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        console.log('Loading warehouse data');
        const response = await fetch(`${API_URL}/warehouse/getparts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch purchase orders');
        }
        const pos = await response.json();
        console.log('Fetched POs for warehouse:', pos);

        // Update stats
        updateWarehouseStats(pos);

        // Clear existing rows
        tableBody.innerHTML = '';
        if (!Array.isArray(pos) || pos.length === 0) {
            displayEmptyWarehouseTable();
            return;
        }

        // Display all POs in table
        pos.forEach(po => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="job-id">${po.po_number || 'N/A'}</span></td>
                <td>${po.model_number || 'N/A'}</td>
                <td>${po.complaint_id || 'N/A'}</td>
                <td>${po.requested_quantity || 0}</td>
                <td><span class="badge badge-${getStatusBadgeClass(po.status)}">${(po.status || 'pending').charAt(0).toUpperCase() + (po.status || 'pending').slice(1)}</span></td>
                <td>${po.service_center_name || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewPODetails('${po.po_number}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${(po.status === 'pending' || po.status === 'Pending') ? `
                            <button class="action-btn" onclick="editWarehousePO('${po.po_number}')" title="Edit & Dispatch">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn" onclick="printPO('${po.po_number}')" title="Print PO">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading warehouse data:', error);
        showToast(`Error loading warehouse data: ${error.message}`, 'error');
        displayEmptyWarehouseTable('error');
    } finally {
        showWarehouseLoading(false);
    }
}

function displayEmptyWarehouseTable(isError = false) {
    const tableBody = document.getElementById('warehouseTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fas fa-boxes" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px; display: block;"></i>
            <h4 style="color: #64748b; margin-bottom: 8px;">${isError ? 'Error Loading Data' : 'No Purchase Orders Found'}</h4>
            <p style="color: #9ca3af;">${isError ? 'Failed to load purchase orders' : 'No purchase orders available in the warehouse'}</p>
        </td>
    `;
    tableBody.appendChild(emptyRow);
}

function showWarehouseLoading(show) {
    const tableBody = document.getElementById('warehouseTableBody');
    if (!tableBody) return;
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2563eb; margin-bottom: 8px; display: block;"></i>
                    <p style="color: #64748b;">Loading warehouse data...</p>
                </td>
            </tr>
        `;
    }
}

function updateWarehouseStats(pos) {
    if (!Array.isArray(pos)) return;

    const pendingCount = pos.filter(po => (po.status || 'pending').toLowerCase() === 'pending').length;
    const dispatchedCount = pos.filter(po => (po.status || '').toLowerCase() === 'dispatched').length;
    const deliveredCount = pos.filter(po => (po.status || '').toLowerCase() === 'delivered').length;

    const pendingEl = document.getElementById('whPendingCount');
    const dispatchedEl = document.getElementById('whDispatchedCount');
    const deliveredEl = document.getElementById('whDeliveredCount');

    if (pendingEl) pendingEl.textContent = pendingCount;
    if (dispatchedEl) dispatchedEl.textContent = dispatchedCount;
    if (deliveredEl) deliveredEl.textContent = deliveredCount;
}

// =============================
// Modal Functions (Placeholder implementations)
// =============================
function viewPODetails(poNumber) {
    console.log('Viewing PO details for:', poNumber);
    showToast(`Viewing details for PO: ${poNumber}`, 'info');
    // TODO: Implement modal with PO details
}

function editPOStatus(poNumber) {
    console.log('Editing PO status for:', poNumber);
    showToast(`Editing status for PO: ${poNumber}`, 'info');
    // TODO: Implement edit modal
}

function editGRMStatus(poNumber) {
    console.log('Editing GRM status for:', poNumber);
    showToast(`Updating receipt for PO: ${poNumber}`, 'info');
    // TODO: Implement GRM edit modal
}

function editWarehousePO(poNumber) {
    console.log('Editing warehouse PO for:', poNumber);
    showToast(`Editing warehouse PO: ${poNumber}`, 'info');
    // TODO: Implement warehouse edit modal
}

function printPO(poNumber) {
    console.log('Printing PO:', poNumber);
    showToast(`Printing PO: ${poNumber}`, 'info');
    // TODO: Implement print functionality
}

// =============================
// Navigation Setup
// =============================
function setupInventoryNavigation() {
    // Listen for section changes to load appropriate data
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-section="po-status"]')) {
            setTimeout(() => loadPOStatusData(), 100);
        } else if (e.target.matches('[data-section="grm"]')) {
            setTimeout(() => loadGRMData(), 100);
        } else if (e.target.matches('[data-section="warehouse-dashboard"]')) {
            setTimeout(() => loadWarehouseData(), 100);
        }
    });
}

// =============================
// Utility Functions
// =============================
function getStatusBadgeClass(status) {
    const statusClasses = {
        'pending': 'warning',
        'dispatched': 'info',
        'delivered': 'success',
        'cancelled': 'danger',
        'completed': 'success'
    };
    return statusClasses[(status || 'pending').toLowerCase()] || 'secondary';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
}

function refreshWarehouseData() {
    loadWarehouseData();
    showToast('Warehouse data refreshed', 'success');
}

// Utility function to get cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// Utility function for toast notifications
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
    closeBtn.innerHTML = "×";
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


// Global functions for HTML onclick handlers
window.viewPODetails = viewPODetails;
window.editPOStatus = editPOStatus;
window.editGRMStatus = editGRMStatus;
window.editWarehousePO = editWarehousePO;
window.printPO = printPO;
window.resetPOForm = resetPOForm;
window.refreshWarehouseData = refreshWarehouseData;
window.loadPOStatusData = loadPOStatusData;
window.loadGRMData = loadGRMData;
window.loadWarehouseData = loadWarehouseData;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeInventoryModule,
        initCreatePO,
        initPOStatus,
        initGRM,
        initWarehouseDashboard
    };
}

// Part Code Selection (existing functionality)
document.addEventListener('DOMContentLoaded', function() {
    const poModelNumberSelect = document.getElementById("poModelNumber");
    if (poModelNumberSelect) {
        poModelNumberSelect.addEventListener("change", function() {
            const poModelNumber = this.value;
            const poPartCodeSelect = document.getElementById("poPartCode");

            // Reset part code dropdown
            poPartCodeSelect.innerHTML = '<option value="">-- Select Part Code --</option>';

            const MODEL_PARTCODE_MAP = {
                "Wipro Garnet LED Smart Gateway (SG2000)": [
                    "PART-1",
                    "PART-2",
                ],
                "Wipro Next Smart IR Blaster (DSIR100)": [
                    "PART-3",
                    "PART-4",
                    "PART-5"
                ],
                "Wipro Smart Switch 2N Module (DSP2200)": [
                    "PART-6",
                    "PART-7"
                ],
                "Wipro Smart Switch 4N Module (DSP2400)": [
                    "PART-8"
                ],
                "Wipro Smart Switch 4N FN Module (DSP410)": [
                    "PART-9",
                    "PART-10",
                    "PART-11",
                    "PART-12"
                ],
                "Wipro Garnet 6W Smart Trimless COB (DS50610)": [
                    "PART-13",
                ],
                "Wipro Garnet 10W Smart Module COB (DS51000)": [
                    "PART-14",
                    "PART-15"
                ],
                "Wipro Garnet 10W Smart Trimless COB (DS51010)": [
                    "PART-16",
                    "PART-17"
                ],
                "Wipro Garnet 15W Smart Module COB (DS51500)": [
                    "PART-18"
                ],
                "Wipro Garnet 15W Smart Trimless COB (DS51510)": [
                    "PART-19"
                ],
                "WIPRO-10W Smart Trimless COB Black (DS51011)": [
                    "PART-20"
                ],
                "WIPRO-Garnet 6W Smart Panel CCT (DS70600)": [
                    "PART-21"
                ],
                "WIPRO-Garnet 10W Smart Panel CCT (DS71000)": [
                    "PART-22"
                ],
                "WIPRO-Garnet 15W Smart Panel CCT (DS71500)": [
                    "PART-23"
                ],
                "Wipro Garnet 40W Smart WiFi CCT RGB Strip (DS44000)": [
                    "PART-24",
                    "PART-25"
                ],
                "Wipro Garnet 40W Smart CCT RGB LED Strip (DS45000)": [
                    "PART-26",
                    "PART-27"
                ],
                "Wipro Garnet 40W Smart CCT RGB LED Strip New (SS01000)": [
                    "PART-28",
                    "PART-29",
                    "PART-30"
                ],
                "Wipro 3MP WiFi Smart Camera (SC020203)": [
                    "PART-31",
                    "PART-32"
                ],
                "Wipro 3MP WiFi Smart Camera. Alexa (SC020303)": [
                    "PART-33",
                    "PART-34"
                ],
                "Wipro Smart Doorbell 1080P (SD02010)": [
                    "PART-35"
                ],
                "Wipro Smart Wifi AC Doorbell 2MP (SD03000)": [
                    "PART-36",
                    "PART-37"
                ],
                "Native Lock Pro": [
                    "PART-38"
                ],
                "Native Lock S": [
                    "PART-39",
                    "PART-40"
                ],
            };

            if (MODEL_PARTCODE_MAP[poModelNumber]) {
                MODEL_PARTCODE_MAP[poModelNumber].forEach(name => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.textContent = name;
                    poPartCodeSelect.appendChild(option);
                });
            } else {
                showToast("No part found for selected type", "error");
            }
        });
    }
});