import NavbarUser from '../components/navbaruser';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// MANTRA ANTI-ERROR BUILD
export const dynamic = 'force-dynamic';

export default async function DaftarBelanjaPage() {
  const session = await getServerSession(authOptions);

  // 1. FIX ERROR createdAt: Kita ganti urutannya berdasarkan 'id' yang udah pasti ada di tabel
  const daftarBelanja = await prisma.daftarBelanja.findMany({
    orderBy: { id: 'desc' } 
  });

  // 2. Hitung Statistik Otomatis
  const totalMacamBarang = daftarBelanja.length;
  const totalEstimasiBiaya = daftarBelanja.reduce((sum, item) => sum + (item.estimasi_harga || 0), 0);

  // 3. Hitung jumlah barang yang statusnya masih "DIAJUKAN"
  const totalPending = daftarBelanja.filter(item => item.status === "DIAJUKAN").length;

  // Fungsi buat ngubah angka jadi format Rupiah (Rp)
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <NavbarUser />

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Daftar Pengadaan Barang</h1>
              <p className="text-sm text-slate-500">List logistik yang perlu dibeli beserta estimasi biayanya.</p>
            </div>
          </div>
          
          {/* Tombol Tambah Barang cuma muncul kalau login */}
          {session && (
            <Link href="/inventaris" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-orange-200">
              + Ajukan Barang
            </Link>
          )}
        </div>

        {/* KOTAK STATISTIK BELANJA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-blue-500">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Pengajuan</p>
              <h2 className="text-2xl font-bold text-slate-800">{totalMacamBarang} <span className="text-sm font-normal text-slate-500">Item</span></h2>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-orange-500">
            <div className="bg-orange-50 p-4 rounded-full text-orange-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Estimasi Dana</p>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{formatRupiah(totalEstimasiBiaya)}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-amber-500">
            <div className="bg-amber-50 p-4 rounded-full text-amber-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Status Menunggu</p>
              <h2 className="text-2xl font-bold text-slate-800">{totalPending} <span className="text-sm font-normal text-slate-500">Item</span></h2>
            </div>
          </div>
        </div>

        {/* TABEL DAFTAR BELANJA */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase rounded-lg">
                <tr>
                  <th className="px-5 py-4 rounded-l-lg font-bold">Nama Barang</th>
                  <th className="px-5 py-4 font-bold">Jumlah</th>
                  <th className="px-5 py-4 font-bold">Estimasi Harga</th>
                  <th className="px-5 py-4 font-bold max-w-[200px]">Alasan Kebutuhan</th>
                  <th className="px-5 py-4 rounded-r-lg font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {daftarBelanja.length > 0 ? (
                  daftarBelanja.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-800">{item.nama_barang}</td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{item.jumlah} Unit</td>
                      {/* FIX ERROR ESTIMASI HARGA: Ditambahin || 0 biar kalau null jadi nol */}
                      <td className="px-5 py-4 font-bold text-orange-600">{formatRupiah(item.estimasi_harga || 0)}</td>
                      <td className="px-5 py-4 text-slate-500 truncate max-w-[200px]" title={item.alasan || "-"}>
                        {item.alasan || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider
                          ${item.status === 'DIBELI' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        <p className="text-slate-500 font-medium">Belum ada daftar barang yang perlu dibeli.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}