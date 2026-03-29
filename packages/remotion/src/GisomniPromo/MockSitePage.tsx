import React from "react";
import { outfitFamily, spaceGroteskFamily } from "./fonts";

export const MockSitePage: React.FC = () => {
  return (
    <div
      style={{
        width: 1200,
        height: 720,
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
        fontFamily: outfitFamily,
      }}
    >
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: "#111111", letterSpacing: "0.04em" }}>GISOMNI</div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Home", "Features", "Solutions", "News", "Contact"].map((link) => (
            <span
              key={link}
              style={{
                fontFamily: spaceGroteskFamily,
                fontSize: 13,
                color: "#666666",
                letterSpacing: "0.04em",
              }}
            >
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 580,
          textAlign: "center",
          padding: "0 80px",
          background: "radial-gradient(ellipse at center, #f8f8f8 0%, #ffffff 70%)",
        }}
      >
        {/* Globe area */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #e8e8e8 0%, #cccccc 50%, #999999 100%)",
            marginBottom: 30,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          }}
        />

        <div
          style={{
            fontSize: 56,
            fontWeight: 200,
            color: "#111111",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          GISOMNI
        </div>

        <div
          style={{
            fontFamily: spaceGroteskFamily,
            fontSize: 17,
            color: "#666666",
            lineHeight: 1.7,
            maxWidth: 620,
            marginBottom: 30,
          }}
        >
          Interactive Geospatial Mapping Solutions for global impact.
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              padding: "12px 28px",
              background: "#111111",
              color: "#ffffff",
              borderRadius: 6,
              fontFamily: spaceGroteskFamily,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Contact Us
          </div>
          <div
            id="view-features-btn"
            style={{
              padding: "12px 28px",
              background: "#ffffff",
              color: "#111111",
              border: "1.5px solid #111111",
              borderRadius: 6,
              fontFamily: spaceGroteskFamily,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            View Features
          </div>
        </div>
      </div>
    </div>
  );
};
