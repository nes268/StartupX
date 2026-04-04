import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../layout/AnimatedBackground';
import { useAuth } from '../../context/AuthContext';

const BRAND = 'CITBIF';
/** Brief beat before the first letter — keeps the entrance intentional, not sluggish */
const SPLASH_DELAY_CHILDREN = 0.14;
/** Space between letters: quick cascade, still readable one-by-one */
const SPLASH_STAGGER = 0.1;
/** Each letter’s own motion — short enough to feel snappy */
const SPLASH_LETTER_DURATION_S = 0.55;
/** Pause on the full word before routing to login */
const SPLASH_HOLD_AFTER_MS = 620;

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: SPLASH_STAGGER,
      delayChildren: SPLASH_DELAY_CHILDREN,
    },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: SPLASH_LETTER_DURATION_S,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    navigate(user.profileComplete ? '/dashboard' : '/profile-wizard', { replace: true });
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (isLoading || user) return;
    const lastLetterDoneMs =
      (SPLASH_DELAY_CHILDREN + (BRAND.length - 1) * SPLASH_STAGGER + SPLASH_LETTER_DURATION_S) * 1000;
    const totalMs = lastLetterDoneMs + SPLASH_HOLD_AFTER_MS;

    navigateTimerRef.current = setTimeout(() => {
      navigate('/login', { replace: true });
    }, totalMs);

    return () => {
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center px-4">
        <AnimatedBackground />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center px-4">
        <AnimatedBackground />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center px-4 sm:px-6 py-10">
      <AnimatedBackground />
      <motion.div
        className="relative z-10 flex items-baseline justify-center gap-[0.045em] select-none"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="CITBIF"
      >
        {BRAND.split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={letterVariants}
            className="inline-block font-['Outfit',sans-serif] font-extrabold text-6xl sm:text-7xl md:text-8xl uppercase bg-gradient-to-br from-[#4338ca] via-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent [text-shadow:0_0_40px_rgba(79,70,229,0.15)]"
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default SplashScreen;
