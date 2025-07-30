
// ==== Get DOM Elements ====
const ccAgentForm = document.getElementById('addccagentForm');
const resetBtn = document.querySelector('#addccagentForm .btn-outline');
const submitBtn = document.querySelector('#addccagentForm .btn-primary');

const fullNameInput = document.getElementById('cc_fullname');
const emailInput = document.getElementById('cc_Email');
const phoneInput = document.getElementById('cc_Phone');
const brandsSelect = $('#cc_brands'); // jQuery for Select2

// ==== Reset Form ====
function resetPartnerForm() {
    // Clear text inputs
    fullNameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';

    // Clear Select2 Brands dropdown
    $('#cc_brands').val(null).trigger('change');

    console.log('Form reset successfully');
}


// ==== Submit Form ====
ccAgentForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    // Get form values
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const selectedBrands = brandsSelect.val(); // array of selected brands

    // Basic Validation (Browser does most, but extra check here)
    if (!fullName || !email || !phone || selectedBrands.length === 0) {
        alert('Please fill all required fields and select at least one brand.');
        return;
    }

    // Phone number validation (extra check)
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone)) {
        alert('Please enter a valid 10-digit phone number starting with 6-9.');
        return;
    }

    // Create data object
    const ccAgentData = {
        fullName: fullName,
        email: email,
        phone: phone,
        brands: selectedBrands
    };

    console.log('Submitting CC Agent:', ccAgentData);

    // Show loading state
    const submitBtn = ccAgentForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;

    fetch(`${API_URL}/admin/addccgenet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`
        },
        body: JSON.stringify(ccAgentData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to register agent. Server responded with ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            showToast('Call Center Agent registered successfully! 🎉', 'success');
            resetPartnerForm();
            console.log('Server Response:', data);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(`Error: ${error.message}`, 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
});

// Utility function to get cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}
