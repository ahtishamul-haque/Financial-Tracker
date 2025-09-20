import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Charts({ transactions }) {
  if (!transactions || transactions.length === 0)
    return (
      <p className="text-gray-500 italic text-center">
        No data to display
      </p>
    );

  // 🆕 Category merge mapping
  const mergedCategories = {
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

  const normalizeCategory = (cat) => {
    if (!cat) return "Other";
    const lower = cat.toLowerCase();
    return mergedCategories[lower] || cat;
  };

  // Pie: Category totals
  const categoryTotals = transactions.reduce((acc, t) => {
    const cat = normalizeCategory(t.category);
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});
  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  }));

  // Bar: Vendor totals
  const vendorTotals = transactions.reduce((acc, t) => {
    const vendor = t.vendor || "Unknown";
    acc[vendor] = (acc[vendor] || 0) + t.amount;
    return acc;
  }, {});
  const barData = Object.keys(vendorTotals).map((vendor) => ({
    vendor,
    amount: vendorTotals[vendor],
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6666"];

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-6">
      {/* Pie Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
          Spending by Category
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={false}         // 🚫 disable labels on slices
              minAngle={5}   
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
          Spending by Vendor
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="vendor"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-30}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
            <Bar dataKey="amount" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Charts;


