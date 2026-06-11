import Link from "next/link";
import NavbarUser from "./components/navbaruser";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import TombolTerimaKembali from "./components/tombolterimakembali";

export const revalidate = 0; // Biar data selalu fresh

export default async function DashboardLogistik() {
  const session = await getServerSession(authOptions);

  // --- 1. TARIK DATA STATISTIK REAL-TIME ---
  const totalMacamBarang = await prisma.barang.count();
  
  const peminjamanAktif = await prisma.peminjaman.findMany({
    where: { status: "DIPINJAM" },
    include: { barang: true },
    orderBy: { tanggal_pinjam: 'desc' }
  });
  
  const totalSedangDipinjam = peminjamanAktif.reduce((sum, item) => sum + item.jumlah_pinjam, 0);

  const perluPengecekan = await prisma.barang.count({
    where: { OR: [{ kondisi: 'Perlu Cek' }, { kondisi: 'Rusak' }] }
  });

  // (BARU) Hitung barang yang perlu dibeli
  const totalPerluDibeli = await prisma.daftarBelanja.count({
    where: { status: 'DIAJUKAN' }
  });

  // --- 2. TARIK PREVIEW TABEL (Maksimal 5 data terbaru) ---
  const inventaris = await prisma.barang.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  // (BARU) Tarik data daftar belanja untuk tabel bawah
  const daftarBelanjaPreview = await prisma.daftarBelanja.findMany({
    where: { status: 'DIAJUKAN' },
    take: 5,
    orderBy: { id: 'desc' }
  });

  // Fungsi format rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <NavbarUser />

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        
        {/* KOTAK STATISTIK DINAMIS (Sekarang jadi 4 Kolom) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-emerald-500">
            <div className="bg-emerald-50 p-3.5 rounded-full text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Barang</p>
              <h2 className="text-xl font-black text-slate-800 leading-none">{totalMacamBarang} <span className="text-sm font-medium text-slate-500">Item</span></h2>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-amber-500">
            <div className="bg-amber-50 p-3.5 rounded-full text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dipinjam</p>
              <h2 className="text-xl font-black text-slate-800 leading-none">{totalSedangDipinjam} <span className="text-sm font-medium text-slate-500">Unit</span></h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-red-500">
            <div className="bg-red-50 p-3.5 rounded-full text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Perlu Cek</p>
              <h2 className="text-xl font-black text-slate-800 leading-none">{perluPengecekan} <span className="text-sm font-medium text-slate-500">Unit</span></h2>
            </div>
          </div>

          {/* KOTAK BARU: PERLU DIBELI */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 border-l-4 border-l-blue-500">
            <div className="bg-blue-50 p-3.5 rounded-full text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Perlu Dibeli</p>
              <h2 className="text-xl font-black text-slate-800 leading-none">{totalPerluDibeli} <span className="text-sm font-medium text-slate-500">Item</span></h2>
            </div>
          </div>

        </div>

        {/* BARIS TENGAH: PEMINJAMAN & INVENTARIS KECIL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Kolom Kiri: Peminjaman Berjalan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Status Peminjaman Aktif</h2>
                {session && (
                  <Link href="/peminjaman" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-orange-200">
                    + Catat Peminjaman
                  </Link>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
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
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Dipinjam</span>
                        </td>
                        {session && (
                          <td className="px-4 py-4 text-center">
                            <TombolTerimaKembali id={pinjam.id} namaBarang={pinjam.barang?.nama || "Barang"} />
                          </td>
                        )}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-500 font-medium">Belum ada barang yang dipinjam.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Inventaris */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Cek Inventaris</h2>
                <Link href="/semua-barang" className="text-sm font-bold text-orange-600 hover:underline">Lihat Semua</Link>
              </div>

              <div className="space-y-3">
                {inventaris.length > 0 ? inventaris.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{item.nama}</h3>
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
                  <p className="text-sm text-slate-500 text-center py-4">Belum ada barang di gudang.</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* BARIS BAWAH: TABEL DAFTAR BARANG YANG HARUS DIBELI */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Daftar Pengadaan (Perlu Dibeli)</h2>
            </div>
            <Link href="/belanja" className="text-sm font-bold text-blue-600 hover:underline">Lihat Semua Belanjaan</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase rounded-lg">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg font-bold">Nama Barang</th>
                  <th className="px-4 py-3 font-bold">Jumlah</th>
                  <th className="px-4 py-3 font-bold">Estimasi Harga</th>
                  <th className="px-4 py-3 font-bold max-w-[200px]">Alasan Kebutuhan</th>
                  <th className="px-4 py-3 rounded-r-lg font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {daftarBelanjaPreview.length > 0 ? daftarBelanjaPreview.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-800">{item.nama_barang}</td>
                    <td className="px-4 py-4 text-slate-600">{item.jumlah} Unit</td>
                    <td className="px-4 py-4 font-bold text-orange-600">{formatRupiah(item.estimasi_harga || 0)}</td>
                    <td className="px-4 py-4 text-slate-500 truncate max-w-[200px]" title={item.alasan || "-"}>
                      {item.alasan || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-500 font-medium">Belum ada pengajuan barang baru.</td>
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