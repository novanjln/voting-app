// pages/api/vote.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SHEET_API = process.env.SHEET_API || "https://script.google.com/macros/s/AKfycbyIR_CyheUoy4z8M0XA_sYA89rl5PFMCFYjNmDhfQam4gRWxH6CyBLPSplF2QNe_s6L/exec";

  if (!SHEET_API) {
    console.error("SHEET_API undefined");
    return res.status(500).json({ error: "SHEET_API undefined" });
  }

  try {
    const body = req.body || {};
    console.log("/api/vote body:", body);

    const { id, voteType } = body;
    if (!id || !voteType) {
      return res.status(400).json({ error: "Missing id or voteType" });
    }

    // ambil IP (opsional)
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : (req.socket && req.socket.remoteAddress) || "unknown";

    // Kirim ke Apps Script, PAKSA type = "vote"
    const payload = { type: "vote", id: Number(id), voteType, ip };

    const r = await fetch(SHEET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // jika Apps Script mengembalikan HTML (error), tangani
    const text = await r.text();
    try {
      const data = JSON.parse(text);

      if (data.error === "already_voted") {
        return res.status(409).json({ error: "already_voted" });
      }
      if (data.error) {
        return res.status(500).json({ error: data.error });
      }

      return res.status(200).json({ ok: true, result: data });
    } catch (parseErr) {
      console.error("Apps Script returned non-JSON:", text);
      return res.status(500).json({ error: "Apps Script returned non-JSON", raw: text });
    }
  } catch (err) {
    console.error("/api/vote error:", err);
    return res.status(500).json({ error: err.message });
  }
}
