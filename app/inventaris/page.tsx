'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavbarUser from '../components/navbaruser';
import Link from 'next/link';

export default function InventarisPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // State Form
  const [ketersediaan, setKetersediaan] = useState('SUDAH_ADA'); // SUDAH_ADA atau PERLU_DIBELI
  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState('');
  
  // State Khusus "Sudah Ada"
  const [kategori, setKategori] = useState('Perlengkapan');
  const [kondisi, setKondisi] = useState('Baik');
  
  // State Khusus "Perlu Dibeli"
  const [estimasiHarga, setEstimasiHarga] = useState('');
  const [alasan, setAlasan] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      status_ketersediaan: ketersediaan,
      nama,
      jumlah,
      kategori,
      kondisi,
      estimasi_harga: estimasiHarga,
      keterangan: alasan
    };

    try {
      const res = await fetch('/api/barang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Terlempar ke halaman utama kalau sukses
        router.push('/');
        router.refresh();
      } else {
        alert("Gagal menyimpan data!");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <NavbarUser />

      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manajemen Inventaris</h1>
            <p className="text-sm text-slate-500">Kelola ketersediaan barang dan pengajuan logistik.</p>
          </div>
        </div>

        {/* LOGIKA READ-ONLY: Kalau belum login, cuma disuruh login */}
        {!session ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Terkunci</h2>
            <p className="text-slate-500 mb-6">Anda harus login sebagai pengurus Divisi Logistik untuk menambah barang.</p>
            <Link href="/login" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors">
              Login Sekarang
            </Link>
          </div>
        ) : (
          /* JIKA SUDAH LOGIN, TAMPILKAN FORM */
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10"></div>
            
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Input Data Barang
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* TOGGLE PINTAR: Pilih Status Barang */}
              <div className="bg-slate-100/50 p-1.5 rounded-2xl flex relative w-full mb-6 border border-slate-100">
                <button
                  type="button"
                  onClick={() => setKetersediaan('SUDAH_ADA')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all z-10 ${ketersediaan === 'SUDAH_ADA' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sudah Ada (Gudang)
                </button>
                <button
                  type="button"
                  onClick={() => setKetersediaan('PERLU_DIBELI')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all z-10 ${ketersediaan === 'PERLU_DIBELI' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Perlu Dibeli (Pengadaan)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">Nama Barang</label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Tenda Terpal 4x6" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium" required />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">Jumlah</label>
                  <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Masukkan angka" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium" required min="1" />
                </div>

                {/* FORM DINAMIS: Berubah sesuai toggle di atas */}
                {ketersediaan === 'SUDAH_ADA' ? (
                  <>
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">Kategori</label>
                      <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium">
                        <option value="Perlengkapan">Perlengkapan</option>
                        <option value="Elektronik">Elektronik</option>
                        <option value="Konsumsi">Konsumsi</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">Kondisi Fisik</label>
                      <select value={kondisi} onChange={(e) => setKondisi(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium">
                        <option value="Baik">Baik</option>
                        <option value="Perlu Cek">Perlu Cek / Servis</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">Estimasi Total Harga (Rp)</label>
                      <input type="number" value={estimasiHarga} onChange={(e) => setEstimasiHarga(e.target.value)} placeholder="Contoh: 150000" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">Alasan Kebutuhan</label>
                      <textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Kenapa barang ini perlu dibeli?" rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-800 font-medium" required></textarea>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                  {loading ? 'Menyimpan Data...' : (ketersediaan === 'SUDAH_ADA' ? 'Simpan ke Inventaris' : 'Ajukan ke Daftar Belanja')}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </main>
  );
}