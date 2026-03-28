function getUserRole() {
  return localStorage.getItem("userRole");
}

function getUserEmail() {
  return localStorage.getItem("userEmail");
}

async function logoutUser() {
  if (typeof db !== "undefined") {
    await db.auth.signOut();
  }
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}

function protectPage(allowedRoles) {
  const role = getUserRole();
  if (!role) { window.location.href = "login.html"; return; }
  if (!allowedRoles.includes(role)) {
    if (role === "donor") window.location.href = "donor-dashboard.html";
    else if (role === "ngo") window.location.href = "ngo-dashboard.html";
    else if (role === "admin") window.location.href = "admin-dashboard.html";
    else if (role === "community") window.location.href = "community-dashboard.html";
    else window.location.href = "login.html";
  }
}

function setupRoleNavbar() {
  const role = getUserRole();

  const donorLink = document.getElementById("navDonorDashboard");
  const ngoLink = document.getElementById("navNgoDashboard");
  const adminLink = document.getElementById("navAdminDashboard");
  const loginLink = document.getElementById("navLogin");
  const logoutLink = document.getElementById("navLogout");

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

  // Inject Profile link only if it doesn't already exist anywhere on the page
  if (!document.getElementById("navProfile") && logoutLink) {
    const li = document.createElement("li");
    li.id = "navProfile";
    li.innerHTML = '<a href="profile.html">\ud83d\udc64 Profile</a>';
    logoutLink.parentElement.insertAdjacentElement("beforebegin", li);
  }

  // Inject Live Map link only if it doesn't already exist anywhere on the page
  if (!document.getElementById("navLiveMap") && logoutLink) {
    const li = document.createElement("li");
    li.id = "navLiveMap";
    li.innerHTML = '<a href="live-tracking.html">\ud83d\udccd Live Map</a>';
    logoutLink.parentElement.insertAdjacentElement("beforebegin", li);
  }

  // Hide Available Food and Donate for admin
  if (role === "admin") {
    document.querySelectorAll("a[href='food.html'], a[href='donate.html']").forEach(el => {
      if (el.parentElement) el.parentElement.style.display = "none";
    });
  }

  // Hide Donate for NGO
  if (role === "ngo") {
    document.querySelectorAll("a[href='donate.html']").forEach(el => {
      if (el.parentElement) el.parentElement.style.display = "none";
    });
  }
}
