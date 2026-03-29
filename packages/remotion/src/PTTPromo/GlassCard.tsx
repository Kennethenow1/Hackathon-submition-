import React from 'react';
import { PALETTE, BRAND_ACCENT_RGB } from './palette';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number | string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = 20,
}) => {
  return (
    <div
      style={{
        background: `rgba(253,251,240,0.72)`,
        backdropFilter: 'blur(16px)',
        border: `1px solid rgba(${BRAND_ACCENT_RGB},0.32)`,
        borderRadius: 16,
        padding,
        boxShadow: `rgba(0,0,0,0.08) 0px 4px 24px, rgba(255,255,255,0.5) 0px 1px 0px inset`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
