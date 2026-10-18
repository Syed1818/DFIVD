import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Film, Home, BookOpen } from 'lucide-react';

export default function ContextMenu() {
  const [menuData, setMenuData] = useState({ visible: false, x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      
      // Ensure the menu stays within viewport bounds
      const menuWidth = 220; // approximate width
      const menuHeight = 250; // approximate height
      
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) x -= menuWidth;
      if (y + menuHeight > window.innerHeight) y -= menuHeight;

      setMenuData({ visible: true, x, y });
    };

    const handleClick = () => {
      setMenuData(prev => prev.visible ? { ...prev, visible: false } : prev);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const menuItems = [
    { label: 'Go to Home', icon: Home, path: '/' },
    { label: 'Image Scanner', icon: ImageIcon, path: '/image-detection' },
    { label: 'Video Scanner', icon: Film, path: '/video-detection' },
    { label: 'Documentation', icon: BookOpen, path: '/how-to-use' },
  ];

  const handleAction = (path) => {
    navigate(path);
    setMenuData({ ...menuData, visible: false });
  };

  return (
    <AnimatePresence>
      {menuData.visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed z-[9999] w-56 p-2 bg-black/70 backdrop-blur-xl border-[0.5px] border-white/20 rounded-xl shadow-2xl"
          style={{ top: menuData.y, left: menuData.x }}
        >
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">ATHEIA SYSTEM</span>
            </div>
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(item.path);
                  }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-slate-200 hover:text-white group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
