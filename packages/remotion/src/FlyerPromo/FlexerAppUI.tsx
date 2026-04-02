import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY } from "./shared";

// This file exports FlyerAppUI - the real Flyer app interface

export const FlyerAppUI: React.FC<{
  hoverGlow?: number;
  showPreview?: boolean;
  showProcessing ?: boolean;
}> = ({ hoverGlow = 0, showPreview = false, showProcessing = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const uploadContentOp = showPreview ? 0.1 : 1;
  const previewOp = showPreview ? 1 : 0;

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        background: "#f8f9fa",
        minHeight: 740,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        gap: 16,
      }}
    >
      {/* brand title */}
      <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.primary, letterSpacing: "-1px" }}>Flyer</div>

      {/* main card */}
      <div
        style={{
          background: COLORS.card,
          borderRadius: 24,
          boxShadow: "0 12px 36px -8px rgba(0,0,0,0.10)",
          padding: "24px",
          width: 1070,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>Scan Your Flyer</div>
            <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>Extract event details instantly with AI</div>
          </div>
          {/* theme toggle */}
          <div style={{
            width: 40, height: 24, borderRadius: 12,
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", padding: "2px",
          }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: COLORS.primary }} />
          </div>
        </div>

        {/* upload section */}
        <div style={{ opacity: uploadContentOp }}>
          { /* upload label */ }
          <div
            style={{
              border: `2px dashed rgba(79, 70, 229, ${0.3 + hoverGlow * 0.4})`,
              borderRadius: 16,
              padding: "32px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              background: `rgba(79, 70, 229, ${hoverGlow * 0.04})`,
              transition: "none",
            }}
          >
            { /* upload icon wrapper */ }
            <div style={{ width: 64, height: 64, borderRadius: 16, background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            {/* upload text */}
            <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.text }}>Drop your image or PDF here</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>Supports PNG, JPG, PDF</div>
            { /* divider */ }
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "70%" }}>
              <div style={{ flex: 1, height: 1, background: COLORS.border }} />
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>or</span>
              <div style={{ flex: 1, height: 1, background: COLORS.border }} />
            </div>
            {/* take a photo button */}
            <button style={{
              background: "transparent",
              border: `2px solid ${COLORS.primary}`,
              borderRadius: 12,
              padding: "9px 20px",
              fontFamily: FONT_FAMILY,
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.primary,
              cursor: "default",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l6-9h4l6 9z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Take a Photo
            </button>
          </div>
        </div>

        { /* preview section */ }
        {showPreview && (
          <div style={{ opacity: previewOp, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              position: "relative",
              width: "100%",
              height: 220,
              borderRadius: 12,
              background: "linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M13 2H8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7l-4-5z" stroke="rgba(220,34,55,0.6)" strokeWidth="1.5"/>
                <path d="M13 2v5h5" stroke="rgba(220,34,55,0.6)" strokeWidth="1.5"/>
              </svg>
              {/* remove button */}
              <button style={{
                position: "absolute",
                top: 8, right: 8,
                width: 28, height: 28,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.4)",
                border: "none",
                color: "white",
                fontSize: 16,
                cursor: "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 300,
              }}>x</button>
            </div>
            {/* action buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: "9px 14px",
                fontFamily: FONT_FAMILY,
                fontSize: 14,
                fontWeight: 500,
                color: COLORS.textMuted,
                cursor: "default",
              }}>Reselect File</button>
              <button style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                border: "none",
                borderRadius: 12,
                padding: "9px 24px",
                fontFamily: FONT_FAMILY,
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                cursor: "default",
                boxShadow: "0 4px 9px -2px rgba(79,70,229,0.35)",
              }}>Process Photo</button>
            </div>
            { /* retake */ }
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button style={{ background: "transparent", border: "none", fontFamily: FONT_FAMILY, fontSize: 13, color: COLORS.textMuted, cursor: "default" }}>Retake Photo</button>
            </div>
          </div>
        )}

        {/* calendar connection section */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: COLORS.surface,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Google Calendar icon placeholder */}
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #4068ff 0%, #2244ff 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>G</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Google Calendar</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>Not connected</div>
            </div>
          </div>
          <button style={{
            background: COLORS.primary,
            border: "none",
            borderRadius: 10,
            padding: "6px 16px",
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            cursor: "default",
          }}>Connect</button>
        </div>

        {/* donation section */}
        <div style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
          borderRadius: 12,
          border: "1px solid rgba(251,191,51,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>Support Us</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>Help keep Flyer free for everyone.</div>
          </div>
          <button style={{
            background: "linear-gradient(135deg, #f59100 0%, #f5cc00 100%)",
            border: "none",
            borderRadius: 8,
            padding: "5px 14px",
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            cursor: "default",
          }}>Donate</button>
        </div>
      </div>

      {/* footer */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "8px 0",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>Flyer</span>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>Privacy</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>Terms</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>&#169; 2025</span>
        </div>
      </div>
    </div>
  );
};
