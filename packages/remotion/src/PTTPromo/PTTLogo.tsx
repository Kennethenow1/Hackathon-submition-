import React from 'react';
import { PALETTE } from './palette';

interface PTTLogoProps {
  size?: number;
  color?: string;
}

export const PTTLogo: React.FC<PTTLogoProps> = ({
  size = 64,
  color = PALETTE.brandAccent,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.brandAccent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px rgba(107,124,61,0.28)`,
        }}
      >
        <span
          style={{
            fontSize: size * 0.42,
            fontFamily: '"DM Serif Display", serif',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.04em',
          }}
        >
          PTT
        </span>
      </div>
    </div>
  );
};
