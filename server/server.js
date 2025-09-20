const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");
const pdf = require("pdf-parse");

const app = express();
app.use(cors());
app.use(express.json());

// Uploads folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, randomUUID() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Test route
app.get("/api", (req, res) => res.send("Backend is working!"));

// Upload route
app.post("/api/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "PDF uploaded successfully", file: req.file.filename });
});

// Extended category mapping
const categoryMap = {
  // 🛒 Shopping
  myntra: "Shopping",
  amazon: "Shopping",
  flipkart: "Shopping",
  ajio: "Shopping",
  meesho: "Shopping",
  reliance: "Shopping",
  shopperstop: "Shopping",
  nykaa: "Shopping",
  tatacliq: "Shopping",
  paytmMall: "Shopping",
  snapdeal: "Shopping",
  firstcry: "Shopping",
  decathlon: "Shopping",
  lifestyle: "Shopping",
  maxfashion: "Shopping",
  pepperfry: "Shopping",
  ikea: "Shopping",

  // 🍔 Food & Cafe
  swiggy: "Food",
  zomato: "Food",
  dominos: "Food",
  pizzaHut: "Food",
  kfc: "Food",
  mcdonalds: "Food",
  burgerking: "Food",
  subway: "Food",
  bbq: "Food",
  eatfit: "Food",
  cafe: "Cafe",
  starbucks: "Cafe",
  barista: "Cafe",
  costa: "Cafe",
  chaayos: "Cafe",
  cool: "Cafe",
  sweets: "Food",
  
  // 🥦 Groceries
  blinkit: "Groceries",
  bigbasket: "Groceries",
  grofers: "Groceries",
  dmart: "Groceries",
  reliancefresh: "Groceries",
  more: "Groceries",
  spencers: "Groceries",
  naturebasket: "Groceries",
  dairy: "Groceries",
  groceries: "Groceries",

  // 🚖 Travel
  ola: "Travel",
  uber: "Travel",
  redbus: "Travel",
  irctc: "Travel",
  yatra: "Travel",
  makemytrip: "Travel",
  cleartrip: "Travel",
  ixigo: "Travel",
  goibibo: "Travel",
  indigo: "Travel",
  spicejet: "Travel",
  airindia: "Travel",
  vistara: "Travel",
  travel: "Travel",

  // 💡 Bills & Utilities
  jio: "Bill Payments",
  airtel: "Bill Payments",
  vodafone: "Bill Payments",
  idea: "Bill Payments",
  bsnl: "Bill Payments",
  electricity: "Bill Payments",
  gas: "Bill Payments",
  water: "Bill Payments",
  tataPower: "Bill Payments",
  adanipower: "Bill Payments",
  mseb: "Bill Payments",

  // 🎬 Entertainment
  hudle: "Entertainment",
  bookmyshow: "Entertainment",
  hotstar: "Entertainment",
  netflix: "Entertainment",
  sony: "Entertainment",
  prime: "Entertainment",
  zee: "Entertainment",
  voot: "Entertainment",
  sunNxt: "Entertainment",
  erosnow: "Entertainment",
  gaana: "Entertainment",
  spotify: "Entertainment",
  wynk: "Entertainment",
  youtube: "Entertainment",
  
  // 🏦 Wallets / Banks
  bank: "Wallet Top-up",
  icici: "Wallet Top-up",
  sbi: "Wallet Top-up",
  hdfc: "Wallet Top-up",
  axis: "Wallet Top-up",
  kotak: "Wallet Top-up",
  yesbank: "Wallet Top-up",
  idfc: "Wallet Top-up",
  federal: "Wallet Top-up",
  bob: "Wallet Top-up",
  paytm: "Wallet Top-up",
  phonepe: "Wallet Top-up",
  googlepay: "Wallet Top-up",
  freecharge: "Wallet Top-up",
  mobikwik: "Wallet Top-up",

  // 💰 Savings & Investments
  jar: "Savings",
  automatic: "Savings",
  payment: "Savings",
  sip: "Investments",
  mutualfund: "Investments",
  zerodha: "Investments",
  groww: "Investments",
  upstox: "Investments",
  sharekhan: "Investments",

  // 💊 Medical & Health
  nursing: "Hospital",
  hospital: "Medical",
  apollo: "Medical",
  fortis: "Medical",
  max: "Medical",
  aiims: "Medical",
  medplus: "Medical",
  pharmeasy: "Medical",
  1mg: "Medical",
  netmeds: "Medical",
  pharmacy: "Medical",
  medical: "Medical",
  
  // 💵 Misc
  cash: "Cash",
  recharge: "Recharges",
  dth: "Recharges",
  fastag: "Toll/Transport",
  insurance: "Insurance",
  lic: "Insurance",
  bajaj: "Insurance",
  tataAig: "Insurance",
  iciciPrudential: "Insurance",
};

