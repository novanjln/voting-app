import { useEffect, useState } from "react";
import { Send, FileSpreadsheet, Download, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
    if (hasSeenPopup) setShowPopup(false);
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  // Ambil data laporan dari API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    };
    fetchReports();
  }, []);

  // Kirim laporan baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !region || !description) return alert("Isi semua kolom dulu ya!");

    try {
      const payload = { type: "report", name, region, description };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal kirim laporan");

      setReports([...reports, { ...payload, id: data.id }]);
      setName("");
      setRegion("");
      setDescription("");
      alert("Laporan berhasil dikirim!");
    } catch (err) {
      console.error(err);
      alert("Gagal kirim laporan. Coba lagi.");
    }
  };

  // Export Excel
  const exportToExcel = () => {
    if (reports.length === 0) return alert("Belum ada data untuk diexport!");
    const worksheet = XLSX.utils.json_to_sheet(reports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "laporan-politik-uang.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-poppins">
      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden w-96">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-lg font-bold"
            >
              ✕
            </button>
            <img src="/popup-banner.jpg" alt="Popup" className="w-full h-auto" />
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gradient-to-r from-ipbBlue to-ipbGreen text-white py-8 shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-wide">
            Pengaduan Praktik Kotor Politik Uang
          </h1>
          <p className="text-sm opacity-90 mt-2">Suara Mahasiswa IPB untuk Demokrasi Tanpa Suap 🌿💙</p>
          <div className="flex justify-center mt-4">
            <img src="/ipb-logo.png" alt="Logo IPB" className="w-20 h-auto drop-shadow-lg" />
          </div>
        </div>
      </header>

      {/* FORM */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 transition hover:shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-ipbBlue flex items-center gap-2">
            <AlertCircle className="w-6 h-6" /> Form Pengaduan
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-1">Nama Pelapor</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ipbGreen"
                placeholder="Masukkan nama kamu (boleh disamarkan)"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Wilayah</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ipbGreen"
                placeholder="Contoh: Bogor Barat"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Deskripsi Pengaduan</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ipbGreen"
                placeholder="Tuliskan detail dugaan praktik politik uang"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-ipbBlue to-ipbGreen text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <Send className="w-5 h-5" /> Kirim Pengaduan
            </button>
          </form>
        </div>

        {/* TABEL HASIL */}
        {reports.length > 0 && (
          <div className="mt-10 bg-white shadow-xl rounded-2xl p-6 border border-gray-100 transition hover:shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-ipbBlue flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" /> Data Pengaduan
              </h2>
              <button
                onClick={exportToExcel}
                className="bg-gradient-to-r from-ipbGreen to-ipbBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
              >
                <Download className="w-5 h-5" /> Export Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-ipbBlue text-white">
                    <th className="p-3 text-left">Nama</th>
                    <th className="p-3 text-left">Wilayah</th>
                    <th className="p-3 text-left">Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-100">
                      <td className="p-3">{r.name}</td>
                      <td className="p-3">{r.region}</td>
                      <td className="p-3">{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 text-sm py-8">
        <p>© 2025 Kolaborasi Mahasiswa IPB untuk Demokrasi Bersih</p>
      </footer>
    </div>
  );
}