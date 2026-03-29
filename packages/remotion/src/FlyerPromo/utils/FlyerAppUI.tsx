import React from 'react';
import { FONT_FAMILY } from '../fonts';
import { COLORS } from '../constants';

type Props = {
  state?: 'landing' | 'preview' | 'success' | 'calendar';
  showCamera?: boolean;
};

const btnBase: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  fontWeight: 600,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  padding: '10px 22px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

export const FlyerAppUI: React.FC<Props> = ({ state = 'landing', showCamera = false }) => {
  return (
    <div
      style={{
        width: 800,
        minHeight: 520,
        background: COLORS.white,
        fontFamily: FONT_FAMILY,
        color: COLORS.darkText,
        padding: 0,
        position: 'relative',
      }}
    >
      {/* Brand */}
      <div style={{ textAlign: 'center', padding: '18px 0 6px' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.charcoal }}>Flyer</span>
      </div>
      {/* Card */}
      <div
        style={{
          margin: '0 auto',
          maxWidth: 560,
          background: COLORS.white,
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: 28,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Scan Your Flyer</h1>
            <p style={{ fontSize: 13, color: COLORS.midGray, margin: '4px 0 0' }}>
              Extract event details instantly with AI
            </p>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: COLORS.offWhite,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            ☀
          </div>
        </div>

        {state === 'landing' && (
          <div>
            {/* Upload area */}
            <div
              style={{
                border: `2px dashed ${COLORS.lightGray}`,
                borderRadius: 14,
                padding: '36px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.charcoal }}>
                Drop your image or PDF here
              </div>
              <div style={{ fontSize: 12, color: COLORS.midGray, marginTop: 4 }}>
                Supports PNG, JPG, PDF
              </div>
              <div style={{ fontSize: 12, color: COLORS.midGray, margin: '12px 0' }}>or</div>
              <button
                style={{
                  ...btnBase,
                  background: COLORS.offWhite,
                  color: COLORS.charcoal,
                  border: `1px solid ${COLORS.lightGray}`,
                }}
              >
                📷 Take a Photo
              </button>
            </div>
          </div>
        )}

        {state === 'preview' && (
          <div>
            <div
              style={{
                background: COLORS.offWhite,
                borderRadius: 12,
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 48 }}>📋</div>
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                ×
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                style={{
                  ...btnBase,
                  flex: 1,
                  background: COLORS.offWhite,
                  color: COLORS.charcoal,
                  border: `1px solid ${COLORS.lightGray}`,
                  justifyContent: 'center',
                }}
              >
                Reselect File
              </button>
              <button
                style={{
                  ...btnBase,
                  flex: 1,
                  background: COLORS.accentBlue,
                  color: '#fff',
                  justifyContent: 'center',
                }}
              >
                Process Photo
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                style={{
                  ...btnBase,
                  background: 'transparent',
                  color: COLORS.midGray,
                  fontSize: 13,
                }}
              >
                📷 Retake Photo
              </button>
            </div>
          </div>
        )}

        {state === 'success' && (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#E8F9EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontSize: 28,
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Event added to calendar</div>
            <button
              style={{
                ...btnBase,
                background: COLORS.accentBlue,
                color: '#fff',
                marginTop: 16,
              }}
            >
              View
            </button>
          </div>
        )}

        {state === 'calendar' && (
          <div>
            <div
              style={{
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: COLORS.darkText, margin: '0 0 2px' }}>
                  Google Calendar
                </h3>
                <span style={{ fontSize: 12, color: COLORS.midGray }}>Not connected</span>
              </div>
              <button
                style={{
                  ...btnBase,
                  background: COLORS.offWhite,
                  color: COLORS.charcoal,
                  border: `1px solid ${COLORS.lightGray}`,
                }}
              >
                Connect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera modal overlay */}
      {showCamera && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
          }}
        >
          <div
            style={{
              width: 380,
              background: COLORS.white,
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Take a Photo</h3>
              <span style={{ cursor: 'pointer', fontSize: 18 }}>✕</span>
            </div>
            <div
              style={{
                background: '#1a1a1a',
                borderRadius: 10,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.midGray,
                fontSize: 13,
              }}
            >
              Camera Preview
            </div>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: COLORS.accentBlue,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 22,
                }}
              >
                ◉
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
