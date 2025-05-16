import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation, Variant } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  initialVariant?: "hidden" | "visible";
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  className?: string;
  viewport?: {
    once?: boolean;
    amount?: number | "some" | "all";
  };
  delay?: number;
  style?: React.CSSProperties;
}

const defaultVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const ScrollAnimation = ({
  children,
  initialVariant = "hidden",
  variants = defaultVariants,
  className = "",
  viewport = { once: true, amount: 0.3 },
  delay = 0,
  style = {},
}: ScrollAnimationProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, viewport);
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!viewport.once) {
      controls.start("hidden");
    }
  }, [isInView, controls, viewport.once]);

  return (
    <motion.div
      ref={ref}
      initial={initialVariant}
      animate={controls}
      variants={variants}
      transition={{
        delay,
        duration: 0.5,
        ease: "easeOut",
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Text-specific animation component with staggered children
export const ScrollTextAnimation = ({
  children,
  className = "",
  staggerChildren = 0.1,
  ...props
}: ScrollAnimationProps & { staggerChildren?: number }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: props.delay || 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <ScrollAnimation
      variants={containerVariants}
      className={className}
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </ScrollAnimation>
  );
};

// Animated heading component for titles and subtitles
export const AnimatedHeading = ({
  children,
  el = "h2",
  className = "",
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  el?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  delay?: number;
}) => {
  const Tag = el;

  return (
    <ScrollAnimation
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.7,
            ease: "easeOut",
          },
        },
      }}
      delay={delay}
      className={className}
      {...props}
    >
      <Tag className={className}>{children}</Tag>
    </ScrollAnimation>
  );
};
