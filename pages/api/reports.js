// pages/api/reports.js
export default async function handler(req, res) {
  const SHEET_API =
    "https://script.google.com/macros/s/AKfycbyIR_CyheUoy4z8M0XA_sYA89rl5PFMCFYjNmDhfQam4gRWxH6CyBLPSplF2QNe_s6L/exec";

  try {
    if (req.method === "GET") {
      const response = await fetch(SHEET_API);
      const data = await response.json(); // harus JSON dari Apps Script
      res.status(200).json(data);
    } else if (req.method === "POST") {
      const { name, region, description } = req.body;

      if (!name || !region || !description) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const newReport = {
        type: "report", // penting biar Apps Script tahu ini laporan baru
        name,
        region,
        description,
      };

      const response = await fetch(SHEET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });

      const result = await response.json();

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      // kembalikan data laporan baru termasuk ID
      res.status(200).json({
        id: result.id,
        name,
        region,
        description,
      });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}