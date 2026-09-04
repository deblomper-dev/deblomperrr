import { ImageResponse } from "next/og";

export const alt = "Ankit Kumar — Full-stack developer";
export const size = { width: 1200, height: 630 };
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
          padding: "80px 80px 60px 80px",
          backgroundColor: "#f7f5f0",
          color: "#141311",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 18, letterSpacing: "0.11em", textTransform: "uppercase", color: "#55504a" }}>
            FULL-STACK DEVELOPER
          </span>
          <span style={{ fontSize: 18, letterSpacing: "0.11em", textTransform: "uppercase", color: "#9d3819" }}>
            ● OPEN TO WORK
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1
            style={{
              fontSize: 68,
              lineHeight: 1.05,
              fontWeight: 400,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Most of what I build, I also have to keep running.
          </h1>
          <p
            style={{
              fontSize: 24,
              lineHeight: 1.5,
              color: "#55504a",
              marginTop: 24,
              maxWidth: 900,
            }}
          >
            Container deployment platform, self-hosted mail stack, media extraction API — curated projects from nub-coders.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(20, 19, 17, 0.2)",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 20, color: "#141311", fontWeight: 600 }}>
            Ankit Kumar
          </span>
          <span style={{ fontSize: 18, color: "#726c61" }}>
            github.com/deblomperr — deblomper.dev
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
