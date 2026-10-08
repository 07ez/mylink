export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-700 shadow-inner dark:bg-zinc-800 dark:text-zinc-200">
          이
        </div>
        <h1 className="text-2xl font-bold tracking-tight">이지환</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 break-keep">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다,
        </p>
      </div>
    </main>
  );
}

