// Toast Notification Logic
function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function togglePassword(id) {
    const field = document.getElementById(id);
    field.type = field.type === "password" ? "text" : "password";
}

async function handleSignup(e) {
    e.preventDefault();
    const username=document.getElementById("signupName").value.trim();
    const p1 = document.getElementById("signupPassword").value.trim();
    const p2 = document.getElementById("confirmPassword").value.trim();
    console.log(API_URL);
      if (!username || !p1||!p2) {
        showToast("❌ Name and Password are required", "error");
        return;
    }
    if (p1 !== p2) {
        showToast("❌ Passwords do not match!", "error");
        return;
    } else {
        const url = `${API_URL}/auth/Signup`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: p1,
                }),
            });
            const json = await response.json();
            if (!response.ok) {
                showToast(`❌${json.message}`, "error");
                throw new Error(`Response status: ${response.status}`);
            }
            showToast("✅ Signup successful!", "success");
            console.log(json);
            setTimeout(() => {
                switchForm("signin");
            }, 2000);
        } catch (error) {
            console.error(error.message);
        }
    }
}
async function handleSignin(e) {
    e.preventDefault();
    const name = document.getElementById("signinName").value.trim();
    const password = document.getElementById("signinPassword").value.trim();
    const checkbox = document.getElementById("checkup");
    const isChecked = checkbox.checked; // true if checked, false if not

    if (!name || !password) {
        showToast("❌ Name and Password are required", "error");
        return;
    }
    const url = `${API_URL}/auth/Signin`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: name,
                password: password,
                isChecked: isChecked,
            }),
        });
        const json = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                showToast("❌ Wrong username or password", "error");
            } else {
                showToast(`❌ Wrong username or password`, "error");
            }
            throw new Error(`Response status: ${response.status}`);
        }
        showToast("✅ Signin successful!", "success");
        console.log(json.token);
        document.cookie = `token=${json.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
    } catch (error) {
        console.error(error.message);
    }
}
function switchForm(form) {
    document.getElementById("signupForm").classList.remove("visible");
    document.getElementById("signinForm").classList.remove("visible");

    if (form === "signup") {
        document.getElementById("signupForm").classList.add("visible");
    } else {
        document.getElementById("signinForm").classList.add("visible");
    }
}

// Live password match check
document.addEventListener("DOMContentLoaded", () => {
    const pass = document.getElementById("signupPassword");
    const confirm = document.getElementById("confirmPassword");
    const matchMsg = document.getElementById("passwordMatch");

    function checkMatch() {
        if (confirm.value === "") {
            matchMsg.textContent = "";
            return;
        }
        if (pass.value === confirm.value) {
            matchMsg.textContent = "✅ Passwords match";
            matchMsg.style.color = "green";
        } else {
            matchMsg.textContent = "❌ Passwords do not match";
            matchMsg.style.color = "red";
        }
    }

    pass.addEventListener("input", checkMatch);
    confirm.addEventListener("input", checkMatch);
});
