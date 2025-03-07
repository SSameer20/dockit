const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginRole = document.getElementById("login-role");
const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", LoginUser);

window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  if (token) {
    location.href = "/pages/app";
    return;
  }
});

async function LoginUser() {
  if (loginEmail.value == "" || loginPassword.value == "") {
    alert("Please enter email and password");
    loginEmail.focus();
    return;
  }
  try {
    const response = await fetch(
      `http://localhost:8000/${loginRole.value}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.value,
          password: loginPassword.value,
        }),
      }
    );

    if (!response.ok) {
      alert("Incorrect Credentials");
      return;
    }
    const data = await response.json();
    alert("Logged in successfully!");
    localStorage.setItem("token", data.token);
    location.href = "/pages/app";
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}
