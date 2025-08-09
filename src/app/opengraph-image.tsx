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
          {/* Brand mark */}
          <img
            src="https://wewire.com/main/logo_dark.svg"
            width={180}
            height={32}
            alt="WeWire"
            style={{ display: "block" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5 }}>
              WeWire Invoice
            </div>
            <div
              style={{
                fontSize: 18,
                marginTop: 8,
                color: "#475569",
                maxWidth: 900,
              }}
            >
              Create, preview, and download professional invoices — fast, free,
              and beautifully formatted.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, marginTop: 12 }}>
          {[
            { label: "No account required", icon: "✔" },
            { label: "Real-time preview", icon: "✔" },
            { label: "PDF export", icon: "✔" },
            { label: "Customer & items", icon: "✔" },
            { label: "Local drafts", icon: "✔" },
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
          <div style={{ fontSize: 18, color: "#64748b" }}>wewire.com</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
