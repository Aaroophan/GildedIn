import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LazySectionProps {
    children: ReactNode;
    threshold?: number;
    className?: string;
    fallback?: ReactNode;
    delay?: number;
}

export const LazySection = ({
    children,
    threshold = 0.1,
    className = '',
    fallback,
    delay = 0
}: LazySectionProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                        setShouldRender(true);
                    }, delay);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, delay]);

    return (
        <div ref={ref} className={className}>
            {shouldRender ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            ) : (
                fallback || (
                    <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
                )
            )}
        </div>
    );
};