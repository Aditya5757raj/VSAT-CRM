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

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addProductForm");
  const resetBtn = document.getElementById("resetBtn");

  // Form validation and submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const mobile = document.getElementById("customerMobile").value.trim();
    const type = document.getElementById("productType").value;
    const name = document.getElementById("productName").value.trim();
    const serial = document.getElementById("serialNo").value.trim();
    const popDate = document.getElementById("popDate").value;
    const warranty = document.getElementById("warranty").value;

    let isValid = true;

    // Validation function
    function validate(id, condition, msg) {
      const input = document.getElementById(id);
      const error = document.getElementById(id + "Error");
      if (condition) {
        error.textContent = "";
        input.style.borderColor = "#d1d5db";
      } else {
        error.textContent = msg;
        input.style.borderColor = "#dc2626";
        if (isValid) {
          showToast(msg, "error");
        }
        isValid = false;
      }
    }

    // Validate all fields
    validate("customerMobile", /^\d{10}$/.test(mobile), "Enter valid 10-digit mobile number");
    validate("productType", type !== "", "Please select a product type");
    validate("productName", name !== "", "Product name is required");
    validate("serialNo", serial !== "", "Serial number is required");
    validate("popDate", popDate !== "", "Date of purchase is required");
    validate("warranty", warranty !== "", "Please select warranty period");

    // Check if date is not in future
    if (popDate) {
      const selectedDate = new Date(popDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        validate("popDate", false, "Date of purchase cannot be in the future");
      }
    }

    if (!isValid) return;

    // Find customer by mobile
    const customers = JSON.parse(localStorage.getItem("crmCustomers")) || [];
    const customerIndex = customers.findIndex(c => c.mobile === mobile);

    if (customerIndex === -1) {
      showToast("Customer not found. Please register the customer first.", "error");
      return;
    }

    // Add product to customer
    if (!customers[customerIndex].products) {
      customers[customerIndex].products = [];
    }

    const newProduct = {
      productType: type,
      productName: name,
      serial: serial,
      popDate: popDate,
      warranty: warranty,
      addedDate: new Date().toISOString()
    };

    customers[customerIndex].products.push(newProduct);

    // Update localStorage
    localStorage.setItem("crmCustomers", JSON.stringify(customers));

    showToast("✅ Product added successfully!", "success");
    resetForm();
  });

  // Reset form function
  function resetForm() {
    form.reset();
    
    // Clear all error messages
    document.querySelectorAll('.error-message').forEach(error => {
      error.textContent = "";
    });
    
    // Reset border colors
    document.querySelectorAll('input, select').forEach(input => {
      input.style.borderColor = "#d1d5db";
    });
  }

  // Reset button event listener
  resetBtn.addEventListener("click", resetForm);

  // Date validation on input
  document.getElementById("popDate").addEventListener("input", function() {
    const selectedDate = new Date(this.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      showToast("Date of purchase cannot be in the future.", "error");
      this.value = "";
    }
  });

  // Mobile number validation on input
  document.getElementById("customerMobile").addEventListener("input", function() {
    const mobile = this.value.trim();
    const error = document.getElementById("customerMobileError");

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
});
// Toast Utility with spam prevention
const toastQueue = new Set();  // Track currently active messages

function showToast(message, type = 'success', duration = 3000) {
  // Prevent duplicate toasts
  if (toastQueue.has(message)) return;
  toastQueue.add(message);
  setTimeout(() => toastQueue.delete(message), duration);

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
