"use client";

import { useState, useEffect, useCallback } from "react";
import type { MyLinkData, LinkItem, UserProfile } from "@/types/link";
import mockData from "@/data/mock-links.json";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const STORAGE_KEY = "mylink-data";

// ── 아이콘 렌더러 ──────────────────────────────────────────────
function LinkIcon({ icon }: { icon?: string }) {
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
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      );
    case "code":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      );
    case "book-open":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
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
    default:
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
  }
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────
export default function ProfilePage() {
  const [data, setData] = useState<MyLinkData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [editLinks, setEditLinks] = useState<LinkItem[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLinkErrors, setNewLinkErrors] = useState<{ title?: string; url?: string }>({});
  const [isAdding, setIsAdding] = useState(false);

  // LocalStorage에서 데이터 불러오기 (없으면 mock-links.json 주입)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      setData(mockData as MyLinkData);
    }
  }, []);

  // LocalStorage에 저장
  const saveToStorage = useCallback((d: MyLinkData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  }, []);

  // 편집 모드 진입
  const enterEditMode = () => {
    if (!data) return;
    setEditProfile({ ...data.user });
    setEditLinks(data.links.map((l) => ({ ...l })));
    setIsEditMode(true);
  };

  // 편집 완료 저장
  const saveEdit = () => {
    if (!editProfile) return;
    const updated: MyLinkData = {
      user: editProfile,
      links: editLinks.sort((a, b) => a.order - b.order),
    };
    setData(updated);
    saveToStorage(updated);
    setIsEditMode(false);
    setShowAddForm(false);
  };

  // 편집 취소
  const cancelEdit = () => {
    setIsEditMode(false);
    setShowAddForm(false);
  };

  // 기본값 복원
  const resetToDefault = () => {
    const defaultData = mockData as MyLinkData;
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
    setIsEditMode(false);
    setShowAddForm(false);
  };

  // 링크 토글
  const toggleLink = (id: string) => {
    setEditLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
  };

  // 링크 삭제
  const deleteLink = (id: string) => {
    setEditLinks((prev) => prev.filter((l) => l.id !== id));
  };

  // 링크 필드 수정
  const updateLink = (id: string, field: keyof LinkItem, value: string | boolean) => {
    setEditLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  // 새 링크 추가 (Firestore users/anonymous/links 경로에 저장)
  const addLink = async () => {
    const errors: { title?: string; url?: string } = {};

    // 제목 검증
    if (!newLink.title.trim()) {
      errors.title = "제목을 입력해주세요.";
    } else if (newLink.title.trim().length > 50) {
      errors.title = "제목은 50자 이내로 입력해주세요.";
    }

    // URL 검증
    if (!newLink.url.trim()) {
      errors.url = "URL을 입력해주세요.";
    } else {
      try {
        const parsed = new URL(newLink.url.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.url = "http:// 또는 https://로 시작하는 URL을 입력해주세요.";
        }
      } catch {
        errors.url = "올바른 URL 형식이 아닙니다. (예: https://example.com)";
      }
    }

    if (Object.keys(errors).length > 0) {
      setNewLinkErrors(errors);
      return;
    }

    try {
      setIsAdding(true);
      const linkPayload = {
        title: newLink.title.trim(),
        url: newLink.url.trim(),
        description: newLink.description.trim(),
        isActive: true,
        isPrimary: false,
        icon: "link",
        order: editLinks.length + 1,
        createdAt: new Date().toISOString(),
      };

      // Firestore users/anonymous/links 컬렉션에 새 문서 추가
      const docRef = await addDoc(
        collection(db, "users", "anonymous", "links"),
        linkPayload
      );

      const link: LinkItem = {
        id: docRef.id,
        title: linkPayload.title,
        url: linkPayload.url,
        description: linkPayload.description,
        isActive: linkPayload.isActive,
        isPrimary: linkPayload.isPrimary,
        icon: linkPayload.icon,
        order: linkPayload.order,
      };

      setEditLinks((prev) => [...prev, link]);
      setNewLink({ title: "", url: "", description: "" });
      setNewLinkErrors({});
      setShowAddForm(false);
    } catch (error) {
      console.error("Firestore에 링크 추가 중 오류 발생:", error);
      setNewLinkErrors({
        title: "Firestore 저장에 실패했습니다. Firebase 권한 또는 연결 상태를 확인해주세요.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f8f9]">
        <div className="text-[#868b94] text-sm">불러오는 중...</div>
      </main>
    );
  }

  const { user, links } = data;
  const activeLinks = links.filter((l) => l.isActive).sort((a, b) => a.order - b.order);
  const primaryLink = activeLinks.find((l) => l.isPrimary);
  const subLinks = activeLinks.filter((l) => !l.isPrimary);

  return (
    <>
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f7f8f9] pb-28">
        <div className="w-full max-w-[460px]">
          {/* 프로필 카드 */}
          <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] border border-[#eeeff1]">

            {/* ── 프로필 헤더 ── */}
            <div className="flex flex-col items-center text-center">
              {/* 아바타 */}
              <div className="relative mb-3.5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff2ec] text-[#ff6600] text-2xl font-bold border border-[#ffd5c0]">
                  {user.avatarText}
                </div>
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#10ab7d] ring-2 ring-white" />
              </div>

              {/* 이름 */}
              {isEditMode ? (
                <input
                  value={editProfile?.name ?? ""}
                  onChange={(e) =>
                    setEditProfile((p) => p ? { ...p, name: e.target.value } : p)
                  }
                  className="text-[22px] font-bold text-center text-[#1a1c20] border-b-2 border-[#ff6600] outline-none w-full max-w-[200px]"
                />
              ) : (
                <h1 className="text-[22px] font-bold leading-[30px] text-[#1a1c20]">
                  {user.name}
                </h1>
              )}

              {/* 직무 뱃지 */}
              {isEditMode ? (
                <input
                  value={editProfile?.title ?? ""}
                  onChange={(e) =>
                    setEditProfile((p) => p ? { ...p, title: e.target.value } : p)
                  }
                  className="mt-1.5 text-xs font-semibold text-center text-[#e14d00] bg-[#fff2ec] rounded-full px-2.5 py-0.5 border border-[#ff6600] outline-none"
                />
              ) : (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#fff2ec] px-2.5 py-0.5 text-xs font-semibold text-[#e14d00]">
                  {user.title}
                </div>
              )}

              {/* 소개글 */}
              {isEditMode ? (
                <textarea
                  value={editProfile?.bio ?? ""}
                  onChange={(e) =>
                    setEditProfile((p) => p ? { ...p, bio: e.target.value } : p)
                  }
                  rows={3}
                  className="mt-3 w-full text-sm leading-[20px] text-[#555d6d] border border-[#eeeff1] rounded-lg p-2 outline-none focus:border-[#ff6600] resize-none"
                />
              ) : (
                <p className="mt-3 text-sm leading-[20px] text-[#555d6d] break-keep px-2">
                  {user.bio}
                </p>
              )}

              {/* 기술 스택 칩 */}
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {user.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[#f3f4f5] px-2.5 py-1 text-xs font-medium text-[#555d6d]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div className="my-6 h-[1px] w-full bg-[#eeeff1]" />

            {/* ── 링크 목록 (방문자 뷰) ── */}
            {!isEditMode && (
              <>
                {/* 대표 CTA 버튼 */}
                {primaryLink && (
                  <div className="mb-4">
                    <a
                      href={primaryLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff6600] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#e14d00] active:scale-[0.98]"
                    >
                      <LinkIcon icon={primaryLink.icon} />
                      <span>{primaryLink.title}</span>
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
                      className="group flex items-center justify-between rounded-xl bg-[#f7f8f9] p-3.5 transition-colors hover:bg-[#eeeff1] active:bg-[#dcdee3]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#555d6d] shadow-sm transition-colors group-hover:text-[#ff6600]">
                          <LinkIcon icon={link.icon} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-[#1a1c20]">
                            {link.title}
                          </div>
                          {link.description && (
                            <div className="text-xs text-[#868b94]">
                              {link.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <svg
                        className="h-4 w-4 text-[#868b94] transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* ── 편집 모드: 링크 관리 ── */}
            {isEditMode && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#868b94] uppercase tracking-wide mb-3">
                  링크 관리
                </p>
                {editLinks
                  .sort((a, b) => a.order - b.order)
                  .map((link) => (
                    <div
                      key={link.id}
                      className={`rounded-xl border p-3.5 transition-colors ${
                        link.isActive
                          ? "bg-white border-[#eeeff1]"
                          : "bg-[#f7f8f9] border-[#eeeff1] opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* 대표 뱃지 */}
                          {link.isPrimary && (
                            <span className="flex-shrink-0 rounded-full bg-[#fff2ec] px-1.5 py-0.5 text-[10px] font-bold text-[#e14d00]">
                              대표
                            </span>
                          )}
                          <input
                            value={link.title}
                            onChange={(e) => updateLink(link.id, "title", e.target.value)}
                            className="text-sm font-semibold text-[#1a1c20] border-b border-[#dcdee3] outline-none w-full min-w-0 bg-transparent focus:border-[#ff6600]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* 토글 */}
                          <button
                            onClick={() => toggleLink(link.id)}
                            title={link.isActive ? "비활성화" : "활성화"}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              link.isActive ? "bg-[#ff6600]" : "bg-[#dcdee3]"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                link.isActive ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          {/* 삭제 */}
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="text-[#868b94] hover:text-red-500 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <input
                        value={link.description ?? ""}
                        onChange={(e) => updateLink(link.id, "description", e.target.value)}
                        placeholder="설명 (선택)"
                        className="mt-1.5 text-xs text-[#868b94] border-b border-transparent outline-none w-full bg-transparent focus:border-[#dcdee3] placeholder-[#c2c5cb]"
                      />
                    </div>
                  ))}

                {/* 새 링크 추가 폼 */}
                {showAddForm ? (
                  <div className="rounded-xl border border-dashed border-[#ff6600] bg-[#fff9f6] p-3.5 space-y-3">
                    {/* 제목 */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-xs font-semibold text-[#555d6d]">
                          링크 제목 <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-[10px] ${newLink.title.length > 50 ? "text-red-500 font-semibold" : "text-[#868b94]"}`}>
                          {newLink.title.length}/50
                        </span>
                      </div>
                      <input
                        value={newLink.title}
                        onChange={(e) => {
                          setNewLink((p) => ({ ...p, title: e.target.value }));
                          if (newLinkErrors.title) setNewLinkErrors((p) => ({ ...p, title: undefined }));
                        }}
                        placeholder="예: 내 포트폴리오"
                        className={`w-full text-sm border-b outline-none pb-1 bg-transparent transition-colors ${
                          newLinkErrors.title
                            ? "border-red-400 placeholder-red-300"
                            : "border-[#dcdee3] focus:border-[#ff6600]"
                        }`}
                      />
                      {newLinkErrors.title && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                          <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {newLinkErrors.title}
                        </p>
                      )}
                    </div>

                    {/* URL */}
                    <div>
                      <label className="text-xs font-semibold text-[#555d6d] block mb-0.5">
                        URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={newLink.url}
                        onChange={(e) => {
                          setNewLink((p) => ({ ...p, url: e.target.value }));
                          if (newLinkErrors.url) setNewLinkErrors((p) => ({ ...p, url: undefined }));
                        }}
                        placeholder="https://example.com"
                        className={`w-full text-sm border-b outline-none pb-1 bg-transparent transition-colors ${
                          newLinkErrors.url
                            ? "border-red-400 placeholder-red-300"
                            : "border-[#dcdee3] focus:border-[#ff6600]"
                        }`}
                      />
                      {newLinkErrors.url && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                          <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {newLinkErrors.url}
                        </p>
                      )}
                    </div>

                    {/* 설명 */}
                    <div>
                      <label className="text-xs font-semibold text-[#555d6d] block mb-0.5">
                        설명 <span className="text-[#868b94] font-normal">(선택)</span>
                      </label>
                      <input
                        value={newLink.description}
                        onChange={(e) => setNewLink((p) => ({ ...p, description: e.target.value }))}
                        placeholder="이 링크에 대한 짧은 설명"
                        className="w-full text-sm border-b border-[#dcdee3] outline-none pb-1 bg-transparent focus:border-[#ff6600]"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={addLink}
                        disabled={isAdding}
                        className="flex-1 rounded-lg bg-[#ff6600] py-1.5 text-xs font-semibold text-white hover:bg-[#e14d00] transition-colors disabled:opacity-50"
                      >
                        {isAdding ? "저장 중..." : "추가"}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewLinkErrors({});
                          setNewLink({ title: "", url: "", description: "" });
                        }}
                        className="flex-1 rounded-lg bg-[#f3f4f5] py-1.5 text-xs font-semibold text-[#555d6d] hover:bg-[#eeeff1] transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#dcdee3] py-3 text-sm font-medium text-[#868b94] hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    새 링크 추가
                  </button>
                )}

                {/* 편집 완료/취소 버튼 */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={saveEdit}
                    className="flex-1 rounded-xl bg-[#ff6600] py-3 text-sm font-bold text-white hover:bg-[#e14d00] transition-colors"
                  >
                    편집 완료
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 rounded-xl bg-[#f3f4f5] py-3 text-sm font-bold text-[#555d6d] hover:bg-[#eeeff1] transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 푸터 */}
            <p className="mt-7 text-center text-xs text-[#868b94]">
              © 2026 {user.name} · All rights reserved
            </p>
          </div>
        </div>
      </main>

      {/* ── 시연용 하단 플로팅 컨트롤 바 ── */}
      {!isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 z-50">
          <div className="flex gap-2 rounded-2xl bg-white border border-[#eeeff1] shadow-lg px-4 py-3">
            <button
              onClick={enterEditMode}
              className="flex items-center gap-1.5 rounded-xl bg-[#f3f4f5] px-4 py-2 text-sm font-semibold text-[#1a1c20] hover:bg-[#eeeff1] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              프로필/링크 편집
            </button>
            <button
              onClick={resetToDefault}
              className="flex items-center gap-1.5 rounded-xl bg-[#f3f4f5] px-4 py-2 text-sm font-semibold text-[#555d6d] hover:bg-[#eeeff1] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              기본값 초기화
            </button>
          </div>
        </div>
      )}
    </>
  );
}
