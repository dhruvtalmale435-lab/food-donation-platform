
function getUserRole() {
  return localStorage.getItem("userRole");
}

function getUserEmail() {
  return localStorage.getItem("userEmail");
}

function logoutUser() {
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  window.location.href = "login.html";
}

function protectPage(allowedRoles) {
  const role = getUserRole();

  if (!role) {
    window.location.href = "donor-access.html";
    return;
  }

  if (!allowedRoles.includes(role)) {
    if (allowedRoles.includes("donor")) {
      window.location.href = "donor-access.html";
    } else {
      window.location.href = "login.html";
    }
  }

}

function setupRoleNavbar() {
  const role = getUserRole();

  const donorLink = document.getElementById("navDonorDashboard");
  const ngoLink = document.getElementById("navNgoDashboard");
  const adminLink = document.getElementById("navAdminDashboard");
  const loginLink = document.getElementById("navLogin");
  const logoutLink = document.getElementById("navLogout");
  const donateLink = document.getElementById("navDonate");

  if (donorLink) donorLink.style.display = "none";
  if (ngoLink) ngoLink.style.display = "none";
  if (adminLink) adminLink.style.display = "none";
  if (logoutLink) logoutLink.style.display = "none";

  if (!role) {
    if (loginLink) loginLink.style.display = "inline-block";
    return;
  }

  if (loginLink) loginLink.style.display = "none";
  if (logoutLink) logoutLink.style.display = "inline-block";

  if (role === "donor" && donorLink) donorLink.style.display = "inline-block";
  if (role === "ngo" && ngoLink) ngoLink.style.display = "inline-block";
  if (role === "admin" && adminLink) adminLink.style.display = "inline-block";

  if (role === "ngo" && donateLink) donateLink.style.display = "none";
}