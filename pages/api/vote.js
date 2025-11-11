const SHEET_API = process.env.SHEET_API || "https://script.google.com/macros/s/AKfycbyIR_CyheUoy4z8M0XA_sYA89rl5PFMCFYjNmDhfQam4gRWxH6CyBLPSplF2QNe_s6L/exec";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, voteType } = req.body;
    if (!id || !voteType) return res.status(400).json({ error: "Missing id or voteType" });

    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : (req.socket && req.socket.remoteAddress) || "unknown";

    const payload = { type: "vote", id: String(id), voteType, ip }; // ID string

    const r = await fetch(SHEET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    try {
      const data = JSON.parse(text);
      if (data.error === "already_voted") return res.status(409).json({ error: "already_voted" });
      if (data.error) return res.status(500).json({ error: data.error });

      res.status(200).json({ ok: true, result: data });
    } catch {
      return res.status(500).json({ error: "Apps Script returned non-JSON", raw: text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}