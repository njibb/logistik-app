import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// FUNGSI UPDATE DATA (PUT)
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Akses Ditolak" }, { status: 401 });

  try {
    // FIX NEXT.JS 15: Params harus di-await
    const params = await context.params;
    const id = params.id;
    
    const data = await req.json();
    await prisma.barang.update({
      where: { id: id },
      data: {
        nama: data.nama,
        kategori: data.kategori,
        stok_tersedia: Number(data.stok_tersedia),
        total_stok: Number(data.total_stok),
        kondisi: data.kondisi,
      }
    });
    return NextResponse.json({ success: true, pesan: "Data berhasil diupdate!" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// FUNGSI HAPUS DATA (DELETE)
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Akses Ditolak" }, { status: 401 });

  try {
    // FIX NEXT.JS 15: Params harus di-await
    const params = await context.params;
    const id = params.id;

    await prisma.barang.delete({
      where: { id: id }
    });
    return NextResponse.json({ success: true, pesan: "Data berhasil dihapus!" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}