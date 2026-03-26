function getDonations() {
  return JSON.parse(localStorage.getItem("donations")) || [];
}

function saveDonations(donations) {
  localStorage.setItem("donations", JSON.stringify(donations));
}

document.addEventListener("DOMContentLoaded", function () {
  // Use existing Supabase client from supabase.js
  if (!window.supabase && !window.supabaseClient && !window.supabase?.createClient) {
    console.error("Supabase library not loaded.");
  }

  // If supabase.js created global const supabase, it will already be available
  // This fallback is only for safety if needed.
  let db = null;
  if (typeof supabase !== "undefined"){
    db = supabase;
  } else if (window.supabaseClient);{
    db = window.supabaseClient;
  } else if (window.supabase && window.supabaseClient){
    const SUPABASE_URL = "https://ncjbzcohbupbaicwlbov.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ6Y29oYnVwYmFpY3dsYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDkxMTAsImV4cCI6MjA4OTY4NTExMH0.nYzspsW6ePv264-ILjoM4N6KYsCrJ720QSc44vuWZNA";
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
 
  const form = document.getElementById("donationForm");
  const donationMessage = document.getElementById("donationMessage");
  const table = document.getElementById("donationTable");

  const foodSearch = document.getElementById("foodSearch");
  const foodFilter = document.getElementById("foodFilter");
  const foodCards = document.querySelectorAll(".food-card");

  const ngoSearch = document.getElementById("ngoSearch");
  const ngoFilter = document.getElementById("ngoFilter");
  const ngoCards = document.querySelectorAll(".ngo-card");

  // ---------------- FORM SUBMIT ----------------
  if (form && db) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const donation = {
        donorName: document.getElementById("donorName")?.value || "Anonymous",
        contactNumber: document.getElementById("contactNumber")?.value || "",
        foodType: document.getElementById("foodType")?.value || "",
        quantity: parseInt(document.getElementById("quantity")?.value) || 1,
        expiryTime: document.getElementById("expiryTime")?.value || "",
        pickupAddress: document.getElementById("pickupAddress")?.value || "",
        area: document.getElementById("area")?.value || "",
        ngoSelect: document.getElementById("ngoSelect")?.value || "",
        notes: document.getElementById("notes")?.value || "",
        status: "Pending"
      };

      console.log("DONATION:", donation);

      const { data, error } = await db
        .from("donation")
        .insert([
          {
            donorName: donation.donorName,
            contactNumber: donation.contactNumber,
            foodType: donation.foodType,
            quantity: donation.quantity,
            expiryTime: donation.expiryTime,
            pickupAddress: donation.pickupAddress,
            area: donation.area,
            ngoSelect: donation.ngoSelect,
            notes: donation.notes,
            status: donation.status
          }
        ])
        .select();

      console.log("DATA:", data);

      if (error) {
        console.error("SUPABASE ERROR:", error);
        alert("Donation failed to save: " + error.message);
        return;
      }

      // localStorage backup for pages still using local data
      const donations = getDonations();
      donations.push({
        donorName: donation.donorName,
        contactNumber: donation.contactNumber,
        foodType: donation.foodType,
        quantity: donation.quantity,
        expiryTime: donation.expiryTime,
        pickupAddress: donation.pickupAddress,
        area: donation.area,
        ngoSelect: donation.ngoSelect || "Auto Match",
        notes: donation.notes,
        status: donation.status,
        createdAt: new Date().toISOString()
      });
      saveDonations(donations);

      console.log("SUCCESS:", data);

      if (donationMessage) {
        donationMessage.textContent = "✅ Donation submitted successfully!";
      } else {
        alert("✅ Donation submitted successfully!");
      }

      form.reset();

      await loadTableData();
      await updateImpactStats();
      await loadActivityFeed();
    });
  }

  // ---------------- LOAD TABLE ----------------
  async function loadTableData() {
    if (!table || !db) return;

    const { data, error } = await db
      .from("donation")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("TABLE FETCH ERROR:", error);
      return;
    }

    console.log("Fetched data:", data);
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
    if (!db) return;

    const { error } = await db
      .from("donation")
      .update({ status: "Accepted" })
      .eq("id", id);

    if (error) {
      console.error("ACCEPT ERROR:", error);
      return;
    }

    await loadTableData();
    await updateImpactStats();
    await loadActivityFeed();
  };

  // ---------------- IMPACT STATS ----------------
  async function updateImpactStats() {
    if (!db) return;

    const { data, error } = await db
      .from("donation")
      .select("*");

    if (error) {
      console.error("IMPACT STATS ERROR:", error);
      return;
    }

    const mealsDonatedEl = document.getElementById("mealsDonated");
    const partnerNgosEl = document.getElementById("partnerNgos");
    const foodSavedEl = document.getElementById("foodSaved");
    const activeDonorsEl = document.getElementById("activeDonors");

    if (!mealsDonatedEl || !partnerNgosEl || !foodSavedEl || !activeDonorsEl) return;

    let totalMeals = 0;
    const donors = new Set();
    const ngos = new Set();

    data.forEach((d) => {
      const qty = parseInt(d.quantity) || 0;
      totalMeals += qty;

      if (d.donorName) donors.add(d.donorName);
      if (d.ngoSelect) ngos.add(d.ngoSelect);
    });

    mealsDonatedEl.textContent = totalMeals;
    partnerNgosEl.textContent = ngos.size;
    foodSavedEl.textContent = totalMeals + " kg";
    activeDonorsEl.textContent = donors.size;
  }

  // ---------------- ACTIVITY FEED ----------------
  async function loadActivityFeed() {
    const feed = document.getElementById("activityFeed");
    if (!feed || !db) return;

    const { data, error } = await db
      .from("donation")
      .select("*")
      .order("id", { ascending: false })
      .limit(5);

    if (error) {
      console.error("ACTIVITY FEED ERROR:", error);
      return;
    }

    feed.innerHTML = "";

    if (!data || data.length === 0) {
      feed.innerHTML = `
        <div class="feed-item">
          No live donation activity yet.
        </div>
      `;
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

  // ---------------- FILTERS ----------------
  if (foodSearch && foodFilter) {
    function filterFoodCards() {
      const searchValue = foodSearch.value.toLowerCase();
      const selectedStatus = foodFilter.value;

      foodCards.forEach((card) => {
        const text = card.innerText.toLowerCase();
        const status = card.getAttribute("data-status");

        card.style.display =
          text.includes(searchValue) &&
          (selectedStatus === "all" || status === selectedStatus)
            ? "block"
            : "none";
      });
    }

    foodSearch.addEventListener("keyup", filterFoodCards);
    foodFilter.addEventListener("change", filterFoodCards);
  }

  if (ngoSearch && ngoFilter) {
    function filterNGOs() {
      const searchValue = ngoSearch.value.toLowerCase();
      const selectedArea = ngoFilter.value;

      ngoCards.forEach((card) => {
        const text = card.innerText.toLowerCase();
        const area = card.getAttribute("data-area");

        card.style.display =
          text.includes(searchValue) &&
          (selectedArea === "all" || area === selectedArea)
            ? "block"
            : "none";
      });
    }

    ngoSearch.addEventListener("keyup", filterNGOs);
    ngoFilter.addEventListener("change", filterNGOs);
  }

  // ---------------- INITIAL LOAD ----------------
  loadTableData();
  updateImpactStats();
  loadActivityFeed();
  setInterval(loadActivityFeed, 600000);
});