import React from 'react';

type Variant = 'home' | 'videos' | 'gallery' | 'events' | 'achievements' | 'blog' | 'contact';

const hexPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Crect width='220' height='220' fill='none'/%3E%3Cpath d='M110 10l52 30v60l-52 30-52-30V40z' fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='1'/%3E%3Cpath d='M55 70l55 32 55-32' fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3Cpath d='M55 130l55-32 55 32' fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3C/svg%3E")`;
const concretePattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;

const styles: Record<Variant, React.CSSProperties> = {
  home: {
    backgroundColor: '#050507',
    backgroundImage: `${hexPattern}, radial-gradient(circle at 18% 18%, rgba(255,107,0,0.22), transparent 18%), radial-gradient(circle at 82% 82%, rgba(0,119,255,0.16), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 42%, rgba(255,107,0,0.05) 100%), linear-gradient(180deg, rgba(6,6,10,0.96), rgba(10,10,12,0.9))`,
    backgroundSize: '220px 220px, auto, auto, 240px 240px, cover',
    backgroundPosition: 'center, center, center, center, center',
    backgroundBlendMode: 'normal, screen, screen, normal, normal',
  },
  videos: {
    backgroundColor: '#060608',
    backgroundImage: `${concretePattern}, linear-gradient(130deg, rgba(255,255,255,0.05) 0%, transparent 35%, rgba(255,107,0,0.06) 100%), repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 18px), linear-gradient(180deg, rgba(8,8,10,0.95), rgba(6,6,8,0.92))`,
    backgroundSize: '220px 220px, cover, 240px 240px, cover',
    backgroundPosition: 'center, center, center, center',
    backgroundBlendMode: 'normal, screen, normal, normal',
  },
  gallery: {
    backgroundColor: '#050507',
    backgroundImage: `${hexPattern}, radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 16%), radial-gradient(circle at 80% 80%, rgba(255,107,0,0.16), transparent 24%), linear-gradient(180deg, rgba(8,8,10,0.96), rgba(6,6,8,0.92))`,
    backgroundSize: '220px 220px, auto, auto, cover',
    backgroundPosition: 'center, center, center, center',
    backgroundBlendMode: 'normal, screen, screen, normal',
  },
  events: {
    backgroundColor: '#060608',
    backgroundImage: `${concretePattern}, repeating-linear-gradient(45deg, rgba(255,107,0,0.08) 0 4px, transparent 4px 18px), radial-gradient(circle at 20% 20%, rgba(255,107,0,0.2), transparent 16%), linear-gradient(180deg, rgba(8,8,10,0.96), rgba(6,6,8,0.9))`,
    backgroundSize: '220px 220px, 240px 240px, auto, cover',
    backgroundPosition: 'center, center, center, center',
    backgroundBlendMode: 'normal, normal, screen, normal',
  },
  achievements: {
    backgroundColor: '#050507',
    backgroundImage: `${hexPattern}, radial-gradient(circle at 12% 18%, rgba(0,119,255,0.14), transparent 16%), radial-gradient(circle at 90% 82%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 45%, rgba(0,119,255,0.05) 100%), linear-gradient(180deg, rgba(6,6,8,0.96), rgba(8,8,10,0.9))`,
    backgroundSize: '220px 220px, auto, auto, 280px 280px, cover',
    backgroundPosition: 'center, center, center, center, center',
    backgroundBlendMode: 'normal, screen, screen, normal, normal',
  },
  blog: {
    backgroundColor: '#050507',
    backgroundImage: `${concretePattern}, linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(180deg, rgba(8,8,10,0.96), rgba(6,6,8,0.92))`,
    backgroundSize: '220px 220px, 100% 24px, 24px 100%, cover',
    backgroundPosition: 'center, center, center, center',
    backgroundBlendMode: 'normal, normal, normal, normal',
  },
  contact: {
    backgroundColor: '#060608',
    backgroundImage: `${hexPattern}, radial-gradient(circle at 30% 30%, rgba(0,119,255,0.12), transparent 15%), radial-gradient(circle at 70% 70%, rgba(255,107,0,0.12), transparent 18%), linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 42%, rgba(255,107,0,0.04) 100%), linear-gradient(180deg, rgba(7,7,9,0.96), rgba(6,6,8,0.9))`,
    backgroundSize: '220px 220px, auto, auto, 260px 260px, cover',
    backgroundPosition: 'center, center, center, center, center',
    backgroundBlendMode: 'normal, screen, screen, normal, normal',
  },
};

export default function PageBackground({ variant = 'home' }: { variant?: Variant }) {
  const style: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: -10,
    pointerEvents: 'none',
    overflow: 'hidden',
    ...styles[variant],
  };

  return (
    <div style={style}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(2,2,4,0.2) 0%, rgba(2,2,4,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
