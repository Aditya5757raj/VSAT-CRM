// Toggle password visibility
function togglePassword(id, el) {
  const field = document.getElementById(id);
  field.type = field.type === 'password' ? 'text' : 'password';

  const icon = el.querySelector('i');
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
}

// Toast Notification
function showToast(message, bgColor = '#333') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: ${bgColor};
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    z-index: 9999;
    font-size: 14px;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadein {
    from {opacity: 0; bottom: 0;}
    to {opacity: 1; bottom: 20px;}
  }
  @keyframes fadeout {
    from {opacity: 1; bottom: 20px;}
    to {opacity: 0; bottom: 0;}
  }
`;
document.head.appendChild(style);

// Initialize dynamic validation
let alertTimeout;

function initUserManagement() {
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const oldPasswordInput = document.getElementById('oldPassword');

  newPasswordInput.addEventListener('input', validatePasswords);
  confirmPasswordInput.addEventListener('input', validatePasswords);

  function validatePasswords() {
    clearTimeout(alertTimeout);

    const newPass = newPasswordInput.value.trim();
    const confirmPass = confirmPasswordInput.value.trim();
    const oldPass = oldPasswordInput.value.trim();

    if (newPass && newPass === oldPass) {
      showToast('🚨 New password must be different from old password!', '#e74c3c');
      return false;
    }

    if (newPass && confirmPass && newPass !== confirmPass) {
      showToast('⚠️ Passwords do not match!', '#f39c12');
      return false;
    }

    if (newPass && confirmPass && newPass === confirmPass) {
      showToast('✅ Passwords match!', '#2ecc71');
      return true;
    }

    return false;
  }

  window.validatePasswords = validatePasswords; // Make accessible globally
}

async function submitPasswordChange() {
  const oldPass = document.getElementById('oldPassword')?.value.trim();
  const newPass = document.getElementById('newPassword')?.value.trim();
  const confirmPass = document.getElementById('confirmPassword')?.value.trim();

  const isValid = validatePasswords();
  if (!isValid) return;

  if (!oldPass || !newPass || !confirmPass) {
    showToast('🚨 Please fill in all fields!', '#e74c3c');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getCookie('token')}`,
      },
      body: JSON.stringify({
        oldPassword: oldPass,
        newPassword: newPass
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(`❌ ${data.message || data.error}`, '#e74c3c');
      return;
    }

    showToast('✅ Password changed successfully!', '#2ecc71');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);

  } catch (error) {
    console.error('Password change error:', error.message);
    showToast('❌ Something went wrong!', '#e74c3c');
  }
}

window.addEventListener('DOMContentLoaded', initUserManagement);
