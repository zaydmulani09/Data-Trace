import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { Menu, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { name: 'Map', path: '/map' },
    { name: 'Water', path: '/water' },
    { name: 'Electricity', path: '/electricity' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Actions', path: '/actions' },
  ];

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-[100] bg-bg-1 border-b border-border-1 px-4 md:px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-display text-2xl font-bold text-accent tracking-tighter">
        DataTrace
      </Link>
      
      {/* Desktop Links */}
      <ul className="hidden md:flex gap-8">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={cn(
                "nav-link",
                location.pathname === link.path && "active"
              )}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="text-[10px] mono text-text-2 uppercase tracking-widest">Live Data Stream</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 hover:bg-bg-2 rounded-[4px] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-bg-1 border-b border-border-2 shadow-2xl md:hidden z-[99]"
          >
            <ul className="flex flex-col p-4 gap-2">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "block p-4 text-lg mono uppercase tracking-widest hover:bg-bg-2 rounded-[4px] transition-colors",
                      location.pathname === link.path ? "text-accent bg-bg-2" : "text-text-2"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="p-4 border-t border-border-1 mt-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                <span className="text-[10px] mono text-text-3 uppercase tracking-widest">Live Data Stream Active</span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-bg-1 border-t border-border-1 px-8 py-12 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="font-display text-xl mb-4">DataTrace</h3>
          <p className="text-text-2 text-sm leading-relaxed">
            Environmental impact tracker for global data center infrastructure. 
            All consumption estimates use conservative methodology.
          </p>
        </div>
        <div>
          <h4 className="mono text-xs text-text-3 uppercase mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/map" className="text-text-2 hover:text-accent">Global Map</Link></li>
            <li><Link to="/water" className="text-text-2 hover:text-accent">Water Consumption</Link></li>
            <li><Link to="/electricity" className="text-text-2 hover:text-accent">Power & Carbon</Link></li>
            <li><Link to="/analysis" className="text-text-2 hover:text-accent">Advanced Analysis</Link></li>
            <li><Link to="/actions" className="text-text-2 hover:text-accent font-bold text-accent">Take Action</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mono text-xs text-text-3 uppercase mb-4">Data Sources</h4>
          <ul className="space-y-2 text-sm text-text-2">
            <li>EPA Envirofacts API</li>
            <li>LBNL 2024 US Data Center Report</li>
            <li>WRI Aqueduct Water Risk Atlas</li>
            <li>Company Sustainability Reports</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-border-1 mt-12 pt-8 flex justify-between items-center text-[10px] mono text-text-3 uppercase tracking-widest">
        <span>© 2026 DataTrace Project</span>
        <span>Data Updated: {new Date().toLocaleDateString()}</span>
      </div>
    </footer>
  );
}
