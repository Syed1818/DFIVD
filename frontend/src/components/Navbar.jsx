import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Image as ImageIcon, Film, BookOpen, Users, Mail, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isTouchDevice] = useState(() => 
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Close mobile menu on route change
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  const navLinks = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Image Scan', path: '/image-detection', icon: ImageIcon },
    { name: 'Video Scan', path: '/video-detection', icon: Film },
    { name: 'Docs', path: '/how-to-use', icon: BookOpen },
    { name: 'Team', path: '/about', icon: Users },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <>
      {/* ── Desktop Dock ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          className="bg-black/60 backdrop-blur-xl border-[0.5px] border-white/20 px-4 py-3 rounded-full flex items-center gap-2 lg:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        >
          {navLinks.map((link, i) => {
            const isActive = location.pathname === link.path;
            const isHovered = hoveredIndex === i;
            
            return (
              <div 
                key={link.path} 
                className="relative"
                onMouseEnter={() => !isTouchDevice && setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <AnimatePresence>
                  {isHovered && !isTouchDevice && (
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
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </motion.nav>
      </div>

      {/* ── Mobile FAB + Drawer ── */}
      <div className="md:hidden fixed bottom-5 right-5 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] active:bg-slate-200"
          aria-label="Toggle navigation"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.nav
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-3xl px-6 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-8" />
              <div className="grid grid-cols-3 gap-4">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.92 }}
                        className={`flex flex-col items-center gap-2.5 py-4 rounded-2xl transition-colors ${
                          isActive 
                            ? 'bg-white text-black' 
                            : 'bg-white/5 text-white active:bg-white/10'
                        }`}
                      >
                        <link.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">{link.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
