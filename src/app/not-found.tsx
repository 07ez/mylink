import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8f9]">
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#eeeff1]">
        <div className="mx-auto flex h-14 max-w-[460px] items-center justify-between px-4 sm:px-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6600] text-white font-bold text-sm shadow-sm">
              M
            </div>
            <span className="text-base font-bold tracking-tight text-[#1a1c20]">
              MyLink
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px] rounded-[20px] bg-white p-8 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] border border-[#eeeff1] text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff2ec] text-[#ff6600] border border-[#ffd5c0]">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <span className="inline-block rounded-full bg-[#fff2ec] px-3 py-1 text-xs font-semibold text-[#e14d00]">
            404 Not Found
          </span>

          <h1 className="mt-3 text-xl font-bold text-[#1a1c20]">
            사용자를 찾을 수 없습니다
          </h1>
          <p className="mt-2 text-xs leading-[18px] text-[#868b94] break-keep">
            존재하지 않는 사용자이거나, 주소가 잘못 입력되었을 수 있습니다.
          </p>

          <Link
            href="/"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6600] py-3 text-xs font-bold text-white hover:bg-[#e14d00] transition-colors shadow-sm"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
