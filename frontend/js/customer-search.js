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
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");

  const nameInput = document.getElementById("searchName");
  const mobileInput = document.getElementById("searchMobile");
  const serialInput = document.getElementById("searchSerial");

  const resultsContainer = document.getElementById("searchResults");
  const noResultsDiv = document.getElementById("noResults");
  const resultsCard = document.getElementById("resultsCard");

  // Handle Search
  searchBtn.addEventListener("click", function () {
    const name = nameInput.value.trim().toLowerCase();
    const mobile = mobileInput.value.trim();
    const serial = serialInput.value.trim().toLowerCase();

    // Validate at least one search criteria
    if (!name && !mobile && !serial) {
      showToast("Please enter at least one search criteria", "error");
      return;
    }

    // Get customers from localStorage
    const customers = JSON.parse(localStorage.getItem("crmCustomers")) || [];
    
    const filtered = customers.filter(customer => {
      const matchesName = !name || customer.name.toLowerCase().includes(name);
      const matchesMobile = !mobile || customer.mobile.includes(mobile);
      
      // Check if serial matches in customer's products
      let matchesSerial = !serial;
      if (serial && customer.products) {
        matchesSerial = customer.products.some(product => 
          product.serial.toLowerCase().includes(serial)
        );
      } else if (serial && customer.serial) {
        // Check legacy serial field
        matchesSerial = customer.serial.toLowerCase().includes(serial);
      }

      return matchesName && matchesMobile && matchesSerial;
    });

    showResults(filtered);
  });

  // Clear form
  clearBtn.addEventListener("click", function () {
    nameInput.value = "";
    mobileInput.value = "";
    serialInput.value = "";
    resultsContainer.innerHTML = "";
    noResultsDiv.style.display = "none";
    resultsCard.style.display = "none";
  });

  // Render Results as Cards
  function showResults(results) {
    resultsContainer.innerHTML = "";
    resultsCard.style.display = "block";
    
    if (results.length === 0) {
      noResultsDiv.style.display = "block";
      return;
    }

    noResultsDiv.style.display = "none";

    results.forEach(customer => {
      const card = document.createElement("div");
      card.className = "result-card";
      
      let productsHtml = "";
      if (customer.products && customer.products.length > 0) {
        productsHtml = customer.products.map(product => `
          <p><strong>Product:</strong> ${product.productType} - ${product.productName}</p>
          <p><strong>Serial No:</strong> ${product.serial}</p>
          <p><strong>Purchase Date:</strong> ${product.popDate}</p>
          <p><strong>Warranty:</strong> ${product.warranty}</p>
        `).join('');
      } else if (customer.productType) {
        // Legacy format
        productsHtml = `
          <p><strong>Product:</strong> ${customer.productType} - ${customer.product || 'N/A'}</p>
          <p><strong>Serial No:</strong> ${customer.serial || 'N/A'}</p>
          <p><strong>Purchase Date:</strong> ${customer.purchaseDate || 'N/A'}</p>
        `;
      }

      card.innerHTML = `
        <h3>${customer.name} (${customer.mobile})</h3>
        <p><strong>Address:</strong> ${customer.address || 'N/A'}</p>
        <p><strong>Location:</strong> ${customer.locality || 'N/A'} - ${customer.pin || 'N/A'}</p>
        <p><strong>Call Type:</strong> ${customer.callType || 'N/A'}</p>
        ${productsHtml}
        <p><strong>Priority:</strong> ${customer.priority || 'Normal'}</p>
        <p><strong>Registration Date:</strong> ${customer.registrationDate ? new Date(customer.registrationDate).toLocaleDateString() : 'N/A'}</p>
      `;
      resultsContainer.appendChild(card);
    });

    showToast(`Found ${results.length} customer(s)`, "success");
  }

  // Enter key support for search
  [nameInput, mobileInput, serialInput].forEach(input => {
    input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        searchBtn.click();
      }
    });
  });
});