'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TombolTerimaKembali({ id, namaBarang }: { id: string, namaBarang: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleTerima = async () => {
    const konfirmasi = window.confirm(`Konfirmasi: Terima kembali barang ${namaBarang} ke gudang?`);
    if (!konfirmasi) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/peminjaman/${id}`, {
        method: 'PUT',
      });

      if (res.ok) {
        // Otomatis refresh dashboard kalau sukses
        router.refresh(); 
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memproses.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleTerima} 
      disabled={loading}
      className="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Proses...' : 'Terima Kembali'}
    </button>
  );
}