window.addEventListener("DOMContentLoaded", () => {
  GetUserDetails();
  GetUserRequestDetails();
});
async function GetUserDetails() {
  const userEmail = document.getElementById("user-email");
  const userCredits = document.getElementById("user-credits");
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
  userCredits.innerText = user.credits;
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

async function GetUserRequestDetails() {
  const requestArea = document.getElementById("request-area");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session completed Please Login Again");
    return (location.href = "/pages/login");
  }
  const response = await fetch(`http://localhost:8000/user/requests`, {
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
  const output = data.output;
  console.log(data);
  output.map((item) => {
    const parent = document.createElement("div");
    const child1 = document.createElement("span");
    child1.innerText = item.request;
    const child2 = document.createElement("span");
    child2.innerText = item.requestAt;
    parent.appendChild(child1);
    parent.appendChild(child2);
    requestArea.appendChild(parent);
    parent.style.display = "flex";
    parent.style.flexDirection = "row";
    parent.style.padding = "10px";
    parent.style.justifyContent = "space-around";
  });
}
