import { ImageResponse } from "next/og";

export const alt = "MyLink - 나만의 올인원 프로필 링크";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 90% 15%, rgba(255, 102, 0, 0.12) 0%, transparent 50%), radial-gradient(circle at 10% 85%, rgba(255, 102, 0, 0.08) 0%, transparent 40%)",
          padding: "54px 64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 상단 헤더: 로고 & 뱃지 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#ff6600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "26px",
                fontWeight: 900,
                boxShadow: "0 6px 16px rgba(255, 102, 0, 0.3)",
              }}
            >
              M
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#1a1c20",
                  letterSpacing: "-0.5px",
                }}
              >
                MyLink
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#868b94",
                  fontWeight: 600,
                }}
              >
                나만의 올인원 프로필 링크
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#fff2ec",
              border: "1px solid #ffd5c0",
              borderRadius: "999px",
              padding: "8px 18px",
              color: "#e14d00",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "#ff6600",
              }}
            />
            <span>10초 만에 완성하는 프로필</span>
          </div>
        </div>

        {/* 중앙 메인 쇼케이스: 좌측 카피 + 우측 모바일 목업 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "48px",
            margin: "24px 0",
          }}
        >
          {/* 좌측 헤드라인 & 소개 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "50px",
                fontWeight: 900,
                color: "#1a1c20",
                lineHeight: 1.15,
                letterSpacing: "-1.5px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>흩어져 있던 나의 모든 링크,</span>
              <span style={{ color: "#ff6600" }}>MyLink 하나로 완벽하게.</span>
            </div>

            <p
              style={{
                fontSize: "20px",
                color: "#555d6d",
                lineHeight: 1.5,
                margin: 0,
                maxWidth: "520px",
              }}
            >
              깃허브, 포트폴리오, 블로그, SNS를 감각적인 한 페이지에 담고 실시간 방문자 클릭수를 분석해보세요.
            </p>

            {/* 특징 태그 뱃지들 */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#fafbfc",
                  border: "1px solid #eeeff1",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1a1c20",
                }}
              >
                <span>🔥 실시간 클릭 카운트</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#fafbfc",
                  border: "1px solid #eeeff1",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1a1c20",
                }}
              >
                <span>📊 shadcn 통계 차트</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#fafbfc",
                  border: "1px solid #eeeff1",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1a1c20",
                }}
              >
                <span>⚡ 나만의 @아이디</span>
              </div>
            </div>
          </div>

          {/* 우측 미니 모바일 프리뷰 카드 */}
          <div
            style={{
              width: "360px",
              backgroundColor: "#ffffff",
              border: "1.5px solid #eeeff1",
              borderRadius: "28px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* 프로필 헤더 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "999px",
                  backgroundColor: "#fff2ec",
                  border: "2px solid #ffd5c0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff6600",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                홍
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#1a1c20",
                  }}
                >
                  홍길동
                </span>
                <span style={{ fontSize: "12px", color: "#868b94" }}>
                  @hong · 주니어 개발자
                </span>
              </div>
            </div>

            {/* 샘플 링크 아이템들 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  backgroundColor: "#ff6600",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#ffffff",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>
                  GitHub 저장소
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "rgba(0,0,0,0.15)",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <span>👁️</span>
                  <span>42</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#fafbfc",
                  border: "1px solid #eeeff1",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#1a1c20",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>
                  포트폴리오 & 프로젝트
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "#f0f1f3",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#555d6d",
                  }}
                >
                  <span>👁️</span>
                  <span>28</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#fafbfc",
                  border: "1px solid #eeeff1",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#1a1c20",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>
                  기술 블로그
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "#f0f1f3",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#555d6d",
                  }}
                >
                  <span>👁️</span>
                  <span>19</span>
                </div>
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
            borderTop: "1px solid #eeeff1",
            paddingTop: "18px",
            fontSize: "14px",
            color: "#868b94",
          }}
        >
          <span>https://mylink-hez5.vercel.app</span>
          <span style={{ color: "#ff6600", fontWeight: 700 }}>
            모든 링크를 가장 완벽하게 연결하는 방법 · MyLink
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
