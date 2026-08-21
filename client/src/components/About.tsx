import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Droplets, Footprints, Flame, ArrowRight, Compass } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="relative py-16 sm:py-24 bg-white text-[#0A0A0A] border-t border-slate-200 overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#FF7A30]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FFB347]/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Main Event Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Big Headline & Editorial Concept */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-5"
          >
            <div className="inline-flex items-center space-x-2.5 px-3 py-1 bg-amber-50 border border-[#FF7A30]/30 rounded-full text-xs font-semibold tracking-widest text-[#FF7A30] uppercase">
              <span>UDUPIPAGES BEACH RUN 2026</span>
            </div>

            <h2 className="font-thunder text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-[#0A0A0A] leading-tight">
              KARNATAKA'S PREMIER <span className="text-gradient-orange">COASTAL MOVEMENT</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm md:text-base text-slate-700 font-normal leading-relaxed">
              <p>
                <strong className="text-[#0A0A0A] font-bold">Udupipages Beach Run 2026</strong> is envisioned as Karnataka's premier coastal sports and environmental event that combines <strong>fitness, tourism, beach conservation, sea water conservation, river conservation, and public awareness</strong> into a single community movement.
              </p>
              <p>
                The event is not just a marathon but a district wide environmental campaign designed to encourage citizens, students, tourists, corporate organizations, government departments, NGOs, and local communities to actively participate in protecting Udupi's beaches, rivers, and marine ecosystems.
              </p>
              <p className="border-l-4 border-[#FF7A30] pl-3.5 sm:pl-4 italic text-slate-900 font-medium bg-amber-50/50 py-3 text-xs sm:text-sm">
                The <strong>Udupipages Beach Run</strong> will serve as the flagship event under the broader <strong>"Clean Coast – Clean Rivers – Clean Udupi"</strong> initiative, making Udupi a national model for sustainable tourism and environmental stewardship.
              </p>
            </div>

            <div className="pt-2 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-6">
              <div className="border border-slate-200 bg-slate-50 p-3.5 sm:p-4 shadow-sm">
                <Footprints className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF7A30] mb-1.5 sm:mb-2" />
                <span className="block font-thunder text-base sm:text-lg font-bold text-[#0A0A0A]">15K ROUTE</span>
                <span className="text-xs text-slate-600">Coastal dune trail</span>
              </div>
              <div className="border border-slate-200 bg-slate-50 p-3.5 sm:p-4 shadow-sm">
                <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF7A30] mb-1.5 sm:mb-2" />
                <span className="block font-thunder text-base sm:text-lg font-bold text-[#0A0A0A]">ZERO PLASTIC</span>
                <span className="text-xs text-slate-600">Eco-hydrated stations</span>
              </div>
              <div className="border border-slate-200 bg-slate-50 p-3.5 sm:p-4 shadow-sm xs:col-span-2 sm:col-span-1">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF7A30] mb-1.5 sm:mb-2" />
                <span className="block font-thunder text-base sm:text-lg font-bold text-[#0A0A0A]">100% IMPACT</span>
                <span className="text-xs text-slate-600">Direct cleanup funds</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Event Highlights Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative p-1 bg-gradient-to-b from-[#FF7A30]/40 via-slate-200 to-white shadow-xl">
              <div className="bg-white p-6 sm:p-8 space-y-5">
                <div className="text-xs font-mono text-[#FF7A30] tracking-widest uppercase font-bold flex items-center justify-between">
                  <span>EVENT HIGHLIGHTS // DEC 2026</span>
                </div>
                <h3 className="font-thunder text-[11px] xs:text-xs sm:text-sm md:text-base font-extrabold text-[#0A0A0A] flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap tracking-tight leading-none py-1">
                  <span>PADUKERE GROUND</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF7A30] inline flex-shrink-0" />
                  <span>KAPU LIGHT HOUSE</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Experience Udupi's pristine stretch where fresh river estuaries merge with the roaring Arabian Sea. A breathtaking course designed to inspire awe and spark action.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-200 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Expected Runners:</span>
                    <span className="font-bold text-[#0A0A0A]">1,500+ Participants</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Spectators & Supporters:</span>
                    <span className="font-bold text-[#FF7A30]">2,000+ Attendees</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Event Timing:</span>
                    <span className="font-bold text-[#0A0A0A]">5:30 AM – 10:00 AM</span>
                  </div>
                </div>

                <a
                  href="#objectives"
                  className="inline-block w-full text-center py-3.5 bg-sunset-gradient hover:opacity-95 text-white font-thunder text-sm uppercase tracking-wider transition-opacity shadow-md"
                >
                  EXPLORE EVENT OBJECTIVES
                </a>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Run for Clean Beaches Dedicated Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="bg-slate-50 border border-slate-200 p-8 sm:p-12 shadow-sm"
        >
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#00A3FF] uppercase">
              <Compass className="w-4 h-4 text-[#00A3FF]" />
              <span>THE MOVEMENT</span>
            </div>
            <h3 className="font-thunder text-3xl sm:text-5xl font-extrabold text-[#0A0A0A]">
              RUN FOR CLEAN BEACHES
            </h3>
            <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed">
              <strong>Run for Clean Beaches</strong> is a movement that inspires individuals and communities to protect and preserve our beautiful coastline through fitness, awareness, and collective action. Every step taken during the Udupipages Beach Run symbolizes our commitment to cleaner beaches, healthier oceans, and a sustainable future.
            </p>
            <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed">
              The event encourages participants to reduce plastic pollution, dispose of waste responsibly, and actively participate in beach clean-up initiatives. By bringing together citizens, tourists, students, volunteers, and organizations, the campaign promotes environmental stewardship and responsible tourism. Together, we can ensure that Udupi's beaches remain clean, vibrant, and welcoming for future generations.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
