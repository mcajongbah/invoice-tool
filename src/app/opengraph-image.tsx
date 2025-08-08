import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #ffffff 0%, #f5f7fb 100%)",
          padding: 64,
          color: "#0b1220",
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 16,
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            FI
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: -0.5 }}>
              Free Invoice Maker
            </div>
            <div
              style={{
                fontSize: 26,
                marginTop: 8,
                color: "#475569",
                maxWidth: 900,
              }}
            >
              Create, preview, and download professional invoices — 100% free.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          {[
            { label: "No account required", icon: "✔" },
            { label: "Real-time preview", icon: "✔" },
            { label: "PDF export", icon: "✔" },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#0b1220",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 22 }}>{f.label}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 4,
              background: "#0f172a",
              opacity: 0.08,
              width: "68%",
              borderRadius: 4,
            }}
          />
          <div style={{ fontSize: 18, color: "#64748b" }}>free-invoice</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
