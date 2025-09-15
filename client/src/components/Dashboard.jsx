import React, { useState } from "react";
import axios from "axios";
import Charts from "./Charts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // states for totals
  const [categoryTotals, setCategoryTotals] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post(`${API_URL}/api/parse`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTransactions(res.data.transactions);

      // Set totals
      setCategoryTotals(res.data.categoryTotals || {});
      const total = Object.values(res.data.categoryTotals || {}).reduce(
        (sum, val) => sum + val,
        0
      );
      setGrandTotal(total);
    } catch (err) {
      console.error(err);
      setError("Failed to parse PDF. Check file format.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8">
        {/* Upload */}
        <div
          className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8"
          style={{ marginLeft: "50px" }}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full md:w-96 text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer focus:outline-none px-3 py-2"
          />
          <button
            onClick={handleParse}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition duration-200 disabled:opacity-50"
            style={{ marginLeft: "30px", borderRadius: "10px" }}
          >
            {loading ? "Loading.." : "Show"}
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Total Spending */}
        {grandTotal > 0 && (
          <div className="text-center text-2xl font-bold text-blue-700 mb-6" style={{ marginLeft: "50px" }}>
            <h2><u>Total Spent</u>: ₹{grandTotal.toLocaleString("en-IN",{
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</h2>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto mb-8" style={{ marginTop: "50px" }}>
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 border"><u>Vendor</u></th>
                <th className="px-4 py-3 border">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<u>Amount</u>
                </th>
                <th className="px-4 py-3 border">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<u>Category</u>
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No transactions yet. Upload a PDF.
                  </td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-2 border font-medium">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t.vendor}
                    </td>
                    <td className="px-4 py-2 border font-medium text-green-600">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      ₹{t.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {t.category || "Other"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Charts */}
        {transactions.length > 0 && (
          <div className="mt-6">
            <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
              &nbsp;&nbsp;Overview
            </h1>
            <Charts transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
