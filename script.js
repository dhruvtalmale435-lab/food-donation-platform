document.addEventListener("DOMContentLoaded", function () {
  if (typeof db === "undefined") {
    console.error("Supabase client not loaded.");
    return;
  }

  const form = document.getElementById("donationForm");
  const donationMessage = document.getElementById("donationMessage");
  const table = document.getElementById("donationTable");

  // ---------------- FORM SUBMIT ----------------
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const donation = {
        donorName: document.getElementById("donorName")?.value.trim() || "Anonymous",
        contactNumber: document.getElementById("contactNumber")?.value.trim() || "",
        foodType: document.getElementById("foodType")?.value.trim() || "",
        quantity: parseInt(document.getElementById("quantity")?.value) || 1,
        expiryTime: document.getElementById("expiryTime")?.value.trim() || "",
        pickupAddress: document.getElementById("pickupAddress")?.value.trim() || "",
        area: document.getElementById("area")?.value || "",
        ngoSelect: document.getElementById("ngoSelect")?.value || "",
        notes: document.getElementById("notes")?.value.trim() || "",
        status: "Pending"
      };

      const { data, error } = await db
        .from("donation")
        .insert([donation])
        .select();

      if (error) {
        console.error("SUPABASE ERROR:", error);
        if (donationMessage) {
          donationMessage.style.color = "red";
          donationMessage.textContent = "❌ Failed: " + error.message;
        } else {
          alert("Donation failed: " + error.message);
        }
        return;
      }

      if (donationMessage) {
        donationMessage.style.color = "green";
        donationMessage.textContent = "✅ Donation submitted successfully!";
        setTimeout(() => { donationMessage.textContent = ""; }, 4000);
      }

      form.reset();
      await loadTableData();
      await updateImpactStats();
      await loadActivityFeed();
    });
  }

  // ---------------- LOAD TABLE ----------------
  async function loadTableData() {
    if (!table) return;

    const { data, error } = await db
      .from("donation")
      .select("*")
      .order("id", { ascending: false });

    if (error) { console.error("TABLE FETCH ERROR:", error); return; }

    table.innerHTML = "";
    data.forEach((d) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.foodType || "-"}</td>
        <td>${d.quantity || "-"}</td>
        <td>${d.pickupAddress || "-"}</td>
        <td>${d.expiryTime || "-"}</td>
        <td><button onclick="acceptFood('${d.id}')">Accept</button></td>
        <td>${d.status || "Pending"}</td>
      `;
      table.appendChild(row);
    });
  }

  // ---------------- ACCEPT FOOD ----------------
  window.acceptFood = async function (id) {
    const { error } = await db
      .from("donation")
      .update({ status: "Accepted" })
      .eq("id", id);

    if (error) { console.error("ACCEPT ERROR:", error); return; }
    await loadTableData();
    await updateImpactStats();
    await loadActivityFeed();
  };

  // ---------------- IMPACT STATS ----------------
  async function updateImpactStats() {
    const mealsDonatedEl = document.getElementById("mealsDonated");
    const partnerNgosEl = document.getElementById("partnerNgos");
    const foodSavedEl = document.getElementById("foodSaved");
    const activeDonorsEl = document.getElementById("activeDonors");

    if (!mealsDonatedEl) return;

    const { data, error } = await db.from("donation").select("*");
    if (error) { console.error("IMPACT STATS ERROR:", error); return; }

    let totalMeals = 0;
    const donors = new Set();
    const ngos = new Set();

    data.forEach((d) => {
      totalMeals += parseInt(d.quantity) || 0;
      if (d.donorName) donors.add(d.donorName);
      if (d.ngoSelect) ngos.add(d.ngoSelect);
    });

    mealsDonatedEl.textContent = totalMeals;
    if (partnerNgosEl) partnerNgosEl.textContent = ngos.size;
    if (foodSavedEl) foodSavedEl.textContent = totalMeals + " kg";
    if (activeDonorsEl) activeDonorsEl.textContent = donors.size;
  }

  // ---------------- ACTIVITY FEED ----------------
  async function loadActivityFeed() {
    const feed = document.getElementById("activityFeed");
    if (!feed) return;

    const { data, error } = await db
      .from("donation")
      .select("*")
      .order("id", { ascending: false })
      .limit(5);

    if (error) { console.error("ACTIVITY FEED ERROR:", error); return; }

    feed.innerHTML = "";

    if (!data || data.length === 0) {
      feed.innerHTML = `<div class="feed-item">No live donation activity yet.</div>`;
      return;
    }

    data.forEach((d) => {
      const item = document.createElement("div");
      item.className = "feed-item";
      item.innerHTML = `
        👁️ <span>${d.donorName || "Anonymous"}</span> donated
        <span>${d.quantity || 0}</span> items at
        <span>${d.pickupAddress || d.area || "Unknown Location"}</span>
      `;
      feed.appendChild(item);
    });
  }

  // ---------------- NGO FILTER ----------------
  const ngoSearch = document.getElementById("ngoSearch");
  const ngoFilter = document.getElementById("ngoFilter");
  const ngoCards = document.querySelectorAll(".ngo-card");

  if (ngoSearch && ngoFilter && ngoCards.length) {
    function filterNGOs() {
      const searchValue = ngoSearch.value.toLowerCase();
      const selectedArea = ngoFilter.value;
      ngoCards.forEach((card) => {
        const text = card.innerText.toLowerCase();
        const area = card.getAttribute("data-area");
        card.style.display =
          text.includes(searchValue) &&
          (selectedArea === "all" || area === selectedArea)
            ? "block" : "none";
      });
    }
    ngoSearch.addEventListener("keyup", filterNGOs);
    ngoFilter.addEventListener("change", filterNGOs);
  }

  // Init on page load
  loadTableData();
  updateImpactStats();
  loadActivityFeed();
});
