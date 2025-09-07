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
  const isChecked = document.getElementById('checkup').checked;

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: name,
        password: password,
        isChecked: isChecked,
        captcha: captchaResponse,
      }),
    });

    let json;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      json = await response.json();
    } else {
      json = { message: await response.text() };
    }

    if (!response.ok) {
      showToast(`❌ ${json.message || json.error || 'Login failed'}`, 'error');
      grecaptcha.reset();
      console.error("❌ Response error:", json);
      throw new Error(`Status ${response.status}: ${json.message}`);
    }

    // ✅ Store token in cookie
    document.cookie = `token=${json.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;

    showToast('✅ Signin successful!', 'success');

    // 🧠 Extract and normalize role
    const rawRole = json.role;
    const roleNormalized = (rawRole || '').trim().toLowerCase();
    const firstLogin = json.firstLogin;

    // 🧾 Debug logs
    console.log('✅ Backend Response:', json);
    console.log('🔍 Raw role:', rawRole);
    console.log('🔍 Normalized role:', roleNormalized);
    console.log('🔁 First login:', firstLogin);

    setTimeout(() => {
      if (firstLogin) {
        console.log('🔀 Redirecting to change-password.html');
        window.location.href = 'change-password.html';
        return;
      }

      // 🔁 Redirect based on normalized role
      switch (roleNormalized) {
        case 'admin':
          console.log('🔀 Redirecting to dashboard.html');
          window.location.href = 'pages/dashboard.html';
          break;
        case 'servicecenter':
          console.log('🔀 Redirecting to service_center.html');
          window.location.href = 'pages/service_center.html';
          break;
        case 'ccagent':
          console.log('🔀 Redirecting to cc_agent.html with complaint section');
          window.location.href = 'pages/cc_agent.html#complaint';
          break;
        case 'warehouse':
          console.log('🔀 Redirecting to cc_agent.html with complaint section');
          window.location.href = 'pages/warehouse.html';
        default:
          console.log('🔀 Redirecting to user/performance.html (default)');
          window.location.href = 'user/performance.html';
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Signin error:', error.message);
  }
}


sessionStorage.setItem("isLoggedIn", "true");


