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
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  // Bar Chart:
  const groupedTotals = {};
  validTransactions.forEach((t) => {
    const dateObj = parseDateSafely(t.date);
    let fullLabel = "";
    if (granularity === "day") fullLabel = formatDay(dateObj);
    else if (granularity === "week") {
      const monday = getMonday(dateObj);
      fullLabel = formatDay(monday);
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

  // Insights
  const totalDisplayed = adjustedPieData.reduce((sum, d) => sum + d.displayValue, 0);
  const [topCategoryData] = [...adjustedPieData].sort((a, b) => b.displayValue - a.displayValue);

  // Insight 1
  const percentOriginal = totalDisplayed
    ? ((topCategoryData.displayValue / totalDisplayed) * 100).toFixed(0)
    : 0;
  const peerPercent = 18;
  const insight1 = `- You spend ${percentOriginal}% of your income on ${topCategoryData.name}, compared to the average ${peerPercent}% in your peer group.`;

  // Insight 2
  const highestEntry = Object.entries(filledTotals).reduce(
    (prev, curr) => (curr[1] > prev[1] ? curr : prev),
    ["", 0]
  );
  let periodLabel = highestEntry[0];
  if (granularity === "day") {
    const [y, m, d] = periodLabel.split("-");
    periodLabel = `${d} ${new Date(y, m - 1, d).toLocaleString("default", { month: "short" })}`;
  } else if (granularity === "week") {
    const [y, m, d] = periodLabel.split("-");
    const date = new Date(y, m - 1, d);
    periodLabel = `W${getWeekNumber(date)} ${date.toLocaleString("default", { month: "short" })}`;
  } else if (granularity === "month") {
    periodLabel = new Date(periodLabel + "-01").toLocaleString("default", { month: "long" });
  }
  const insight2 = `- Your spends in ${periodLabel} were the highest ₹${highestEntry[1].toLocaleString()}.`;

  // Insight 3
  const avgSpend = Math.round(total / validTransactions.length);
  const insight3 = `- Your average spend per transaction is ₹${avgSpend.toLocaleString()}.`;

  // Insight 4
  const lowestEntry = Object.entries(filledTotals).reduce(
    (prev, curr) => (curr[1] < prev[1] ? curr : prev),
    ["", Infinity]
  );
  let lowestLabel = lowestEntry[0];
  if (granularity === "day") {
    const [y, m, d] = lowestLabel.split("-");
    lowestLabel = `${d} ${new Date(y, m - 1, d).toLocaleString("default", { month: "short" })}`;
  } else if (granularity === "week") {
    const [y, m, d] = lowestLabel.split("-");
    const date = new Date(y, m - 1, d);
    lowestLabel = `W${getWeekNumber(date)} ${date.toLocaleString("default", { month: "short" })}`;
  } else if (granularity === "month") {
    lowestLabel = new Date(lowestLabel + "-01").toLocaleString("default", { month: "long" });
  }
  const insight4 = `- Your lowest spend was in ${lowestLabel} ₹${lowestEntry[1].toLocaleString()}.`;

  // Insight 5
  const topTwo = [...adjustedPieData].sort((a, b) => b.displayValue - a.displayValue).slice(0, 2);
  const combinedPercent = (
    ((topTwo[0].displayValue + topTwo[1].displayValue) / totalDisplayed) *
    100
  ).toFixed(0);
  const insight5 = `- Your top 2 categories make up ${combinedPercent}% of your total spending.`;

  // Insight 6
  const insight6 = `- You made total ${validTransactions.length} transactions.`;

  // Insight 7
  const insight7 = `- You spent the most in ${topCategoryData.name} with ₹${topCategoryData.actualValue.toLocaleString()}.`;

  // Insight 8
  const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24) + 1;
  const avgPerDay = Math.round(total / totalDays);
  const insight8 = `- Your average daily spend is ₹${avgPerDay.toLocaleString()}.`;

  // Insight 9
  const months = Object.values(filledTotals);
  let growth = "N/A";
  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];
    if (prev > 0) {
      growth = (((last - prev) / prev) * 100).toFixed(1) + "%";
    }
  }
  const insight9 = `- Your last period spending changed by ${growth} compared to the previous.`;

  // Insight 10
  const avgPerCategory = (total / Object.keys(categoryTotals).length).toFixed(0);
  const insight10 = `- On average, you spend ₹${avgPerCategory} per category.`;

  // Insight 11
  const medianSpend = (() => {
    if (validTransactions.length === 0) return 0;
    const sorted = validTransactions.map((t) => t.amount).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  })();
  const insight11 = `- Median spend per transaction is ₹${medianSpend.toLocaleString()}.`;

  // Insight 12:
  const largestTxn = validTransactions.length
    ? validTransactions.reduce((max, t) => (t.amount > max.amount ? t : max), validTransactions[0])
    : { amount: 0, date: null };
  let largestTxnDate = "";
  if (largestTxn && largestTxn.date) {
    const d = parseDateSafely(largestTxn.date);
    largestTxnDate = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
  }
  const insight12 = `- Your largest single transaction was ₹${largestTxn.amount.toLocaleString()}${largestTxnDate ? ` on ${largestTxnDate}` : ""}.`;

  // Insight 13:
  const smallestTxn = validTransactions.length
    ? validTransactions.reduce((min, t) => (t.amount < min.amount ? t : min), validTransactions[0])
    : { amount: 0, date: null };
  let smallestTxnDate = "";
  if (smallestTxn && smallestTxn.date) {
    const d = parseDateSafely(smallestTxn.date);
    smallestTxnDate = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
  }
  const insight13 = `- Your smallest transaction was ₹${smallestTxn.amount.toLocaleString()}${smallestTxnDate ? ` on ${smallestTxnDate}` : ""}.`;

  // Insight 14:
  const weekendSpend = validTransactions
    .filter((t) => {
      const day = parseDateSafely(t.date).getDay();
      return day === 0 || day === 6;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  const weekdaySpend = total - weekendSpend;
  const insight14 = `- Weekend vs weekday spend: ₹${weekendSpend.toLocaleString()} vs ₹${weekdaySpend.toLocaleString()}.`;

  // Insight 15:
  const avgPerWeek = Math.round(total / (totalDays / 7 || 1));
  const insight15 = `- Weekly average spend is ₹${avgPerWeek.toLocaleString()}.`;

  // Insight 16:
  const busiestDayCountMap = validTransactions.reduce((acc, t) => {
    const dayName = parseDateSafely(t.date).toLocaleDateString("default", { weekday: "long" });
    acc[dayName] = (acc[dayName] || 0) + 1;
    return acc;
  }, {});
  const busiestDayEntry = Object.entries(busiestDayCountMap).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const insight16 = `- You made the most transactions on ${busiestDayEntry[0]} (${busiestDayEntry[1]} transactions).`;

  // Insight 17:
  const uniqueCategories = Object.keys(categoryTotals).length;
  const insight17 = `- You spent across ${uniqueCategories} different categories.`;

  // Insight 18:
  const avgTransactionPerDay = (validTransactions.length / (totalDays || 1)).toFixed(2);
  const insight18 = `- You made on average ${avgTransactionPerDay} transactions per day.`;

  // Insight 19:
  const spendStdDev = (() => {
    if (validTransactions.length === 0) return 0;
    const mean = total / validTransactions.length;
    const variance =
      validTransactions.reduce((sum, t) => sum + Math.pow(t.amount - mean, 2), 0) / validTransactions.length;
    return Math.round(Math.sqrt(variance));
  })();
  const insight19 = `- Standard deviation of transactions: ₹${spendStdDev}.`;

  // Insight 20:
  const top3Categories = [...adjustedPieData].sort((a, b) => b.displayValue - a.displayValue).slice(0, 3);
  const top3Share = totalDisplayed ? ((top3Categories.reduce((s, c) => s + c.displayValue, 0) / totalDisplayed) * 100).toFixed(0) : 0;
  const insight20 = `- Your top 3 categories account for ${top3Share}% of spending.`;

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
            <Tooltip
              formatter={(value, name, props) => `₹${props.payload.actualValue.toLocaleString()}`}
            />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart + Insights */}
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
        <p className="text-center mt-4 font-semibold text-gray-600">{insight1}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight2}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight3}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight4}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight5}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight6}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight7}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight8}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight9}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight10}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight11}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight12}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight13}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight14}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight15}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight16}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight17}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight18}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight19}</p>
        <p className="text-center mt-2 font-semibold text-gray-600">{insight20}</p>
      </div>
    </div>
  );
}

export default Charts;


