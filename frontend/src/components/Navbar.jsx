import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Image as ImageIcon, Film, BookOpen, Users, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const navLinks = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Image Scan', path: '/image-detection', icon: ImageIcon },
    { name: 'Video Scan', path: '/video-detection', icon: Film },
    { name: 'Docs', path: '/how-to-use', icon: BookOpen },
    { name: 'Team', path: '/about', icon: Users },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        className="bg-black/60 backdrop-blur-xl border-[0.5px] border-white/20 px-4 py-3 rounded-full flex items-center gap-2 md:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      >
        {navLinks.map((link, i) => {
          const isActive = location.pathname === link.path;
          const isHovered = hoveredIndex === i;
          
          return (
            <div 
              key={link.path} 
              className="relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded whitespace-nowrap pointer-events-none"
                  >
                    {link.name}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Link to={link.path}>
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isHovered ? 1.25 : 1,
                    y: isHovered ? -8 : 0,
                    backgroundColor: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
                    color: isActive ? '#000' : '#fff'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 ${!isActive && 'hover:bg-white/10'} transition-colors cursor-pointer`}
                >
                  <link.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                </motion.div>
              </Link>
              
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </div>
          );
        })}
      </motion.nav>
    </div>
  );
}
