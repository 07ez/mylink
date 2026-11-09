"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef, type CSSProperties } from "react";
import Link from "next/link";
import LandingPage from "@/components/LandingPage";
import type { MyLinkData, LinkItem, UserProfile } from "@/types/link";
import mockData from "@/data/mock-links.json";
import { db, auth, googleProvider } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
} from "firebase/firestore";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";

const STORAGE_KEY = "mylink-data";

// ── 아이콘 렌더러 (사이트 파비콘 및 내장 아이콘 지원) ──────────
function LinkIcon({ icon, url }: { icon?: string; url?: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);

  // URL 변경 시 이미지 소스 인덱스 리셋
  useEffect(() => {
    setSourceIndex(0);
  }, [url]);

  // 고유 내장 아이콘이 명시되어 있고 "link"가 아닌 경우
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
    }
  }

  // 사이트 파비콘 후보 URL 목록 (개인 배포 사이트 직접 파비콘 + Google Favicon 폴백)
  const candidates: string[] = [];
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname) {
        const isPersonalOrVercel =
          parsed.hostname.endsWith(".vercel.app") ||
          parsed.hostname.endsWith(".netlify.app") ||
          parsed.hostname.endsWith(".github.io") ||
          parsed.hostname.endsWith(".pages.dev") ||
          parsed.hostname === "localhost";

        if (isPersonalOrVercel) {
          candidates.push(
            `${parsed.origin}/icon`,
            `${parsed.origin}/favicon.ico`,
            `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`
          );
        } else {
          candidates.push(
            `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`,
            `${parsed.origin}/favicon.ico`,
            `${parsed.origin}/icon`
          );
        }
      }
    } catch {
      // ignore invalid url
    }
  }

  const currentFaviconUrl = candidates[sourceIndex];

  if (currentFaviconUrl) {
    return (
      <img
        src={currentFaviconUrl}
        alt=""
        className="h-5 w-5 rounded-sm object-contain"
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          // Google Favicon API가 색인되지 않은 사이트에 대해 기본 16x16 지구본을 반환하면 다음 후보로 전환
          const img = e.currentTarget;
          if (
            currentFaviconUrl.includes("google.com/s2/favicons") &&
            img.naturalWidth <= 16 &&
            img.naturalHeight <= 16 &&
            sourceIndex < candidates.length - 1
          ) {
            setSourceIndex((prev) => prev + 1);
          }
        }}
        onError={() => setSourceIndex((prev) => prev + 1)}
      />
    );
  }

  // 사이트 아이콘이 없거나 로드 실패 시 기본 링크 모양(체인) 아이콘
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

// ── 스켈레톤 로더 ───────────────────────────────────────────────
function LinkSkeleton() {
  return (
    <div className="space-y-2.5">
      {/* 대표 링크 스켈레톤 */}
      <div className="h-[46px] w-full animate-pulse rounded-full bg-[#fff2ec]/80 border border-[#ffd5c0]/50" />
      {/* 서브 링크 스켈레톤 */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl bg-[#f7f8f9] p-3.5"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-[#e5e7eb]" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-28 animate-pulse rounded bg-[#e5e7eb]" />
              <div className="h-3 w-44 animate-pulse rounded bg-[#f3f4f5]" />
            </div>
          </div>
          <div className="h-4 w-4 animate-pulse rounded bg-[#e5e7eb]" />
        </div>
      ))}
    </div>
  );
}

