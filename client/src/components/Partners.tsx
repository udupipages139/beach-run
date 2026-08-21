import React from 'react';
import { Shield, Award, HeartHandshake, Waves, Globe, Anchor } from 'lucide-react';

export const Partners: React.FC = () => {
  const partners = [
    { name: 'Udupi District Tourism', icon: Waves },
    { name: 'Karnataka Marine Board', icon: Anchor },
    { name: 'Coastal Protection Forum', icon: Shield },
    { name: 'Clean Seas Initiative', icon: Globe },
    { name: 'Udupipages Media', icon: Award },
    { name: 'Ocean Guardians NGO', icon: HeartHandshake },
  ];

  return (
    <section className="py-16 bg-white border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-mono text-[#00A3FF] uppercase tracking-widest font-bold block">
            COMMUNITY & ENVIRONMENTAL PARTNERS
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200 p-4 flex flex-col items-center justify-center space-y-2 hover:border-[#00A3FF] shadow-xs hover:shadow-md transition-all group cursor-default"
              >
                <Icon className="w-6 h-6 text-slate-500 group-hover:text-[#00A3FF] transition-colors" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#00A3FF] uppercase tracking-wider text-center">
                  {partner.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
