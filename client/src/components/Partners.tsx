import React from 'react';
import { ExternalLink, Shield, Waves, Globe, Anchor, HeartHandshake, Award } from 'lucide-react';

export const Partners: React.FC = () => {
  const primaryPartners = [
    {
      name: 'Udupi Pages',
      role: 'Official Organizing & Media Partner',
      logo: '/images/partners/udupipages.jpg',
      url: 'https://www.udupipages.in/',
      description: 'The premier local news, culture, and community network driving Udupi’s coastal events.',
    },
    {
      name: 'TechNetMark',
      role: 'Official Technology & Digital Partner',
      logo: '/images/partners/technetmark.jpg',
      url: 'https://www.technetmark.com/',
      description: 'Connecting technology, creating value — powering high-performance digital platforms.',
    },
  ];

  const communityPartners = [
    { name: 'Udupi District Tourism', icon: Waves },
    { name: 'Karnataka Marine Board', icon: Anchor },
    { name: 'Coastal Protection Forum', icon: Shield },
    { name: 'Clean Seas Initiative', icon: Globe },
    {
      name: 'Udupipages Media',
      logo: '/images/partners/udupipages.jpg',
      url: 'https://www.udupipages.in/',
    },
    {
      name: 'TechNetMark',
      logo: '/images/partners/technetmark.jpg',
      url: 'https://www.technetmark.com/',
    },
  ];

  return (
    <section id="partners" className="py-16 sm:py-20 bg-white border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Main Organizing & Technology Partners */}
        <div>
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-mono text-[#00A3FF] uppercase tracking-widest font-bold block">
              ORGANIZING & TECHNOLOGY PARTNERS
            </span>
            <h2 className="font-thunder text-3xl sm:text-5xl text-slate-900 tracking-wider">
              POWERED BY LEADERS IN MEDIA & TECHNOLOGY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {primaryPartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#00A3FF] p-6 sm:p-8 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl group"
              >
                <div className="absolute top-4 right-4 text-slate-400 group-hover:text-[#00A3FF] transition-colors flex items-center space-x-1 text-xs font-mono">
                  <span className="text-[11px] font-bold tracking-wider">VISIT</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <div className="h-20 sm:h-24 w-full flex items-center justify-center my-3 px-4">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} Logo`}
                    className="max-h-full max-w-[200px] sm:max-w-[240px] object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-1.5 mt-auto pt-4 border-t border-slate-100 w-full">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#00A3FF] tracking-wider block">
                    {partner.role}
                  </span>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                    {partner.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Community & Environmental Partners Strip */}
        <div className="pt-6 border-t border-slate-100">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-mono text-[#00A3FF] uppercase tracking-widest font-bold block">
              COMMUNITY & ENVIRONMENTAL PARTNERS
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {communityPartners.map((partner, index) => {
              const hasLogo = 'logo' in partner && partner.logo;
              const hasUrl = 'url' in partner && partner.url;
              const Icon = 'icon' in partner ? partner.icon : null;

              const innerContent = (
                <>
                  {hasLogo ? (
                    <div className="h-8 w-full flex items-center justify-center">
                      <img
                        src={partner.logo}
                        alt={`${partner.name} Logo`}
                        className="max-h-8 max-w-[110px] object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : Icon ? (
                    <Icon className="w-6 h-6 text-slate-500 group-hover:text-[#00A3FF] transition-colors" />
                  ) : null}

                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#00A3FF] uppercase tracking-wider text-center flex items-center justify-center gap-1">
                    {partner.name}
                    {hasUrl && (
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#00A3FF] inline flex-shrink-0" />
                    )}
                  </span>
                </>
              );

              if (hasUrl) {
                return (
                  <a
                    key={index}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-50 border border-slate-200 p-4 flex flex-col items-center justify-center space-y-2 hover:border-[#00A3FF] shadow-xs hover:shadow-md transition-all group cursor-pointer"
                  >
                    {innerContent}
                  </a>
                );
              }

              return (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-200 p-4 flex flex-col items-center justify-center space-y-2 hover:border-[#00A3FF] shadow-xs hover:shadow-md transition-all group cursor-default"
                >
                  {innerContent}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

