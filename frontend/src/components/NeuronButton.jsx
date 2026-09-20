import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function NeuronButton({ to, children, className }) {
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (to) {
      e.preventDefault(); // prevent immediate navigation
    }
    
    // Generate particles
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (i / 12) * Math.PI * 2,
      distance: 40 + Math.random() * 60,
    }));
    
    setParticles((prev) => [...prev, ...newParticles]);

    // Delay navigation slightly to allow animation to play
    if (to) {
      setTimeout(() => {
        navigate(to);
      }, 400);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      {children}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: p.x, y: p.y }}
            animate={{ 
              opacity: 0, 
              scale: Math.random() * 2 + 1,
              x: p.x + Math.cos(p.angle) * p.distance, 
              y: p.y + Math.sin(p.angle) * p.distance 
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => {
              setParticles(current => current.filter(cp => cp.id !== p.id));
            }}
            className="absolute w-1.5 h-1.5 bg-sky-400 rounded-full pointer-events-none z-10 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
