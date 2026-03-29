import React from 'react';
import { COLORS } from '../constants';

export const FeatureCard: React.FC<{
  title?: string;
  description?: string;
  iconColor?: string;
  style?: React.CSSProperties;
}> = ({
  title = 'Feature',
  description = 'Description of the feature.',
  iconColor = '#3490dc',
  style = {},
}) => {
  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 16,
        padding: 28,
        border: `1px solid ${COLORS.borderGray200}`,
        boxShadow: '0 6px 24px rgba(0,0,0,0.07)',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        ...style,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="1.5" />
          <path d="M8 12l3 3 5-5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.textBlack, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: COLORS.textGray500, lineHeight: 1.5 }}>
        {description}
      </div>
    </div>
  );
};
