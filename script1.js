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
        }
      })
      .catch(() => {
        localityInput.innerHTML = '<option value="">-- Error fetching locality --</option>';
      });
  } else {
    localityInput.innerHTML = '<option value="">-- Select locality --</option>';
  }
}

document.getElementById("productType").addEventListener("change", function () {
  const productType = this.value;
  const product = document.getElementById("product");
  product.innerHTML = '<option value="">-- Select Product --</option>';

  if (productType === "AC") {
    ["1.5 Ton Split AC", "2 Ton Window AC", "Inverter AC"].forEach(p => {
      let opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      product.appendChild(opt);
    });
  } else if (productType === "Washing Machine") {
    ["Front Load 7kg", "Top Load 6.5kg", "Fully Automatic 8kg"].forEach(p => {
      let opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      product.appendChild(opt);
    });
  }
});

document.getElementById("purchaseDate").addEventListener("input", () => {
  const input = document.getElementById("purchaseDate");
  const selectedDate = new Date(input.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate > today) {
    alert("Date of Purchase cannot be in the future.");
    input.value = "";
    input.focus();
  }
});

document.getElementById("callForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let isValid = true;

  function validate(id, condition, msg) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + "Error");
    if (condition) {
      error.textContent = "";
    } else {
      error.textContent = msg;
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
  document.getElementById("callTypeError").textContent = callType ? "" : "Select a call type";
  if (!callType) isValid = false;

  const priority = document.querySelector("input[name='priority']:checked");
  document.getElementById("priorityError").textContent = priority ? "" : "Select priority";
  if (!priority) isValid = false;

  const purchaseDateInput = document.getElementById('purchaseDate');
  const purchaseDate = new Date(purchaseDateInput.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (purchaseDate > today) {
    alert("Date of Purchase cannot be in the future.");
    purchaseDateInput.focus();
    isValid = false;
  }

  if (isValid) {
    alert("Call Registered Successfully!");
    document.getElementById("callForm").reset();
    document.getElementById("locality").innerHTML = '<option value="">-- Select locality --</option>';
    document.getElementById("product").innerHTML = '<option value="">-- Select Product --</option>';
  }
});
document.getElementById("mobile").addEventListener("input", function () {
  const mobile = this.value.trim();
  const error = document.getElementById("mobileError");

  if (mobile === "") {
    error.textContent = "Mobile number is required";
  } else if (!/^\d{10}$/.test(mobile)) {
    error.textContent = "Enter a valid 10-digit mobile number";
  } else {
    error.textContent = "";
  }
});

