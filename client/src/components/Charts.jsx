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

// Get week number from a date
const getWeekNumber = (date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date - firstDay) / (1000 * 60 * 60 * 24);
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
};

// Format for month and day
const formatMonth = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// NEW: Safe date parser to handle inconsistent formats
const parseDateSafely = (rawDate) => {
  if (!rawDate) return null;

  // Format: DD-MM-YYYY
  const dmyMatch = rawDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return new Date(`${year}-${month}-${day}`);
  }

  // Format: MM/DD/YYYY
  const mdyMatch = rawDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    return new Date(`${year}-${month}-${day}`);
  }

  // Fallback: ISO or valid formats
  return new Date(rawDate);
};

function Charts({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-500 italic text-center">No data to display</p>;
  }

  // Validate transactions
  const validTransactions = transactions.filter((t) => {
    const d = parseDateSafely(t.date);
    const isValid = d instanceof Date && !isNaN(d.getTime());
    if (!isValid) {
      console.warn("Invalid date in transaction:", t);
    }
    return isValid;
  });

  console.log("Valid Transactions:", validTransactions);

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
  if (monthDiff >= 4) {
    granularity = "month";
  } else if (monthDiff >= 1) {
    granularity = "week";
  }

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
  const MIN_PERCENTAGE = 0.05;

  const adjustedPieData = pieData.map((d) => {
    const actualPercent = d.value / total;
    const displayValue =
      actualPercent < MIN_PERCENTAGE ? total * MIN_PERCENTAGE : d.value;
    return { ...d, displayValue, actualValue: d.value };
  });

  const PIE_COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#FF6666",
  ];

  // Bar Chart Data
  const groupedTotals = validTransactions.reduce((acc, t) => {
    const dateObj = parseDateSafely(t.date);
    let fullLabel = "";

    if (granularity === "day") {
      fullLabel = formatDay(dateObj);
    } else if (granularity === "week") {
      const week = getWeekNumber(dateObj);
      const year = dateObj.getFullYear();
      fullLabel = `W${week} ${year}`;
    } else if (granularity === "month") {
      fullLabel = formatMonth(dateObj);
    }

    acc[fullLabel] = (acc[fullLabel] || 0) + t.amount;
    return acc;
  }, {});

  const barData = Object.entries(groupedTotals)
    .map(([fullLabel, amount]) => {
      let label = fullLabel;

      if (granularity === "day") {
        const date = new Date(fullLabel);
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" });
        label = `${day} ${month}`;
      } else if (granularity === "week") {
        const [weekPart, year] = fullLabel.split(" ");
        const weekNum = parseInt(weekPart.replace("W", ""));
        const jan1 = new Date(year, 0, 1);
        const weekDate = new Date(jan1.setDate((weekNum - 1) * 7));
        const monthName = weekDate.toLocaleString("default", { month: "short" });
        label = `${weekPart} ${monthName}`;
      } else if (granularity === "month") {
        const date = new Date(fullLabel + "-01");
        label = date.toLocaleString("default", { month: "short" });
      }

      return { label, fullLabel, amount };
    })
    .sort((a, b) => {
      const parseDate = (item) => {
        if (granularity === "day") return new Date(item.fullLabel);
        if (granularity === "week") {
          const match = item.fullLabel.match(/W(\d+)\s(\d+)/);
          if (!match) return new Date();
          const [, week, year] = match;
          const jan1 = new Date(year, 0, 1);
          return new Date(jan1.setDate((week - 1) * 7));
        }
        if (granularity === "month") return new Date(item.fullLabel + "-01");
        return new Date();
      };

      return parseDate(a) - parseDate(b);
    });

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
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {adjustedPieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => {
                const actual = props.payload.actualValue;
                return `₹${actual.toLocaleString()}`;
              }}
            />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
          Spending by{" "}
          {granularity === "day"
            ? "Day"
            : granularity === "week"
            ? "Week"
            : "Month"}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barData}
            margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              angle={-30}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="amount" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Charts;

