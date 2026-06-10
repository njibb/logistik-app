import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Akses Ditolak" }, { status: 401 });

  try {
    const data = await req.json();

    // Pastikan angka benar-benar angka
    const jumlahPinjam = parseInt(data.jumlah_pinjam);

    // Cek stok dulu biar aman dari minus
    const barang = await prisma.barang.findUnique({ where: { id: data.barangId } });
    if (!barang || barang.stok_tersedia < jumlahPinjam) {
      return NextResponse.json({ error: "Gagal: Stok fisik tidak mencukupi!" }, { status: 400 });
    }

    // 1. Kurangi stok barang yang dipinjam
    await prisma.barang.update({
      where: { id: data.barangId },
      data: { stok_tersedia: { decrement: jumlahPinjam } }
    });

    // 2. Catat riwayat di tabel peminjaman
    await prisma.peminjaman.create({
      data: {
        nama_peminjam: data.nama_peminjam,
        barangId: data.barangId,
        jumlah_pinjam: jumlahPinjam,
        keterangan: data.keterangan || "Dipinjam untuk keperluan logistik",
        status: "DIPINJAM"
      }
    });

    return NextResponse.json({ success: true, pesan: "Berhasil dicatat!" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("ERROR PEMINJAMAN:", error);
    return NextResponse.json({ error: "Database error. Cek terminal VS Code." }, { status: 500 });
  }
}