import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const correct = searchParams.get("correct") ?? "0";
  const total = searchParams.get("total") ?? "0";
  const label = searchParams.get("label") ?? "Practice";

  const emoji = score >= 70 ? "🏆" : score >= 50 ? "✨" : "💪";
  const bgColor =
    score >= 70 ? "#0D9488" : score >= 50 ? "#D97706" : "#DC2626";

  const date = new Date().toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* App name */}
        <div
          style={{
            position: "absolute",
            top: 44,
            color: "rgba(255,255,255,0.85)",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          📚 LibreviewPH
        </div>

        {/* Score block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <div style={{ fontSize: 28 }}>{emoji}</div>
          <div
            style={{
              color: "white",
              fontSize: 128,
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {score}%
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 30,
              marginTop: 14,
            }}
          >
            {correct} out of {total} correct
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 24,
              marginTop: 20,
              backgroundColor: "rgba(0,0,0,0.2)",
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 100,
            }}
          >
            {label}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            color: "rgba(255,255,255,0.5)",
            fontSize: 20,
          }}
        >
          libreview.ph · Free UPCAT Reviewer · {date}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
