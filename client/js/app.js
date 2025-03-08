window.addEventListener("load", GetUserDetails);
async function GetUserDetails() {
  const userEmail = document.getElementById("user-email");
  userEmail.innerText = "Loading";
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session completed Please Login Again");
    return (location.href = "/pages/login");
  }
  const response = await fetch(`http://localhost:8000/user/profile`, {
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

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  return (location.href = "/pages/login");
});

document
  .getElementById("request-btn")
  .addEventListener("click", RequestCredits);
async function RequestCredits() {
  const numberOfCredits = document.getElementById("credits-request");
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session completed Please Login Again");
    return (location.href = "/pages/login");
  }
  if (numberOfCredits.value < 1 || numberOfCredits.value > 10) {
    alert("You can only request 1 to 10 credits");
    return;
  }
  try {
    const response = await fetch(`http://localhost:8000/user/credits/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({ credits: numberOfCredits.value }),
    });
    if (!response.ok) {
      return alert("error with request");
    }
    alert("Credited");
  } catch (error) {
    alert(`Error with the request`);
  }
}
