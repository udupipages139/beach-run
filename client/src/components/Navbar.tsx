import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView?: 'home' | 'blog' | 'gallery' | 'route-map';
  onNavigate?: (view: 'home' | 'blog' | 'gallery' | 'route-map', targetSection?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView = 'home', onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'The Run', sectionId: 'about', href: '#about' },
    { name: 'Race Categories', sectionId: 'races', href: '#races' },
    { name: 'Route', sectionId: 'route', view: 'route-map' as const, href: '#route' },
    { name: 'Objectives', sectionId: 'objectives', href: '#objectives' },
    { name: 'Gallery', sectionId: 'gallery', view: 'gallery' as const, href: '#gallery' },
    { name: 'News & Blog', sectionId: 'news', view: 'blog' as const, href: '#news' },
    { name: 'FAQs', sectionId: 'faq', href: '#faq' },
  ];

  const handleNavClick = (
    e: React.MouseEvent,
    item: { sectionId?: string; view?: 'home' | 'blog' | 'gallery' | 'route-map'; href: string }
  ) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      if (item.view) {
        e.preventDefault();
        onNavigate(item.view);
      } else if (currentView !== 'home') {
        e.preventDefault();
        onNavigate('home', item.sectionId);
      } else if (item.sectionId) {
        e.preventDefault();
        const el = document.getElementById(item.sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = item.sectionId;
        }
      }
    }
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#fffffff5] backdrop-blur-md shadow-md border-b border-slate-200/80'
          : 'bg-[#fffffff2] backdrop-blur-sm border-b border-slate-100'
      }`}
    >
      <div className="c nav w-[92%] max-w-[1180px] mx-auto h-[80px] flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#run"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              if (currentView !== 'home') {
                onNavigate('home');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          }}
          className="logo flex gap-[9px] items-center font-black text-[#062b63] no-underline group"
        >
          <img
            src="/images/header-logo.png"
            alt="Udupipages Beach Run 2026"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </a>

        {/* Desktop Menu */}
        <nav className="menu hidden lg:flex gap-[22px] items-center text-[12px] font-extrabold uppercase tracking-wider text-[#062b63]">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`hover:text-[#f5661b] transition-colors py-2 whitespace-nowrap ${
                (currentView === 'blog' && item.view === 'blog') ||
                (currentView === 'gallery' && item.view === 'gallery') ||
                (currentView === 'route-map' && item.view === 'route-map')
                  ? 'text-[#f5661b] font-black border-b-2 border-[#f5661b]'
                  : 'text-[#062b63]'
              }`}
            >
              {item.name}
            </a>
          ))}

          {/* CTA Register Button */}
          <a
            className="btn inline-block bg-[#f5661b] text-white px-[22px] py-[13px] rounded-[7px] font-black uppercase text-[12px] tracking-wider hover:bg-[#e0550d] hover:scale-105 active:scale-95 transition-all shadow-md ml-2 whitespace-nowrap"
            href="#register"
            onClick={(e) =>
              handleNavClick(e, { sectionId: 'register', href: '#register' })
            }
          >
            Register Now
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#062b63] hover:text-[#f5661b] focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 shadow-xl space-y-3 overflow-hidden"
          >
            <div className="flex flex-col space-y-3 text-[13px] font-extrabold uppercase tracking-wider text-[#062b63]">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="hover:text-[#f5661b] py-2 border-b border-slate-100 transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <a
                className="btn text-center block bg-[#f5661b] text-white px-[22px] py-[13px] rounded-[7px] font-black uppercase text-[13px] tracking-wider mt-3 shadow-md"
                href="#register"
                onClick={(e) =>
                  handleNavClick(e, { sectionId: 'register', href: '#register' })
                }
              >
                Register Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
