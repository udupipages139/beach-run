import React from 'react';
import { Newspaper, Calendar, Clock, ArrowRight } from 'lucide-react';
import { blogArticles } from '../data/blogArticles';

interface BlogNewsProps {
  onNavigateToBlog?: (articleId?: string) => void;
}

export const BlogNews: React.FC<BlogNewsProps> = ({ onNavigateToBlog }) => {
  // Display the 3 official blog articles on the home section
  const visibleArticles = blogArticles.slice(0, 3);


  return (
    <section id="news" className="py-20 sm:py-28 bg-white text-[#0A0A0A] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-[#FF7A30]/40 rounded-full text-xs font-semibold tracking-widest text-[#FF7A30] uppercase">
            <Newspaper className="w-3.5 h-3.5 text-[#FF7A30]" />
            <span>LATEST UPDATES & ANNOUNCEMENTS</span>
          </div>
          <h2 className="font-thunder text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase">
            BLOG & <span className="text-gradient-orange">NEWS</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-normal">
            Stay informed with coastal conservation stories, marathon training tips, and official event news.
          </p>
        </div>

        {/* 3 Columns Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => onNavigateToBlog?.(art.id)}
              className="group cursor-pointer bg-slate-50 border border-slate-200 hover:border-[#FF7A30] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 left-3 text-[10px] font-mono font-extrabold tracking-widest text-white bg-[#FF7A30] px-2 py-0.5 uppercase shadow-xs">
                    {art.category}
                  </span>
                </div>

                {/* Article Info */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center font-semibold"><Calendar className="w-3 h-3 text-[#FF7A30] mr-1" /> {art.date}</span>
                    <span>•</span>
                    <span className="flex items-center font-semibold"><Clock className="w-3 h-3 text-[#FF7A30] mr-1" /> {art.readTime}</span>
                  </div>

                  <h3 className="font-thunder text-xl sm:text-2xl font-extrabold text-[#0A0A0A] group-hover:text-[#FF7A30] transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 font-normal leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              {/* Read More Trigger */}
              <div className="p-6 pt-0">
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-extrabold text-[#FF7A30] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>READ FULL STORY</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Stories Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigateToBlog?.()}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-sunset-gradient text-white font-sans text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform space-x-3 border border-white/20"
          >
            <Newspaper className="w-5 h-5" />
            <span>EXPLORE ALL BLOG & NEWS STORIES</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
