import Link from "next/link";
import NavbarUser from "./components/navbaruser";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import TombolTerimaKembali from "./components/tombolterimakembali";

export const revalidate = 0; // Biar data selalu fresh

export default async function DashboardLogistik() {
  const session = await getServerSession(authOptions);

  // --- 1. TARIK DATA STATISTIK REAL-TIME DARI DATABASE ---
  const totalMacamBarang = await prisma.barang.count();
  
  const peminjamanAktif = await prisma.peminjaman.findMany({
    where: { status: "DIPINJAM" },
    include: { barang: true }, // Relasi buat nampilin nama barang
    orderBy: { tanggal_pinjam: 'desc' }
  });
  
  // Hitung total unit yang sedang ada di luar
  const totalSedangDipinjam = peminjamanAktif.reduce((sum, item) => sum + item.jumlah_pinjam, 0);

  // Hitung barang yang kondisinya Perlu Cek atau Rusak
  const perluPengecekan = await prisma.barang.count({
    where: { OR: [{ kondisi: 'Perlu Cek' }, { kondisi: 'Rusak' }] }
  });

  // --- 2. TARIK PREVIEW INVENTARIS ---
  const inventaris = await prisma.barang.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <NavbarUser />

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        
        {/* KOTAK STATISTIK DINAMIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-emerald-500">
            <div className="bg-emerald-50 p-4 rounded-full text-emerald-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Macam Barang</p>
              <h2 className="text-2xl font-bold text-slate-800">{totalMacamBarang} <span className="text-sm font-normal text-slate-500">Item</span></h2>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-amber-500">
            <div className="bg-amber-50 p-4 rounded-full text-amber-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Sedang Dipinjam</p>
              <h2 className="text-2xl font-bold text-slate-800">{totalSedangDipinjam} <span className="text-sm font-normal text-slate-500">Unit</span></h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-red-500">
            <div className="bg-red-50 p-4 rounded-full text-red-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Perlu Pengecekan</p>
              <h2 className="text-2xl font-bold text-slate-800">{perluPengecekan} <span className="text-sm font-normal text-slate-500">Unit</span></h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Peminjaman Berjalan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Status Peminjaman Aktif</h2>
                {session && (
                  <Link href="/peminjaman" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                    + Catat Peminjaman
                  </Link>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Peminjam</th>
                      <th className="px-4 py-3">Barang & Jumlah</th>
                      <th className="px-4 py-3">Tgl Pinjam</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      {session && <th className="px-4 py-3 rounded-r-lg text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {peminjamanAktif.length > 0 ? peminjamanAktif.map((pinjam) => (
                      <tr key={pinjam.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-bold text-slate-800">{pinjam.nama_peminjam}</td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-700">{pinjam.barang?.nama || "Barang Dihapus"}</p>
                          <p className="text-xs text-slate-500">{pinjam.jumlah_pinjam} Unit</p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {new Date(pinjam.tanggal_pinjam).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-xs font-bold uppercase">Dipinjam</span>
                        </td>
                        {session && (
                          <td className="px-4 py-4 text-center">
                            <TombolTerimaKembali 
                            id={pinjam.id} 
                            namaBarang={pinjam.barang?.nama || "Barang"} 
                               />
                                </td>
                                  )}
                       
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-500">Belum ada barang yang dipinjam.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Inventaris */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Cek Inventaris</h2>
                <Link href="/semua-barang" className="text-sm font-bold text-orange-600 hover:underline">Lihat Semua</Link>
              </div>

              <div className="space-y-4">
                {inventaris.length > 0 ? inventaris.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{item.nama}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sisa: <span className={`font-bold ${item.stok_tersedia === 0 ? 'text-red-600' : 'text-emerald-600'}`}>{item.stok_tersedia}</span> dari {item.total_stok}
                      </p>
                    </div>
                    {item.kondisi === "Baik" ? (
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    )}
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 text-center py-4">Belum ada barang.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}