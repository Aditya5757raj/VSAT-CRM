
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
ccAgentForm.addEventListener('submit', function(e) {
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

    // ==== Send data to backend ====
    fetch('/api/ccagents/register', { // <-- Replace with your backend API URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
        // Success
        alert('Call Center Agent registered successfully!');
        resetPartnerForm();
        console.log('Server Response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error registering agent. Please try again.');
    });
});

