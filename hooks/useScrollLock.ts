import { useEffect } from 'react';

export const useScrollLock = (lock: boolean) => {
    useEffect(() => {
        if (lock) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            // Add padding to prevent layout shift if scrollbar disappears
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (scrollBarWidth > 0) {
                document.body.style.paddingRight = `${scrollBarWidth}px`;
            }
            return () => {
                document.body.style.overflow = originalStyle;
                document.body.style.paddingRight = '0px';
            };
        }
    }, [lock]);
};
