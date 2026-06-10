'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function NavbarUser() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initial = session?.user?.name?.[0] || "L";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-orange-200 shadow-lg transition-transform group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
                Irmala <span className="text-orange-600">Logistik</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">  
            {session ? (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                <Link href="/inventaris" className="text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors border border-orange-100">
                  + Tambah Barang
                </Link>

                <div className="text-right ml-2">
                  <p className="text-sm font-bold text-slate-800 leading-none">{session.user?.name}</p>
                  <p className="text-[10px] font-bold text-orange-600 uppercase mt-1 tracking-wider">Div. Logistik</p>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold hover:bg-orange-600 hover:text-white transition-all shadow-inner"
                >
                  {initial}
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
              >
                Login Pengurus
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 p-2">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 flex flex-col gap-4 shadow-xl">
          <Link href="/belanja" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-slate-700">
            Daftar Belanja
          </Link>
          
          {/* INI DIA FIX-NYA: Menu Tambah Barang buat di HP */}
          {session && (
            <Link href="/inventaris" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-orange-600">
              + Tambah Barang
            </Link>
          )}

          <hr className="border-gray-50 my-1" />
          
          {session ? (
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-left text-base font-bold text-red-600"
            >
              Keluar (Logout)
            </button>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-orange-600 text-white text-center py-3 rounded-xl font-bold"
            >
              Login Pengurus
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}