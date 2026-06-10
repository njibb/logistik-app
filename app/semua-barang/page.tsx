import NavbarUser from '../components/navbaruser';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AksiBarang from '../components/aksibarang'; // IMPORT KOMPONEN AKSI

export const revalidate = 0; 

export default async function SemuaBarangPage() {
  const session = await getServerSession(authOptions); // Cek login status
  
  const daftarBarang = await prisma.barang.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <NavbarUser />

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Semua Data Inventaris</h1>
              <p className="text-sm text-slate-500">Daftar lengkap seluruh barang logistik yang terdaftar.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase rounded-lg">
                <tr>
                  <th className="px-5 py-4 rounded-l-lg font-bold">Nama Barang</th>
                  <th className="px-5 py-4 font-bold">Kategori</th>
                  <th className="px-5 py-4 font-bold">Stok Tersedia</th>
                  <th className="px-5 py-4 font-bold">Total Fisik</th>
                  <th className="px-5 py-4 font-bold">Kondisi</th>
                  {/* Kolom aksi cuma muncul kalau udah login */}
                  {session && <th className="px-5 py-4 rounded-r-lg font-bold">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {daftarBarang.length > 0 ? (
                  daftarBarang.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-800">{item.nama}</td>
                      <td className="px-5 py-4 text-slate-600">{item.kategori}</td>
                      <td className="px-5 py-4">
                        <span className={`font-bold ${item.stok_tersedia === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {item.stok_tersedia} Unit
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.total_stok} Unit</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider
                          ${item.kondisi === 'Baik' ? 'bg-emerald-100 text-emerald-700' : 
                            item.kondisi === 'Rusak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {item.kondisi}
                        </span>
                      </td>
                      {/* Tombol aksi cuma muncul kalau udah login */}
                      {session && (
                        <td className="px-5 py-4">
                          <AksiBarang barang={item} />
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500 font-medium">
                      Belum ada data barang. Silakan tambahkan barang baru.
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