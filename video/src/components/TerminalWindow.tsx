import React from "react";

interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
  scale?: number;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title = "yt2blog",
  children,
  width = 1100,
  height = 650,
  scale = 1,
}) => {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        width,
        height,
        backgroundColor: "#0a0a0a",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.1),
          0 25px 50px -12px rgba(0, 0, 0, 0.8),
          0 0 80px rgba(0, 255, 255, 0.1)
        `,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 40,
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        {/* Window controls */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28c840" }} />
        </div>

        {/* Title */}
        <span
          style={{
            flex: 1,
            textAlign: "center",
            color: "#6b7280",
            fontSize: 13,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {title}
        </span>

        <div style={{ width: 52 }} />
      </div>

      {/* Terminal content */}
      <div
        style={{
          flex: 1,
          padding: 20,
          overflow: "hidden",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 14,
          lineHeight: 1.6,
          color: "#e5e7eb",
        }}
      >
        {children}
      </div>
    </div>
  );
};
