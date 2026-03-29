import React from 'react';
import { COLORS } from '../constants';

export const MathGPTLogo: React.FC<{ size?: number }> = ({ size = 64 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: `linear-gradient(135deg, ${COLORS.bluePrimary} 0%, #2563eb 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px -8px rgba(52,144,220,0.4)',
      }}
    >
      <span
        style={{
          color: '#fff',
          fontSize: size * 0.42,
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1,
        }}
      >
        M
      </span>
    </div>
  );
};
