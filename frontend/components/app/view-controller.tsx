'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { FinvoiceSessionView } from '@/components/app/finvoice-session-view';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(FinvoiceSessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    hidden: {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(10px)',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1],
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setHasStarted(true);
    }
  }, [isConnected]);

  // Use either the real start or record that user initiated it
  const handleStart = () => {
    setHasStarted(true);
    start();
  };

  return (
    <AnimatePresence mode="wait">
      {/* Welcome view */}
      {!hasStarted && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={handleStart}
        />
      )}
      {/* Session view */}
      {hasStarted && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          onBack={() => setHasStarted(false)}
        />
      )}
    </AnimatePresence>
  );
}
