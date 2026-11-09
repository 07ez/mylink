"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import type { LinkItem } from "@/types/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const chartConfig = {
  clicks: {
    label: "클릭수",
    color: "#ff6600",
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 1. 로그인 여부 확인 및 비로그인 시 홈(/)으로 리다이렉트
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      } else {
        setAuthUser(user);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 2. 유저의 링크 데이터 및 클릭수 실시간 조회
  useEffect(() => {
    if (!authUser) return;

    setIsDataLoading(true);
    const q = query(
      collection(db, "users", authUser.uid, "links"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLinks: LinkItem[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: d.title || "",
            url: d.url || "",
            description: d.description || "",
            isActive: d.isActive ?? true,
            isPrimary: d.isPrimary ?? false,
            icon: d.icon || "link",
            order: d.order ?? 0,
            clickCount: d.clickCount ?? 0,
            createdAt: d.createdAt,
          };
        });

        setLinks(fetchedLinks);
        setIsDataLoading(false);
      },
      (error) => {
        console.error("통계 링크 데이터 조회 실패:", error);
        setIsDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  // 로딩 상태 화면
  if (isAuthLoading || !authUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f8f9]">
        <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#eeeff1]">
          <div className="mx-auto flex h-14 max-w-[680px] items-center justify-between px-4">
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
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-sm text-[#868b94] flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-[#ff6600]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>인증 확인 중...</span>
          </div>
        </main>
      </div>
    );
  }

  // 통계 계산
  const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  const activeLinksCount = links.filter((l) => l.isActive).length;
  const sortedByClicks = [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
  const topLink = sortedByClicks[0];

  // 차트용 데이터 포맷 (상위 10개 또는 전체)
  const chartData = links.map((link) => ({
    name: link.title.length > 12 ? `${link.title.slice(0, 12)}…` : link.title,
    fullName: link.title,
    clicks: link.clickCount || 0,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8f9]">
      {/* ── 글로벌 헤더 ── */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#eeeff1]">
        <div className="mx-auto flex h-14 max-w-[680px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6600] text-white font-bold text-sm shadow-sm">
              M
            </div>
            <span className="text-base font-bold tracking-tight text-[#1a1c20]">
              MyLink
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-white border border-[#dcdee3] px-3.5 py-1.5 text-xs font-semibold text-[#555d6d] hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shadow-xs"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>내 링크 관리로 돌아가기</span>
          </Link>
        </div>
      </header>

      {/* ── 통계 메인 본문 ── */}
      <main className="flex-1 w-full max-w-[680px] mx-auto p-4 sm:p-6 space-y-6">
        {/* 상단 타이틀 */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fff2ec] px-3 py-1 text-xs font-semibold text-[#e14d00] mb-2">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <span>클릭 통계 대시보드</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1c20]">링크 성과 분석</h1>
          <p className="mt-1 text-xs text-[#868b94]">
            방문자들이 가장 관심을 보인 링크와 총 클릭수를 실시간으로 확인해보세요.
          </p>
        </div>

        {/* ── 핵심 지표 요약 카드 그리드 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 총 클릭수 카드 */}
          <div className="rounded-2xl bg-white p-5 border border-[#eeeff1] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#868b94]">총 클릭수</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff2ec] text-[#ff6600]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#1a1c20] tracking-tight">
                {totalClicks.toLocaleString()}
              </span>
              <span className="ml-1 text-xs text-[#868b94]">회</span>
            </div>
            <p className="mt-1 text-[11px] text-[#868b94]">모든 링크 합산 클릭 수</p>
          </div>

          {/* 활성 링크 수 카드 */}
          <div className="rounded-2xl bg-white p-5 border border-[#eeeff1] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#868b94]">등록된 링크</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7f8f9] text-[#555d6d]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#1a1c20] tracking-tight">
                {links.length}
              </span>
              <span className="ml-1 text-xs text-[#868b94]">개</span>
            </div>
            <p className="mt-1 text-[11px] text-[#868b94]">
              활성화: {activeLinksCount}개
            </p>
          </div>

          {/* 최고 인기 링크 카드 */}
          <div className="rounded-2xl bg-white p-5 border border-[#eeeff1] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#868b94]">가장 인기 있는 링크</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff9f6] text-[#e14d00]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 truncate">
              <span className="text-lg font-bold text-[#1a1c20] truncate block" title={topLink?.title || "-"}>
                {topLink?.title || "없음"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#ff6600] font-semibold">
              {topLink ? `${topLink.clickCount || 0}회 클릭` : "클릭 데이터 없음"}
            </p>
          </div>
        </div>

        {/* ── shadcn 차트 컴포넌트 섹션 ── */}
        <Card className="border border-[#eeeff1] shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1a1c20]">
              링크별 클릭수 분포
            </CardTitle>
            <CardDescription className="text-xs text-[#868b94]">
              등록된 각 링크의 누적 클릭수를 비교한 차트입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isDataLoading ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#868b94]">
                차트 데이터를 불러오는 중...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-xs text-[#868b94] gap-2">
                <svg className="h-8 w-8 text-[#dcdee3]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>등록된 링크가 없습니다.</span>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f4" />
                  <XAxis
                    dataKey="name"
                    stroke="#868b94"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#eeeff1" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#868b94"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(val, name, item) => (
                          <div className="flex items-center justify-between w-full gap-4 text-xs">
                            <span className="font-semibold text-[#1a1c20]">
                              {item?.payload?.fullName}
                            </span>
                            <span className="font-bold text-[#ff6600]">
                              {val}회 클릭
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="clicks" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.clicks > 0 ? "#ff6600" : "#e5e7eb"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* ── 상세 링크별 클릭 목록 테이블 ── */}
        <div className="rounded-2xl bg-white border border-[#eeeff1] shadow-sm p-5">
          <h2 className="text-sm font-bold text-[#1a1c20] mb-3">링크별 상세 통계</h2>
          <div className="divide-y divide-[#eeeff1]">
            {links.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#868b94]">
                등록된 링크가 없습니다.
              </p>
            ) : (
              sortedByClicks.map((link, idx) => (
                <div
                  key={link.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f7f8f9] text-[11px] font-bold text-[#555d6d] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1a1c20] truncate">
                        {link.title}
                      </p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#868b94] truncate block hover:text-[#ff6600] transition-colors"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <svg className="h-3.5 w-3.5 text-[#ff6600]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-bold text-sm text-[#1a1c20]">
                      {(link.clickCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
