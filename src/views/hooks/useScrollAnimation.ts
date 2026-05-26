import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? "0px 0px -60px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return { ref, isVisible };
}

export const animClass = (
  isVisible: boolean,
  type: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" = "slide-up",
  delay: number = 0
): string => {
  const base = "transition-all duration-700 ease-out";
  const delayClass = delay > 0 ? `delay-[${delay}ms]` : "";

  const variants = {
    "fade": {
      visible: "opacity-100",
      hidden: "opacity-0",
    },
    "slide-up": {
      visible: "opacity-100 translate-y-0",
      hidden: "opacity-0 translate-y-10",
    },
    "slide-left": {
      visible: "opacity-100 translate-x-0",
      hidden: "opacity-0 -translate-x-10",
    },
    "slide-right": {
      visible: "opacity-100 translate-x-0",
      hidden: "opacity-0 translate-x-10",
    },
    "scale": {
      visible: "opacity-100 scale-100",
      hidden: "opacity-0 scale-95",
    },
  };

  const v = variants[type];
  return `${base} ${delayClass} ${isVisible ? v.visible : v.hidden}`;
};
