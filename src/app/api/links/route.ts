import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import mockData from "@/data/mock-links.json";
import type { MyLinkData } from "@/types/link";

// GET /api/links - 프로필 및 링크 전체 데이터 조회
export async function GET() {
  return NextResponse.json(mockData as MyLinkData);
}

// POST /api/links - 새 링크 추가 (Firestore users/{uid}/links에 저장)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const uid = body.uid || "anonymous";
    const linkPayload = {
      title: body.title,
      url: body.url,
      description: body.description ?? "",
      isActive: body.isActive ?? true,
      isPrimary: body.isPrimary ?? false,
      icon: body.icon ?? "link",
      order: body.order ?? 99,
      clickCount: body.clickCount ?? 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, "users", uid, "links"),
      linkPayload
    );

    const newLink = {
      id: docRef.id,
      ...linkPayload,
    };

    return NextResponse.json({ success: true, link: newLink }, { status: 201 });
  } catch (error) {
    console.error("Firestore에 링크 추가 중 오류 발생:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/links - 프로필/링크 일괄 업데이트 (mock 응답)
export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, data: body });
}
