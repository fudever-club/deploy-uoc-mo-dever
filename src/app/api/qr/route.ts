import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const defaultUrl = `${protocol}://${host}/`;
    const targetUrl = searchParams.get("url") || defaultUrl;
    const width = Math.min(1000, Math.max(200, parseInt(searchParams.get("width") || "360", 10)));

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width,
      margin: 2,
      color: {
        dark: "#12203a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    return NextResponse.json(
      {
        success: true,
        url: targetUrl,
        qrDataUrl,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/qr error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tạo mã QR" },
      { status: 500 }
    );
  }
}
