import { motion } from "framer-motion";
import React from "react";

/** wobble / lean in a direction, like the amicro "lean" micro. */
export function Lean({
  direction = 1,
  delay = 0,
  looseness = 12,
  children,
  className,
}: {
  direction?: 1 | -1;
  delay?: number;
  looseness?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  // CSS keyframe lean — micro, not noise.
  const targetAngle = (direction * 1) * looseness;
  const keyframes = `
    @keyframes lean-peek-${direction > 0 ? "r" : "l"} {
      0% { transform: rotate(0deg); }
      40% { transform: rotate(${targetAngle}deg); }
      100% { transform: rotate(0deg); }
    }
  `;
  const animName =
    direction > 0 ? "lean-peek-r" : "lean-peek-l";

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.12 }}
    >
      <style>{keyframes}</style>
      <div
        style={{
          display: "inline-block",
          transformOrigin: "center",
          animation: `${animName} 0.22s ease-out ${delay}ms both`,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/** child micro-step: a small opacity/scale pulse on children. */
export function ChildStep({
  children,
  delay = 0,
}: {
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

/** setting micro: rotate by a delta up to ±90°, spins when delta peaks. */
export function SetRotate({
  delta = 0,
  children,
  className,
}: {
  delta?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const angle = Math.max(-90, Math.min(90, delta));

  return (
    <motion.div
      className={className}
      initial={{ rotate: 0 }}
      animate={{ rotate: angle }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ display: "inline-block", transformOrigin: "center" }}
    >
      {children}
    </motion.div>
  );
}

/** Micro-feedback: press + hover interactions for any leaf button/icon. */
export function MicroButton({
  children,
  className,
  onPress,
  onHoverIn,
  onHoverOut,
}: {
  children?: React.ReactNode;
  className?: string;
  onPress?: () => void;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.94 }}
      onHoverStart={onHoverIn}
      onHoverEnd={onHoverOut}
      onClick={(e) => {
        e.preventDefault();
        onPress?.();
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Message bubble micro: drift + fade-in on new message. */
export function BubbleIn({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