function detectCategory(vendor) {
  const lower = vendor.toLowerCase();
  for (const key in categoryMap) {
    if (lower.includes(key)) return categoryMap[key];
  }
  return "Miscellaneous";
}

// Helper to extract date (walk back a few lines)
function extractDate(lines, idx) {
  for (let j = idx; j >= 0; j--) {
    if (/\d{1,2}\s+[A-Za-z]{3}/.test(lines[j])) {
      return lines[j];
    }
  }
  return "";
}

// Parse uploaded PDF
app.post("/api/parse", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    console.log("Parsing file:", req.file.path);

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);

    const lines = data.text.split("\n").map((l) => l.trim()).filter(Boolean);
    console.log("Extracted lines:", lines.length);

    const transactions = [];

    // Format 1: Wallet style
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const amountMatch = line.match(/([-+])\s*(?:Rs\.?|INR)\s*([\d,]+\.\d{2})/i);
      if (amountMatch && i + 1 < lines.length) {
        const sign = amountMatch[1];
        const amount = parseFloat(amountMatch[2].replace(/,/g, ""));
        const nextLine = lines[i + 1]; // vendor is usually the next line

        if (/^Paid to/i.test(nextLine) || /^Added to/i.test(nextLine)) {
          const vendor = nextLine.replace(
            /^(Paid to|Added to wallet from|Added to wallet)\s*/i,
            ""
          ).trim();

          const category = detectCategory(vendor);

          if (sign === "-") {
            transactions.push({
              vendor,
              amount,
              category,
              type: "Debit",
              date: extractDate(lines, i),
            });
            console.log("Wallet Tx:", vendor, amount, category);
          } else {
            transactions.push({
              vendor,
              amount,
              category: "Wallet Top-up",
              type: "Credit",
              date: extractDate(lines, i),
            });
          }
        }
      }
    }

    // Format 2: UPI statement style
    let currentVendor = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Vendor line first
      if (/^(Paid to|Money sent to|Received from)/i.test(line)) {
        currentVendor = line.replace(/^(Paid to|Money sent to|Received from)\s*/i, "").trim();
      }
      // If line looks like a direct expense description
      else if (/^(Paytm|Recharge|Automatic|JAR|PhonePe|Amazon|Purchase|Bill|Shopping|Bus|Train|Flight|Movie|Electricity|Water|Jio|Airtel|VI)/i.test(line)) {
      currentVendor = line.trim();
      }

      // Amount comes later
      const amountMatch2 = line.match(/([-+])\s*Rs\.?\s*([\d,]+(?:\.\d{1,2})?)/i);
      if (amountMatch2 && currentVendor) {
        const sign = amountMatch2[1];
        const amount = parseFloat(amountMatch2[2].replace(/,/g, ""));
        const tagLine = (lines[i + 1] || "").toLowerCase();

        let category = detectCategory(currentVendor);
        if (tagLine.includes("#")) {
          if (tagLine.includes("food")) category = "Food";
          else if (tagLine.includes("groceries")) category = "Groceries";
          else if (tagLine.includes("travel")) category = "Travel";
          else if (tagLine.includes("bill")) category = "Bills";
          else if (tagLine.includes("medical")) category = "Medical";
          else if (tagLine.includes("services")) category = "Services";
          else if (tagLine.includes("miscellaneous")) category = "Miscellaneous";
          else if (tagLine.includes("transfer")) category = "Transfers";
          else if (tagLine.includes("savings")) category = "Savings";
        }
         
        if (sign === "-") {
        transactions.push({
          vendor: currentVendor,
          amount,
          type: "Debit",
          category,
          date: extractDate(lines, i),
        });
        console.log("UPI Tx:", currentVendor, amount, category);
        }
        currentVendor = null; // reset
      }
    }

    // Totals
    const categoryTotals = {};
    let grandTotal = 0;
    transactions.forEach((t) => {
    if (t.type === "Debit") {       
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      grandTotal += t.amount;
      }
    });

    console.log("Total transactions parsed:", transactions.length);
    res.json({ transactions, categoryTotals, grandTotal });
  } catch (err) {
    console.error("PDF Parse Error:", err);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);


