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

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 1000,
      margin: 2,
      color: {
        dark: "#12203a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });

    return NextResponse.json({
      success: true,
      url: targetUrl,
      qrDataUrl,
    });
  } catch (error) {
    console.error("GET /api/qr error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tạo mã QR" },
      { status: 500 }
    );
  }
}
