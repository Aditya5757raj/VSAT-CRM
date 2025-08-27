// ==== Get DOM Elements ====
const warehouseForm = document.getElementById('addWarehouseForm');
const resetWarehouseBtn = document.querySelector('#addWarehouseForm .btn-secondary');
const submitWarehouseBtn = document.querySelector('#addWarehouseForm .btn-primary');

const warehouseNameInput = document.getElementById('warehouse_name');
const warehouseEmailInput = document.getElementById('warehouse_email');
const warehousePhoneInput = document.getElementById('warehouse_contact');
const warehousePincodesInput = document.getElementById('warehouse_pincodes');

// ==== Reset Form ====
function resetWarehouseForm() {
    warehouseForm.reset(); // <-- Use built-in reset
    console.log('Warehouse form reset successfully');
}

// ==== Submit Form ====
warehouseForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    // Get form values
    const fullName = warehouseNameInput.value.trim();
    const email = warehouseEmailInput.value.trim();
    const phone = warehousePhoneInput.value.trim();
    const pincodes = warehousePincodesInput.value.trim();

    // Basic Validation
    if (!fullName || !email || !phone || !pincodes) {
        alert('⚠ Please fill all required fields.');
        return;
    }

    // Phone validation (10 digits, starting with 6-9)
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone)) {
        alert('⚠ Enter a valid 10-digit phone number starting with 6-9.');
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('⚠ Enter a valid email address.');
        return;
    }

    // Pincode validation (comma separated digits only)
    const pincodeArray = pincodes.split(',').map(p => p.trim());
    if (!pincodeArray.every(p => /^[0-9]+$/.test(p))) {
        alert('⚠ Enter valid numeric pincodes (comma separated).');
        return;
    }

    // Create data object
    const warehouseData = {
        fullName: fullName,
        email: email,
        phone: phone,
        pincodes: pincodeArray
    };

    console.log('Submitting Warehouse User:', warehouseData);

    // Show loading state
    const originalText = submitWarehouseBtn.textContent;
    submitWarehouseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitWarehouseBtn.disabled = true;

    fetch(`${API_URL}/admin/addWarehouseUser`, {   // ✅ Fixed backticks
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`   // ✅ Fixed backticks
        },
        body: JSON.stringify(warehouseData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to register warehouse user. Server responded with ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            showToast('✅ Warehouse User registered successfully! 🎉', 'success');
            resetWarehouseForm();       // reset inputs
            console.log('Server Response:', data);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(`❌ Error: ${error.message}`, 'error');  // ✅ Fixed quotes
        })
        .finally(() => {
            // Reset button state
            submitWarehouseBtn.innerHTML = originalText;
            submitWarehouseBtn.disabled = false;

            resetWarehouseForm();
    localStorage.removeItem("warehouseFormData"); // clear saved data if any
        });
});

// ==== Cancel Button ====
resetWarehouseBtn.addEventListener('click', function () {
    resetWarehouseForm();
});

// ==== Utility function to get cookie ====
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
