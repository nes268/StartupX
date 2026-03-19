import React from 'react';
import { motion } from 'framer-motion';

const blobTransition = {
  duration: 14,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as const,
};

const sparkleClusters = [
  { top: '14%', left: '18%', size: 180, opacity: 0.24, delay: 0 },
  { top: '30%', left: '72%', size: 210, opacity: 0.2, delay: 0.8 },
  { top: '62%', left: '12%', size: 170, opacity: 0.2, delay: 1.4 },
  { top: '76%', left: '68%', size: 220, opacity: 0.22, delay: 2.1 },
];

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(152deg,#faf8ff_0%,#eef3ff_38%,#eaf7ff_68%,#f4f8ff_100%)]" />

      <motion.div
        className="absolute inset-0 opacity-90"
        animate={{ opacity: [0.82, 1, 0.88, 0.82] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(1200px 520px at 8% 8%, rgba(139,92,246,0.20), transparent 64%), radial-gradient(900px 460px at 88% 12%, rgba(59,130,246,0.16), transparent 64%), radial-gradient(800px 420px at 50% 100%, rgba(56,189,248,0.14), transparent 68%)',
        }}
      />

      <motion.div
        className="absolute -top-28 -left-20 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.36),rgba(99,102,241,0.06)_65%,transparent_78%)] blur-2xl"
        animate={{ x: [0, 70, 10], y: [0, 40, 0], scale: [1, 1.08, 1] }}
        transition={blobTransition}
      />

      <motion.div
        className="absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_70%_40%,rgba(59,130,246,0.28),rgba(59,130,246,0.05)_62%,transparent_78%)] blur-2xl"
        animate={{ x: [0, -80, 0], y: [0, -30, 0], scale: [1, 1.06, 1] }}
        transition={{ ...blobTransition, duration: 16 }}
      />

      <motion.div
        className="absolute top-[28%] left-[42%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.24),rgba(129,140,248,0.04)_70%,transparent_82%)] blur-xl"
        animate={{ x: [0, 22, -10, 0], y: [0, -18, 12, 0], opacity: [0.5, 0.9, 0.6, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 opacity-[0.22]"
        animate={{ backgroundPosition: ['0px 0px', '36px 24px', '0px 0px'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{
          backgroundImage:
            'radial-gradient(rgba(99,102,241,0.35) 1px, transparent 1px), radial-gradient(rgba(59,130,246,0.26) 1px, transparent 1px)',
          backgroundSize: '42px 42px, 64px 64px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {sparkleClusters.map((cluster, index) => (
        <motion.div
          key={`sparkle-cluster-${index}`}
          className="absolute rounded-full"
          style={{
            top: cluster.top,
            left: cluster.left,
            width: cluster.size,
            height: cluster.size,
            opacity: cluster.opacity,
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.95) 0.8px, transparent 1px), radial-gradient(rgba(199,210,254,0.9) 0.7px, transparent 1px), radial-gradient(rgba(186,230,253,0.75) 0.6px, transparent 1px)',
            backgroundSize: '16px 16px, 22px 22px, 13px 13px',
            backgroundPosition: '0 0, 7px 9px, 11px 3px',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.22))',
          }}
          animate={{
            opacity: [cluster.opacity * 0.55, cluster.opacity, cluster.opacity * 0.5],
            scale: [1, 1.03, 1],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 4.8 + index,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: cluster.delay,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
