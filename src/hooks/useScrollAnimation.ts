import { useEffect, useRef, RefObject } from 'react';

export function useScrollAnimation(): RefObject<HTMLElement | null> {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-on-scroll');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = ref.current?.querySelectorAll('.scroll-animate');
        elements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return ref as RefObject<HTMLElement | null>;
}
