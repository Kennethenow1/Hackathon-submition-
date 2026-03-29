import React from 'react';
import { COLORS } from '../constants';

export const BROWSER_CONTENT_TOP = 0;

// Simplified recreation of the MathGPT homepage for the browser frame
export const MockHomepage: React.FC<{ width?: number }> = ({ width = 1100 }) => {
  const scale = width / 1100;
  return (
    <div
      style={{
        width: 1100,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: COLORS.white,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* Nav */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: `1px solid ${COLORS.borderGray100}`,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: COLORS.bluePrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            M
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: COLORS.textBlack }}>MathGPT</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              fontSize: 12,
              padding: '4px 14px',
              borderRadius: 10,
              border: `1px solid ${COLORS.borderGray200}`,
              color: COLORS.textGray700,
              background: COLORS.white,
            }}
          >
            Sign In
          </div>
          <div
            style={{
              fontSize: 12,
              padding: '4px 14px',
              borderRadius: 10,
              background: COLORS.bluePrimary,
              color: COLORS.textSlate50,
              border: `1px solid ${COLORS.bluePrimary}`,
            }}
          >
            Upgrade
          </div>
        </div>
      </div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '32px 40px 16px' }}>
        <div style={{ fontSize: 28, fontWeight: 400, color: COLORS.textBlack, lineHeight: 1.2 }}>
          MathGPT - Your Personal Math Solver
        </div>
        <div style={{ fontSize: 13, color: COLORS.textGray700, marginTop: 8 }}>
          Get instant homework help from your on-demand AI math solver
        </div>
      </div>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          padding: '0 40px',
          marginBottom: 16,
        }}
      >
        {['MathGPT', 'PhysicsGPT', 'AccountingGPT', 'ChemGPT'].map((tab, i) => (
          <div
            key={tab}
            style={{
              fontSize: 12,
              padding: '5px 14px',
              borderRadius: 8,
              background: i === 0 ? COLORS.bluePrimary90 : COLORS.white,
              color: i === 0 ? '#f1f5f9' : COLORS.textGray700,
              border: i === 0 ? 'none' : `1px solid ${COLORS.borderGray100}`,
              fontWeight: 500,
            }}
          >
            {tab}
          </div>
        ))}
      </div>
      {/* Upload area */}
      <div style={{ padding: '0 80px' }}>
        <div
          style={{
            background: COLORS.bgGraySidebar90,
            borderRadius: '16px 16px 0 0',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px dashed ${COLORS.borderGray200}`,
            borderBottom: 'none',
            fontSize: 12,
            color: COLORS.textGray500,
          }}
        >
          Drag & drop or click to add images or PDF
        </div>
        {/* Input */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: '0 0 16px 16px',
            border: `1px solid ${COLORS.borderGray200}`,
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.textGray500, marginBottom: 10 }}>
            Type your question here...
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Math Input', 'Tools'].map((btn) => (
                <div
                  key={btn}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 10,
                    border: `1px solid ${COLORS.borderGray200}`,
                    color: COLORS.textGray700,
                    background: COLORS.white,
                  }}
                >
                  {btn}
                </div>
              ))}
            </div>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: COLORS.bluePrimary,
                border: `1px solid ${COLORS.bluePrimary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
