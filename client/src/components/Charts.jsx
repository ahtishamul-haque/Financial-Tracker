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

  // Pie: Category totals
  const categoryTotals = transactions.reduce((acc, t) => {
    const cat = t.category || "Other";
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
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Spending by Category:
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Spending by Vendor:
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendor" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Charts;
