import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Flame, Award } from 'lucide-react';

interface CounterProps {
  from: number;
  to: number;
  suffix?: string;
}

const CountUp: React.FC<CounterProps> = ({ from, to, suffix = '' }) => {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = from;
    const duration = 2000; // 2 seconds
    const steps = 50;
    const stepTime = duration / steps;
    const increment = (to - from) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, from, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

export const EventDetails: React.FC = () => {
  return (
    <section id="details" className="py-20 sm:py-28 bg-white text-[#0A0A0A] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-2 sm:space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#00A3FF] uppercase block">
            EVENT AT A GLANCE
          </span>
          <h2 className="font-thunder text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase">
            RACE DAY <span className="text-gradient">SPECIFICATIONS</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-700 font-normal">
            Key schedules, start points, flag-off windows, and category breakdown.
          </p>
        </div>

        {/* Animated Counter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-14">
          <div className="bg-slate-50 border border-slate-200 p-6 sm:p-10 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[11px] sm:text-xs font-mono text-[#00A3FF] uppercase tracking-widest block mb-1.5 sm:mb-2 font-bold">
                EXPECTED PARTICIPANTS
              </span>
              <div className="font-thunder text-5xl sm:text-7xl text-[#0A0A0A] tracking-tight">
                <CountUp from={0} to={1500} suffix="+" />
              </div>
              <span className="text-xs sm:text-sm text-slate-600 mt-1 block">Registered Coastal Marathoners</span>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sky-100 border border-sky-200 rounded-none flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#00A3FF]" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 sm:p-10 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[11px] sm:text-xs font-mono text-[#00A3FF] uppercase tracking-widest block mb-1.5 sm:mb-2 font-bold">
                SUPPORTERS & SPECTATORS
              </span>
              <div className="font-thunder text-5xl sm:text-7xl text-[#0A0A0A] tracking-tight">
                <CountUp from={0} to={2000} suffix="+" />
              </div>
              <span className="text-xs sm:text-sm text-slate-600 mt-1 block">Cheering Community Members</span>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sky-100 border border-sky-200 rounded-none flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-[#00A3FF]" />
            </div>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-slate-50 border border-slate-200 p-6 space-y-3 shadow-sm">
            <Calendar className="w-6 h-6 text-[#00A3FF]" />
            <h3 className="font-thunder text-2xl text-[#0A0A0A]">DATE & TIME</h3>
            <p className="text-lg font-bold text-[#00A3FF]">Sunday, 6th December 2026</p>
            <p className="text-xs text-slate-600">Assembly starts at 5:00 AM</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 space-y-3 shadow-sm">
            <Clock className="w-6 h-6 text-[#00A3FF]" />
            <h3 className="font-thunder text-2xl text-[#0A0A0A]">EVENT TIMING</h3>
            <p className="text-lg font-bold text-[#00A3FF]">5:30 AM – 10:00 AM</p>
            <p className="text-xs text-slate-600">5:30 AM Flag-Off ➔ 10:00 AM Event Wrap</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 space-y-3 shadow-sm">
            <MapPin className="w-6 h-6 text-[#00A3FF]" />
            <h3 className="font-thunder text-2xl text-[#0A0A0A]">START & FINISH</h3>
            <p className="text-sm font-semibold text-[#0A0A0A]">
              <span className="text-[#00A3FF]">Start:</span> Padukere Ground, Udupi<br />
              <span className="text-[#00A3FF]">Finish:</span> Kapu Light House
            </p>
          </div>
        </div>

        {/* Visual Categories Overview Row */}
        <div className="bg-white border border-slate-200 p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6">
            <Award className="w-6 h-6 text-[#00A3FF]" />
            <h3 className="font-thunder text-2xl text-[#0A0A0A]">RACE CATEGORIES</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-5 border-l-4 border-[#FF7A30] border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#FF7A30] font-extrabold tracking-wider uppercase">FUN RUN</span>
                <h4 className="font-thunder text-sm sm:text-base md:text-lg font-extrabold text-[#0A0A0A] tracking-tight leading-snug mt-0.5">3K FUN RUN</h4>
                <p className="text-xs text-slate-800 font-semibold mt-1">Padukere Ground ➔ Padukare School</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Kids & Senior Citizens Walk/Run</p>
              </div>
              <span className="inline-block mt-3 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase border border-emerald-300 w-fit">
                FREE ENTRY
              </span>
            </div>

            <div className="bg-slate-50 p-5 border-l-4 border-[#FF7A30] border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#FF7A30] font-extrabold tracking-wider uppercase">SPEED RUN</span>
                <h4 className="font-thunder text-sm sm:text-base md:text-lg font-extrabold text-[#0A0A0A] tracking-tight leading-snug mt-0.5">5K COASTAL CHALLENGE</h4>
                <p className="text-xs text-slate-800 font-semibold mt-1">Padukere Ground ➔ Blue Wave</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Fitness enthusiasts & beginners</p>
              </div>
              <span className="inline-block mt-3 px-2 py-0.5 bg-amber-100 text-[#FF7A30] text-xs font-bold uppercase border border-amber-300 w-fit">
                ₹499 INR
              </span>
            </div>

            <div className="bg-slate-50 p-5 border-l-4 border-[#FF7A30] border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#FF7A30] font-extrabold tracking-wider uppercase">ENDURANCE</span>
                <h4 className="font-thunder text-sm sm:text-base md:text-lg font-extrabold text-[#0A0A0A] tracking-tight leading-snug mt-0.5">10K ENDURANCE RUN</h4>
                <p className="text-xs text-slate-800 font-semibold mt-1">Padukere Ground ➔ Mattu Beach</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Timed distance challenge</p>
              </div>
              <span className="inline-block mt-3 px-2 py-0.5 bg-amber-100 text-[#FF7A30] text-xs font-bold uppercase border border-amber-300 w-fit">
                ₹799 INR
              </span>
            </div>

            <div className="bg-slate-50 p-5 border-l-4 border-[#FF7A30] border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#FF7A30] font-extrabold tracking-wider uppercase">ULTIMATE</span>
                <h4 className="font-thunder text-sm sm:text-base md:text-lg font-extrabold text-[#0A0A0A] tracking-tight leading-snug mt-0.5">15K ULTIMATE MARATHON</h4>
                <p className="text-xs text-slate-800 font-semibold mt-1">Padukere Ground ➔ Kapu Light House</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Full 15K coastal marathon course</p>
              </div>
              <span className="inline-block mt-3 px-2 py-0.5 bg-amber-100 text-[#FF7A30] text-xs font-bold uppercase border border-amber-300 w-fit">
                ₹999 INR
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
