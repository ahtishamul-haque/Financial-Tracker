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

// Category Mapping
const mergedCategories = {
  groceries: "Essentials",
  food: "Essentials",
  shopping: "Shopping",
  travel: "Travel",
  bills: "Bills",
  entertainment: "Entertainment",
  medical: "Medical",
  services: "Services",
  other: "Other",
};

// Normalize category names
const normalizeCategory = (cat) => {
  if (!cat) return "Other";
  const lower = cat.toLowerCase();
  return mergedCategories[lower] || cat;
};

// Get week number
const getWeekNumber = (date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date - firstDay) / (1000 * 60 * 60 * 24);
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
};

// Formatters
const formatMonth = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

// Safe date parser
const parseDateSafely = (rawDate) => {
  if (!rawDate) return null;

  const dmyMatch = rawDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return new Date(`${year}-${month}-${day}`);
  }

  const mdyMatch = rawDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(rawDate);
};

// Get Monday of a given week
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
};

function Charts({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-500 italic text-center">No data to display</p>;
  }

  const validTransactions = transactions.filter((t) => {
    const d = parseDateSafely(t.date);
    return d instanceof Date && !isNaN(d.getTime());
  });

  const validDates = validTransactions.map((t) => parseDateSafely(t.date));
  if (validDates.length === 0) {
    return <p className="text-gray-500 italic text-center">No valid transaction dates found</p>;
  }

  const minDate = new Date(Math.min(...validDates));
  const maxDate = new Date(Math.max(...validDates));
  const monthDiff =
    maxDate.getFullYear() * 12 +
    maxDate.getMonth() -
    (minDate.getFullYear() * 12 + minDate.getMonth());

  let granularity = "day";
  if (monthDiff >= 4) granularity = "month";
  else if (monthDiff >= 1) granularity = "week";

  // Pie Chart Data
  const categoryTotals = validTransactions.reduce((acc, t) => {
    const cat = normalizeCategory(t.category);
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  const MIN_PERCENTAGE = 0.1;

  const adjustedPieData = pieData.map((d) => {
    const actualPercent = d.value / total;
    const displayValue = actualPercent < MIN_PERCENTAGE ? total * MIN_PERCENTAGE : d.value;
    return { ...d, displayValue, actualValue: d.value };
  });

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6666"];

  // Bar Chart: Ensure missing periods are filled
  const groupedTotals = {};
  validTransactions.forEach((t) => {
    const dateObj = parseDateSafely(t.date);
    let fullLabel = "";
    if (granularity === "day") fullLabel = formatDay(dateObj);
    else if (granularity === "week") {
      const monday = getMonday(dateObj);
      fullLabel = formatDay(monday); // use Monday as label
    } else if (granularity === "month") fullLabel = formatMonth(dateObj);

    groupedTotals[fullLabel] = (groupedTotals[fullLabel] || 0) + t.amount;
  });

  const filledTotals = {};
  if (granularity === "day") {
    let d = new Date(minDate);
    while (d <= maxDate) {
      const label = formatDay(d);
      filledTotals[label] = groupedTotals[label] || 0;
      d.setDate(d.getDate() + 1);
    }
  } else if (granularity === "week") {
    // Start from first Monday
    let d = getMonday(minDate);
    const lastMonday = getMonday(maxDate);
    while (d <= lastMonday) {
      const label = formatDay(d);
      filledTotals[label] = groupedTotals[label] || 0;
      d.setDate(d.getDate() + 7);
    }
  } else if (granularity === "month") {
    let d = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const lastMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    while (d <= lastMonth) {
      const label = formatMonth(d);
      filledTotals[label] = groupedTotals[label] || 0;
      d.setMonth(d.getMonth() + 1);
    }
  }

  const barData = Object.entries(filledTotals).map(([fullLabel, amount]) => {
    let label = fullLabel;
    if (granularity === "day") {
      const [year, month, day] = fullLabel.split("-");
      const date = new Date(year, month - 1, day);
      label = `${day} ${date.toLocaleString("default", { month: "short" })}`;
    } else if (granularity === "week") {
      const [year, month, day] = fullLabel.split("-");
      const date = new Date(year, month - 1, day);
      label = `W${getWeekNumber(date)} ${date.toLocaleString("default", { month: "short" })}`;
    } else if (granularity === "month") {
      const date = new Date(fullLabel + "-01");
      label = date.toLocaleString("default", { month: "short" });
    }
    return { label, fullLabel, amount };
  });

  // Key Insight
  const totalSpending = validTransactions.reduce((sum, t) => sum + t.amount, 0);
  const categoryTotalsOriginal = validTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const [topCategoryOriginal, topAmountOriginal] = Object.entries(categoryTotalsOriginal).reduce(
    (prev, curr) => (curr[1] > prev[1] ? curr : prev)
  );

  const percentOriginal = ((topAmountOriginal / totalSpending) * 100).toFixed(0);
  const peerPercent = 18;

  const insight = `You spend ${percentOriginal}% of your income on ${topCategoryOriginal}, compared to the average ${peerPercent}% in your peer group.`;

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
              data={adjustedPieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="displayValue"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {adjustedPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => `₹${props.payload.actualValue.toLocaleString()}`} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
          Spending by {granularity === "day" ? "Day" : granularity === "week" ? "Week" : "Month"}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="amount" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
        <h3>Key Insights</h3>
        <p className="text-center mt-4 font-semibold text-gray-600">{insight}</p>
      </div>
    </div>
  );
}

export default Charts;
