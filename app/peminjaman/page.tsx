'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavbarUser from '../components/navbaruser';
import Link from 'next/link';

export default function PeminjamanPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [daftarBarang, setDaftarBarang] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_peminjam: '',
    barangId: '',
    jumlah_pinjam: '',
    keterangan: ''
  });

  // Tarik data barang otomatis pas halaman dibuka
  useEffect(() => {
    fetch('/api/barang')
      .then(res => res.json())
      .then(data => {
        setDaftarBarang(data);
        if(data.length > 0) setFormData(prev => ({...prev, barangId: data[0].id}));
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/peminjaman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await res.json();
    if (res.ok) {
      router.push('/');
      router.refresh(); // Biar dashboard langsung update!
    } else {
      alert(result.error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <NavbarUser />

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Catat Peminjaman</h1>
            <p className="text-sm text-slate-500">Form untuk mencatat barang keluar dari inventaris.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2 ml-1">Nama Peminjam / Divisi</label>
              <input type="text" value={formData.nama_peminjam} onChange={(e) => setFormData({...formData, nama_peminjam: e.target.value})} placeholder="Contoh: Dandi (Acara)" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-orange-500 outline-none" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-700 uppercase mb-2 ml-1">Pilih Barang</label>
                <select value={formData.barangId} onChange={(e) => setFormData({...formData, barangId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-orange-500 outline-none" required>
                  {daftarBarang.map(b => (
                    <option key={b.id} value={b.id}>{b.nama} (Sisa: {b.stok_tersedia})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2 ml-1">Jumlah</label>
                <input type="number" min="1" value={formData.jumlah_pinjam} onChange={(e) => setFormData({...formData, jumlah_pinjam: e.target.value})} placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-orange-500 outline-none" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2 ml-1">Keterangan Tambahan (Opsional)</label>
              <textarea value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} placeholder="Keperluan peminjaman..." rows={2} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-orange-500 outline-none"></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 disabled:opacity-70">
                {loading ? 'Menyimpan...' : 'Catat Peminjaman'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}