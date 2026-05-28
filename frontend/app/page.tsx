import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111] text-gray-200 flex flex-col items-center justify-center gap-8 font-sans">
      <h1 className="text-3xl font-bold tracking-wide">ニコニココメント</h1>
      <div className="flex gap-4">
        <Link
          href="/display"
          className="px-8 py-4 bg-[#222] border border-[#444] rounded-xl text-lg hover:bg-[#333] transition-colors"
        >
          表示ページ
        </Link>
        <Link
          href="/input"
          className="px-8 py-4 bg-red-600 rounded-xl text-lg font-bold hover:bg-red-700 transition-colors"
        >
          入力ページ
        </Link>
      </div>
    </div>
  );
}
