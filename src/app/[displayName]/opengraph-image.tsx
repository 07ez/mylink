import { ImageResponse } from "next/og";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import mockData from "@/data/mock-links.json";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ displayName: string }>;
}

export default async function Image({ params }: Props) {
  const { displayName } = await params;
  const decoded = decodeURIComponent(displayName || "");
  const cleanHandle = decoded.startsWith("@") ? decoded.slice(1) : decoded;

  let profile = {
    name: cleanHandle,
    username: cleanHandle,
    title: "MyLink 올인원 프로필",
    bio: "깃허브, 포트폴리오, 블로그를 한 페이지에 담은 프로필입니다.",
    avatarText: cleanHandle.charAt(0).toUpperCase() || "M",
    chips: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    linkCount: 4,
  };

  // 1. 기본 mockData 일치 여부 확인 (예: hong / 홍길동)
  if (
    cleanHandle === mockData.user.username ||
    cleanHandle === mockData.user.name ||
    cleanHandle.toLowerCase() === "hong" ||
    cleanHandle === "홍길동"
  ) {
    profile = {
      name: mockData.user.name,
      username: mockData.user.username,
      title: mockData.user.title,
      bio: mockData.user.bio,
      avatarText: mockData.user.avatarText,
      chips: mockData.user.chips,
      linkCount: mockData.links.length,
    };
  } else {
    // 2. Firestore에서 실시간 유저 프로필 조회 시도
    try {
      const usersRef = collection(db, "users");
      // username으로 검색
      let q = query(usersRef, where("username", "==", cleanHandle), limit(1));
      let snap = await getDocs(q);

      // name으로 검색 (fallback)
      if (snap.empty) {
        q = query(usersRef, where("name", "==", cleanHandle), limit(1));
        snap = await getDocs(q);
      }

      if (!snap.empty) {
        const data = snap.docs[0].data();
        profile = {
          name: data.name || cleanHandle,
          username: data.username || cleanHandle,
          title: data.title || "MyLink 올인원 프로필",
          bio: data.bio || "깃허브, 포트폴리오, 블로그를 한 페이지에 담은 프로필입니다.",
          avatarText:
            data.avatarText || (data.name || cleanHandle).charAt(0).toUpperCase(),
          chips: data.chips && data.chips.length > 0 ? data.chips : profile.chips,
          linkCount: profile.linkCount,
        };
      }
    } catch {
      // 네트워크 또는 오프라인 환경 등 오류 발생 시 기본 profile 유지
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fafbfc",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(255, 102, 0, 0.15) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(255, 102, 0, 0.08) 0%, transparent 40%)",
          padding: "48px 56px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 상단 브랜딩 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* 좌측: MyLink 로고 & 주소 뱃지 */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                backgroundColor: "#ff6600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: 900,
                boxShadow: "0 6px 14px rgba(255, 102, 0, 0.3)",
              }}
            >
              M
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#1a1c20",
                  letterSpacing: "-0.5px",
                }}
              >
                MyLink
              </span>
              <span style={{ fontSize: "16px", color: "#868b94" }}>/</span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#ff6600",
                }}
              >
                @{profile.username}
              </span>
            </div>
          </div>

          {/* 우측: 상태 뱃지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#ffffff",
              border: "1px solid #eeeff1",
              borderRadius: "999px",
              padding: "7px 16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "#10ab7d",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#1a1c20",
              }}
            >
              공개 프로필
            </span>
          </div>
        </div>

        {/* 중앙: 프로필 메인 카드 (디자인 시스템의 모던 클린 카드 적용) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            borderRadius: "32px",
            border: "1.5px solid #eeeff1",
            padding: "36px 44px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.06)",
            gap: "24px",
          }}
        >
          {/* 아바타 + 이름 + 타이틀 */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {/* 시그니처 오렌지 아바타 */}
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "999px",
                backgroundColor: "#fff2ec",
                border: "3px solid #ffd5c0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ff6600",
                fontSize: "42px",
                fontWeight: 900,
                boxShadow: "0 8px 24px rgba(255, 102, 0, 0.15)",
                flexShrink: 0,
              }}
            >
              {profile.avatarText}
            </div>

            {/* 유저 텍스트 정보 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "#1a1c20",
                    letterSpacing: "-1px",
                  }}
                >
                  {profile.name}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#868b94",
                  }}
                >
                  @{profile.username}
                </span>
                <div
                  style={{
                    backgroundColor: "#fff2ec",
                    borderRadius: "999px",
                    padding: "4px 12px",
                    color: "#e14d00",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {profile.title}
                </div>
              </div>

              <p
                style={{
                  fontSize: "18px",
                  color: "#555d6d",
                  lineHeight: 1.45,
                  margin: 0,
                  maxWidth: "850px",
                }}
              >
                {profile.bio}
              </p>
            </div>
          </div>

          {/* 하단 칩 태그 및 프리뷰 링크 박스 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #f0f1f3",
              paddingTop: "20px",
              marginTop: "4px",
            }}
          >
            {/* 기술 스택 / 태그 칩 */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {profile.chips.slice(0, 5).map((chip, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#fafbfc",
                    border: "1px solid #eeeff1",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#555d6d",
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>

            {/* 실시간 뷰 & 링크 안내 */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#fff2ec",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  color: "#ff6600",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                <span>🔗 모든 링크 보러가기</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 푸터 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
            color: "#868b94",
            padding: "0 8px",
          }}
        >
          <span>https://mylink-hez5.vercel.app/@{profile.username}</span>
          <span style={{ color: "#ff6600", fontWeight: 700 }}>
            {profile.name}님의 포트폴리오 및 링크 모음 · MyLink
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
