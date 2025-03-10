const uploadBtn = document.getElementById("upload-btn");
const fileUpload = document.getElementById("file-upload");
const displayFileName = document.getElementById("fileName");

uploadBtn.addEventListener("click", UploadFile);
fileUpload.addEventListener("change", () => {
  displayFileName.innerText = fileUpload.files[0]?.name || "No file selected";
});

async function UploadFile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session Expired, Please Log in");
      return (location.href = "/pages/login");
    }

    if (!fileUpload.files.length) {
      return alert("No file selected!");
    }

    const formData = new FormData();
    formData.append("file", fileUpload.files[0]);

    const response = await fetch(`http://localhost:8000/user/documents/scan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        fileName: fileUpload.files[0].name,
        type: fileUpload.files[0].type,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Upload Error:", result.message);
      return alert("Error with request: " + result.message);
    }

    alert("File Uploaded Successfully!");
  } catch (error) {
    console.error("Upload Error:", error);
    alert("Error while uploading");
  }
}
