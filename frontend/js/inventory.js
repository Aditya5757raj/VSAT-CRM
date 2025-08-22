// Inventory Management JavaScript
// Handles Create PO, PO Status, GRM, and Warehouse Dashboard functionality

// // Sample model-partcode mapping data
// const MODEL_PARTCODE_MAP = {
//   'AC-LG-001': 'PC-AC-LG-001',
//   'AC-LG-002': 'PC-AC-LG-002',
//   'AC-SAMSUNG-001': 'PC-AC-SAMSUNG-001',
//   'AC-SAMSUNG-002': 'PC-AC-SAMSUNG-002',
//   'TV-LG-001': 'PC-TV-LG-001',
//   'TV-LG-002': 'PC-TV-LG-002',
//   'TV-SAMSUNG-001': 'PC-TV-SAMSUNG-001',
//   'TV-SONY-001': 'PC-TV-SONY-001',
//   'REF-LG-001': 'PC-REF-LG-001',
//   'REF-SAMSUNG-001': 'PC-REF-SAMSUNG-001',
//   'WM-LG-001': 'PC-WM-LG-001',
//   'WM-SAMSUNG-001': 'PC-WM-SAMSUNG-001'
// };

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
  const modelDropdown = document.getElementById('modelDropdown');

  if (!createPOForm) return;

//   // Setup searchable dropdown for model numbers
//   if (modelNumberInput && modelDropdown) {
//     setupSearchableDropdown(modelNumberInput, modelDropdown);
//   }

  // Form submission
  createPOForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleCreatePO();
  });

  console.log('Create PO functionality initialized');
}

// // Setup searchable dropdown for model numbers
// function setupSearchableDropdown(input, dropdown) {
//   const modelNumbers = Object.keys(MODEL_PARTCODE_MAP);

//   input.addEventListener('input', function() {
//     const searchTerm = this.value.toLowerCase();
//     const filteredModels = modelNumbers.filter(model => 
//       model.toLowerCase().startsWith(searchTerm)
//     );

//     if (searchTerm && filteredModels.length > 0) {
//       showDropdown(dropdown, filteredModels, input);
//     } else {
//       hideDropdown(dropdown);
//     }
//   });

//   input.addEventListener('blur', function() {
//     // Delay hiding to allow click on dropdown items
//     setTimeout(() => hideDropdown(dropdown), 200);
//   });

//   input.addEventListener('focus', function() {
//     if (this.value) {
//       this.dispatchEvent(new Event('input'));
//     }
//   });
// }


// // Show dropdown with filtered items
// function showDropdown(dropdown, items, input) {
//   dropdown.innerHTML = '';
//   dropdown.style.display = 'block';

//   items.forEach(item => {
//     const div = document.createElement('div');
//     div.className = 'dropdown-item';
//     div.textContent = item;
//     div.addEventListener('click', function() {
//       input.value = item;
//       document.getElementById('poPartCode').value = MODEL_PARTCODE_MAP[item] || '';
//       hideDropdown(dropdown);
//     });
//     dropdown.appendChild(div);
//   });
// }

// function hideDropdown(dropdown) {
//   dropdown.style.display = 'none';
// }

function handleCreatePO() {
  const modelNumber = document.getElementById('poModelNumber').value.trim();
  const partCode = document.getElementById('poPartCode').value.trim();
  const complaintId = document.getElementById('poComplaintId').value.trim();
  const requestedQuantity = parseInt(document.getElementById('poRequestedQuantity').value);

  // Validation
  if (!modelNumber || !partCode || !complaintId || !requestedQuantity) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  if (!MODEL_PARTCODE_MAP[modelNumber]) {
    showToast('Invalid model number selected', 'error');
    return;
  }

  // Create PO object
  const po = {
    serial_number: getNextSerialNumber(),
    model_number: modelNumber,
    part_code: partCode,
    complaint_id: complaintId,
    requested_quantity: requestedQuantity,
    po_number: generatePONumber(),
    status: 'pending',
    service_center_id: 'SC001', // Dummy placeholder
    service_center_name: 'Default Service Center',
    location: 'Default Location',
    created_date: new Date().toISOString(),
    docket_number: '',
    docket_date: '',
    courier_name: '',
    received_status: '',
    short_quantity: 0,
    fulfilled_quantity: 0
  };

  // Save to localStorage
  savePOToStorage(po);

  showToast('Purchase Order created successfully!', 'success');
  resetPOForm();
  
  // Refresh PO Status if currently viewing
  if (document.getElementById('po-status').classList.contains('active')) {
    loadPOStatusData();
  }
}

function getNextSerialNumber() {
  const pos = getPOsFromStorage();
  return pos.length > 0 ? Math.max(...pos.map(po => po.serial_number)) + 1 : 1;
}

