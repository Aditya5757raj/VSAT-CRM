// Toast Utility with spam protection
const toastSet = new Set();

function showToast(message, type = 'success', duration = 3000) {
  if (toastSet.has(message)) return; // prevent spam
  toastSet.add(message);
  setTimeout(() => toastSet.delete(message), duration);

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
  const searchBtn = document.getElementById("jobSearchBtn");
  const clearBtn = document.getElementById("clearBtn");
  const nameInput = document.getElementById("searchName");
  const mobileInput = document.getElementById("historyMobile");

  const jobHistoryContainer = document.getElementById("jobHistoryList");
  const noHistory = document.getElementById("noHistory");
  const historyCard = document.getElementById("historyCard");

  // Search Button Click
  searchBtn.addEventListener("click", function () {
    const name = nameInput.value.trim();
    const mobile = mobileInput.value.trim();

    if (!name && !mobile) {
      showToast("Please enter customer name or mobile number", "error");
      return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      showToast("Please enter a valid 10-digit mobile number", "error");
      return;
    }

    const customers = JSON.parse(localStorage.getItem("crmCustomers")) || [];

    const matchingCustomers = customers.filter(customer => {
      const matchesName = !name || customer.name.toLowerCase().includes(name.toLowerCase());
      const matchesMobile = !mobile || customer.mobile === mobile;
      return matchesName && matchesMobile;
    });

    if (matchingCustomers.length === 0) {
      jobHistoryContainer.innerHTML = "";
      historyCard.style.display = "block";
      noHistory.style.display = "block";
      showToast("No customers found", "error");
      return;
    }

    displayJobHistory(matchingCustomers);
  });

  // Display Job History
  function displayJobHistory(customers) {
    jobHistoryContainer.innerHTML = "";
    historyCard.style.display = "block";
    noHistory.style.display = "none";

    let totalJobs = 0;

    customers.forEach(customer => {
      // Registration job
      const registrationCard = document.createElement("div");
      registrationCard.className = "job-card";
      registrationCard.innerHTML = `
        <h3>Customer Registration</h3>
        <p><strong>Customer:</strong> ${customer.name}</p>
        <p><strong>Mobile:</strong> ${customer.mobile}</p>
        <p><strong>Call Type:</strong> ${customer.callType || 'N/A'}</p>
        <p><strong>Priority:</strong> ${customer.priority || 'Normal'}</p>
        <p><strong>Address:</strong> ${customer.address || 'N/A'}</p>
        <p><strong>Registration Date:</strong> ${customer.registrationDate ? new Date(customer.registrationDate).toLocaleDateString() : 'N/A'}</p>
      `;
      jobHistoryContainer.appendChild(registrationCard);
      totalJobs++;

      // Products loop
      if (customer.products && customer.products.length > 0) {
        customer.products.forEach((product, index) => {
          const productCard = document.createElement("div");
          productCard.className = "job-card";
          productCard.innerHTML = `
            <h3>Product Registration #${index + 1}</h3>
            <p><strong>Customer:</strong> ${customer.name}</p>
            <p><strong>Product Type:</strong> ${product.productType}</p>
            <p><strong>Product Name:</strong> ${product.productName}</p>
            <p><strong>Serial No:</strong> ${product.serial}</p>
            <p><strong>Purchase Date:</strong> ${product.popDate}</p>
            <p><strong>Warranty:</strong> ${product.warranty}</p>
            <p><strong>Added Date:</strong> ${product.addedDate ? new Date(product.addedDate).toLocaleDateString() : 'N/A'}</p>
          `;
          jobHistoryContainer.appendChild(productCard);
          totalJobs++;
        });
      } else if (customer.productType) {
        // Legacy support
        const productCard = document.createElement("div");
        productCard.className = "job-card";
        productCard.innerHTML = `
          <h3>Product Registration</h3>
          <p><strong>Customer:</strong> ${customer.name}</p>
          <p><strong>Product Type:</strong> ${customer.productType}</p>
          <p><strong>Product Name:</strong> ${customer.product || 'N/A'}</p>
          <p><strong>Serial No:</strong> ${customer.serial || 'N/A'}</p>
          <p><strong>Purchase Date:</strong> ${customer.purchaseDate || 'N/A'}</p>
        `;
        jobHistoryContainer.appendChild(productCard);
        totalJobs++;
      }
    });

    if (totalJobs === 0) {
      noHistory.style.display = "block";
    } else {
      showToast(`Found ${totalJobs} job record(s)`, "success");
    }
  }

  // Clear button
  clearBtn.addEventListener("click", function () {
    nameInput.value = "";
    mobileInput.value = "";
    jobHistoryContainer.innerHTML = "";
    noHistory.style.display = "none";
    historyCard.style.display = "none";
  });

  // Enter key triggers search
  [nameInput, mobileInput].forEach(input => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchBtn.click();
      }
    });
  });

  // Live mobile validation
  mobileInput.addEventListener("input", function () {
    const mobile = this.value.trim();
    this.style.borderColor = (mobile && !/^\d{10}$/.test(mobile)) ? "#dc2626" : "#d1d5db";
  });
});
