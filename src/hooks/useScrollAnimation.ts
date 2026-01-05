import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (triggerOnce = false) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);

                // Only disconnect if triggerOnce is true
                if (entry.isIntersecting && triggerOnce) {
                    observer.disconnect();
                }
            },
            {
                threshold: 0.15,
                rootMargin: '0px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [triggerOnce]);

    return { ref, isVisible };
};
