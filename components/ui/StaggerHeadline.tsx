"use client";

import React, { useEffect } from "react";
import {
  motion,
  useAnimationControls,
  useReducedMotion,
  type Variants,
} from "framer-motion";

const headlineWords = [
  { text: "One", breakAfter: false },
  { text: "Tap.", breakAfter: true },
  { text: "Infinite", breakAfter: false },
  { text: "Possibilities.", breakAfter: false },
];

const subheadlineText =
  "Share your professional profile, secure your belongings, and manage events with a single tap. No app required.";
const subheadlineWords = subheadlineText.split(" ");

const masterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const headlineContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const headlineWordVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

const dividerVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

const subheadlineContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
};

const subheadlineWordVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
};

export function StaggerHeadline() {
  const controls = useAnimationControls();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    let active = true;

    const runLoop = async () => {
      while (active) {
        // Trigger reveal stagger from beginning
        await controls.start("visible");
        // Hold readable for 8s
        await new Promise((resolve) => setTimeout(resolve, 8000));
        if (!active) break;
        // Fade out before restarting loop
        await controls.start("hidden");
        // Pause 400ms before re-triggering stagger
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    };

    runLoop();

    return () => {
      active = false;
    };
  }, [controls, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
          One Tap.
          <br />
          Infinite Possibilities.
        </h1>
        <div className="w-8 border-b border-orange-500 mx-auto" />
        <p className="text-base text-gray-500 leading-normal max-w-sm mx-auto">
          {subheadlineText}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate={controls}
      variants={masterVariants}
    >
      {/* Headline */}
      <motion.h1
        className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900"
        variants={headlineContainerVariants}
      >
        {headlineWords.map((item, index) => (
          <React.Fragment key={index}>
            <motion.span
              variants={headlineWordVariants}
              className="inline-block mr-1.5 last:mr-0"
            >
              {item.text}
            </motion.span>
            {item.breakAfter && <br />}
          </React.Fragment>
        ))}
      </motion.h1>

      {/* Brand Divider */}
      <motion.div
        variants={dividerVariants}
        className="w-8 border-b border-orange-500 mx-auto origin-center"
      />

      {/* Sub-headline */}
      <motion.p
        variants={subheadlineContainerVariants}
        className="text-base text-gray-500 leading-normal max-w-sm mx-auto"
      >
        {subheadlineWords.map((word, index) => (
          <motion.span
            key={index}
            variants={subheadlineWordVariants}
            className="inline-block mr-1 last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </motion.p>
    </motion.div>
  );
}
