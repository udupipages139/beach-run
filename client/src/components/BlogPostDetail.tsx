import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  Phone,
  Mail,
  ExternalLink,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BlogPost, blogArticles } from '../data/blogArticles';

interface BlogPostDetailProps {
  post: BlogPost;
  onBackToBlog: () => void;
  onNavigateToPost: (postId: string) => void;
  onRegisterClick?: () => void;
}

export const BlogPostDetail: React.FC<BlogPostDetailProps> = ({
  post,
  onBackToBlog,
  onNavigateToPost,
  onRegisterClick,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Other related stories (the other 2 articles)
  const relatedPosts = blogArticles.filter((a) => a.id !== post.id);

  return (
    <article className="min-h-screen bg-slate-50 text-[#0A0A0A] font-sans pb-24 pt-16">
      
      {/* Top Sticky Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBackToBlog}
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#00A3FF] hover:text-[#0077CC] uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL STORIES</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>

            {onRegisterClick ? (
              <button
                onClick={onRegisterClick}
                className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-1.5 bg-sunset-gradient text-white text-xs font-extrabold uppercase tracking-widest shadow-xs hover:opacity-95 transition-opacity"
              >
                <span>REGISTER NOW</span>
                <Flame className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a
                href="#register"
                onClick={() => {
                  window.location.hash = 'home';
                  setTimeout(() => {
                    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-1.5 bg-sunset-gradient text-white text-xs font-extrabold uppercase tracking-widest shadow-xs hover:opacity-95 transition-opacity"
              >
                <span>REGISTER NOW</span>
                <Flame className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header Metadata */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-[#00A3FF] bg-sky-50 px-3 py-1 border border-sky-200">
              {post.category}
            </span>
            <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 text-[#00A3FF] mr-1" />
                {post.date}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 text-[#00A3FF] mr-1" />
                {post.readTime}
              </span>
            </div>
          </div>

          <h1 className="font-thunder text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A] uppercase tracking-wide leading-tight">
            {post.h1Title || post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase block font-mono">
                BY {post.author.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {post.authorRole}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Udupipages Editorial Dispatch
            </span>
          </div>
        </header>

        {/* Featured Banner Image */}
        <div className="relative h-64 sm:h-96 w-full overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-mono flex items-center justify-between">
            <span className="bg-black/60 backdrop-blur-sm px-2.5 py-1">
              Malpe & Padukere Coastal Corridor • Udupi
            </span>
          </div>
        </div>

        {/* Event Quick Specs Box */}
        <div className="bg-white border-l-4 border-l-[#00A3FF] border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="text-xs font-mono uppercase font-bold text-[#00A3FF] tracking-wider mb-3 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-[#00A3FF]" />
            <span>OFFICIAL EVENT SNAPSHOT</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">EVENT DATE</span>
              <span className="font-bold text-slate-900">{post.eventDetails.date}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">LOCATION</span>
              <span className="font-bold text-slate-900">{post.eventDetails.location}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">FLAG-OFF WINDOW</span>
              <span className="font-bold text-slate-900">{post.eventDetails.flagOff}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">OFFICIAL PORTAL</span>
              <a
                href={`https://${post.eventDetails.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#00A3FF] hover:underline flex items-center space-x-1"
              >
                <span>{post.eventDetails.website}</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="font-thunder text-2xl sm:text-3xl text-slate-900 uppercase">
            INTRODUCTION
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
            {post.introParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Article Content Sections */}
        <div className="space-y-8">
          {post.sections.map((sec, idx) => (
            <section
              key={idx}
              className="bg-white border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs"
            >
              {sec.title && (
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-thunder text-2xl sm:text-3xl text-slate-900 uppercase tracking-wide">
                    {sec.title}
                  </h3>
                  {sec.subtitle && (
                    <p className="text-xs sm:text-sm text-[#00A3FF] font-semibold mt-1">
                      {sec.subtitle}
                    </p>
                  )}
                </div>
              )}

              {sec.content.length > 0 && (
                <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                  {sec.content.map((p, pIdx) => (
                    <p key={pIdx} className="whitespace-pre-line">{p}</p>
                  ))}
                </div>
              )}

              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul className="space-y-3 pt-2">
                  {sec.bulletPoints.map((bp, bpIdx) => (
                    <li key={bpIdx} className="flex items-start space-x-3 text-sm text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-[#00A3FF] mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{bp}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.callout && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-amber-900 text-xs sm:text-sm italic font-medium mt-4">
                  💡 {sec.callout.text}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* FAQ Accordion Section */}
        {post.faqs.length > 0 && (
          <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase font-bold text-[#00A3FF] tracking-wider">
                <HelpCircle className="w-4 h-4 text-[#00A3FF]" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h3 className="font-thunder text-2xl sm:text-3xl text-slate-900 uppercase">
                COMMON RUNNER INQUIRIES
              </h3>
            </div>

            <div className="divide-y divide-slate-200">
              {post.faqs.map((faq, fIdx) => {
                const isOpen = openFaqIndex === fIdx;
                return (
                  <div key={fIdx} className="py-4">
                    <button
                      onClick={() => toggleFaq(fIdx)}
                      className="w-full flex items-center justify-between text-left space-x-4 group"
                    >
                      <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#00A3FF] transition-colors">
                        {faq.question}
                      </span>
                      <span className="p-1 rounded-full bg-slate-100 group-hover:bg-sky-50 text-slate-500 group-hover:text-[#00A3FF] transition-colors flex-shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-[#00A3FF]/40">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Conclusion & CTA */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 border border-slate-800 shadow-xl space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-[#FF7A30] tracking-widest block">
              FINAL THOUGHTS
            </span>
            <h3 className="font-thunder text-3xl sm:text-4xl text-white uppercase">
              {post.conclusion.heading}
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {post.conclusion.paragraphs.map((p, cIdx) => (
              <p key={cIdx}>{p}</p>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            {onRegisterClick ? (
              <button
                onClick={onRegisterClick}
                className="px-6 py-3.5 bg-sunset-gradient text-white font-sans text-xs sm:text-sm uppercase font-extrabold tracking-widest shadow-md hover:scale-105 transition-transform flex items-center space-x-2"
              >
                <span>{post.conclusion.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <a
                href="#register"
                onClick={() => {
                  window.location.hash = 'home';
                  setTimeout(() => {
                    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="px-6 py-3.5 bg-sunset-gradient text-white font-sans text-xs sm:text-sm uppercase font-extrabold tracking-widest shadow-md hover:scale-105 transition-transform flex items-center space-x-2"
              >
                <span>{post.conclusion.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onBackToBlog}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700"
            >
              EXPLORE MORE STORIES
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex flex-wrap items-center gap-4">
            <span className="flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1 text-[#00A3FF]" />
              run@udupibeachrun.com
            </span>
            <span className="flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1 text-[#00A3FF]" />
              +91 9180323209 / +91 8494983557
            </span>
          </div>
        </section>

        {/* Read Next Related Articles */}
        <div className="pt-8 space-y-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-thunder text-2xl sm:text-3xl text-slate-900 uppercase">
              EXPLORE MORE COASTAL STORIES
            </h4>
            <button
              onClick={onBackToBlog}
              className="text-xs font-bold text-[#00A3FF] hover:underline uppercase"
            >
              VIEW ALL
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => {
                  onNavigateToPost(rel.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer bg-white border border-slate-200 hover:border-[#00A3FF] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-40 w-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-mono font-bold tracking-widest text-white bg-[#00A3FF] px-2 py-0.5 uppercase">
                      {rel.category}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    {rel.date} • {rel.readTime}
                  </div>

                  <h5 className="font-thunder text-xl text-slate-900 group-hover:text-[#00A3FF] transition-colors leading-snug">
                    {rel.title}
                  </h5>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rel.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A3FF] uppercase tracking-wider">
                  <span>READ STORY</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </article>
  );
};
