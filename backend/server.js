console.log("🔥 SERVER FILE LOADED");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ROOT TEST
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

// TEST DB ROUTE
app.get("/test-db", async (req, res) => {
  console.log("TEST-DB HIT"); // 👈 IMPORTANT

  const { data, error } = await supabase
    .from("donation")
    .select("*");

  if (error) {
    console.log("ERROR:", error);
    return res.json(error);
  }

  res.json(data);
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
app.get("/test-db", (req, res) => {
  res.send("TEST ROUTE WORKING");
});