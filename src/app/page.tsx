export default function Home() {
  const links = [
    {
      title: "GitHub",
      description: "github.com/07ez",
      url: "https://github.com/07ez",
      badge: "Visit",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      ),
    },
    {
      title: "프로젝트 & 작업물",
      description: "포트폴리오 모아보기",
      url: "https://github.com/07ez?tab=repositories",
      badge: "Projects",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
  ];

  const tags = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vibe Coding"];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      {/* 부드러운 배경 블러 데코레이션 */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl dark:from-indigo-600/15 dark:via-purple-600/15 dark:to-pink-600/15" />
      </div>

      <div className="w-full max-w-md">
        {/* 메인 프로필 카드 */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-8 shadow-xl shadow-zinc-200/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:shadow-none">
          {/* 아바타 영역 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-lg shadow-indigo-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-3xl font-extrabold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                  이
                </div>
              </div>
              {/* 상태 뱃지 */}
              <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white dark:bg-zinc-900 dark:ring-zinc-900">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>

            {/* 이름 및 타이틀 */}
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              이지환
            </h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Junior Developer
            </p>

            {/* 소개글 */}
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 break-keep">
              아이디어를 코드로 구현하는 것을 즐기는 개발자입니다. 새로운 기술을 탐구하며 더 나은 웹 경험을 만들어갑니다.
            </p>

            {/* 기술 태그 */}
            <div className="mt-5 flex flex-wrap justify-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 링크 목록 */}
          <div className="mt-8 space-y-3">
            {links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-zinc-200/90 bg-white/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400">
                    {link.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {link.title}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {link.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>{link.badge}</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          © 2026 이지환. All rights reserved.
        </p>
      </div>
    </main>
  );
}


