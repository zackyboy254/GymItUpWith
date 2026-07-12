'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to observe elements and trigger scroll-based animations.
 * Adds 'is-visible' class when element enters viewport.
 */
export function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const element = ref.current;
    if (element) {
      // Observe the element itself and all children with animation classes
      const animatedElements = element.querySelectorAll(
        '.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale-in, .stagger-children'
      );
      animatedElements.forEach((el) => observer.observe(el));
      
      // Also observe the container if it has an animation class
      if (
        element.classList.contains('animate-on-scroll') ||
        element.classList.contains('animate-slide-left') ||
        element.classList.contains('animate-slide-right') ||
        element.classList.contains('animate-scale-in') ||
        element.classList.contains('stagger-children')
      ) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Hook that returns a parallax Y offset based on scroll position.
 */
export function useParallax(speed: number = 0.3) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
}
