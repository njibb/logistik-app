import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Akses Ditolak" }, { status: 401 });

  try {
    // FIX NEXT.JS 15: Params harus di-await
    const params = await context.params;
    const id = params.id;

    // 1. Cari data peminjaman yang mau dikembalikan
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id: id }
    });

    if (!peminjaman || peminjaman.status === "DIKEMBALIKAN") {
      return NextResponse.json({ error: "Data tidak ditemukan atau sudah dikembalikan." }, { status: 400 });
    }

    // 2. Gunakan $transaction biar eksekusi update status & balikin stok jalan bersamaan (aman dari bug)
    await prisma.$transaction([
      // Ubah status peminjaman
      prisma.peminjaman.update({
        where: { id: id },
        data: { status: "DIKEMBALIKAN" }
      }),
      // Balikin stok barang ke inventaris
      prisma.barang.update({
        where: { id: peminjaman.barangId },
        data: { stok_tersedia: { increment: peminjaman.jumlah_pinjam } }
      })
    ]);

    return NextResponse.json({ success: true, pesan: "Barang berhasil diterima!" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses pengembalian." }, { status: 500 });
  }
}