import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

const heroImages = [
  '/images/hero_section/udupipages-Beach-Run1.jpg.jpeg',
  '/images/hero_section/udupipages-Beach-Run2.jpg.jpeg',
  '/images/hero_section/udupipages-Beach-Run3.jpg.jpeg',
  '/images/hero_section/udupipages-Beach-Run4.jpg.jpeg',
  '/images/hero_section/udupipages-Beach-Run5.jpg.jpeg',
];

export const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Automatic slideshow transition timer (6-second cycle for relaxed pacing)
  useEffect(() => {
    if (reducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [reducedMotion]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const titleWords = ['UDUPIPAGES', 'BEACH', 'RUN', '2026'];

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] overflow-hidden bg-white flex items-center justify-center pt-20 pb-12 sm:pt-16 sm:pb-10"
      aria-label="Hero Section"
    >
      {/* Background Slideshow: Stacked Image Layers */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-white">
        {heroImages.map((src, index) => {
          const isActive = index === currentIndex;
          return (
            <motion.img
              key={src}
              src={src}
              alt={`Udupi Beach Run Slide ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              initial={false}
              animate={{
                opacity: isActive ? 0.95 : 0,
                scale: isActive ? 1.04 : 1.0,
              }}
              transition={{
                opacity: { duration: 1.6, ease: [0.4, 0.0, 0.2, 1] },
                scale: { duration: 6.0, ease: 'linear' },
              }}
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            />
          );
        })}
      </div>

      {/* Light Vignette Overlay for Contrast (Reduced opacity so slideshow is clearly visible) */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/15 to-white/25 z-10 pointer-events-none" />

      {/* Warm Orange Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(circle,rgba(255,122,48,0.22)_0%,rgba(255,255,255,0)_70%)] pointer-events-none z-10" />

      {/* Hero Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center w-full pointer-events-auto">
        
        {/* Official Logo Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/95 border border-[#FF7A30]/40 backdrop-blur-md mb-3 sm:mb-4 shadow-md max-w-full"
        >
          <img
            src="/images/logo.png"
            alt="Official Logo"
            className="w-5 h-5 sm:w-7 sm:h-7 object-contain flex-shrink-0"
          />
          <span className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-extrabold tracking-wider text-[#0A0A0A] uppercase truncate max-w-[260px] xs:max-w-none">
            Official Coastal Marathon & Marine Preservation
          </span>
        </motion.div>

        {/* Display Headline */}
        <h1 className="font-thunder text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.98] tracking-wide text-[#0A0A0A] uppercase text-center font-extrabold drop-shadow-xs max-w-full overflow-hidden">
          {titleWords.map((word, wordIdx) => (
            <span key={wordIdx} className="inline-block mx-1 xs:mx-1.5 sm:mx-3 md:mx-4">
              {word.split('').map((char, charIdx) => (
                <motion.span
                  key={charIdx}
                  initial={reducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: reducedMotion ? 0 : 0.15 + (wordIdx * 4 + charIdx) * 0.025,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                  className={`inline-block ${
                    word === 'BEACH' || word === '2026'
                      ? 'text-gradient-orange'
                      : 'text-[#0A0A0A]'
                  }`}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subline: Kapu text set to Black */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-3 sm:mt-4 max-w-2xl text-xs xs:text-sm sm:text-lg text-[#0A0A0A] font-extrabold tracking-wide leading-relaxed px-2"
        >
          Run for the coast. Protect our ocean. Experience Udupi's coastal edge from{' '}
          <span className="font-black text-white bg-[#0A0A0A] px-2 py-0.5 shadow-sm inline-block my-0.5">Padukere Ground</span> to{' '}
          <span className="font-black text-black bg-white px-2 py-0.5 border border-slate-400 shadow-sm inline-block my-0.5">Kapu Light House</span>.
        </motion.p>

        {/* Info Meta Pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-[#0A0A0A] font-extrabold"
        >
          <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-[#FF7A30]/40 shadow-sm">
            <Calendar className="w-4 h-4 text-[#FF7A30] flex-shrink-0" />
            <span className="text-[11px] sm:text-xs md:text-sm font-extrabold whitespace-nowrap text-[#0A0A0A]">6TH DECEMBER 2026 • 5:30 AM – 10:00 AM</span>
          </div>
          <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-[#FF7A30]/40 shadow-sm">
            <MapPin className="w-4 h-4 text-[#FF7A30] flex-shrink-0" />
            <span className="text-[11px] sm:text-xs md:text-sm font-extrabold whitespace-nowrap text-[#0A0A0A]">PADUKERE TO KAPU LIGHT HOUSE, UDUPI</span>
          </div>
        </motion.div>

        {/* Registration CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-5 sm:mt-6 w-full sm:w-auto"
        >
          <a
            href="#register"
            className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 xs:px-8 py-3.5 sm:py-4 bg-sunset-gradient text-white font-sans text-sm sm:text-lg uppercase tracking-[0.15em] font-extrabold shadow-[0_4px_25px_rgba(255,122,48,0.45)] transition-transform hover:scale-105 active:scale-95 border border-white/20"
          >
            <span className="relative z-10">SECURE YOUR BIB NOW</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </a>
        </motion.div>
      </div>

      {/* Manual Controls: Previous Button */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white border border-slate-200 text-[#0A0A0A] hover:text-[#FF7A30] items-center justify-center transition-all shadow-md backdrop-blur-sm"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Manual Controls: Next Button */}
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white border border-slate-200 text-[#0A0A0A] hover:text-[#FF7A30] items-center justify-center transition-all shadow-md backdrop-blur-sm"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slideshow Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3 py-1.5 border border-slate-200 shadow-sm">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 ${
              currentIndex === idx
                ? 'w-5 h-1.5 bg-[#FF7A30]'
                : 'w-1.5 h-1.5 bg-slate-400 hover:bg-slate-600'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Down Scroll Anchor */}
      <a
        href="#about"
        className="hidden lg:flex absolute bottom-4 right-6 z-20 text-slate-700 hover:text-[#FF7A30] transition-colors flex-col items-center space-y-1"
        aria-label="Scroll to About section"
      >
        <span className="text-[9px] tracking-widest uppercase font-bold">DISCOVER MORE</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-[#FF7A30]" />
      </a>
    </section>
  );
};
