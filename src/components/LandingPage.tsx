"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const NAV_ITEMS = [
  { id: "interactive-demo", label: "미리보기" },
  { id: "features", label: "기능 소개" },
  { id: "how-it-works", label: "이용 방법" },
  { id: "usecases", label: "활용 사례" },
] as const;

export default function LandingPage({ onLogin, isLoggingIn }: LandingPageProps) {
  // 인터랙티브 데모 프리뷰용 클릭 카운트 상태 (방문자가 직접 눌러보며 체험)
  const [demoClicks, setDemoClicks] = useState<Record<string, number>>({
    link1: 42,
    link2: 19,
    link3: 31,
  });
  const [activeTab, setActiveTab] = useState<"dev" | "creator" | "career">("dev");
  const [activeNav, setActiveNav] = useState<string>("");
  const isProgrammaticScroll = useRef(false);
  const scrollFrameRef = useRef<number | null>(null);

  // 누르자마자 지체 없이 빠르게 "슉" 이동하는 스크롤 애니메이션
  const animateScrollTo = (targetY: number, duration = 320) => {
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
    }
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();
    isProgrammaticScroll.current = true;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(step);
      } else {
        isProgrammaticScroll.current = false;
        scrollFrameRef.current = null;
      }
    };

    scrollFrameRef.current = requestAnimationFrame(step);
  };

  // 상단 네비게이션 클릭 시 부드럽게 이동 & 주황색 활성화
  const handleNavClick = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveNav(id);
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 72;
    const rect = el.getBoundingClientRect();
    const targetY = Math.max(0, rect.top + window.scrollY - headerOffset);
    animateScrollTo(targetY);
  };

  // 스크롤 위치에 따라 현재 섹션 감지해 상단 글자 주황색 전환
  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;
      const viewportMiddle = window.scrollY + 200;
      let current = "";
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const bottom = top + el.offsetHeight;
        if (viewportMiddle >= top && viewportMiddle <= bottom) {
          current = item.id;
          break;
        }
      }
      if (current) {
        setActiveNav(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  const handleDemoClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDemoClicks((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const useCases = {
    dev: {
      name: "홍길동",
      role: "주니어 풀스택 개발자",
      bio: "기술과 코드로 세상의 문제를 해결합니다. 모던 웹과 DX에 관심이 많습니다.",
      avatar: "홍",
      avatarBg: "bg-[#fff2ec] text-[#ff6600]",
      chips: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Firebase"],
      links: [
        { id: "link1", title: "GitHub 프로필 및 프로젝트", url: "#", desc: "오픈소스 및 토이프로젝트 코드 모음", icon: "code" },
        { id: "link2", title: "기술 블로그 (Velog)", url: "#", desc: "배운 지식과 삽질 기록들", icon: "book" },
        { id: "link3", title: "인터랙티브 웹 포트폴리오", url: "#", desc: "직접 개발한 웹 서비스 체험하기", icon: "folder" },
      ],
    },
    creator: {
      name: "홍길동",
      role: "디지털 콘텐츠 크리에이터",
      bio: "디자인과 일상을 영상으로 기록합니다. 영감을 주는 이야기를 만듭니다.",
      avatar: "홍",
      avatarBg: "bg-purple-50 text-purple-600",
      chips: ["YouTube", "Figma", "Branding", "UI/UX", "Vlog"],
      links: [
        { id: "link1", title: "YouTube 채널 (구독 1.5만)", url: "#", desc: "매주 일요일 저녁 8시 새 영상 업로드", icon: "video" },
        { id: "link2", title: "Figma 디자인 템플릿 마켓", url: "#", desc: "무료 & 유료 디자인 리소스 배포", icon: "folder" },
        { id: "link3", title: "인스타그램 데일리 피드", url: "#", desc: "작업 비하인드와 일상 스냅", icon: "camera" },
      ],
    },
    career: {
      name: "홍길동",
      role: "프로덕트 매니저 (PM)",
      bio: "데이터와 사용자 경험을 기반으로 비즈니스 임팩트를 만듭니다.",
      avatar: "홍",
      avatarBg: "bg-blue-50 text-blue-600",
      chips: ["Product Management", "Data Driven", "SQL", "Agile", "B2B SaaS"],
      links: [
        { id: "link1", title: "LinkedIn 프로필", url: "#", desc: "경력 이력 및 네트워크 연결", icon: "briefcase" },
        { id: "link2", title: "브런치스토리 아티클", url: "#", desc: "스타트업 프로덕트 성장 스토리", icon: "book" },
        { id: "link3", title: "프로덕트 포트폴리오 (Notion)", url: "#", desc: "주요 프로젝트 케이스 스터디", icon: "folder" },
      ],
    },
  };

  const currentCase = useCases[activeTab];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1a1c20] selection:bg-[#ffd5c0] selection:text-[#e14d00] flex flex-col">
      {/* ── 상단 네비게이션 헤더 ── */}
      <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-[#eeeff1]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveNav("");
              animateScrollTo(0, 500);
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff6600] text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#1a1c20] leading-none">
                MyLink
              </span>
              <span className="text-[10px] font-medium text-[#868b94] leading-tight">
                나만의 올인원 프로필
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#555d6d]">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className={`relative py-1 transition-colors duration-200 ${
                    isActive
                      ? "text-[#ff6600] font-bold"
                      : "text-[#555d6d] hover:text-[#ff6600]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-[#ff6600] transition-transform duration-300 origin-center ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 rounded-full bg-[#1a1c20] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#ff6600] hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{isLoggingIn ? "로그인 중..." : "시작하기"}</span>
          </button>
        </div>
      </header>

      {/* ── 1. 히어로 섹션 (HERO SECTION) ── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* 부드러운 배경 블러 효과 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#ff6600]/15 to-amber-200/25 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* 좌측: 타이틀 및 콜투액션 */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2ec] border border-[#ffd5c0] px-3.5 py-1.5 text-xs font-semibold text-[#e14d00] shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#ff6600] animate-pulse" />
                <span>10초 만에 만드는 나만의 프로필 링크</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.15] text-[#1a1c20] break-keep">
                흩어져 있던 나의 모든 링크,
                <br />
                <span className="bg-gradient-to-r from-[#ff6600] via-[#ff7e2e] to-[#e14d00] bg-clip-text text-transparent">
                  MyLink 하나로 완벽하게.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#555d6d] leading-relaxed max-w-xl mx-auto lg:mx-0 break-keep">
                깃허브, 포트폴리오, 블로그, SNS를 감각적인 한 페이지에 담아보세요.
                방문자 실시간 클릭수 통계와 깔끔한 모바일 최적화 뷰를 제공합니다.
              </p>

              {/* CTA 버튼 영역 */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  type="button"
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-[#ff6600] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-[#ff6600]/25 hover:bg-[#e14d00] hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </span>
                  <span>{isLoggingIn ? "로그인 중..." : "Google로 시작하기"}</span>
                </button>

                <Link
                  href="/07ez"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white border border-[#dcdee3] px-6 py-4 text-sm font-semibold text-[#555d6d] hover:bg-[#f7f8f9] hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shadow-xs"
                >
                  <span>개발자 링크 확인해보기</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* 신뢰 지표 태그 */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#868b94]">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#10ab7d]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>실시간 클릭 분석 차트</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#10ab7d]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>파비콘 자동 연동</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#10ab7d]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>모바일 반응형 최적화</span>
                </div>
              </div>
            </div>

            {/* 우측: 스마트폰 목업 속 라이브 인터랙티브 프리뷰 */}
            <div className="lg:col-span-5 flex justify-center relative" id="interactive-demo">
              {/* 플로팅 뱃지 1: 실시간 클릭 증가 안내 */}
              <div className="hidden sm:flex absolute -top-4 -left-6 z-20 items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md p-3 shadow-xl border border-[#eeeff1] animate-bounce duration-1000">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff2ec] text-[#ff6600]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#1a1c20]">링크를 클릭해보세요!</p>
                  <p className="text-[10px] text-[#868b94]">실시간으로 카운트가 올라가요</p>
                </div>
              </div>

              {/* 플로팅 뱃지 2: 통계 대시보드 미리보기 */}
              <div className="hidden sm:flex absolute -bottom-5 -right-4 z-20 items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl border border-[#eeeff1]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10ab7d]/10 text-[#10ab7d]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] text-[#868b94] block">총 누적 클릭</span>
                  <span className="text-xs font-bold text-[#1a1c20]">
                    {(demoClicks.link1 + demoClicks.link2 + demoClicks.link3).toLocaleString()}회 돌파 🔥
                  </span>
                </div>
              </div>

              {/* 스마트폰 목업 컨테이너 */}
              <div className="w-full max-w-[340px] rounded-[38px] bg-[#1a1c20] p-3 shadow-2xl shadow-orange-500/10 ring-1 ring-black/10">
                <div className="rounded-[30px] bg-white overflow-hidden p-5 border border-neutral-100 flex flex-col items-center text-center">
                  
                  {/* 상단 스피커 & 카메라 노치 흉내 */}
                  <div className="w-24 h-4 bg-neutral-100 rounded-full mb-4 mx-auto" />

                  {/* 아바타 */}
                  <div className="relative mb-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2ec] text-[#ff6600] text-xl font-bold border-2 border-[#ffd5c0]">
                      홍
                    </div>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#10ab7d] ring-2 ring-white" />
                  </div>

                  <h3 className="text-base font-bold text-[#1a1c20]">홍길동</h3>
                  <span className="text-xs font-medium text-[#868b94]">@hong</span>
                  <div className="mt-1.5 inline-flex items-center rounded-full bg-[#fff2ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#e14d00]">
                    주니어 풀스택 개발자
                  </div>
                  <p className="mt-2 text-xs text-[#555d6d] leading-relaxed break-keep px-1">
                    아이디어를 코드로 구현하고 사용자에게 더 나은 경험을 전달합니다.
                  </p>

                  {/* 칩 */}
                  <div className="mt-3 flex flex-wrap justify-center gap-1">
                    {["Next.js", "React", "TypeScript", "Tailwind"].map((t) => (
                      <span key={t} className="rounded-full bg-[#f7f8f9] px-2 py-0.5 text-[10px] text-[#555d6d]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="my-4 h-[1px] w-full bg-[#eeeff1]" />

                  {/* 인터랙티브 링크 버튼들 (클릭 시 카운트 증가 효과) */}
                  <div className="w-full space-y-2">
                    {/* 대표 링크 */}
                    <button
                      type="button"
                      onClick={(e) => handleDemoClick("link1", e)}
                      className="w-full flex items-center justify-between rounded-full bg-[#ff6600] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e14d00] active:scale-95 transition-all text-left group"
                    >
                      <span className="truncate">GitHub 오픈소스 저장소</span>
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold bg-black/15 px-2 py-0.5 rounded-full">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{demoClicks.link1}</span>
                      </span>
                    </button>

                    {/* 서브 링크 1 */}
                    <button
                      type="button"
                      onClick={(e) => handleDemoClick("link2", e)}
                      className="w-full flex items-center justify-between rounded-xl bg-[#f7f8f9] p-2.5 text-left hover:bg-[#eeeff1] active:scale-95 transition-all border border-[#eeeff1]"
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#1a1c20] truncate">기술 블로그</span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#868b94] shrink-0">
                            <svg className="h-2.5 w-2.5 text-[#868b94]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{demoClicks.link2}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-[#868b94] truncate block">배운 점과 트러블슈팅 기록</span>
                      </div>
                      <svg className="h-3 w-3 text-[#868b94] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* 서브 링크 2 */}
                    <button
                      type="button"
                      onClick={(e) => handleDemoClick("link3", e)}
                      className="w-full flex items-center justify-between rounded-xl bg-[#f7f8f9] p-2.5 text-left hover:bg-[#eeeff1] active:scale-95 transition-all border border-[#eeeff1]"
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#1a1c20] truncate">포트폴리오 모아보기</span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#868b94] shrink-0">
                            <svg className="h-2.5 w-2.5 text-[#868b94]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{demoClicks.link3}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-[#868b94] truncate block">웹 개발 프로젝트 시연 영상</span>
                      </div>
                      <svg className="h-3 w-3 text-[#868b94] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <p className="mt-4 text-[9px] text-[#868b94]">
                    👆 위 링크들을 직접 터치해보세요!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. 핵심 기능 쇼케이스 (FEATURES) ── */}
      <section className="relative py-24 bg-white border-y border-[#eeeff1] overflow-hidden" id="features">
        {/* 히어로 섹션과 동일한 은은한 배경 블러 포인트 */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#ff6600]/5 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-amber-200/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2ec] border border-[#ffd5c0] px-3.5 py-1.5 text-xs font-semibold text-[#e14d00] shadow-xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
              <span>주요 기능 둘러보기</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1a1c20] tracking-tight leading-tight break-keep">
              링크 관리에 꼭 필요한 모든 것을
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#ff6600] to-[#e14d00] bg-clip-text text-transparent">
                가장 직관적이고 감각적으로.
              </span>
            </h2>
            <p className="text-sm text-[#555d6d] leading-relaxed break-keep">
              복잡한 설정이나 코딩 없이, 구글 로그인 한 번으로 전문가 수준의 퍼스널 링크 페이지를 완성할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 카드 1 */}
            <div className="rounded-3xl bg-[#fafbfc] p-7 border border-[#eeeff1] shadow-xs hover:border-[#ffd5c0] hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ec] border border-[#ffd5c0] text-[#ff6600] mb-5 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#1a1c20] mb-2">초간편 링크 추가</h3>
                <p className="text-xs text-[#555d6d] leading-relaxed break-keep">
                  URL과 제목만 입력하면 끝! 파비콘 자동 감지와 대표 링크 뱃지 하이라이트 기능을 지원합니다.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#eeeff1] flex items-center gap-1.5 text-[11px] font-semibold text-[#ff6600]">
                <span>1초 만에 등록 완료</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>

            {/* 카드 2 */}
            <div className="rounded-3xl bg-[#fafbfc] p-7 border border-[#eeeff1] shadow-xs hover:border-[#ffd5c0] hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ec] border border-[#ffd5c0] text-[#ff6600] mb-5 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#1a1c20] mb-2">실시간 클릭수 추적</h3>
                <p className="text-xs text-[#555d6d] leading-relaxed break-keep">
                  방문자가 어떤 링크에 가장 열광하는지 눈 모양 아이콘과 실시간 숫자로 한눈에 파악하세요.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#eeeff1] flex items-center gap-1.5 text-[11px] font-semibold text-[#ff6600]">
                <span>실시간 성과 측정</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>

            {/* 카드 3 */}
            <div className="rounded-3xl bg-[#fafbfc] p-7 border border-[#eeeff1] shadow-xs hover:border-[#ffd5c0] hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ec] border border-[#ffd5c0] text-[#ff6600] mb-5 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#1a1c20] mb-2">통계 대시보드 (/stats)</h3>
                <p className="text-xs text-[#555d6d] leading-relaxed break-keep">
                  shadcn 인터랙티브 막대 차트와 총 합산 클릭수로 내 프로필 링크의 전반적인 반응을 확인하세요.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#eeeff1] flex items-center gap-1.5 text-[11px] font-semibold text-[#ff6600]">
                <span>차트 분석 제공</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>

            {/* 카드 4 */}
            <div className="rounded-3xl bg-[#fafbfc] p-7 border border-[#eeeff1] shadow-xs hover:border-[#ffd5c0] hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ec] border border-[#ffd5c0] text-[#ff6600] mb-5 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#1a1c20] mb-2">고유 URL (@아이디)</h3>
                <p className="text-xs text-[#555d6d] leading-relaxed break-keep">
                  나만의 개성 있는 고유 주소(/@username)로 이력서, 인스타그램 프로필, 명함에 손쉽게 공유하세요.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#eeeff1] flex items-center gap-1.5 text-[11px] font-semibold text-[#ff6600]">
                <span>단축 링크 즉시 생성</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 이용 방법 3단계 (HOW IT WORKS) ── */}
      <section className="relative py-24 bg-[#fafbfc] overflow-hidden" id="how-it-works">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2ec] border border-[#ffd5c0] px-3.5 py-1.5 text-xs font-semibold text-[#e14d00] shadow-xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
              <span>초간단 3단계 가이드</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1a1c20] tracking-tight break-keep">
              누구나 10초 만에 끝나는
              <br />
              <span className="bg-gradient-to-r from-[#ff6600] to-[#e14d00] bg-clip-text text-transparent">
                MyLink 제작 과정
              </span>
            </h2>
            <p className="text-sm text-[#555d6d]">
              복잡한 인증이나 설정 없이, 가입 즉시 나만의 프로필 페이지가 준비됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* 스텝 1 */}
            <div className="relative rounded-3xl bg-white p-8 border border-[#eeeff1] shadow-xs hover:border-[#ffd5c0] hover:shadow-lg transition-all text-center group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ec] border border-[#ffd5c0] text-[#ff6600] font-black text-base mb-5 group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="text-base font-bold text-[#1a1c20] mb-2">1초 구글 로그인</h3>
              <p className="text-xs text-[#555d6d] leading-relaxed break-keep">
                아이디/비밀번호 입력 없이 안전한 Google 소셜 로그인으로 한 번에 접속합니다.
              </p>
            </div>

            {/* 스텝 2 */}
            <div className="relative rounded-3xl bg-white p-8 border border-[#eeeff1] shadow-xs hover:border-[#ffd5c0] hover:shadow-lg transition-all text-center group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ec] border border-[#ffd5c0] text-[#ff6600] font-black text-base mb-5 group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="text-base font-bold text-[#1a1c20] mb-2">프로필 & 링크 작성</h3>
              <p className="text-xs text-[#555d6d] leading-relaxed break-keep">
                이름, 직무 타이틀, 소개글과 기술 스택 태그, 그리고 보여주고 싶은 링크들을 채워 넣으세요.
              </p>
            </div>

            {/* 스텝 3 */}
            <div className="relative rounded-3xl bg-white p-8 border border-[#eeeff1] shadow-xs hover:border-[#ffd5c0] hover:shadow-lg transition-all text-center group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ec] border border-[#ffd5c0] text-[#ff6600] font-black text-base mb-5 group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="text-base font-bold text-[#1a1c20] mb-2">공유하고 통계 확인</h3>
              <p className="text-xs text-[#555d6d] leading-relaxed break-keep">
                상단 [공유하기]로 내 링크를 복사해 전 세계에 공유하고, 실시간 클릭수를 관찰해보세요!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 직군별 MyLink 활용 사례 탭 (USE CASES) ── */}
      <section className="relative py-24 bg-white border-t border-[#eeeff1] overflow-hidden" id="usecases">
        {/* 히어로 배경 블러 톤 유지 */}
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-tr from-[#ff6600]/10 to-amber-200/15 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2ec] border border-[#ffd5c0] px-3.5 py-1.5 text-xs font-semibold text-[#e14d00] shadow-xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
              <span>직군별 템플릿 예시</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1a1c20] tracking-tight break-keep">
              다양한 직군의 사용자들이
              <br />
              <span className="bg-gradient-to-r from-[#ff6600] to-[#e14d00] bg-clip-text text-transparent">
                MyLink를 활용하는 방법
              </span>
            </h2>
            <p className="text-sm text-[#555d6d]">
              개발자, 크리에이터, 기획자 등 나만의 목적과 스타일에 맞춰 자유롭게 꾸밀 수 있습니다.
            </p>
          </div>

          {/* 탭 버튼들: 히어로 캡슐 디자인 적용 */}
          <div className="flex justify-center gap-2.5 mb-10">
            {[
              { id: "dev", label: "💻 개발자" },
              { id: "creator", label: "🎨 크리에이터" },
              { id: "career", label: "📈 PM / 기획자" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  activeTab === tab.id
                    ? "bg-[#ff6600] text-white shadow-md shadow-[#ff6600]/25 scale-105"
                    : "bg-[#fafbfc] border border-[#eeeff1] text-[#555d6d] hover:border-[#ffd5c0] hover:text-[#ff6600]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 내용 미리보기 카드: 히어로 스마트폰 목업과 일치하는 미니 모바일 뷰 디자인 */}
          <div className="rounded-[32px] border border-[#eeeff1] bg-[#fafbfc] p-6 sm:p-9 max-w-md mx-auto shadow-xl shadow-orange-500/5 transition-all">
            <div className="text-center">
              {/* 아바타 */}
              <div className="relative inline-block mb-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2ec] text-[#ff6600] text-xl font-bold border-2 border-[#ffd5c0]">
                  {currentCase.avatar}
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#10ab7d] ring-2 ring-white" />
              </div>

              <h4 className="text-lg font-bold text-[#1a1c20]">{currentCase.name}</h4>
              <div className="mt-1.5 inline-flex items-center rounded-full bg-[#fff2ec] px-3 py-0.5 text-xs font-semibold text-[#e14d00]">
                {currentCase.role}
              </div>
              <p className="mt-2.5 text-xs text-[#555d6d] leading-relaxed break-keep px-2">
                {currentCase.bio}
              </p>
              
              <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
                {currentCase.chips.map((c) => (
                  <span key={c} className="rounded-full bg-white border border-[#eeeff1] px-2.5 py-0.5 text-[10px] text-[#555d6d] font-medium">
                    {c}
                  </span>
                ))}
              </div>

              <div className="my-5 h-[1px] w-full bg-[#eeeff1]" />

              {/* 링크 목록 */}
              <div className="space-y-2.5 text-left">
                {currentCase.links.map((link, idx) => (
                  <div
                    key={link.id}
                    className={`rounded-2xl p-3.5 border transition-colors flex items-center justify-between ${
                      idx === 0
                        ? "bg-[#ff6600] text-white border-transparent shadow-sm"
                        : "bg-white border-[#eeeff1] text-[#1a1c20]"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className={`text-xs font-bold truncate ${idx === 0 ? "text-white" : "text-[#1a1c20]"}`}>
                        {link.title}
                      </p>
                      <p className={`text-[10px] break-words break-keep ${idx === 0 ? "text-white/80" : "text-[#868b94]"}`}>
                        {link.desc}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        idx === 0 ? "bg-black/15 text-white" : "bg-[#f7f8f9] text-[#868b94]"
                      }`}
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{(idx + 1) * 28}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. 하단 강력한 CTA 배너 ── */}
      <section className="relative py-24 bg-gradient-to-b from-[#fafbfc] to-[#fff2ec]/40 border-t border-[#eeeff1] overflow-hidden">
        {/* 히어로 블러 글로우 효과와 완벽 일치 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-[#ff6600]/20 to-amber-200/30 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2ec] border border-[#ffd5c0] px-4 py-1.5 text-xs font-semibold text-[#e14d00] shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#ff6600] animate-pulse" />
            <span>지금 바로 시작하기</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#1a1c20] tracking-tight leading-[1.2] break-keep">
            단 하나의 링크로
            <br />
            <span className="bg-gradient-to-r from-[#ff6600] via-[#ff7e2e] to-[#e14d00] bg-clip-text text-transparent">
              나의 모든 가치를 보여주세요.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#555d6d] max-w-md mx-auto leading-relaxed break-keep">
            포트폴리오, 깃허브, 블로그를 가장 깔끔하게 모아 공유하고, 실시간 방문자 클릭수 통계를 확인해보세요.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-3 rounded-full bg-[#ff6600] px-9 py-4 text-base font-bold text-white shadow-xl shadow-[#ff6600]/30 hover:bg-[#e14d00] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </span>
              <span>{isLoggingIn ? "로그인 중..." : "Google로 시작하기"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="mt-auto py-8 bg-white border-t border-[#eeeff1] text-center text-xs text-[#868b94]">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#ff6600] text-white font-bold text-[10px]">
              M
            </div>
            <span className="font-bold text-[#1a1c20]">MyLink</span>
            <span>· All-in-one Link in Bio Platform</span>
          </div>
          <p>© 2026 MyLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
