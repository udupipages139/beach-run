import React, { useState, useMemo, useEffect } from 'react';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  X,
  Search,
  ArrowLeft,
  Bookmark,
  User,
  Filter,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { BlogPost, blogArticles } from '../data/blogArticles';
import { BlogPostDetail } from './BlogPostDetail';

interface BlogPageProps {
  onBackToHome: () => void;
  initialArticleId?: string | null;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBackToHome, initialArticleId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(() => {
    if (initialArticleId) {
      return blogArticles.find((a) => a.id === initialArticleId || a.slug === initialArticleId) || null;
    }
    return null;
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (initialArticleId) {
      const art = blogArticles.find((a) => a.id === initialArticleId || a.slug === initialArticleId);
      if (art) {
        setSelectedArticle(art);
      }
    }
  }, [initialArticleId]);

  const categories = ['ALL', 'TRAINING & PERFORMANCE', 'ENVIRONMENTAL ACTION', 'COMMUNITY & EVENT', 'COURSE INSIGHTS', 'COMMUNITY IMPACT'];

  const filteredArticles = useMemo(() => {
    return blogArticles.filter((art) => {
      const matchesCat = selectedCategory === 'ALL' || art.category === selectedCategory;
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return blogArticles.find((a) => a.featured) || blogArticles[0];
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  // If an article is selected, render the dedicated full-page reading experience!
  if (selectedArticle) {
    return (
      <BlogPostDetail
        post={selectedArticle}
        onBackToBlog={() => {
          setSelectedArticle(null);
          window.location.hash = 'blog-page';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToPost={(postId) => {
          const next = blogArticles.find((a) => a.id === postId || a.slug === postId);
          if (next) {
            setSelectedArticle(next);
            window.location.hash = `blog-page-${next.id}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onRegisterClick={() => {
          onBackToHome();
          setTimeout(() => {
            document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A0A0A] font-sans pb-24 pt-20">
      
      {/* Top Breadcrumb & Navigation Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#00A3FF] hover:text-[#0066FF] uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME LANDING PAGE</span>
          </button>

          <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
            <span>UDUPIPAGES OFFICIAL BULLETIN</span>
            <span>•</span>
            <span className="text-[#00A3FF] font-bold">{blogArticles.length} STORIES PUBLISHED</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Hero Header */}
        <div className="mb-10 text-center sm:text-left space-y-3 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-50 border border-[#00A3FF]/40 rounded-full text-xs font-semibold tracking-widest text-[#00A3FF] uppercase">
            <Newspaper className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span>OFFICIAL RACE JOURNAL & PRESS DESK</span>
          </div>
          <h1 className="font-thunder text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase tracking-wide">
            UDUPI BEACH RUN <span className="text-gradient">BLOG & STORIES</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-3xl leading-relaxed">
            In-depth guides on coastal sand training, biomechanics, environmental conservation, and official updates for Udupipages Beach Run 2026.
          </p>
        </div>

        {/* Featured Lead Article */}
        {selectedCategory === 'ALL' && !searchQuery && (
          <div className="mb-14 bg-white border border-slate-200 shadow-md overflow-hidden group hover:border-[#00A3FF] transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[320px] overflow-hidden bg-slate-900">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#00A3FF] text-white text-[11px] font-mono font-extrabold px-3 py-1 uppercase tracking-widest shadow-md">
                  FEATURED LEAD STORY
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center text-[#00A3FF] font-bold">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> {featuredArticle.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 text-[#00A3FF] mr-1" /> {featuredArticle.readTime}
                    </span>
                  </div>

                  <span className="inline-block text-[11px] font-mono text-[#00A3FF] uppercase font-bold tracking-widest bg-sky-50 px-2.5 py-0.5 border border-sky-200">
                    {featuredArticle.category}
                  </span>

                  <h2 className="font-thunder text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A] group-hover:text-[#00A3FF] transition-colors leading-tight">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <User className="w-3.5 h-3.5 text-[#00A3FF]" />
                    <span>{featuredArticle.author}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedArticle(featuredArticle);
                      window.location.hash = `blog-page-${featuredArticle.id}`;
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-sunset-gradient text-white font-sans text-xs uppercase font-extrabold tracking-wider hover:opacity-95 flex items-center space-x-2"
                  >
                    <span>READ ARTICLE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs & Search Control */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 shadow-xs">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, topics, authors..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#0A0A0A] placeholder-slate-400 focus:outline-none focus:border-[#00A3FF]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                    active
                      ? 'bg-[#00A3FF] text-white border-[#00A3FF] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#00A3FF]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 p-8 space-y-3">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-thunder text-2xl text-slate-700">NO ARTICLES MATCH YOUR SEARCH</h3>
            <p className="text-xs text-slate-500">Try adjusting your category filter or keyword terms.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="mt-3 px-4 py-2 bg-slate-100 text-xs font-bold uppercase text-[#00A3FF]"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art) => {
              const isBookmarked = bookmarkedIds.includes(art.id);
              return (
                <article
                  key={art.id}
                  onClick={() => {
                    setSelectedArticle(art);
                    window.location.hash = `blog-page-${art.id}`;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group cursor-pointer bg-white border border-slate-200 hover:border-[#00A3FF] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70" />
                      
                      <span className="absolute top-3 left-3 text-[10px] font-mono font-bold tracking-widest text-white bg-[#00A3FF] px-2.5 py-0.5 uppercase shadow-xs">
                        {art.category}
                      </span>

                      <button
                        onClick={(e) => toggleBookmark(art.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                          isBookmarked
                            ? 'bg-[#00A3FF] text-white'
                            : 'bg-black/40 text-white hover:bg-black/70'
                        }`}
                        title={isBookmarked ? 'Bookmarked' : 'Bookmark story'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meta & Title */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 text-[#00A3FF] mr-1" /> {art.date}</span>
                        <span>•</span>
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 text-[#00A3FF] mr-1" /> {art.readTime}</span>
                      </div>

                      <h3 className="font-thunder text-2xl text-[#0A0A0A] group-hover:text-[#00A3FF] transition-colors leading-tight">
                        {art.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 font-normal leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A3FF] uppercase tracking-wider">
                      <span className="group-hover:translate-x-1 transition-transform">READ FULL STORY</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Newsletter Subscription Box */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00A3FF] uppercase font-bold tracking-widest bg-black/50 px-3 py-1 border border-[#00A3FF]/40">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>OFFICIAL ATHLETE DISPATCH</span>
            </div>
            <h3 className="font-thunder text-3xl sm:text-4xl text-white uppercase">
              GET THE LATEST RACE ANNOUNCEMENTS DIRECT TO YOUR INBOX
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Receive route updates, training guides, and race-day logistics directly from the Udupipages Organizing Committee.
            </p>

            {subscribed ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold uppercase flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>SUCCESS! YOU ARE SUBSCRIBED TO THE UDUPI BEACH RUN DISPATCH.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-grow px-4 py-3 bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00A3FF]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-sunset-gradient text-white font-sans text-xs uppercase font-extrabold tracking-wider hover:opacity-95 whitespace-nowrap"
                >
                  SUBSCRIBE NOW
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
