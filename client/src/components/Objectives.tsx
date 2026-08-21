import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, Coins, Users, Eye } from 'lucide-react';

export const Objectives: React.FC = () => {
  const objectives = [
    {
      num: '01',
      title: 'Educate and Raise Awareness',
      subtitle: 'Public & Spectator Education',
      desc: 'To inform the public, participants, and spectators about the importance of keeping beaches, rivers, and the sea clean. This includes educating them on the harmful effects of plastic pollution, improper waste disposal, and the degradation of natural habitats on marine life and human health.',
      icon: BookOpen,
    },
    {
      num: '02',
      title: 'Promote Responsible Tourism',
      subtitle: 'Leave No Trace Philosophy',
      desc: 'To encourage both locals and tourists to adopt eco-friendly habits and practice responsible tourism. The event would promote a "leave no trace" philosophy, emphasizing that the natural beauty of Udupi is a shared resource that must be preserved.',
      icon: Compass,
    },
    {
      num: '03',
      title: 'Fundraising for Conservation Efforts',
      subtitle: 'Direct Coastal & River Funding',
      desc: 'To generate funds for local organizations and initiatives dedicated to coastal and river conservation. This could include financing beach clean-up drives, filter river waste to sea, setting up proper waste management systems, or supporting programs for the restoration of natural ecosystems.',
      icon: Coins,
    },
    {
      num: '04',
      title: 'Foster Community Engagement',
      subtitle: 'Sustainable Community Movement',
      desc: 'To unite the local community, including government bodies, schools, businesses, and volunteers, under a common cause. This collective participation strengthens local bonds and ensures that the conservation message extends beyond the event itself, creating a sustainable movement.',
      icon: Users,
    },
    {
      num: '05',
      title: "Showcase Udupi's Natural Beauty",
      subtitle: 'The Marathon Route as a Moving Canvas',
      desc: 'To highlight the stunning coastline and serene environment of Udupi, reminding people of what is at stake and inspiring a deeper appreciation for nature. The marathon route itself would serve as a moving canvas, showcasing the beauty of the area that needs to be protected.',
      icon: Eye,
    },
  ];

  return (
    <section id="objectives" className="py-20 sm:py-28 bg-slate-50 text-[#0A0A0A] border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#FF7A30] uppercase block">
            MEASURABLE ENVIRONMENTAL OUTCOMES
          </span>
          <h2 className="font-thunder text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase">
            OBJECTIVES
          </h2>
          <p className="text-xs sm:text-base text-slate-700 font-normal">
            The Beach Run is designed around measurable environmental outcomes through year long activities.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {objectives.map((obj, index) => {
            const Icon = obj.icon;
            return (
              <motion.div
                key={obj.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className={`group relative bg-white border border-slate-200 p-7 sm:p-8 hover:border-[#FF7A30] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${
                  index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  {/* Top Card Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-thunder text-4xl font-extrabold text-slate-300 group-hover:text-[#FF7A30] transition-colors duration-300">
                      {obj.num}
                    </span>
                    <div className="w-12 h-12 bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Icon className="w-6 h-6 text-[#FF7A30]" />
                    </div>
                  </div>

                  <h3 className="font-thunder text-xl sm:text-2xl font-extrabold text-[#0A0A0A] group-hover:text-[#FF7A30] transition-colors mb-1.5 leading-snug">
                    {obj.title}
                  </h3>
                  <h4 className="text-xs font-bold text-[#FF7A30] uppercase tracking-wider mb-4">
                    {obj.subtitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
                    {obj.desc}
                  </p>
                </div>

                {/* Subtle Hover Gradient Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-sunset-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
