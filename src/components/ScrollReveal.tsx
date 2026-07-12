'use client';

import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollReveal({ children, className = '' }: ScrollRevealProps) {
  const ref = useScrollAnimation();

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
