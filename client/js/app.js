window.addEventListener("load", GetUserDetails);
async function GetUserDetails() {
  const userEmail = document.getElementById("user-email");
  userEmail.innerText = "Loading";
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session completed Please Login Again");
    return (location.href = "/pages/login");
  }
  const response = await fetch(`http://localhost:8000/user/details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return (location.href = "/");
  }
  const data = await response.json();
  const user = data.data;
  console.log(user.userId);
  userEmail.innerText = user.email;
}
