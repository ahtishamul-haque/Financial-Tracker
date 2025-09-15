import React, { useState } from "react";
import axios from "axios";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
    } catch {
      setMessage("Upload failed");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Upload Bank Statement</h2>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={handleUpload}
        className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
      >
        Upload
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}

export default UploadForm;
