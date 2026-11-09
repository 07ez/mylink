import type { Metadata } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import mockData from "@/data/mock-links.json";

interface Props {
  params: Promise<{ displayName: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ displayName: string }>;
}): Promise<Metadata> {
  const { displayName } = await params;
  const decoded = decodeURIComponent(displayName || "");
  const cleanHandle = decoded.startsWith("@") ? decoded.slice(1) : decoded;

  let name = cleanHandle;
  let title = "";
  let bio = "";

  // 1. Firestore에서 실시간 유저 조회 (username 또는 name)
  try {
    const usersRef = collection(db, "users");
    
    // username 일치 검색
    let snap = await getDocs(
      query(usersRef, where("username", "==", cleanHandle), limit(1))
    );

    // 소문자 변환 검색
    if (snap.empty && cleanHandle.toLowerCase() !== cleanHandle) {
      snap = await getDocs(
        query(usersRef, where("username", "==", cleanHandle.toLowerCase()), limit(1))
      );
    }

    // name(표시 이름) 일치 검색
    if (snap.empty) {
      snap = await getDocs(
        query(usersRef, where("name", "==", cleanHandle), limit(1))
      );
    }

    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data.name) name = data.name;
      if (data.title) title = data.title;
      if (data.bio) bio = data.bio;
    } else {
      // 2. Firestore에 없을 경우 기본 mockData 일치 여부 확인 (예: hong / 홍길동)
      if (
        cleanHandle === mockData.user.username ||
        cleanHandle === mockData.user.name ||
        cleanHandle.toLowerCase() === "hong" ||
        cleanHandle === "홍길동"
      ) {
        name = mockData.user.name;
        title = mockData.user.title;
        bio = mockData.user.bio;
      }
    }
  } catch {
    // Firestore 조회 실패 시 cleanHandle 기본값 유지
  }

  // 동적 타이틀: MyLink - {사용자이름}
  const pageTitle = `MyLink - ${name}`;

  // 동적 설명: 사용자의 소개글(bio)이나 직무가 있으면 반영, 없으면 Hello World! 친근한 기본 카피
  let pageDesc = "";
  if (bio) {
    pageDesc = title ? `${bio} · ${title}` : bio;
  } else if (title) {
    pageDesc = `${title} · ${name}님의 올인원 프로필과 모든 링크 모아보기 ✨`;
  } else {
    pageDesc = `Hello World! ${name}님의 올인원 프로필 링크입니다. ✨`;
  }

  const pageUrl = `https://mylink-hez5.vercel.app/${displayName}`;

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: pageUrl,
      siteName: "MyLink",
      type: "profile",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
    },
  };
}

export default function DynamicUserLayout({ children }: Props) {
  return <>{children}</>;
}
