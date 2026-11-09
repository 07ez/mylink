"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { UserProfile, LinkItem } from "@/types/link";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

// ── 아이콘 렌더러 (사이트 파비콘 및 내장 아이콘 지원) ──────────
function LinkIcon({ icon, url }: { icon?: string; url?: string }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [url]);

  if (icon && icon !== "link") {
    switch (icon) {
      case "github":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        );
      case "folder":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      case "code":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case "book-open":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "linkedin":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
    }
  }

  let faviconUrl: string | null = null;
  if (url && !imgError) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname) {
        faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
      }
    } catch {
      faviconUrl = null;
    }
  }

  if (faviconUrl) {
    return (
      <img
        src={faviconUrl}
        alt=""
        className="h-5 w-5 rounded-sm object-contain"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ displayName: string }>;
}) {
  const resolvedParams = use(params);
  const rawTargetName = decodeURIComponent(resolvedParams.displayName || "")
    .replace(/^@+/, "")
    .trim();

  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [avatarImgError, setAvatarImgError] = useState(false);

  // 로그인 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsub();
  }, []);

  // displayName(username)으로 Firestore 유저 검색 및 링크 로드
  useEffect(() => {
    if (!rawTargetName) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsNotFound(false);

    const fetchUserData = async () => {
      try {
        let userDocSnap = null;

        // 1. username 필드로 유저 검색 (입력값 그대로 & 소문자)
        const usernameQueries = [
          query(collection(db, "users"), where("username", "==", rawTargetName)),
        ];
        if (rawTargetName.toLowerCase() !== rawTargetName) {
          usernameQueries.push(
            query(collection(db, "users"), where("username", "==", rawTargetName.toLowerCase()))
          );
        }

        for (const q of usernameQueries) {
          const snap = await getDocs(q);
          if (!snap.empty) {
            userDocSnap = snap.docs[0];
            break;
          }
        }

        // 2. username으로 못 찾은 경우 name(표시이름)으로도 조회
        if (!userDocSnap) {
          const nameSnap = await getDocs(
            query(collection(db, "users"), where("name", "==", rawTargetName))
          );
          if (!nameSnap.empty) {
            userDocSnap = nameSnap.docs[0];
          }
        }

        // 3. uid 문서 ID 직접 조회 시도 (혹시 URL에 UID가 들어온 경우)
        if (!userDocSnap) {
          try {
            const directSnap = await getDocs(
              query(collection(db, "users"), where("__name__", "==", rawTargetName))
            );
            if (!directSnap.empty) {
              userDocSnap = directSnap.docs[0];
            }
          } catch {
            // ignore
          }
        }

        // 검색된 유저가 없는 경우 404 처리
        if (!userDocSnap) {
          if (isMounted) {
            setIsNotFound(true);
            setIsLoading(false);
          }
          return;
        }

        const userData = userDocSnap.data() as UserProfile;
        const userId = userDocSnap.id;

        const profile: UserProfile = {
          uid: userId,
          username: userData.username || rawTargetName,
          name: userData.name || rawTargetName,
          title: userData.title || "",
          bio: userData.bio || "",
          avatarText:
            userData.avatarText || (userData.name || rawTargetName).charAt(0).toUpperCase(),
          photoURL: userData.photoURL || "",
          chips: userData.chips || [],
        };

        if (isMounted) {
          setTargetUser(profile);
        }

        // 4. 링크 목록 조회: users/{userId}/links
        const linksQuery = query(
          collection(db, "users", userId, "links"),
          orderBy("createdAt", "desc")
        );

        const unsubLinks = onSnapshot(
          linksQuery,
          (snapshot) => {
            const fetched: LinkItem[] = snapshot.docs.map((docSnap) => {
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

            // 활성화된 링크만 노출 (방문자 뷰)
            const activeLinks = fetched.filter((l) => l.isActive);

            if (isMounted) {
              setLinks(activeLinks);
              setIsLoading(false);
            }
          },
          (err) => {
            console.error("공개 링크 로드 실패:", err);
            if (isMounted) setIsLoading(false);
          }
        );

        return () => unsubLinks();
      } catch (error) {
        console.error("유저 조회 중 오류 발생:", error);
        if (isMounted) {
          setIsNotFound(true);
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [rawTargetName]);

  // 404 상태 화면
  if (isNotFound) {
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
              <span className="font-semibold text-[#1a1c20]">@{rawTargetName}</span> 사용자가
              존재하지 않거나 주소가 잘못되었습니다.
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

  // 로딩 상태 화면
  if (isLoading) {
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

        <main className="flex-1 w-full flex items-center justify-center p-4">
          <div className="text-xs text-[#868b94] flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-[#ff6600]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            프로필을 불러오는 중...
          </div>
        </main>
      </div>
    );
  }

  if (!targetUser) return null;

  const isOwner = authUser && (authUser.uid === targetUser.uid);
  const primaryLink = links.find((l) => l.isPrimary);
  const subLinks = links.filter((l) => !l.isPrimary);

  // 링크 클릭 핸들러 (클릭 카운트 저장)
  const handleLinkClick = async (link: LinkItem) => {
    if (!targetUser?.uid) return;
    try {
      setLinks((prev) =>
        prev.map((l) =>
          l.id === link.id ? { ...l, clickCount: (l.clickCount ?? 0) + 1 } : l
        )
      );

      const linkRef = doc(db, "users", targetUser.uid, "links", link.id);
      await updateDoc(linkRef, {
        clickCount: increment(1),
      });
    } catch (error) {
      console.error("클릭 카운트 저장 실패:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8f9]">
      {/* ── 상단 헤더 ── */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#eeeff1]">
        <div className="mx-auto flex h-14 max-w-[460px] items-center justify-between px-4 sm:px-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6600] text-white font-bold text-sm shadow-sm group-hover:bg-[#e14d00] transition-colors">
              M
            </div>
            <span className="text-base font-bold tracking-tight text-[#1a1c20]">
              MyLink
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* 링크 공유 버튼 */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                } catch (e) {
                  console.error("복사 실패:", e);
                }
              }}
              className="flex items-center gap-1.5 rounded-full bg-white border border-[#dcdee3] px-3 py-1.5 text-xs font-semibold text-[#555d6d] hover:bg-[#f7f8f9] shadow-xs transition-colors"
            >
              {isCopied ? (
                <>
                  <svg className="h-3.5 w-3.5 text-[#10ab7d]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#10ab7d]">복사 완료!</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>공유하기</span>
                </>
              )}
            </button>

            {/* 본인 여부에 따른 동작 버튼 */}
            {isOwner ? (
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-full bg-[#ff6600] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#e14d00] transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>내 링크 관리</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="rounded-full bg-[#1a1c20] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors"
              >
                나도 만들기
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── 프로필 본문 ── */}
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 pb-20">
        <div className="w-full max-w-[460px]">
          <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] border border-[#eeeff1]">
            {/* 프로필 헤더 */}
            <div className="flex flex-col items-center text-center">
              {/* 아바타 */}
              <div className="relative mb-3.5">
                {targetUser.photoURL && !avatarImgError ? (
                  <img
                    src={targetUser.photoURL}
                    alt={targetUser.name}
                    className="h-20 w-20 rounded-full object-cover border border-[#ffd5c0]"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarImgError(true)}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff2ec] text-[#ff6600] text-2xl font-bold border border-[#ffd5c0]">
                    {targetUser.avatarText}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#10ab7d] ring-2 ring-white" />
              </div>

              {/* 이름 */}
              <h1 className="text-[22px] font-bold leading-[30px] text-[#1a1c20]">
                {targetUser.name}
              </h1>

              {/* Display Name (@username) */}
              {targetUser.username && (
                <p className="mt-0.5 text-xs font-medium text-[#868b94]">
                  @{targetUser.username.replace(/^@+/, "")}
                </p>
              )}

              {/* 직무 뱃지 */}
              {targetUser.title && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#fff2ec] px-2.5 py-0.5 text-xs font-semibold text-[#e14d00]">
                  {targetUser.title}
                </div>
              )}

              {/* 소개글 */}
              {targetUser.bio && (
                <p className="mt-3 text-sm leading-[20px] text-[#555d6d] break-keep px-2">
                  {targetUser.bio}
                </p>
              )}

              {/* 기술 스택 칩 */}
              {targetUser.chips && targetUser.chips.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {targetUser.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-[#f3f4f5] px-2.5 py-1 text-xs font-medium text-[#555d6d]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 구분선 */}
            <div className="my-6 h-[1px] w-full bg-[#eeeff1]" />

            {/* ── 링크 목록 ── */}
            {/* 대표 CTA 링크 */}
            {primaryLink && (
              <div className="mb-4">
                <a
                  href={primaryLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(primaryLink)}
                  className="flex w-full items-center justify-between rounded-full bg-[#ff6600] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#e14d00] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LinkIcon icon={primaryLink.icon} url={primaryLink.url} />
                    <span className="truncate">{primaryLink.title}</span>
                  </div>
                  <span
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-white/95 bg-black/15 px-2.5 py-0.5 rounded-full"
                    title={`조회수: ${primaryLink.clickCount ?? 0}`}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{primaryLink.clickCount ?? 0}</span>
                  </span>
                </a>
              </div>
            )}

            {/* 서브 링크 목록 */}
            <div className="space-y-2.5">
              {subLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link)}
                  className="group flex items-center justify-between rounded-xl bg-[#f7f8f9] p-3.5 transition-all hover:bg-[#f0f2f4] border border-transparent hover:border-[#eeeff1]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#555d6d] shadow-sm transition-colors group-hover:text-[#ff6600]">
                      <LinkIcon icon={link.icon} url={link.url} />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1a1c20] truncate group-hover:text-[#ff6600] transition-colors">
                          {link.title}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 text-xs text-[#868b94] shrink-0"
                          title={`조회수: ${link.clickCount ?? 0}`}
                        >
                          <svg className="h-3.5 w-3.5 text-[#868b94]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{link.clickCount ?? 0}</span>
                        </span>
                      </div>
                      {link.description && (
                        <div className="text-xs text-[#868b94] truncate">
                          {link.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <svg
                    className="h-4 w-4 text-[#868b94] shrink-0 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}

              {links.length === 0 && (
                <div className="py-8 text-center text-xs text-[#868b94]">
                  등록된 공개 링크가 없습니다.
                </div>
              )}
            </div>

            {/* 푸터 */}
            <p className="mt-8 text-center text-xs text-[#868b94]">
              © 2026 {targetUser.name} · Powered by{" "}
              <Link href="/" className="font-semibold text-[#1a1c20] hover:text-[#ff6600] transition-colors">
                MyLink
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
