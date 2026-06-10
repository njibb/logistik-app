import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// --- FUNGSI POST: Untuk Tambah Barang (Inventaris & Daftar Belanja) ---
export async function POST(req: Request) {
  // Cek apakah yang akses benar-benar pengurus yang udah login
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Akses Ditolak. Silakan login!" }, { status: 401 });
  }

  const data = await req.json();

  try {
    if (data.status_ketersediaan === "PERLU_DIBELI") {
      // Masuk ke tabel Daftar Belanja
      await prisma.daftarBelanja.create({
        data: {
          nama_barang: data.nama,
          jumlah: parseInt(data.jumlah),
          estimasi_harga: data.estimasi_harga ? parseInt(data.estimasi_harga) : 0,
          alasan: data.keterangan || "Pengadaan Logistik Baru",
          status: "DIAJUKAN"
        }
      });
    } else {
      // Masuk ke tabel Inventaris Barang
      await prisma.barang.create({
        data: {
          nama: data.nama,
          kategori: data.kategori || "Lainnya",
          total_stok: parseInt(data.jumlah),
          stok_tersedia: parseInt(data.jumlah),
          kondisi: data.kondisi || "Baik",
        }
      });
    }
    return NextResponse.json({ success: true, pesan: "Berhasil ditambahkan!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan data ke database" }, { status: 500 });
  }
}

// --- FUNGSI GET: Untuk Mengambil Data Barang di Form Peminjaman ---
export async function GET() {
  try {
    // Hanya ambil barang yang stoknya masih ada (> 0) biar yang habis nggak bisa dipinjam
    const barangTersedia = await prisma.barang.findMany({
      where: { stok_tersedia: { gt: 0 } },
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(barangTersedia);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat barang" }, { status: 500 });
  }
}