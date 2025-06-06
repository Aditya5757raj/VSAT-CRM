// Toast Utility with spam protection
const toastSet = new Set();

function showToast(message, type = 'success', duration = 3000) {
  if (toastSet.has(message)) return;
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
  const searchBtn = document.getElementById("productSearchBtn");
  const clearBtn = document.getElementById("clearBtn");

  const nameInput = document.getElementById("searchName");
  const mobileInput = document.getElementById("searchMobile");

  const productContainer = document.getElementById("productResults");
  const noProducts = document.getElementById("noProducts");
  const productsCard = document.getElementById("productsCard");

  // Get products for customer from localStorage
  function getProductsForCustomer(name, mobile) {
    const customers = JSON.parse(localStorage.getItem("crmCustomers")) || [];

    return customers.filter(customer => {
      const matchesName = !name || customer.name.toLowerCase().includes(name.toLowerCase());
      const matchesMobile = !mobile || customer.mobile.includes(mobile);
      return matchesName && matchesMobile;
    });
  }

  function displayProducts(customers) {
    productContainer.innerHTML = "";
    productsCard.style.display = "block";

    let totalProducts = 0;

    customers.forEach(customer => {
      if (customer.products && customer.products.length > 0) {
        customer.products.forEach(product => {
          totalProducts++;
          const card = document.createElement("div");
          card.className = "product-card";
          card.innerHTML = `
            <h3>${customer.name} (${customer.mobile})</h3>
            <p><strong>Product Type:</strong> ${product.productType}</p>
            <p><strong>Product Name:</strong> ${product.productName}</p>
            <p><strong>Serial No:</strong> ${product.serial}</p>
            <p><strong>Purchase Date:</strong> ${product.popDate}</p>
            <p><strong>Warranty:</strong> ${product.warranty}</p>
            <p><strong>Added Date:</strong> ${product.addedDate ? new Date(product.addedDate).toLocaleDateString() : 'N/A'}</p>
          `;
          productContainer.appendChild(card);
        });
      } else if (customer.productType) {
        // Legacy format support
        totalProducts++;
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <h3>${customer.name} (${customer.mobile})</h3>
          <p><strong>Product Type:</strong> ${customer.productType}</p>
          <p><strong>Product Name:</strong> ${customer.product || 'N/A'}</p>
          <p><strong>Serial No:</strong> ${customer.serial || 'N/A'}</p>
          <p><strong>Purchase Date:</strong> ${customer.purchaseDate || 'N/A'}</p>
          <p><strong>Registration Date:</strong> ${customer.registrationDate ? new Date(customer.registrationDate).toLocaleDateString() : 'N/A'}</p>
        `;
        productContainer.appendChild(card);
      }
    });

    if (totalProducts === 0) {
      noProducts.style.display = "block";
    } else {
      noProducts.style.display = "none";
      showToast(`Found ${totalProducts} product(s)`, "success");
    }
  }

  // Search action
  searchBtn.addEventListener("click", function () {
    const name = nameInput.value.trim();
    const mobile = mobileInput.value.trim();

    if (!name && !mobile) {
      showToast("Please enter customer name or mobile number", "error");
      return;
    }

    const customers = getProductsForCustomer(name, mobile);

    if (customers.length === 0) {
      productContainer.innerHTML = "";
      productsCard.style.display = "block";
      noProducts.style.display = "block";
      showToast("No customers found", "error");
      return;
    }

    displayProducts(customers);
  });

  // Clear action
  clearBtn.addEventListener("click", function () {
    nameInput.value = "";
    mobileInput.value = "";
    productContainer.innerHTML = "";
    noProducts.style.display = "none";
    productsCard.style.display = "none";
  });

  // Enter key support for search
  [nameInput, mobileInput].forEach(input => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchBtn.click();
      }
    });
  });
});