// ── 인라인 편집 컴포넌트 ──────────────────────────────────────
function InlineEditCard({
  link,
  onSave,
  onCancel,
  isSaving,
}: {
  link: LinkItem;
  onSave: (id: string, values: { title: string; url: string; description: string }) => Promise<boolean>;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    title: link.title,
    url: link.url,
    description: link.description || "",
  });
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: { title?: string; url?: string } = {};

    // 1. 제목 검증 (새 링크 추가와 동일)
    if (!form.title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    } else if (form.title.trim().length > 50) {
      newErrors.title = "제목은 50자 이내로 입력해주세요.";
    }

    // 2. URL 검증 (새 링크 추가와 동일)
    if (!form.url.trim()) {
      newErrors.url = "URL을 입력해주세요.";
    } else {
      try {
        const parsed = new URL(form.url.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          newErrors.url = "http:// 또는 https://로 시작하는 URL을 입력해주세요.";
        }
      } catch {
        newErrors.url = "올바른 URL 형식이 아닙니다. (예: https://example.com)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const ok = await onSave(link.id, form);
    if (!ok) {
      setErrors({
        title: "Firestore 저장에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  return (
    <div className="rounded-xl border border-[#ff6600] bg-[#fff9f6] p-3.5 space-y-3 shadow-sm text-left">
      {/* 제목 */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-xs font-semibold text-[#555d6d]">
            링크 제목 <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-[10px] ${
              form.title.length > 50 ? "text-red-500 font-semibold" : "text-[#868b94]"
            }`}
          >
            {form.title.length}/50
          </span>
        </div>
        <input
          value={form.title}
          onChange={(e) => {
            setForm((p) => ({ ...p, title: e.target.value }));
            if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
          }}
          placeholder="예: 내 포트폴리오"
          className={`w-full text-sm border-b outline-none pb-1 bg-transparent transition-colors ${
            errors.title
              ? "border-red-400 placeholder-red-300"
              : "border-[#dcdee3] focus:border-[#ff6600]"
          }`}
        />
        {errors.title && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
            <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.title}
          </p>
        )}
      </div>

      {/* URL */}
      <div>
        <label className="text-xs font-semibold text-[#555d6d] block mb-0.5">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          value={form.url}
          onChange={(e) => {
            setForm((p) => ({ ...p, url: e.target.value }));
            if (errors.url) setErrors((p) => ({ ...p, url: undefined }));
          }}
          placeholder="https://example.com"
          className={`w-full text-sm border-b outline-none pb-1 bg-transparent transition-colors ${
            errors.url
              ? "border-red-400 placeholder-red-300"
              : "border-[#dcdee3] focus:border-[#ff6600]"
          }`}
        />
        {errors.url && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
            <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.url}
          </p>
        )}
      </div>

      {/* 설명 */}
      <div>
        <label className="text-xs font-semibold text-[#555d6d] block mb-0.5">
          설명 <span className="text-[#868b94] font-normal">(선택)</span>
        </label>
        <input
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="이 링크에 대한 짧은 설명"
          className="w-full text-sm border-b border-[#dcdee3] outline-none pb-1 bg-transparent focus:border-[#ff6600]"
        />
      </div>

      {/* 버튼 영역: 수정 완료 / 취소 */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#ff6600] py-1.5 text-xs font-semibold text-white hover:bg-[#e14d00] transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>저장 중...</span>
            </>
          ) : (
            "수정 완료"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 rounded-lg bg-[#f3f4f5] py-1.5 text-xs font-semibold text-[#555d6d] hover:bg-[#eeeff1] transition-colors disabled:opacity-50"
        >
          취소
        </button>
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ─────────────────────────────────────────────
function DeleteConfirmModal({
  link,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: {
  link: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  if (!isOpen || !link) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] rounded-2xl bg-white p-6 shadow-2xl border border-[#eeeff1] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h3 className="text-lg font-bold text-[#1a1c20] text-center">
          정말 삭제하시겠습니까?
        </h3>

        {/* 링크 이름 표시 */}
        <div className="mt-4 rounded-xl bg-[#f7f8f9] p-3 text-center border border-[#eeeff1]">
          <span className="text-[11px] text-[#868b94] block mb-1">삭제할 링크</span>
          <p className="text-sm font-bold text-[#1a1c20] break-all">
            {link.title}
          </p>
        </div>

        {/* 경고 (빨간색) */}
        <p className="mt-3 text-center text-xs font-semibold text-red-500">
          이작업은 되돌릴 수 없습니다
        </p>

        {/* 버튼: [취소] [삭제하기] */}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-[#f3f4f5] py-2.5 text-xs font-semibold text-[#555d6d] hover:bg-[#eeeff1] transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isDeleting ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>삭제 중...</span>
              </>
            ) : (
              "삭제하기"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────
export default function ProfilePage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 사용자 실시간 검색 모달 상태
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<MyLinkData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [editLinks, setEditLinks] = useState<LinkItem[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLinkErrors, setNewLinkErrors] = useState<{ title?: string; url?: string }>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 편집 모드: 태그(chips) 입력 상태
  const [chipInput, setChipInput] = useState("");
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    title?: string;
    bio?: string;
    chips?: string;
  }>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // 인라인 수정 및 삭제 모달 상태
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 링크 순서 이동 FLIP 애니메이션용 ref 및 상태
  const linkItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevPositionsRef = useRef<Map<string, number>>(new Map());
  const [movingLinkId, setMovingLinkId] = useState<string | null>(null);
  const moveHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 로그인 유저 기반 기본 프로필 생성 헬퍼
  const buildUserProfile = useCallback((firebaseUser: User, savedUser?: Partial<UserProfile>): UserProfile => {
    const defaultUser = (mockData as MyLinkData).user;
    const displayName = savedUser?.name || firebaseUser.displayName || defaultUser.name;
    const email = firebaseUser.email || savedUser?.email || "";
    const username = savedUser?.username || (email ? email.split("@")[0] : defaultUser.username);
    const avatarText = displayName ? displayName.charAt(0).toUpperCase() : defaultUser.avatarText;

    return {
      uid: firebaseUser.uid,
      username,
      name: displayName,
      title: savedUser?.title || defaultUser.title,
      bio: savedUser?.bio || defaultUser.bio,
      avatarText,
      photoURL: firebaseUser.photoURL || savedUser?.photoURL || "",
      email,
      chips: savedUser?.chips || defaultUser.chips,
    };
  }, []);

  // Google 소셜 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("구글 로그인 실패:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut(auth);
      setIsEditMode(false);
      setShowAddForm(false);
      setEditingLinkId(null);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 드롭다운 외부 클릭 및 ESC 키 닫기 처리
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsSearchOpen(false);
      }
    };
    if (isDropdownOpen || isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen, isSearchOpen]);

  // 헤더 공유 버튼 핸들러 (내 공개 링크 클립보드 복사)
  const handleHeaderShare = async () => {
    try {
      const cleanUsername = data?.user.username?.replace(/^@+/, "");
      const shareUrl = cleanUsername
        ? `${window.location.origin}/${encodeURIComponent(cleanUsername)}`
        : window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2000);
    } catch (error) {
      console.error("링크 복사 실패:", error);
    }
  };

  // 헤더 검색 모달 열기 및 전체 유저 목록 로드 (실시간 접두어 자동완성용)
  const handleOpenSearch = async () => {
    setIsSearchOpen(true);
    setSearchQuery("");
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    try {
      setIsSearchingUsers(true);
      const snap = await getDocs(collection(db, "users"));
      const fetchedUsers: UserProfile[] = snap.docs
        .map((docSnap) => {
          const d = docSnap.data() as Partial<UserProfile>;
          const name = (d.name || d.username || "").trim();
          const username = (d.username || d.name || "").replace(/^@+/, "").trim();
          return {
            uid: docSnap.id,
            username,
            name,
            title: d.title || "",
            bio: d.bio || "",
            avatarText: d.avatarText || (name ? name.charAt(0).toUpperCase() : "U"),
            photoURL: d.photoURL || "",
            email: d.email || "",
            chips: d.chips || [],
          };
        })
        .filter((u) => Boolean(u.name || u.username));

      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // 입력한 검색어(접두어 startsWith) 기반 실시간 자동검색 결과
  const normalizedKeyword = searchQuery.trim().replace(/^@+/, "").toLowerCase();
  const matchedUsers = normalizedKeyword
    ? allUsers
        .filter((u) => {
          const uname = (u.username || "").replace(/^@+/, "").toLowerCase();
          const dname = (u.name || "").toLowerCase();
          return uname.startsWith(normalizedKeyword) || dname.startsWith(normalizedKeyword);
        })
        .sort((a, b) => {
          const aKey = (a.username || a.name).toLowerCase();
          const bKey = (b.username || b.name).toLowerCase();
          return aKey.localeCompare(bKey);
        })
    : [];

  // Firebase Auth 로그인 상태 감지
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setAuthUser(currentUser);
      setAvatarImgError(false);
      setIsDropdownOpen(false);
      setIsAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 로그인한 유저의 프로필 및 Firestore(users/{user.uid}/links) 실시간 리스너 연결
  useEffect(() => {
    if (!authUser) {
      setData(null);
      setEditLinks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userStorageKey = `${STORAGE_KEY}-${authUser.uid}`;
    let savedUser: Partial<UserProfile> | undefined;

    const stored = localStorage.getItem(userStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.user) savedUser = parsed.user;
      } catch (e) {
        console.error("로컬 스토리지 파싱 에러:", e);
      }
    }

    const initialUser = buildUserProfile(authUser, savedUser);

    // 1. 초기 프로필 상태 반영
    setData({
      user: initialUser,
      links: [],
    });

    // Firestore users/{user.uid} 문서에서 유저 정보 조회 및 동기화
    const userDocRef = doc(db, "users", authUser.uid);
    getDoc(userDocRef)
      .then((snap) => {
        if (snap.exists()) {
          const firestoreUser = snap.data() as Partial<UserProfile>;
          const mergedUser = buildUserProfile(authUser, { ...savedUser, ...firestoreUser });
          setData((prev) => ({
            user: mergedUser,
            links: prev?.links || [],
          }));
        } else {
          setDoc(userDocRef, initialUser, { merge: true }).catch(() => {});
        }
      })
      .catch((err) => {
        console.error("유저 프로필 문서 조회 실패:", err);
      });

    // 2. Firestore 실시간 리스너 연결: users/{user.uid}/links (createdAt 기준 최신순 정렬)
    const q = query(
      collection(db, "users", authUser.uid, "links"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLinks: LinkItem[] = snapshot.docs.map((docSnap) => {
          const docData = docSnap.data();
          return {
            id: docSnap.id,
            title: docData.title || "",
            url: docData.url || "",
            description: docData.description || "",
            isActive: docData.isActive ?? true,
            isPrimary: docData.isPrimary ?? false,
            icon: docData.icon || "link",
            order: docData.order ?? 0,
            clickCount: docData.clickCount ?? 0,
            createdAt: docData.createdAt,
          };
        });

        // 중복 ID 방지 (Map을 이용한 deduplication)
        const uniqueMap = new Map<string, LinkItem>();
        fetchedLinks.forEach((item) => {
          if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        });
        const uniqueLinks = Array.from(uniqueMap.values());

        // 사용자 지정 순서(order 오름차순) 기준 정렬 (동일할 경우 최신순)
        uniqueLinks.sort((a, b) => {
          const orderA = a.order ?? 9999;
          const orderB = b.order ?? 9999;
          if (orderA !== orderB) return orderA - orderB;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setData((prev) => ({
          user: prev?.user || initialUser,
          links: uniqueLinks,
        }));

        setEditLinks(uniqueLinks);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore 링크 로드 실패:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser, buildUserProfile]);

  // LocalStorage에 저장 (유저 UID별 분리 저장)
  const saveToStorage = useCallback(
    (d: MyLinkData) => {
      const key = authUser ? `${STORAGE_KEY}-${authUser.uid}` : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(d));
    },
    [authUser]
  );

  // 편집 모드 진입
  const enterEditMode = () => {
    if (!data) return;
    setEditProfile({
      ...data.user,
      chips: [...data.user.chips],
    });
    setEditLinks(data.links.map((l) => ({ ...l })));
    setChipInput("");
    setEditErrors({});
    setIsEditMode(true);
  };

  // 기술 스택 칩 추가
  const handleAddChip = () => {
    if (!editProfile) return;
    const trimmedChip = chipInput.trim();
    if (!trimmedChip) return;

    if (editProfile.chips.length >= 10) {
      setEditErrors((p) => ({ ...p, chips: "태그는 최대 10개까지 등록할 수 있습니다." }));
      return;
    }

    if (editProfile.chips.some((c) => c.toLowerCase() === trimmedChip.toLowerCase())) {
      setEditErrors((p) => ({ ...p, chips: "이미 추가된 태그입니다." }));
      return;
    }

    setEditProfile((p) => (p ? { ...p, chips: [...p.chips, trimmedChip] } : p));
    setChipInput("");
    setEditErrors((p) => ({ ...p, chips: undefined }));
  };

  // 기술 스택 칩 삭제
  const handleRemoveChip = (targetChip: string) => {
    if (!editProfile) return;
    setEditProfile((p) =>
      p ? { ...p, chips: p.chips.filter((c) => c !== targetChip) } : p
    );
    setEditErrors((p) => ({ ...p, chips: undefined }));
  };

  // 편집 완료 저장
  const saveEdit = async () => {
    if (!editProfile || !data) return;
    const errors: typeof editErrors = {};

    const trimmedName = editProfile.name.trim();

    if (!trimmedName) {
      errors.name = "이름을 입력해주세요.";
    } else if (trimmedName.length > 20) {
      errors.name = "이름은 20자 이내로 입력해주세요.";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setIsSavingEdit(true);
      const updatedProfile: UserProfile = {
        ...editProfile,
        name: trimmedName,
        username: data.user.username,
        title: editProfile.title.trim(),
        bio: editProfile.bio.trim(),
        avatarText: trimmedName
          ? trimmedName.charAt(0).toUpperCase()
          : editProfile.avatarText,
      };

      const orderedLinks = editLinks.map((l, idx) => ({
        ...l,
        title: l.title.trim() || "링크",
        description: (l.description ?? "").trim(),
        order: idx + 1,
      }));

      const updated: MyLinkData = {
        user: updatedProfile,
        links: orderedLinks,
      };

      setData(updated);
      saveToStorage(updated);

      if (authUser) {
        await Promise.all([
          setDoc(doc(db, "users", authUser.uid), updatedProfile, { merge: true }),
          ...orderedLinks.map((l) =>
            setDoc(
              doc(db, "users", authUser.uid, "links", l.id),
              {
                title: l.title,
                url: l.url,
                description: l.description,
                isActive: l.isActive,
                order: l.order,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            )
          ),
        ]);
        if (authUser.displayName !== updatedProfile.name) {
          await updateProfile(authUser, { displayName: updatedProfile.name }).catch((err) => {
            console.warn("Firebase Auth displayName 업데이트 실패:", err);
          });
        }
      }

      setIsEditMode(false);
      setShowAddForm(false);
      setEditErrors({});
    } catch (error) {
      console.error("유저 프로필 저장 실패:", error);
      alert("프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 편집 취소
  const cancelEdit = () => {
    setIsEditMode(false);
    setShowAddForm(false);
    setEditErrors({});
  };

  // 기본값 복원
  const resetToDefault = () => {
    if (!authUser) return;
    const resetUser = buildUserProfile(authUser);
    const updated: MyLinkData = {
      user: resetUser,
      links: data?.links || [],
    };
    setData(updated);
    localStorage.removeItem(`${STORAGE_KEY}-${authUser.uid}`);
    setDoc(doc(db, "users", authUser.uid), resetUser, { merge: true }).catch(() => {});
    setIsEditMode(false);
    setShowAddForm(false);
  };

  // 링크 공개/비공개 토글
  const toggleLink = (id: string) => {
    setEditLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
  };

  // 링크 순서 위/아래 이동 (FLIP 애니메이션 적용)
  const moveLink = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editLinks.length) return;

    // 1. 이동 전 각 카드의 현재 Y 좌표(First) 기록
    const positions = new Map<string, number>();
    linkItemRefs.current.forEach((el, id) => {
      positions.set(id, el.getBoundingClientRect().top);
    });
    prevPositionsRef.current = positions;

    const targetId = editLinks[index]?.id ?? null;
    if (targetId) {
      setMovingLinkId(targetId);
      if (moveHighlightTimeoutRef.current) {
        clearTimeout(moveHighlightTimeoutRef.current);
      }
      moveHighlightTimeoutRef.current = setTimeout(() => {
        setMovingLinkId(null);
      }, 360);
    }

    setEditLinks((prev) => {
      const next = [...prev];
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  // 2. DOM 순서 반영 직후 이전 위치와의 차이(Invert)를 계산해 부드럽게 슬라이드(Play)
  useLayoutEffect(() => {
    if (prevPositionsRef.current.size === 0) return;

    linkItemRefs.current.forEach((el, id) => {
      const prevTop = prevPositionsRef.current.get(id);
      if (prevTop === undefined) return;
      const newTop = el.getBoundingClientRect().top;
      const deltaY = prevTop - newTop;

      if (Math.abs(deltaY) > 1) {
        el.style.transition = "none";
        el.style.transform = `translateY(${deltaY}px)`;
        // 강제 리플로우
        void el.offsetHeight;
        el.style.transition =
          "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms ease, border-color 320ms ease";
        el.style.transform = "translateY(0)";
      }
    });

    prevPositionsRef.current.clear();
  }, [editLinks]);

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

  // 새 링크 추가 (Firestore users/{user.uid}/links 경로에 저장)
  const addLink = async () => {
    if (!authUser) return;
    const errors: { title?: string; url?: string } = {};

    // 제목 검증
    if (!newLink.title.trim()) {
      errors.title = "제목을 입력해주세요.";
    } else if (newLink.title.trim().length > 50) {
      errors.title = "제목은 50자 이내로 입력해주세요.";
    }

    // URL 검증
    let normalizedUrl = newLink.url.trim();
    if (!normalizedUrl) {
      errors.url = "URL을 입력해주세요.";
    } else {
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl.replace(/^https?:\/+/i, "")}`;
      }
      try {
        const parsed = new URL(normalizedUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.url = "http:// 또는 https://로 시작하는 URL을 입력해주세요.";
        } else {
          normalizedUrl = parsed.href;
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
      const targetUid = auth.currentUser?.uid || authUser.uid;
      const linkPayload = {
        title: newLink.title.trim(),
        url: normalizedUrl,
        description: newLink.description.trim(),
        isActive: true,
        isPrimary: false,
        icon: "link",
        order: editLinks.length + 1,
        clickCount: 0,
        createdAt: new Date().toISOString(),
      };

      // Firestore users/{user.uid}/links 컬렉션에 새 문서 추가
      await addDoc(
        collection(db, "users", targetUid, "links"),
        linkPayload
      );

      // onSnapshot 실시간 리스너가 새 문서를 감지해 editLinks와 data.links를 갱신하므로 폼만 리셋합니다.
      setNewLink({ title: "", url: "", description: "" });
      setNewLinkErrors({});
      setShowAddForm(false);
    } catch (error) {
      console.error(
        "Firestore에 링크 추가 중 오류 발생:",
        error,
        "title:",
        newLink.title,
        "url:",
        normalizedUrl
      );
      setNewLinkErrors({
        title: "Firestore 저장에 실패했습니다. Firebase 권한 또는 연결 상태를 확인해주세요.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // 링크 인라인 수정 저장 (동일 경로: users/{user.uid}/links/{id})
  const handleSaveEdit = async (
    linkId: string,
    values: { title: string; url: string; description: string }
  ): Promise<boolean> => {
    if (!authUser) return false;
    try {
      setIsUpdating(true);
      const docRef = doc(db, "users", authUser.uid, "links", linkId);
      await setDoc(
        docRef,
        {
          title: values.title.trim(),
          url: values.url.trim(),
          description: values.description.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 로컬 상태 즉시 반영
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          links: prev.links.map((l) =>
            l.id === linkId
              ? {
                  ...l,
                  title: values.title.trim(),
                  url: values.url.trim(),
                  description: values.description.trim(),
                }
              : l
          ),
        };
      });

      setEditLinks((prev) =>
        prev.map((l) =>
          l.id === linkId
            ? {
                ...l,
                title: values.title.trim(),
                url: values.url.trim(),
                description: values.description.trim(),
              }
            : l
        )
      );

      setEditingLinkId(null);
      return true;
    } catch (error) {
      console.error("Firestore 링크 수정 실패:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // 삭제 확인 모달 열기
  const handleOpenDeleteModal = (link: LinkItem) => {
    setDeletingLink(link);
  };

  // Firestore 링크 삭제 (동일 경로: users/{user.uid}/links/{id})
  const handleConfirmDelete = async () => {
    if (!deletingLink || !authUser) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "users", authUser.uid, "links", deletingLink.id));

      // 로컬 상태 즉시 반영
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          links: prev.links.filter((l) => l.id !== deletingLink.id),
        };
      });

      setEditLinks((prev) => prev.filter((l) => l.id !== deletingLink.id));

      setDeletingLink(null);
    } catch (error) {
      console.error("Firestore 링크 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 링크 클릭 핸들러 (클릭 카운트 저장)
  const handleLinkClick = async (link: LinkItem) => {
    if (!authUser) return;
    try {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          links: prev.links.map((l) =>
            l.id === link.id ? { ...l, clickCount: (l.clickCount ?? 0) + 1 } : l
          ),
        };
      });

      setEditLinks((prev) =>
        prev.map((l) =>
          l.id === link.id ? { ...l, clickCount: (l.clickCount ?? 0) + 1 } : l
        )
      );

      const linkRef = doc(db, "users", authUser.uid, "links", link.id);
      await updateDoc(linkRef, {
        clickCount: increment(1),
      });
    } catch (error) {
      console.error("클릭 카운트 저장 실패:", error);
    }
  };

  // ── 상단 글로벌 헤더 (구글 소셜 로그인 / 유저 정보 표시) ──
  const renderHeader = () => (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#eeeff1]">
      <div className="mx-auto flex h-14 max-w-[460px] sm:max-w-[540px] items-center justify-between px-4 sm:px-0">
        {/* 브랜드 로고 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6600] text-white font-bold text-sm shadow-sm">
            M
          </div>
          <span className="text-base font-bold tracking-tight text-[#1a1c20]">
            MyLink
          </span>
        </div>

        {/* 우측: 구글 로그인 버튼 또는 액션 버튼(검색/공유/내 페이지) + 유저 프로필 드롭다운 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAuthLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-[#f3f4f5]" />
          ) : authUser ? (
            <>
              {/* 검색 버튼 */}
              <button
                type="button"
                onClick={handleOpenSearch}
                className="flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full bg-white border border-[#dcdee3] sm:px-3 sm:py-1.5 text-xs font-semibold text-[#555d6d] hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shadow-xs shrink-0"
                title="사용자 검색"
                aria-label="검색"
              >
                <span className="hidden sm:inline">검색</span>
                <svg className="h-3.5 w-3.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              {/* 공유 버튼 (링크 복사) */}
              <button
                type="button"
                onClick={handleHeaderShare}
                className="flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full bg-white border border-[#dcdee3] sm:px-3 sm:py-1.5 text-xs font-semibold text-[#555d6d] hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shadow-xs shrink-0"
                title="내 페이지 링크 복사"
                aria-label="공유"
              >
                {isShareCopied ? (
                  <>
                    <span className="hidden sm:inline text-[#10ab7d]">복사됨!</span>
                    <svg className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-[#10ab7d]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">공유</span>
                    <svg className="h-3.5 w-3.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                  </>
                )}
              </button>

              {/* 내 공개 페이지 바로가기 버튼 */}
              {data?.user.username && (
                <Link
                  href={`/${data.user.username.replace(/^@+/, "")}`}
                  className="flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full bg-white border border-[#dcdee3] sm:px-3 sm:py-1.5 text-xs font-semibold text-[#555d6d] hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shadow-xs shrink-0"
                  title="내 공개 페이지 보기"
                  aria-label="내 페이지"
                >
                  <span className="hidden sm:inline">내 페이지</span>
                  <svg className="h-3.5 w-3.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full bg-[#f7f8f9] border border-[#eeeff1] pl-1.5 pr-2.5 py-1 hover:bg-[#eeeff1] transition-colors"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {authUser.photoURL && !avatarImgError ? (
                    <img
                      src={authUser.photoURL}
                      alt={authUser.displayName || "유저 프로필"}
                      className="h-7 w-7 rounded-full object-cover border border-[#eeeff1]"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarImgError(true)}
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff2ec] text-xs font-bold text-[#ff6600] border border-[#ffd5c0]">
                      {(data?.user.name || authUser.displayName || authUser.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[#1a1c20] max-w-[100px] truncate hidden sm:inline-block">
                    {data?.user.name || authUser.displayName || authUser.email}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 text-[#868b94] transition-transform duration-150 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 프로필 드롭다운 메뉴 (Outline Trace + 위에서 아래로 순차 Wipe-In) */}
                {isDropdownOpen && (
                  <div className="animate-dropdown-panel absolute right-0 mt-2 w-56 rounded-2xl bg-white p-1.5 shadow-xl border border-[#eeeff1] z-50 overflow-hidden">
                    {/* 테두리 외곽선 트레이스 SVG (우리 사이트 브랜드 오렌지 톤) */}
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full z-10"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="mylink-outline-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff6600" />
                          <stop offset="50%" stopColor="#ff9a44" />
                          <stop offset="100%" stopColor="#ffd5c0" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="1"
                        y="1"
                        width="calc(100% - 2px)"
                        height="calc(100% - 2px)"
                        rx="15"
                        ry="15"
                        fill="none"
                        stroke="url(#mylink-outline-grad)"
                        strokeWidth="1.75"
                        pathLength="100"
                        className="animate-outline-trace"
                      />
                    </svg>

                    {/* 로그인 계정 정보 요약 */}
                    <div
                      style={{ "--row-idx": 0 } as CSSProperties}
                      className="animate-dropdown-row px-3 py-2.5 border-b border-[#eeeff1]"
                    >
                      <p className="text-xs font-bold text-[#1a1c20] truncate">
                        {data?.user.name || authUser.displayName || "사용자"}
                      </p>
                      {authUser.email && (
                        <p className="mt-0.5 text-[11px] text-[#868b94] truncate">
                          {authUser.email}
                        </p>
                      )}
                    </div>

                    {/* 메뉴 항목: 내 공개 페이지, 프로필/링크 편집, 내 링크 복사, 기본값 초기화 */}
                    <div className="py-1 space-y-0.5 border-b border-[#eeeff1]">
                      {/* 내 공개 페이지 바로가기 */}
                      {data?.user.username && (
                        <Link
                          href={`/${data.user.username.replace(/^@+/, "")}`}
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ "--row-idx": 1 } as CSSProperties}
                          className="animate-dropdown-row flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1a1c20] hover:bg-[#f7f8f9] transition-colors"
                        >
                          <svg
                            className="h-4 w-4 text-[#ff6600] shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          <span>내 공개 페이지 보기</span>
                        </Link>
                      )}

                      {/* 통계 페이지 바로가기 */}
                      <Link
                        href="/stats"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{ "--row-idx": 2 } as CSSProperties}
                        className="animate-dropdown-row flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1a1c20] hover:bg-[#f7f8f9] transition-colors"
                      >
                        <svg
                          className="h-4 w-4 text-[#ff6600] shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                          />
                        </svg>
                        <span>통계 대시보드</span>
                      </Link>
                    {/* 1. 프로필/링크 편집 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditMode) {
                          cancelEdit();
                        } else {
                          enterEditMode();
                        }
                        setIsDropdownOpen(false);
                      }}
                      style={{ "--row-idx": 3 } as CSSProperties}
                      className="animate-dropdown-row flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1a1c20] hover:bg-[#f7f8f9] transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-[#555d6d] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>{isEditMode ? "편집 모드 종료" : "프로필/링크 편집"}</span>
                    </button>

                    {/* 2. 내 링크 복사 */}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const cleanUsername = data?.user.username?.replace(/^@+/, "");
                          const shareUrl = cleanUsername
                            ? `${window.location.origin}/${encodeURIComponent(cleanUsername)}`
                            : window.location.href;
                          await navigator.clipboard.writeText(shareUrl);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        } catch (error) {
                          console.error("링크 복사 실패:", error);
                        }
                      }}
                      style={{ "--row-idx": 4 } as CSSProperties}
                      className="animate-dropdown-row flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1a1c20] hover:bg-[#f7f8f9] transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <svg
                            className="h-4 w-4 text-[#10ab7d] shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-[#10ab7d]">링크 복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4 text-[#555d6d] shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>내 링크 복사</span>
                        </>
                      )}
                    </button>

                    {/* 5. 기본값 초기화 */}
                    <button
                      type="button"
                      onClick={() => {
                        resetToDefault();
                        setIsDropdownOpen(false);
                      }}
                      style={{ "--row-idx": 5 } as CSSProperties}
                      className="animate-dropdown-row flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#555d6d] hover:bg-[#f7f8f9] hover:text-[#1a1c20] transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-[#868b94] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>기본값 초기화</span>
                    </button>
                  </div>

                  {/* 메뉴 항목: 로그아웃 */}
                  <div
                    style={{ "--row-idx": 6 } as CSSProperties}
                    className="animate-dropdown-row pt-1"
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 rounded-full bg-white border border-[#dcdee3] px-3.5 py-1.5 text-xs font-semibold text-[#1a1c20] shadow-xs hover:bg-[#f7f8f9] transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{isLoggingIn ? "로그인 중..." : "Google 로그인"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );

  // 1. 인증 상태 확인 중 로딩 화면
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f8f9]">
        {renderHeader()}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#868b94] text-sm">로그인 상태를 확인하는 중...</div>
        </main>
      </div>
    );
  }

  // 2. 비로그인 상태 화면: 모던 반응형 랜딩 페이지
  if (!authUser) {
    return <LandingPage onLogin={handleGoogleLogin} isLoggingIn={isLoggingIn} />;
  }

  // 3. 로그인 완료 후 데이터 로드 중 화면
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f8f9]">
        {renderHeader()}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-[#868b94] text-sm">불러오는 중...</div>
        </main>
      </div>
    );
  }

  const { user, links } = data;
  const activeLinks = links
    .filter((l) => l.isActive)
    .sort((a, b) => {
      const orderA = a.order ?? 9999;
      const orderB = b.order ?? 9999;
      if (orderA !== orderB) return orderA - orderB;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  const primaryLink = activeLinks.find((l) => l.isPrimary);
  const subLinks = activeLinks.filter((l) => !l.isPrimary);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8f9]">
      {renderHeader()}
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 pb-28">
        <div className="w-full max-w-[460px]">
          {/* 프로필 카드 */}
          <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] border border-[#eeeff1]">

            {/* ── 프로필 헤더 (로그인한 유저 정보 표시) ── */}
            <div className="flex flex-col items-center text-center">
              {/* 아바타 */}
              <div className="relative mb-3.5">
                {(user.photoURL || authUser.photoURL) && !avatarImgError ? (
                  <img
                    src={user.photoURL || authUser.photoURL || ""}
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover border border-[#ffd5c0]"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarImgError(true)}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff2ec] text-[#ff6600] text-2xl font-bold border border-[#ffd5c0]">
                    {user.avatarText}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#10ab7d] ring-2 ring-white" />
              </div>

              {/* 이름 */}
              {isEditMode ? (
                <div className="w-full max-w-[240px]">
                  <label className="text-[11px] font-semibold text-[#868b94] block mb-0.5">이름</label>
                  <input
                    value={editProfile?.name ?? ""}
                    onChange={(e) => {
                      setEditProfile((p) => (p ? { ...p, name: e.target.value } : p));
                      if (editErrors.name) setEditErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="이름을 입력하세요"
                    className={`text-lg font-bold text-center text-[#1a1c20] border-b-2 outline-none w-full bg-transparent pb-0.5 transition-colors ${
                      editErrors.name
                        ? "border-red-400 placeholder-red-300"
                        : "border-[#ff6600]"
                    }`}
                  />
                  {editErrors.name && (
                    <p className="mt-1 text-[11px] text-red-500">{editErrors.name}</p>
                  )}
                </div>
              ) : (
                <h1 className="text-[22px] font-bold leading-[30px] text-[#1a1c20]">
                  {user.name}
                </h1>
              )}

              {/* Display Name (@username) */}
              {user.username && (
                <Link
                  href={`/${user.username.replace(/^@+/, "")}`}
                  className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-[#868b94] hover:text-[#ff6600] transition-colors"
                  title="내 공개 페이지 바로가기"
                >
                  <span>@{user.username.replace(/^@+/, "")}</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}

              {/* 직무 뱃지 */}
              {isEditMode ? (
                <div className="mt-2.5 w-full max-w-[240px]">
                  <label className="text-[11px] font-semibold text-[#868b94] block mb-0.5">직무 / 타이틀</label>
                  <input
                    value={editProfile?.title ?? ""}
                    onChange={(e) => {
                      setEditProfile((p) => (p ? { ...p, title: e.target.value } : p));
                      if (editErrors.title) setEditErrors((p) => ({ ...p, title: undefined }));
                    }}
                    placeholder="예: 직무 / 타이틀"
                    className="w-full text-xs font-semibold text-center text-[#e14d00] bg-[#fff2ec] rounded-full px-2.5 py-1 border border-[#ff6600] outline-none"
                  />
                  {editErrors.title && (
                    <p className="mt-1 text-[11px] text-red-500">{editErrors.title}</p>
                  )}
                </div>
              ) : (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#fff2ec] px-2.5 py-0.5 text-xs font-semibold text-[#e14d00]">
                  {user.title}
                </div>
              )}

              {/* 소개글 */}
              {isEditMode ? (
                <div className="mt-2.5 w-full">
                  <label className="text-[11px] font-semibold text-[#868b94] block mb-0.5 text-left">소개글</label>
                  <textarea
                    value={editProfile?.bio ?? ""}
                    onChange={(e) => {
                      setEditProfile((p) => (p ? { ...p, bio: e.target.value } : p));
                      if (editErrors.bio) setEditErrors((p) => ({ ...p, bio: undefined }));
                    }}
                    rows={3}
                    placeholder="예: 소개글입니다."
                    className="w-full text-sm leading-[20px] text-[#555d6d] border border-[#eeeff1] rounded-lg p-2 outline-none focus:border-[#ff6600] resize-none"
                  />
                  {editErrors.bio && (
                    <p className="mt-1 text-[11px] text-red-500">{editErrors.bio}</p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-[20px] text-[#555d6d] break-keep px-2">
                  {user.bio}
                </p>
              )}

              {/* 기술 스택 칩 */}
              {isEditMode ? (
                <div className="mt-3 w-full text-left">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#868b94]">
                      기술 스택 / 키워드 태그
                    </label>
                    <span className="text-[10px] text-[#868b94]">
                      {(editProfile?.chips || []).length}/10
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={chipInput}
                      onChange={(e) => {
                        setChipInput(e.target.value);
                        if (editErrors.chips) setEditErrors((p) => ({ ...p, chips: undefined }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddChip();
                        }
                      }}
                      placeholder="태그 입력 후 Enter 또는 추가"
                      className="flex-1 rounded-xl border border-[#dcdee3] bg-[#f7f8f9] px-2.5 py-1.5 text-xs text-[#1a1c20] outline-none focus:bg-white focus:border-[#ff6600] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddChip}
                      className="shrink-0 rounded-xl bg-[#f3f4f5] px-3 py-1.5 text-xs font-semibold text-[#555d6d] hover:bg-[#eeeff1] hover:text-[#1a1c20] transition-colors"
                    >
                      추가
                    </button>
                  </div>
                  {editErrors.chips && (
                    <p className="mt-1 text-[11px] text-red-500">{editErrors.chips}</p>
                  )}
                  {/* 등록된 칩 목록 (삭제 버튼 포함) */}
                  {(editProfile?.chips || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
                      {editProfile?.chips.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex items-center gap-1 rounded-full bg-[#fff2ec] border border-[#ffd5c0] px-2.5 py-0.5 text-xs font-medium text-[#e14d00]"
                        >
                          <span>{chip}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChip(chip)}
                            className="rounded-full p-0.5 text-[#e14d00]/70 hover:bg-[#ffd5c0]/60 hover:text-[#e14d00] transition-colors"
                            aria-label={`${chip} 태그 삭제`}
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
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
              )}
            </div>

            {/* 구분선 */}
            <div className="my-6 h-[1px] w-full bg-[#eeeff1]" />

            {/* ── 링크 목록 (방문자 뷰) ── */}
            {!isEditMode && (
              isLoading ? (
                <LinkSkeleton />
              ) : (
                <>
                  {/* 대표 CTA 버튼 */}
                  {primaryLink && (
                    editingLinkId === primaryLink.id ? (
                      <div className="mb-4">
                        <InlineEditCard
                          link={primaryLink}
                          onSave={handleSaveEdit}
                          onCancel={() => setEditingLinkId(null)}
                          isSaving={isUpdating}
                        />
                      </div>
                    ) : (
                      <div className="mb-4 flex items-center gap-2">
                        <a
                          href={primaryLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleLinkClick(primaryLink)}
                          className="flex flex-1 items-center justify-between rounded-full bg-[#ff6600] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#e14d00] active:scale-[0.98] min-w-0"
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingLinkId(primaryLink.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#555d6d] border border-[#eeeff1] hover:text-[#ff6600] hover:border-[#ff6600] shadow-sm transition-colors"
                            title="링크 수정"
                            aria-label="링크 수정"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(primaryLink)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#868b94] border border-[#eeeff1] hover:text-red-500 hover:border-red-300 shadow-sm transition-colors"
                            title="링크 삭제"
                            aria-label="링크 삭제"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {/* 서브 링크 목록 */}
                  <div className="space-y-2.5">
                    {subLinks.map((link) => (
                      editingLinkId === link.id ? (
                        <InlineEditCard
                          key={link.id}
                          link={link}
                          onSave={handleSaveEdit}
                          onCancel={() => setEditingLinkId(null)}
                          isSaving={isUpdating}
                        />
                      ) : (
                        <div
                          key={link.id}
                          className="flex items-center justify-between rounded-xl bg-[#f7f8f9] p-3.5 transition-colors border border-transparent hover:border-[#eeeff1]"
                        >
                          {/* 링크 영역 (클릭 시 새 탭 이동) */}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLinkClick(link)}
                            className="group flex items-center gap-3 flex-1 min-w-0 mr-2"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#555d6d] shadow-sm transition-colors group-hover:text-[#ff6600]">
                              <LinkIcon icon={link.icon} url={link.url} />
                            </div>
                            <div className="text-left min-w-0 flex-1">
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
                                <div className="text-xs text-[#868b94] break-words break-keep leading-relaxed mt-0.5">
                                  {link.description}
                                </div>
                              )}
                            </div>
                          </a>

                          {/* 수정 / 삭제 버튼 (연필 아이콘, 글자 없음, 항상 표기) */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingLinkId(link.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#555d6d] border border-[#eeeff1] hover:text-[#ff6600] hover:border-[#ff6600] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors"
                              title="링크 수정"
                              aria-label="링크 수정"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(link)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#868b94] border border-[#eeeff1] hover:text-red-500 hover:border-red-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors"
                              title="링크 삭제"
                              aria-label="링크 삭제"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  {activeLinks.length === 0 && (
                    <div className="py-8 text-center text-xs text-[#868b94]">
                      등록된 링크가 없습니다.
                    </div>
                  )}
                </>
              )
            )}

            {/* ── 편집 모드: 링크 관리 ── */}
            {isEditMode && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#868b94] uppercase tracking-wide">
                    링크 관리
                  </p>
                  <span className="text-[11px] text-[#868b94]">
                    화살표로 순서 변경 · 공개 여부 선택
                  </span>
                </div>
                {isLoading ? (
                  <LinkSkeleton />
                ) : (
                  editLinks.map((link, index) => (
                    <div
                      key={link.id}
                      ref={(el) => {
                        if (el) {
                          linkItemRefs.current.set(link.id, el);
                        } else {
                          linkItemRefs.current.delete(link.id);
                        }
                      }}
                      className={`rounded-xl border p-3 will-change-transform ${
                        movingLinkId === link.id
                          ? "bg-[#fff9f6] border-[#ff6600] shadow-md z-10 relative"
                          : link.isActive
                          ? "bg-white border-[#eeeff1]"
                          : "bg-[#f7f8f9] border-[#eeeff1] opacity-65"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* 좌측: 위/아래 순서 이동 버튼 */}
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveLink(index, "up")}
                            disabled={index === 0}
                            className="flex h-5 w-6 items-center justify-center rounded bg-[#f3f4f5] text-[#555d6d] hover:bg-[#fff2ec] hover:text-[#ff6600] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="위로 이동"
                            aria-label="위로 이동"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLink(index, "down")}
                            disabled={index === editLinks.length - 1}
                            className="flex h-5 w-6 items-center justify-center rounded bg-[#f3f4f5] text-[#555d6d] hover:bg-[#fff2ec] hover:text-[#ff6600] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="아래로 이동"
                            aria-label="아래로 이동"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* 중앙: 제목 및 설명 입력 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {link.isPrimary && (
                              <span className="shrink-0 rounded-full bg-[#fff2ec] px-1.5 py-0.5 text-[10px] font-bold text-[#e14d00]">
                                대표
                              </span>
                            )}
                            <input
                              value={link.title}
                              onChange={(e) => updateLink(link.id, "title", e.target.value)}
                              placeholder="링크 제목"
                              className="text-sm font-semibold text-[#1a1c20] border-b border-[#dcdee3] outline-none w-full min-w-0 bg-transparent focus:border-[#ff6600]"
                            />
                          </div>
                          <input
                            value={link.description ?? ""}
                            onChange={(e) => updateLink(link.id, "description", e.target.value)}
                            placeholder="설명 (선택)"
                            className="mt-1.5 text-xs text-[#868b94] border-b border-transparent outline-none w-full bg-transparent focus:border-[#dcdee3] placeholder-[#c2c5cb]"
                          />
                        </div>

                        {/* 우측: 공개/비공개 토글 및 삭제 */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleLink(link.id)}
                            title={link.isActive ? "클릭하여 비공개로 전환" : "클릭하여 공개로 전환"}
                            className="flex items-center gap-1.5 rounded-full bg-[#f7f8f9] border border-[#eeeff1] pl-2 pr-1 py-0.5 hover:border-[#dcdee3] transition-colors"
                          >
                            <span
                              className={`text-[11px] font-semibold ${
                                link.isActive ? "text-[#e14d00]" : "text-[#868b94]"
                              }`}
                            >
                              {link.isActive ? "공개" : "비공개"}
                            </span>
                            <span
                              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                                link.isActive ? "bg-[#ff6600]" : "bg-[#dcdee3]"
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                                  link.isActive ? "translate-x-3.5" : "translate-x-0.5"
                                }`}
                              />
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(link)}
                            className="p-1 text-[#868b94] hover:text-red-500 transition-colors"
                            title="링크 삭제"
                            aria-label="링크 삭제"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

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
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#ff6600] py-1.5 text-xs font-semibold text-white hover:bg-[#e14d00] transition-colors disabled:opacity-50"
                      >
                        {isAdding ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            <span>저장 중...</span>
                          </>
                        ) : (
                          "추가"
                        )}
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
          </div>
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
      <DeleteConfirmModal
        link={deletingLink}
        isOpen={Boolean(deletingLink)}
        onClose={() => {
          if (!isDeleting) setDeletingLink(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* ── 인스타 스타일 사용자 실시간 자동완성 검색 모달 ── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl bg-white shadow-2xl border border-[#eeeff1] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 검색 입력창 (타자 치는 즉시 자동 검색) */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#eeeff1] bg-[#f7f8f9]/60">
              <svg
                className="h-4 w-4 text-[#868b94] shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사용자 이름 또는 @아이디 검색..."
                className="flex-1 bg-transparent text-sm text-[#1a1c20] placeholder-[#868b94] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dcdee3] text-white hover:bg-[#868b94] transition-colors"
                  aria-label="검색어 지우기"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs font-semibold text-[#555d6d] hover:text-[#1a1c20] px-1.5 py-0.5 transition-colors"
              >
                닫기
              </button>
            </div>

            {/* 실시간 자동검색 결과 리스트 */}
            <div className="max-h-[340px] overflow-y-auto p-2">
              {!normalizedKeyword ? (
                <div className="py-10 text-center">
                  <p className="text-xs font-medium text-[#868b94]">
                    찾고 싶은 사용자의 이름이나 아이디를 입력해보세요.
                  </p>
                  <p className="mt-1 text-[11px] text-[#b0b5bd]">
                    글자를 입력하는 즉시 실시간으로 자동 검색됩니다.
                  </p>
                </div>
              ) : isSearchingUsers && allUsers.length === 0 ? (
                <div className="py-10 flex items-center justify-center gap-2 text-xs text-[#868b94]">
                  <svg className="h-4 w-4 animate-spin text-[#ff6600]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>검색 중...</span>
                </div>
              ) : matchedUsers.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#868b94]">
                  &lsquo;<span className="font-semibold text-[#1a1c20]">{searchQuery.trim()}</span>&rsquo;(으)로 시작하는 사용자가 없습니다.
                </div>
              ) : (
                <div className="space-y-1">
                  {matchedUsers.map((target) => {
                    const targetSlug = (target.username || target.name).replace(/^@+/, "");
                    return (
                      <Link
                        key={target.uid || targetSlug}
                        href={`/${encodeURIComponent(targetSlug)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-[#f7f8f9] transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {target.photoURL ? (
                            <img
                              src={target.photoURL}
                              alt={target.name}
                              className="h-10 w-10 rounded-full object-cover border border-[#eeeff1] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2ec] text-sm font-bold text-[#ff6600] border border-[#ffd5c0]">
                              {target.avatarText || target.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-[#1a1c20] truncate group-hover:text-[#ff6600] transition-colors">
                                {target.name}
                              </span>
                              {target.username && (
                                <span className="text-xs text-[#868b94] truncate">
                                  @{target.username.replace(/^@+/, "")}
                                </span>
                              )}
                            </div>
                            {target.title && (
                              <p className="text-xs text-[#555d6d] truncate mt-0.5">
                                {target.title}
                              </p>
                            )}
                          </div>
                        </div>

                        <svg
                          className="h-4 w-4 text-[#868b94] shrink-0 group-hover:text-[#ff6600] group-hover:translate-x-0.5 transition-all"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
