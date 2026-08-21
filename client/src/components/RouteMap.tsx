import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Droplets, Flag, Sparkles, Image as ImageIcon } from 'lucide-react';

interface RouteMapProps {
  onNavigateToRouteMap?: () => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({ onNavigateToRouteMap }) => {
  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(0);

  const checkpoints = [
    {
      id: 0,
      title: 'PADUKERE GROUND (START)',
      km: '0.0 KM',
      desc: 'Flag-off starting point at Padukere Ground near Malpe Sea Walk. Assembly along coastal estuary.',
      icon: Flag,
      color: '#FF7A30',
      image: '/images/checkpoints/PADUKERE GROUND.webp',
    },
    {
      id: 1,
      title: 'PADUKARE SCHOOL GROUND',
      km: '3.0 KM',
      desc: '3K turnaround point at Padukare School Ground with hydration & medical aid station.',
      icon: Droplets,
      color: '#FFB347',
      image: '/images/checkpoints/PADUKARE SCHOOL GROUND.jpg',
    },
    {
      id: 2,
      title: 'BLUE WAVE WARRIORS',
      km: '5.0 KM',
      desc: '5K Coastal Challenge milestone & turnaround point at Blue Wave Warriors Padukare beach spot.',
      icon: Sparkles,
      color: '#FF7A30',
      image: '/images/checkpoints/Blue Wave Warriors Padukare.png',
    },
    {
      id: 3,
      title: 'MATTU BEACH',
      km: '10.0 KM',
      desc: '10K Endurance Run turnaround point along the pristine Mattu Beach coastline and sea-ridge.',
      icon: Navigation,
      color: '#FFB347',
      image: '/images/checkpoints/mattu-beach2.jpg',
    },
    {
      id: 4,
      title: 'KAPU LIGHT HOUSE (FINISH)',
      km: '15.2 KM',
      desc: 'Grand finish line at the historic 1901 Kapu Light House overlooking the roaring Arabian Sea.',
      icon: MapPin,
      color: '#FF7A30',
      image: '/images/checkpoints/KAPU LIGHT HOUSE.jpg',
    },
  ];

  const currentCp = checkpoints[activeCheckpoint];

  return (
    <section id="route" className="py-20 sm:py-28 bg-slate-50 text-[#0A0A0A] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-2 sm:space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#00A3FF] uppercase block">
            COURSE TRAJECTORY & GOOGLE MAPS CORRIDOR
          </span>
          <h2 className="font-thunder text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase">
            THE COASTAL <span className="text-gradient font-thunder">ROUTE MAP</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-700 font-normal">
            Official 15.2 KM track running along Udupi’s western shoreline from Padukere Ground to Kapu Light House.
          </p>
        </div>

        {/* Map Display & Checkpoint Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch bg-white border border-slate-200 p-4 sm:p-10 shadow-sm">
          
          {/* Left Column: Real Google Maps Route Image */}
          <div className="lg:col-span-7 relative bg-slate-900 border border-slate-200 overflow-hidden flex flex-col justify-between group shadow-md">
            <div className="relative w-full h-[240px] xs:h-[300px] sm:h-[380px] md:h-[420px] bg-slate-950 overflow-hidden flex items-center justify-center p-2">
              <img
                src="/images/route-map-google.png"
                alt="Official Google Maps Route Padukere to Kapu Light House"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 bg-black/80 text-white text-[9px] xs:text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-1 border border-[#00A3FF]/40 uppercase tracking-wider max-w-[90%] truncate">
                GOOGLE MAPS • 15.2 KM (33 MIN RUN CORRIDOR)
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs font-mono border-t border-slate-800">
              <span>START: PADUKERE GROUND</span>
              <span className="text-[#00A3FF] font-bold">FINISH: KAPU LIGHT HOUSE</span>
            </div>
          </div>

          {/* Right Column: Checkpoint Details Card */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-thunder text-xl sm:text-2xl text-[#0A0A0A] uppercase tracking-wider mb-3">
                CHECKPOINT DETAILS
              </h3>

              <div className="bg-slate-50 border-l-4 border-[#00A3FF] border border-slate-200 overflow-hidden shadow-md">
                <div className="relative h-36 xs:h-44 w-full overflow-hidden bg-slate-900">
                  <AnimatePresence mode="popLayout">
                    <motion.img
                      key={currentCp.image}
                      src={currentCp.image}
                      alt={currentCp.title}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-[#00A3FF] uppercase tracking-wider bg-black/80 px-2 py-0.5 border border-[#00A3FF]/40">
                      {currentCp.km}
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-white text-black font-bold uppercase px-2 py-0.5">
                      MILESTONE {activeCheckpoint + 1} OF 5
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                  <h4 className="font-thunder text-xl sm:text-2xl text-[#0A0A0A] leading-tight">
                    {currentCp.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {currentCp.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Milestone Selector Buttons */}
            <div className="grid grid-cols-5 gap-1 text-center pt-2">
              {checkpoints.map((cp, i) => (
                <button
                  key={cp.id}
                  onClick={() => setActiveCheckpoint(i)}
                  className={`py-2 sm:py-2.5 px-0.5 sm:px-1 border uppercase font-extrabold text-[9px] xs:text-[10px] sm:text-xs transition-all rounded-none ${
                    activeCheckpoint === i
                      ? 'bg-[#00A3FF] text-white border-[#00A3FF] shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-[#00A3FF]'
                  }`}
                >
                  {cp.km}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* CTA Button to Full Interactive Route Map Page */}
        {onNavigateToRouteMap && (
          <div className="mt-12 text-center">
            <button
              onClick={onNavigateToRouteMap}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-sunset-gradient text-white font-sans text-sm sm:text-base font-extrabold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform space-x-3 border border-white/20"
            >
              <Navigation className="w-5 h-5" />
              <span>EXPLORE INTERACTIVE ROUTE</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
