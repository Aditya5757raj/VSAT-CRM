// Toast Utility
function showToast(message, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'custom-toast ' + (type === 'error' ? 'error' : 'success');
  toast.textContent = message;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      if (container.childElementCount === 0) {
        container.remove();
      }
    });
  }, duration);
}

// Fetch locality using pin
function fetchLocality() {
  const pin = document.getElementById("pin").value.trim();
  const localityInput = document.getElementById("locality");

  if (pin.length === 6 && /^\d{6}$/.test(pin)) {
    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then(response => response.json())
      .then(data => {
        if (data[0].Status === "Success") {
          localityInput.innerHTML = '<option value="">-- Select locality --</option>';
          data[0].PostOffice.forEach(po => {
            const option = document.createElement("option");
            option.value = `${po.Name}, ${po.District}`;
            option.textContent = `${po.Name}, ${po.District}`;
            localityInput.appendChild(option);
          });
        } else {
          localityInput.innerHTML = '<option value="">-- No locality found --</option>';
          showToast("No locality found for this PIN", "error");
        }
      })
      .catch(() => {
        localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
        showToast("Error fetching locality!", "error");
      });
  } else {
    localityInput.innerHTML = '<option value="">-- Select locality --</option>';
  }
}

// Product change
document.getElementById("productType").addEventListener("change", function () {
  const productType = this.value;
  const product = document.getElementById("product");
  product.innerHTML = '<option value="">-- Select Product --</option>';

  const options = {
    "AC": ["1.5 Ton Split AC", "2 Ton Window AC", "Inverter AC"],
    "Washing Machine": ["Front Load 7kg", "Top Load 6.5kg", "Fully Automatic 8kg"]
  };

  (options[productType] || []).forEach(p => {
    let opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    product.appendChild(opt);
  });
});

// PIN code input listener
document.getElementById("pin").addEventListener("input", fetchLocality);

// Future date validation
document.getElementById("purchaseDate").addEventListener("input", () => {
  const input = document.getElementById("purchaseDate");
  const selectedDate = new Date(input.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate > today) {
    showToast("Date of Purchase cannot be in the future.", "error");
    input.value = "";
    input.focus();
  }
});

// Form validation on submit
document.getElementById("callForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let isValid = true;
  let firstInvalidInput = null;

  function validate(id, condition, msg) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + "Error");
    if (condition) {
      error.textContent = "";
      input.style.borderColor = "#d1d5db";
    } else {
      error.textContent = msg;
      input.style.borderColor = "#dc2626";
      if (!firstInvalidInput) firstInvalidInput = input;
      if (isValid) {
        showToast(msg, "error");
      }
      isValid = false;
    }
  }

  validate("fullName", document.getElementById("fullName").value.trim() !== "", "Full name is required");
  validate("mobile", /^\d{10}$/.test(document.getElementById("mobile").value.trim()), "Enter a valid 10-digit mobile number");
  validate("pin", /^\d{6}$/.test(document.getElementById("pin").value.trim()), "Enter valid 6-digit pin code");
  validate("locality", document.getElementById("locality").value !== "", "Locality is required");
  validate("address", document.getElementById("address").value.trim() !== "", "Address is required");
  validate("productType", document.getElementById("productType").value !== "", "Please select a product type");
  validate("product", document.getElementById("product").value !== "", "Please select a product");
  validate("serial", document.getElementById("serial").value.trim() !== "", "Serial number is required");

  const callType = document.querySelector("input[name='callType']:checked");
  const callTypeError = document.getElementById("callTypeError");
  if (callType) {
    callTypeError.textContent = "";
  } else {
    callTypeError.textContent = "Select a call type";
    if (!firstInvalidInput) firstInvalidInput = document.querySelector("input[name='callType']");
    if (isValid) showToast("Select a call type", "error");
    isValid = false;
  }

  const priority = document.querySelector("input[name='priority']:checked");
  const priorityError = document.getElementById("priorityError");
  if (priority) {
    priorityError.textContent = "";
  } else {
    priorityError.textContent = "Select priority";
    if (!firstInvalidInput) firstInvalidInput = document.querySelector("input[name='priority']");
    if (isValid) showToast("Select priority", "error");
    isValid = false;
  }

  const purchaseDateInput = document.getElementById('purchaseDate');
  const purchaseDate = new Date(purchaseDateInput.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (purchaseDate > today) {
    if (!firstInvalidInput) firstInvalidInput = purchaseDateInput;
    if (isValid) showToast("Date of Purchase cannot be in the future.", "error");
    isValid = false;
  }

  if (!isValid && firstInvalidInput) {
    firstInvalidInput.focus();
  }

  if (isValid) {
    // Save customer data to localStorage
    const customerData = {
      name: document.getElementById("fullName").value.trim(),
      mobile: document.getElementById("mobile").value.trim(),
      pin: document.getElementById("pin").value.trim(),
      locality: document.getElementById("locality").value,
      address: document.getElementById("address").value.trim(),
      callType: callType.value,
      productType: document.getElementById("productType").value,
      product: document.getElementById("product").value,
      serial: document.getElementById("serial").value.trim(),
      purchaseDate: document.getElementById("purchaseDate").value,
      comments: document.getElementById("comments").value.trim(),
      priority: priority.value,
      registrationDate: new Date().toISOString()
    };

    // Get existing customers or initialize empty array
    const existingCustomers = JSON.parse(localStorage.getItem("crmCustomers")) || [];
    existingCustomers.push(customerData);
    localStorage.setItem("crmCustomers", JSON.stringify(existingCustomers));

    showToast("Call Registered Successfully!", "success");
    resetForm();
  }
});

// Live mobile validation
document.getElementById("mobile").addEventListener("input", function () {
  const mobile = this.value.trim();
  const error = document.getElementById("mobileError");

  if (mobile === "") {
    error.textContent = "Mobile number is required";
    this.style.borderColor = "#dc2626";
  } else if (!/^\d{10}$/.test(mobile)) {
    error.textContent = "Enter a valid 10-digit mobile number";
    this.style.borderColor = "#dc2626";
  } else {
    error.textContent = "";
    this.style.borderColor = "#d1d5db";
  }
});

// Reset form function
function resetForm() {
  document.getElementById("callForm").reset();
  document.getElementById("locality").innerHTML = '<option value="">-- Select locality --</option>';
  document.getElementById("product").innerHTML = '<option value="">-- Select Product --</option>';
  
  // Clear all error messages
  document.querySelectorAll('.error-message').forEach(error => {
    error.textContent = "";
  });
  
  // Reset border colors
  document.querySelectorAll('input, select, textarea').forEach(input => {
    input.style.borderColor = "#d1d5db";
  });
}

// Reset button event listener
document.getElementById("resetBtn").addEventListener("click", resetForm);