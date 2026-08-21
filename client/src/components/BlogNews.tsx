import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, Clock, ArrowRight, X } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  content: string[];
  author: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: '15KM Coastal Clean-Up Drive Launched Ahead of Marathon Day',
    category: 'ENVIRONMENTAL ACTION',
    date: 'OCT 12, 2026',
    readTime: '4 MIN READ',
    image: '/images/hero_section/udupipages-Beach-Run1.jpg.jpeg',
    excerpt: 'Community volunteers, local schools, and NGOs unite to clear marine debris and plastic waste along the Padukere to Kapu coastline.',
    content: [
      'In preparation for the upcoming Udupipages Beach Run 2026, over 400 volunteers gathered along Padukere Ground and Mattu Beach to conduct a massive pre-race coastal cleanup.',
      'The initiative removed over 1.2 metric tons of discarded ocean plastic, ghost nets, and debris from the sensitive sand dunes. Organizers confirmed that 100% of collected plastics will be processed by local recycling partners.',
      'Event Director announced: "Our goal is zero plastic footprint on race day. Every runner will be provided eco-friendly compostable hydration cups and stainless steel refilling stations."'
    ],
    author: 'Udupipages Marine Conservation Team'
  },
  {
    id: '2',
    title: 'Pacing & Hydration Strategy for Udupi’s High-Humidity Coastal Trail',
    category: 'TRAINING & PERFORMANCE',
    date: 'NOV 02, 2026',
    readTime: '6 MIN READ',
    image: '/images/hero_section/udupipages-Beach-Run2.jpg.jpeg',
    excerpt: 'Mastering the ocean breeze, sand dune traction, and early morning humidity along Karnataka’s coastal corridor.',
    content: [
      'Running on beach sand and coastal asphalt requires a unique pacing strategy. The Udupipages 15K route features firm packed sand near the waterline and paved coastal roads near Kapu.',
      'Experts recommend starting conservatively at Padukere Ground during the 5:30 AM flag-off. Hydration stations will be positioned every 2.5KM featuring coconut water and electrolyte mixes.',
      'Maintain an upright posture when navigating dune shifts and adjust stride length by 10% to prevent excessive calf fatigue.'
    ],
    author: 'Coach Rajesh Shetty, Coastal Marathon Club'
  },
  {
    id: '3',
    title: 'Official Route Breakdown: Padukere Ground to Kapu Light House',
    category: 'COURSE INSIGHTS',
    date: 'NOV 18, 2026',
    readTime: '5 MIN READ',
    image: '/images/hero_section/udupipages-Beach-Run3.jpg.jpeg',
    excerpt: 'A mile-by-mile guide to Udupi’s most scenic coastal running track where fresh river estuaries meet the Arabian Sea.',
    content: [
      'The 2026 course is widely considered one of India’s most scenic coastal marathon tracks. Starting at Padukere Ground, runners head south along the sea wall toward Padukare School Ground (3K turnaround).',
      'Continuing past Blue Wave Warriors (5K checkpoint) and Mattu Beach (10K turnaround), the route culminates under the shadow of the historic 1901 Kapu Light House.',
      'Spectator cheer zones will be established at key junctions with traditional Yakshagana drum beats cheering runners toward the finish line.'
    ],
    author: 'Udupipages Logistics Committee'
  },
  {
    id: '4',
    title: 'Preserving Karnataka’s Marine Ecosystem Through Community Athletics',
    category: 'COMMUNITY IMPACT',
    date: 'NOV 28, 2026',
    readTime: '4 MIN READ',
    image: '/images/hero_section/udupipages-Beach-Run4.jpg.jpeg',
    excerpt: 'How sports tourism is driving long-term policy changes for coastal waste management in Udupi district.',
    content: [
      'The Udupipages Beach Run is more than an athletic event—it is a sustainable movement. Proceeds from race registrations directly fund year-round beach maintenance and river-to-sea waste filtration units.',
      'Local panchayats and tourism boards have partnered with the event to install permanent solar-powered waste bins across Padukere, Mattu, and Kapu beaches.',
      'Together, athletes, citizens, and tourists are proving that sports can be the catalyst for lasting ecological preservation.'
    ],
    author: 'Environmental Advisory Council'
  }
];

interface BlogNewsProps {
  onNavigateToBlog?: () => void;
}

export const BlogNews: React.FC<BlogNewsProps> = ({ onNavigateToBlog }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Display only 3 articles on the grid
  const visibleArticles = articles.slice(0, 3);

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
              onClick={() => setSelectedArticle(art)}
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
            onClick={() => onNavigateToBlog ? onNavigateToBlog() : setSelectedArticle(articles[3])}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-sunset-gradient text-white font-sans text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform space-x-3 border border-white/20"
          >
            <Newspaper className="w-5 h-5" />
            <span>EXPLORE ALL BLOG & NEWS STORIES</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-black bg-slate-100 border border-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="inline-block text-xs font-mono text-[#FF7A30] uppercase font-bold tracking-widest bg-amber-50 px-2.5 py-1 border border-amber-200">
                {selectedArticle.category}
              </span>

              <h2 className="font-thunder text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] leading-tight">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center justify-between text-xs text-slate-500 border-y border-slate-200 py-3 font-mono">
                <span>BY {selectedArticle.author.toUpperCase()}</span>
                <span>{selectedArticle.date} • {selectedArticle.readTime}</span>
              </div>

              <div className="h-64 w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-700 font-normal leading-relaxed">
                {selectedArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-2.5 bg-sunset-gradient text-white font-thunder text-sm uppercase font-bold tracking-wider hover:opacity-95"
                >
                  CLOSE STORY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
