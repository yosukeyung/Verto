import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export default function HomePage() {
  const waOrderUrl =
    'https://wa.me/6281234567890?text=' +
    encodeURIComponent('Halo Verto, saya ingin memesan tag NFC.')

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* 56px Navigation Header */}
      <Navbar
        rightAction={
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Masuk
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
            Satu Tag NFC untuk Berbagai Kebutuhan
          </h1>
          <div className="w-8 border-b border-indigo-600 mx-auto" />
          <p className="text-base text-gray-500 leading-normal max-w-sm mx-auto">
            Ubah tujuan dan fungsi tag fisik Anda kapan saja melalui dashboard web tanpa perlu memprogram ulang chip.
          </p>

          <div className="pt-2">
            <a
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 border-b border-indigo-700 shadow-sm"
            >
              <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <span>Pesan NFC Tag via WhatsApp</span>
            </a>
          </div>
        </section>

        {/* How it Works Section (Vertical Numbered List per DESIGN.md) */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold leading-tight text-gray-900">
            Bagaimana Cara Kerja?
          </h2>

          <ol className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Beli tag</p>
                <p className="text-gray-500 mt-0.5">
                  Dapatkan stiker anti-metal atau gantungan kunci ABS Verto melalui pemesanan WhatsApp.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Tap dan daftarkan</p>
                <p className="text-gray-500 mt-0.5">
                  Dekatkan smartphone Anda ke tag fisik untuk membuka tautan aktivasi unik tag Anda.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Atur tujuan, selesai</p>
                <p className="text-gray-500 mt-0.5">
                  Pilih mode yang diinginkan di dashboard: Social Mode, Lost & Found, atau Event Hub.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Available Modes Overview */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold leading-tight text-gray-900">
            Pilihan Mode Tag
          </h2>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm font-semibold text-gray-900">Social Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Tampilkan profil publik, kontak WhatsApp, Instagram, dan LinkedIn dalam satu tap.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm font-semibold text-gray-900">Lost & Found Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Proteksi kunci atau dompet dengan halaman kontak aman bagi penemu barang hilang.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm font-semibold text-gray-900">Event Hub Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Publikasikan tautan seminar, formulir pendaftaran, dan informasi kegiatan kampus.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">
          © Verto 2026. Hak cipta dilindungi.
        </p>
      </footer>
    </div>
  )
}
