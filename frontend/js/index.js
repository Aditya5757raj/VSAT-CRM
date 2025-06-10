// Toast Notification Logic
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function togglePassword(id, el) {
  const field = document.getElementById(id);
  field.type = field.type === 'password' ? 'text' : 'password';

  const icon = el.querySelector('i');
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
}

async function handleSignin(e) {
  e.preventDefault();
  const name = document.getElementById('signinName').value.trim();
  const password = document.getElementById('signinPassword').value.trim();
  const checkbox = document.getElementById('checkup');
  const isChecked = checkbox.checked;

  // Get reCAPTCHA response token
  const captchaResponse = grecaptcha.getResponse();
  if (!captchaResponse) {
    showToast("❌ Please verify you're not a robot", 'error');
    return;
  }

  if (!name || !password) {
    showToast('❌ Username and Password are required', 'error');
    return;
  }

  const url = `${API_URL}/auth/Signin`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: name,
        password: password,
        isChecked: isChecked,
        captcha: captchaResponse, // Added captcha verification
      }),
    });

    let json;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      json = await response.json();
    } else {
      const text = await response.text();
      json = { message: text };
    }

    if (!response.ok) {
      showToast(
        `❌ ${json.message || json.error || 'Wrong username or password'}`,
        'error'
      );
      // Reset reCAPTCHA on error
      grecaptcha.reset();
      throw new Error(`Status ${response.status}: ${json.message}`);
    }

    showToast('✅ Signin successful!', 'success');
    console.log(json.token);
    
    // Set cookie with token
    document.cookie = `token=${json.token}; path=/; max-age=${
      60 * 60 * 24
    }; SameSite=Strict`;
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  } catch (error) {
    console.error('Signin error:', error.message);
  }
}