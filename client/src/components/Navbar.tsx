import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentView?: 'home' | 'blog' | 'gallery' | 'route-map';
  onNavigate?: (view: 'home' | 'blog' | 'gallery' | 'route-map', targetSection?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView = 'home', onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Objectives', href: '#objectives', sectionId: 'objectives' },
    { name: 'Route Map', href: '#route', view: 'route-map' as const },
    { name: 'Register', href: '#register', sectionId: 'register' },
    { name: 'News & Blog', href: '#news', view: 'blog' as const },
    { name: 'FAQ', href: '#faq', sectionId: 'faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent, item: { view?: 'home' | 'blog' | 'gallery' | 'route-map'; sectionId?: string }) => {
    if (onNavigate) {
      if (item.view) {
        e.preventDefault();
        onNavigate(item.view);
      } else if (currentView !== 'home') {
        e.preventDefault();
        onNavigate('home', item.sectionId);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-md'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-3.5 shadow-sm'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Aligned Brand Logo */}
        <a
          href="#home"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('home');
            }
          }}
          className="flex items-center group flex-shrink-0"
        >
          <img
            src="/images/header-logo.png"
            alt="Udupipages Beach Run 2026"
            className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-shrink">
          {/* ABOUT Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <button
              onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
              className={`flex items-center text-xs xl:text-sm font-extrabold transition-colors uppercase tracking-wider whitespace-nowrap py-1 ${
                aboutDropdownOpen || currentView === 'gallery'
                  ? 'text-[#FF7A30]'
                  : 'text-[#0A0A0A]/90 hover:text-[#FF7A30]'
              }`}
            >
              <span>ABOUT</span>
              <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180 text-[#FF7A30]' : ''}`} />
            </button>

            {/* Dropdown Menu Panel */}
            <AnimatePresence>
              {aboutDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 shadow-xl py-2 z-50"
                >
                  <a
                    href="#about"
                    onClick={(e) => {
                      setAboutDropdownOpen(false);
                      handleLinkClick(e, { sectionId: 'about' });
                    }}
                    className="block px-4 py-2.5 text-xs font-extrabold text-[#0A0A0A] hover:bg-amber-50 hover:text-[#FF7A30] uppercase border-b border-slate-100 transition-colors"
                  >
                    About Event
                  </a>
                  <a
                    href="#details"
                    onClick={(e) => {
                      setAboutDropdownOpen(false);
                      handleLinkClick(e, { sectionId: 'details' });
                    }}
                    className="block px-4 py-2.5 text-xs font-extrabold text-[#0A0A0A] hover:bg-amber-50 hover:text-[#FF7A30] uppercase border-b border-slate-100 transition-colors"
                  >
                    Event Details
                  </a>
                  <a
                    href="#gallery"
                    onClick={(e) => {
                      setAboutDropdownOpen(false);
                      handleLinkClick(e, { view: 'gallery' });
                    }}
                    className={`block px-4 py-2.5 text-xs font-extrabold uppercase transition-colors ${
                      currentView === 'gallery' ? 'text-[#FF7A30] bg-amber-50' : 'text-[#0A0A0A] hover:bg-amber-50 hover:text-[#FF7A30]'
                    }`}
                  >
                    Photo Gallery
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other Nav Links */}
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className={`text-xs xl:text-sm font-extrabold transition-colors uppercase tracking-wider whitespace-nowrap ${
                (currentView === 'blog' && link.view === 'blog') ||
                (currentView === 'route-map' && link.view === 'route-map')
                  ? 'text-[#FF7A30]'
                  : 'text-[#0A0A0A]/90 hover:text-[#FF7A30]'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Button & Event Tag */}
        <div className="hidden sm:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
          <div className="hidden xl:flex items-center text-xs text-slate-700 space-x-3 border-r border-slate-200 pr-4 whitespace-nowrap">
            <span className="flex items-center font-bold"><Calendar className="w-3.5 h-3.5 text-[#FF7A30] mr-1" /> DEC 6 • 5:30 AM</span>
            <span className="flex items-center font-bold"><MapPin className="w-3.5 h-3.5 text-[#FF7A30] mr-1" /> UDUPI</span>
          </div>
          <a
            href="#register"
            onClick={(e) => {
              if (currentView !== 'home' && onNavigate) {
                e.preventDefault();
                onNavigate('home', 'register');
              }
            }}
            className="px-4 lg:px-5 py-2 sm:py-2.5 rounded-none font-sans text-xs lg:text-sm tracking-wider bg-sunset-gradient text-white font-extrabold uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,122,48,0.4)] whitespace-nowrap flex-shrink-0"
          >
            REGISTER NOW
          </a>
        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#0A0A0A] hover:text-[#FF7A30] focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-3 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Mobile ABOUT Dropdown */}
          <div className="border-b border-slate-100 pb-2">
            <button
              onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
              className="flex items-center justify-between w-full text-sm font-extrabold text-[#0A0A0A] hover:text-[#FF7A30] uppercase py-1"
            >
              <span>ABOUT</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileAboutOpen ? 'rotate-180 text-[#FF7A30]' : ''}`} />
            </button>
            {mobileAboutOpen && (
              <div className="pl-3 space-y-2 pt-2 pb-1 border-l-2 border-[#FF7A30]">
                <a
                  href="#about"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleLinkClick(e, { sectionId: 'about' });
                  }}
                  className="block text-xs font-bold text-slate-800 hover:text-[#FF7A30] uppercase py-1"
                >
                  • About Event
                </a>
                <a
                  href="#details"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleLinkClick(e, { sectionId: 'details' });
                  }}
                  className="block text-xs font-bold text-slate-800 hover:text-[#FF7A30] uppercase py-1"
                >
                  • Event Details
                </a>
                <a
                  href="#gallery"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleLinkClick(e, { view: 'gallery' });
                  }}
                  className="block text-xs font-bold text-slate-800 hover:text-[#FF7A30] uppercase py-1"
                >
                  • Photo Gallery
                </a>
              </div>
            )}
          </div>

          {/* Other Nav Links */}
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleLinkClick(e, link);
              }}
              className="block text-sm font-bold text-[#0A0A0A] hover:text-[#FF7A30] uppercase py-1 border-b border-slate-100"
            >
              {link.name}
            </a>
          ))}

          <a
            href="#register"
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (currentView !== 'home' && onNavigate) {
                e.preventDefault();
                onNavigate('home', 'register');
              }
            }}
            className="block text-center w-full py-3 mt-2 bg-sunset-gradient text-white font-sans text-sm tracking-wider font-extrabold uppercase shadow-sm"
          >
            REGISTER NOW
          </a>
        </div>
      )}
    </header>
  );
};
