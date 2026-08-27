import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#12203A] text-[#faeeda] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 mb-4 rounded-full bg-[#fac775]/20 border-2 border-[#fac775] flex items-center justify-center text-4xl shadow-xl">
        🏮
      </div>
      <h1 className="text-4xl font-extrabold text-[#fac775] mb-2">404</h1>
      <h2 className="text-xl font-bold text-white mb-2">Trang Không Tồn Tại</h2>
      <p className="text-xs text-white/70 max-w-sm mb-6">
        Chiếc đèn lồng ước mơ này dường như đã bay lạc vào bầu trời không gian khác.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-full bg-[#993c1d] hover:bg-[#712b13] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về trang chủ Deploy Ước Mơ</span>
      </Link>
    </div>
  );
}
