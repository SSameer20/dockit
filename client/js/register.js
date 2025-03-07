const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerBtn = document.getElementById("register-btn");

registerBtn.addEventListener("click", RegisterUser);
window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  if (token) {
    localStorage.removeItem("token");
  }
});
async function RegisterUser() {
  if (registerEmail.value == "" || registerPassword.value == "") {
    alert("Please enter email and password");
    registerEmail.focus();
    return;
  }
  try {
    const response = await fetch("http://localhost:8000/user/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: registerEmail.value.trim(),
        password: registerPassword.value.trim(),
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      alert("Registered successfully!");
      localStorage.removeItem("token");
      location.href = "/pages/login";
    } else {
      alert("Registration failed: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}
