import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home' },
    { path: '/image-detection', label: 'Image Scan' },
    { path: '/video-detection', label: 'Video Scan' },
    { path: '/about', label: 'About' },
    { path: '/how-to-use', label: 'Guide' },
    { path: '/terms-privacy', label: 'Legal' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 w-full p-4 flex flex-col md:flex-row justify-between items-center z-50 mix-blend-difference pointer-events-none">
      <Link to="/" className="flex items-center gap-4 text-slate-100 no-underline mb-4 md:mb-0 pointer-events-auto">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 animate-pulse shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
        <h1 className="m-0 text-lg font-bold tracking-[0.3em]">ATHEIA</h1>
      </Link>
      
      <div className="flex flex-wrap justify-center gap-2 md:gap-6 backdrop-blur-md bg-white/5 px-6 py-3 rounded-full border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] pointer-events-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className={`text-[10px] sm:text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${isActive ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'text-slate-400 hover:text-white'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
