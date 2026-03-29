import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from './colors';

interface AppMockUIProps {
  showPreview?: boolean;
  showCalendarSection?: boolean;
  showSuccess?: boolean;
  previewVisible?: boolean;
  processingActive?: boolean;
  calendarConnected?: boolean;
}

export const APP_UPLOAD_LABEL_TOP = 240;
export const APP_UPLOAD_LABEL_LEFT = 100;
export const APP_UPLOAD_LABEL_WIDTH = 600;
export const APP_UPLOAD_LABEL_HEIGHT = 260;

export const APP_TAKE_PHOTO_BTN_TOP = 460;
export const APP_TAKE_PHOTO_BTN_LEFT = 250;
export const APP_TAKE_PHOTO_BTN_WIDTH = 300;
export const APP_TAKE_PHOTO_BTN_HEIGHT = 48;

export const APP_PROCESS_BTN_TOP = 460;
export const APP_PROCESS_BTN_LEFT = 320;
export const APP_PROCESS_BTN_WIDTH = 200;
export const APP_PROCESS_BTN_HEIGHT = 48;

export const APP_CONNECT_BTN_TOP = 440;
export const APP_CONNECT_BTN_LEFT = 480;
export const APP_CONNECT_BTN_WIDTH = 130;
export const APP_CONNECT_BTN_HEIGHT = 40;

export const BROWSER_CONTENT_WIDTH = 800;
export const BROWSER_CONTENT_HEIGHT = 600;

