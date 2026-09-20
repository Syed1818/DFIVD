import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';

export default function MouseFollower() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - (isHovering ? 24 : 10)); 
      cursorY.set(e.clientY - (isHovering ? 24 : 10));
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, input, .cursor-pointer, .dropzone')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible, isHovering]);

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] hidden md:block backdrop-blur-md mix-blend-screen"
      animate={{
        width: isHovering ? 48 : 20,
        height: isHovering ? 48 : 20,
        backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
        border: isHovering ? '1px solid rgba(255, 255, 255, 0.3)' : '0px solid rgba(255, 255, 255, 0)',
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        x: cursorX,
        y: cursorY,
        opacity: isVisible ? 1 : 0
      }}
    />
  );
}