function generatePONumber() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  const datePrefix = `PO${year}${month}${day}`;
  
  // Get today's POs to determine sequence
  const pos = getPOsFromStorage();
  const todayPOs = pos.filter(po => po.po_number.startsWith(datePrefix));
  const sequence = (todayPOs.length + 1).toString().padStart(5, '0');
  
  return `${datePrefix}${sequence}`;
}

function resetPOForm() {
  document.getElementById('createPOForm').reset();
  document.getElementById('poPartCode').value = '';
  hideDropdown(document.getElementById('modelDropdown'));
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
      const status = this.dataset.status;
      loadPOStatusData(status);
    });
  });

  console.log('PO Status functionality initialized');
}

function loadPOStatusData(status = 'pending') {
  const tableBody = document.getElementById('poStatusTableBody');
  if (!tableBody) return;

  const pos = getPOsFromStorage();
  const filteredPOs = pos.filter(po => po.status === status);

  tableBody.innerHTML = '';

  if (filteredPOs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">
          <i class="fas fa-inbox" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
          No ${status} purchase orders found
        </td>
      </tr>
    `;
    return;
  }

  filteredPOs.forEach(po => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="job-id">${po.po_number}</span></td>
      <td>${po.model_number}</td>
      <td>${po.part_code}</td>
      <td>${po.complaint_id}</td>
      <td>${po.requested_quantity}</td>
      <td><span class="badge badge-${getStatusBadgeClass(po.status)}">${po.status.charAt(0).toUpperCase() + po.status.slice(1)}</span></td>
      <td>${formatDate(po.created_date)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="viewPODetails('${po.po_number}')" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          ${po.status === 'pending' ? `
            <button class="action-btn" onclick="editPOStatus('${po.po_number}')" title="Edit Status">
              <i class="fas fa-edit"></i>
            </button>
          ` : ''}
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function getStatusBadgeClass(status) {
  const statusClasses = {
    'pending': 'warning',
    'dispatched': 'info',
    'delivered': 'success',
    'cancelled': 'danger'
  };
  return statusClasses[status] || 'secondary';
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

function loadGRMData() {
  const tableBody = document.getElementById('grmTableBody');
  if (!tableBody) return;

  const pos = getPOsFromStorage();
  const dispatchedPOs = pos.filter(po => po.status === 'dispatched');

  tableBody.innerHTML = '';

  if (dispatchedPOs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">
          <i class="fas fa-shipping-fast" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
          No dispatched orders available for receipt
        </td>
      </tr>
    `;
    return;
  }

  dispatchedPOs.forEach(po => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="job-id">${po.po_number}</span></td>
      <td>${po.model_number}</td>
      <td>${po.part_code}</td>
      <td>${po.requested_quantity}</td>
      <td>${po.docket_number || '-'}</td>
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
}

// =============================
// Warehouse Dashboard Functionality
// =============================
function initWarehouseDashboard() {
  console.log('Warehouse Dashboard functionality initialized');
}

function loadWarehouseData() {
  const tableBody = document.getElementById('warehouseTableBody');
  if (!tableBody) return;

  const pos = getPOsFromStorage();
  
  // Update stats
  updateWarehouseStats(pos);

  tableBody.innerHTML = '';

  if (pos.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">
          <i class="fas fa-boxes" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
          No purchase orders found
        </td>
      </tr>
    `;
    return;
  }

  pos.forEach(po => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="job-id">${po.po_number}</span></td>
      <td>${po.model_number}</td>
      <td>${po.complaint_id}</td>
      <td>${po.requested_quantity}</td>
      <td><span class="badge badge-${getStatusBadgeClass(po.status)}">${po.status.charAt(0).toUpperCase() + po.status.slice(1)}</span></td>
      <td>${po.service_center_name}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="viewPODetails('${po.po_number}')" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          ${po.status === 'pending' ? `
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
}

function updateWarehouseStats(pos) {
  const pendingCount = pos.filter(po => po.status === 'pending').length;
  const dispatchedCount = pos.filter(po => po.status === 'dispatched').length;
  const deliveredCount = pos.filter(po => po.status === 'delivered').length;

  const pendingEl = document.getElementById('whPendingCount');
  const dispatchedEl = document.getElementById('whDispatchedCount');
  const deliveredEl = document.getElementById('whDeliveredCount');

  if (pendingEl) pendingEl.textContent = pendingCount;
  if (dispatchedEl) dispatchedEl.textContent = dispatchedCount;
  if (deliveredEl) deliveredEl.textContent = deliveredCount;
}

// =============================
// Modal Functions
// =============================
function viewPODetails(poNumber) {
  const pos = getPOsFromStorage();
  const po = pos.find(p => p.po_number === poNumber);
  
  if (!po) {
    showToast('Purchase order not found', 'error');
    return;
  }

  // Populate modal fields
  document.getElementById('detailPONumber').textContent = po.po_number;
  document.getElementById('detailModelNumber').textContent = po.model_number;
  document.getElementById('detailPartCode').textContent = po.part_code;
  document.getElementById('detailComplaintId').textContent = po.complaint_id;
  document.getElementById('detailRequestedQuantity').textContent = po.requested_quantity;
  document.getElementById('detailStatus').textContent = po.status.charAt(0).toUpperCase() + po.status.slice(1);
  document.getElementById('detailStatus').className = `badge badge-${getStatusBadgeClass(po.status)}`;
  document.getElementById('detailCreatedDate').textContent = formatDate(po.created_date);
  document.getElementById('detailServiceCenter').textContent = po.service_center_name;

  // Show/hide additional details based on status
  const docketSection = document.getElementById('docketDetailsSection');
  const courierSection = document.getElementById('courierDetailsSection');
  
  if (po.status === 'dispatched' || po.status === 'delivered') {
    docketSection.style.display = 'block';
    courierSection.style.display = 'block';
    document.getElementById('detailDocketNumber').textContent = po.docket_number || '-';
    document.getElementById('detailCourier').textContent = po.courier_name || '-';
  } else {
    docketSection.style.display = 'none';
    courierSection.style.display = 'none';
  }

  // Show modal
  document.getElementById('poDetailsModal').style.display = 'flex';
}

function closePODetailsModal() {
  document.getElementById('poDetailsModal').style.display = 'none';
}

function editGRMStatus(poNumber) {
  const pos = getPOsFromStorage();
  const po = pos.find(p => p.po_number === poNumber);
  
  if (!po) {
    showToast('Purchase order not found', 'error');
    return;
  }

  // Populate GRM edit modal
  document.getElementById('grmEditPONumber').value = po.po_number;
  document.getElementById('grmEditPODisplay').value = po.po_number;
  document.getElementById('grmEditModel').value = po.model_number;
  document.getElementById('grmEditRequestedQty').value = po.requested_quantity;
  document.getElementById('grmReceivedStatus').value = po.received_status || '';
  document.getElementById('grmShortQuantity').value = po.short_quantity || '';

  // Show/hide short quantity field
  const shortQuantityGroup = document.getElementById('shortQuantityGroup');
  if (po.received_status === 'received_short') {
    shortQuantityGroup.style.display = 'block';
  } else {
    shortQuantityGroup.style.display = 'none';
  }

  // Show modal
  document.getElementById('grmEditModal').style.display = 'flex';
}

function closeGRMEditModal() {
  document.getElementById('grmEditModal').style.display = 'none';
}

function saveGRMUpdate() {
  const poNumber = document.getElementById('grmEditPONumber').value;
  const receivedStatus = document.getElementById('grmReceivedStatus').value;
  const shortQuantity = parseInt(document.getElementById('grmShortQuantity').value) || 0;

  if (!receivedStatus) {
    showToast('Please select received status', 'error');
    return;
  }

  if (receivedStatus === 'received_short' && shortQuantity <= 0) {
    showToast('Please enter valid short quantity', 'error');
    return;
  }

  // Update PO in storage
  const pos = getPOsFromStorage();
  const poIndex = pos.findIndex(p => p.po_number === poNumber);
  
  if (poIndex !== -1) {
    pos[poIndex].received_status = receivedStatus;
    pos[poIndex].short_quantity = shortQuantity;
    
    // Update status based on received status
    if (receivedStatus === 'received_ok') {
      pos[poIndex].status = 'delivered';
    }
    
    savePOsToStorage(pos);
    showToast('Goods receipt updated successfully', 'success');
    closeGRMEditModal();
    loadGRMData();
  }
}

function editWarehousePO(poNumber) {
  const pos = getPOsFromStorage();
  const po = pos.find(p => p.po_number === poNumber);
  
  if (!po) {
    showToast('Purchase order not found', 'error');
    return;
  }

  // Populate warehouse edit modal
  document.getElementById('whEditPONumber').value = po.po_number;
  document.getElementById('whEditPODisplay').value = po.po_number;
  document.getElementById('whEditModel').value = po.model_number;
  document.getElementById('whEditRequestedQty').value = po.requested_quantity;
  document.getElementById('whFulfilledQuantity').value = po.fulfilled_quantity || '';
  document.getElementById('whFulfilledQuantity').max = po.requested_quantity;
  document.getElementById('whDocketNumber').value = po.docket_number || '';
  document.getElementById('whDocketDate').value = po.docket_date || '';
  document.getElementById('whCourierName').value = po.courier_name || '';

  // Show modal
  document.getElementById('warehouseEditModal').style.display = 'flex';
}

function closeWarehouseEditModal() {
  document.getElementById('warehouseEditModal').style.display = 'none';
}

function saveWarehouseUpdate() {
  const poNumber = document.getElementById('whEditPONumber').value;
  const fulfilledQuantity = parseInt(document.getElementById('whFulfilledQuantity').value);
  const requestedQuantity = parseInt(document.getElementById('whEditRequestedQty').value);
  const docketNumber = document.getElementById('whDocketNumber').value.trim();
  const docketDate = document.getElementById('whDocketDate').value;
  const courierName = document.getElementById('whCourierName').value;

  // Validation
  if (!fulfilledQuantity || !docketNumber || !docketDate || !courierName) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  if (fulfilledQuantity > requestedQuantity) {
    showToast('Fulfilled quantity cannot exceed requested quantity', 'error');
    return;
  }

  // Update PO in storage
  const pos = getPOsFromStorage();
  const poIndex = pos.findIndex(p => p.po_number === poNumber);
  
  if (poIndex !== -1) {
    pos[poIndex].fulfilled_quantity = fulfilledQuantity;
    pos[poIndex].docket_number = docketNumber;
    pos[poIndex].docket_date = docketDate;
    pos[poIndex].courier_name = courierName;
    pos[poIndex].status = 'dispatched';
    
    savePOsToStorage(pos);
    showToast('Purchase order updated and dispatched successfully', 'success');
    closeWarehouseEditModal();
    loadWarehouseData();
  }
}

function printPO(poNumber) {
  const pos = getPOsFromStorage();
  const po = pos.find(p => p.po_number === poNumber);
  
  if (!po) {
    showToast('Purchase order not found', 'error');
    return;
  }

  // Create printable content
  const printContent = `
    <html>
      <head>
        <title>Purchase Order - ${po.po_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          .details table { width: 100%; border-collapse: collapse; }
          .details th, .details td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .details th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Purchase Order</h1>
          <h2>${po.po_number}</h2>
        </div>
        <div class="details">
          <table>
            <tr><th>Model Number</th><td>${po.model_number}</td></tr>
            <tr><th>Part Code</th><td>${po.part_code}</td></tr>
            <tr><th>Complaint ID</th><td>${po.complaint_id}</td></tr>
            <tr><th>Requested Quantity</th><td>${po.requested_quantity}</td></tr>
            <tr><th>Status</th><td>${po.status.charAt(0).toUpperCase() + po.status.slice(1)}</td></tr>
            <tr><th>Service Center</th><td>${po.service_center_name}</td></tr>
            <tr><th>Created Date</th><td>${formatDate(po.created_date)}</td></tr>
            ${po.docket_number ? `<tr><th>Docket Number</th><td>${po.docket_number}</td></tr>` : ''}
            ${po.courier_name ? `<tr><th>Courier</th><td>${po.courier_name}</td></tr>` : ''}
          </table>
        </div>
      </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
}

// =============================
// Storage Functions
// =============================
function getPOsFromStorage() {
  const pos = localStorage.getItem('purchaseOrders');
  return pos ? JSON.parse(pos) : [];
}

function savePOToStorage(po) {
  const pos = getPOsFromStorage();
  pos.push(po);
  savePOsToStorage(pos);
}

function savePOsToStorage(pos) {
  localStorage.setItem('purchaseOrders', JSON.stringify(pos));
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
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function refreshWarehouseData() {
  loadWarehouseData();
  showToast('Warehouse data refreshed', 'success');
}

// Global functions for HTML onclick handlers
window.viewPODetails = viewPODetails;
window.closePODetailsModal = closePODetailsModal;
window.editGRMStatus = editGRMStatus;
window.closeGRMEditModal = closeGRMEditModal;
window.saveGRMUpdate = saveGRMUpdate;
window.editWarehousePO = editWarehousePO;
window.closeWarehouseEditModal = closeWarehouseEditModal;
window.saveWarehouseUpdate = saveWarehouseUpdate;
window.printPO = printPO;
window.resetPOForm = resetPOForm;
window.refreshWarehouseData = refreshWarehouseData;

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

// Part Code Selection
document.addEventListener('DOMContentLoaded', function () {
    const poModelNumberSelect = document.getElementById("poModelNumber");
    if (poModelNumberSelect) {
        poModelNumberSelect.addEventListener("change", function () {
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
                    "Wipro Garnet 10W Smart Module COB (DS51000)":  [
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
                    // modelNoSelect.appendChild(option.cloneNode(true));
                });
            } else {
                showToast("No part found for selected type", "error");
            }
        });
    }

});