export const AppMockUI: React.FC<AppMockUIProps> = ({
  showPreview = false,
  showCalendarSection = false,
  showSuccess = false,
  previewVisible = false,
  processingActive = false,
  calendarConnected = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scanProgress = processingActive
    ? interpolate(frame, [0, 40], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  return (
    <div
      style={{
        width: BROWSER_CONTENT_WIDTH,
        minHeight: BROWSER_CONTENT_HEIGHT,
        background: COLORS.bgLight,
        fontFamily: 'Outfit, sans-serif',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* App container */}
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '32px 40px',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1,
                letterSpacing: -0.5,
              }}
            >
              Flyer
            </div>
          </div>
          {/* Theme toggle */}
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bgCard,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke={COLORS.textSecondary} strokeWidth="2" />
              <line x1="12" y1="2" x2="12" y2="4" stroke={COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="20" x2="12" y2="22" stroke={COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="12" x2="4" y2="12" stroke={COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="12" x2="22" y2="12" stroke={COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Main card */}
        <div
          style={{
            background: COLORS.bgCard,
            borderRadius: 20,
            padding: 40,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.textPrimary,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Scan Your Flyer
          </h1>
          <p
            style={{
              fontSize: 15,
              color: COLORS.textSecondary,
              marginBottom: 32,
              lineHeight: 1.5,
            }}
          >
            Extract event details instantly with AI
          </p>

          {/* Upload section or Preview section */}
          {!showPreview ? (
            <label
              style={{
                display: 'block',
                border: `2px dashed ${COLORS.border}`,
                borderRadius: 16,
                padding: '40px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#fafbff',
                position: 'relative',
              }}
            >
              {/* Upload icon */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: COLORS.accentSoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="4" stroke={COLORS.accent} strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" stroke={COLORS.accent} strokeWidth="1.5" />
                    <polyline points="21 15 16 10 5 21" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  marginBottom: 6,
                }}
              >
                Drop your image or PDF here
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.textMuted,
                  marginBottom: 24,
                }}
              >
                Supports PNG, JPG, PDF
              </div>
              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div style={{ flex: 1, height: 1, background: COLORS.border }} />
                <span style={{ fontSize: 13, color: COLORS.textMuted }}>or</span>
                <div style={{ flex: 1, height: 1, background: COLORS.border }} />
              </div>
              {/* Camera button */}
              <button
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: `1.5px solid ${COLORS.border}`,
                  background: COLORS.bgCard,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={COLORS.textPrimary} strokeWidth="2" />
                  <circle cx="12" cy="13" r="4" stroke={COLORS.textPrimary} strokeWidth="2" />
                </svg>
                Take a Photo
              </button>
            </label>
          ) : (
            // Preview section
            <div id="previewSection">
              <div
                style={{
                  position: 'relative',
                  borderRadius: 14,
                  overflow: 'hidden',
                  marginBottom: 20,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {/* Preview image placeholder */}
                <div
                  style={{
                    width: '100%',
                    height: 200,
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Flyer representation */}
                  <div
                    style={{
                      width: 140,
                      height: 180,
                      background: 'white',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: COLORS.accentSoft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke={COLORS.accent} strokeWidth="2" />
                        <path d="M8 7h8M8 11h8M8 15h5" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textPrimary }}>Community Event</div>
                    <div style={{ fontSize: 8, color: COLORS.textSecondary, textAlign: 'center' }}>Saturday, Dec 14{`\n`}7:00 PM</div>
                  </div>

                  {/* Processing scan line */}
                  {processingActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${scanProgress}%`,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                        opacity: 0.8,
                      }}
                    />
                  )}

                  {/* Remove button */}
                  <button
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      color: 'white',
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div
                className="action-buttons"
                style={{ display: 'flex', gap: 12, marginBottom: 16 }}
              >
                <button
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.border}`,
                    background: COLORS.bgCard,
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    cursor: 'pointer',
                  }}
                >
                  Reselect File
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: 'none',
                    background: processingActive
                      ? `linear-gradient(135deg, ${COLORS.accentLight} 0%, ${COLORS.accent} 100%)`
                      : `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: `0 4px 16px -4px rgba(99,102,241,${processingActive ? 0.6 : 0.4})`,
                  }}
                >
                  {processingActive ? 'Processing...' : 'Process Photo'}
                </button>
              </div>

              {/* Retake button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  style={{
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    background: 'transparent',
                    fontSize: 13,
                    fontWeight: 500,
                    color: COLORS.textSecondary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={COLORS.textSecondary} strokeWidth="2" />
                    <circle cx="12" cy="13" r="4" stroke={COLORS.textSecondary} strokeWidth="2" />
                  </svg>
                  Retake Photo
                </button>
              </div>
            </div>
          )}

          {/* Calendar connection section */}
          {showCalendarSection && (
            <div
              className="calendar-connection-section"
              style={{
                marginTop: 24,
                padding: '16px 20px',
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafbff',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  Google Calendar
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: calendarConnected ? COLORS.success : COLORS.textMuted,
                  }}
                >
                  {calendarConnected ? 'Connected' : 'Not connected'}
                </div>
              </div>
              <button
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  border: `1.5px solid ${calendarConnected ? COLORS.success : COLORS.border}`,
                  background: calendarConnected ? COLORS.successLight : COLORS.bgCard,
                  fontSize: 13,
                  fontWeight: 600,
                  color: calendarConnected ? COLORS.success : COLORS.textPrimary,
                  cursor: 'pointer',
                }}
              >
                {calendarConnected ? 'Connected ✓' : 'Connect'}
              </button>
            </div>
          )}

          {/* Success confirmation */}
          {showSuccess && (
            <div
              className="success-confirmation"
              style={{
                marginTop: 24,
                padding: '24px',
                borderRadius: 16,
                background: COLORS.successLight,
                border: `1px solid ${COLORS.success}33`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: COLORS.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polyline
                    points="20 6 9 17 4 12"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                }}
              >
                Event added to calendar
              </div>
              <button
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: COLORS.success,
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                View
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="white" strokeWidth="2" />
                  <polyline points="15 3 21 3 21 9" stroke="white" strokeWidth="2" />
                  <line x1="10" y1="14" x2="21" y2="3" stroke="white" strokeWidth="2" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
