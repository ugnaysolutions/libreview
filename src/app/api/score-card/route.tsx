import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = req.nextUrl;
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const correct = searchParams.get("correct") ?? "0";
  const total = searchParams.get("total") ?? "0";
  const label = searchParams.get("label") ?? "Practice";

  const badge = score >= 70 ? "EXCELLENT" : score >= 50 ? "GOOD" : "KEEP GOING";
  const bgColor = score >= 70 ? "#0D9488" : score >= 50 ? "#D97706" : "#DC2626";

  const now = new Date();
  const date = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bgColor,
          fontFamily: "sans-serif",
          paddingTop: 44,
          paddingBottom: 44,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            LibreviewPH
          </span>
          <span
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              backgroundColor: "rgba(0,0,0,0.2)",
              paddingTop: 6,
              paddingBottom: 6,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 100,
            }}
          >
            {badge}
          </span>
        </div>

        {/* Score block */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 128,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {score}%
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 30,
              marginTop: 16,
            }}
          >
            {correct} out of {total} correct
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 24,
              marginTop: 22,
              backgroundColor: "rgba(0,0,0,0.2)",
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 28,
              paddingRight: 28,
              borderRadius: 100,
            }}
          >
            {label}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 18,
            }}
          >
            libreview.ph · Free UPCAT Reviewer · {date}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
  } catch (err) {
    console.error("[score-card]", err);
    return new Response(
      `Score card error: ${err instanceof Error ? err.message : String(err)}`,
      { status: 500, headers: { "content-type": "text/plain" } }
    );
  }
}
