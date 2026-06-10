'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AksiBarang({ barang }: { barang: any }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: barang.nama,
    kategori: barang.kategori,
    stok_tersedia: barang.stok_tersedia,
    total_stok: barang.total_stok,
    kondisi: barang.kondisi,
  });

  const hapusBarang = async () => {
    const konfirmasi = window.confirm(`Yakin mau menghapus ${barang.nama} dari inventaris?`);
    if (!konfirmasi) return;

    try {
      const res = await fetch(`/api/barang/${barang.id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus: " + data.error);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghapus data.");
    }
  };

  const simpanEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/barang/${barang.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Gagal mengupdate: " + data.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat mengupdate data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsModalOpen(true)} className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-amber-200">
          Edit
        </button>
        <button onClick={hapusBarang} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-200">
          Hapus
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Edit Data Barang</h2>
            
            <form onSubmit={simpanEdit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Barang</label>
                <input type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="Perlengkapan">Perlengkapan</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Konsumsi">Konsumsi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi</label>
                  <select value={formData.kondisi} onChange={(e) => setFormData({...formData, kondisi: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="Baik">Baik</option>
                    <option value="Perlu Cek">Perlu Cek</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stok Tersedia</label>
                  <input type="number" value={formData.stok_tersedia} onChange={(e) => setFormData({...formData, stok_tersedia: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Fisik</label>
                  <input type="number" value={formData.total_stok} onChange={(e) => setFormData({...formData, total_stok: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700">
                  {loading ? 'Menyimpan...' : 'Simpan Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}