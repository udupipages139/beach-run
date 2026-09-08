import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Objectives } from './components/Objectives';
import { EventDetails } from './components/EventDetails';
import { RouteMap } from './components/RouteMap';
import { Register } from './components/Register';
import { Gallery } from './components/Gallery';
import { Partners } from './components/Partners';
import { BlogNews } from './components/BlogNews';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { BlogPage } from './components/BlogPage';
import { GalleryPage } from './components/GalleryPage';
import { RouteMapPage } from './components/RouteMapPage';

type ViewState = 'home' | 'blog' | 'gallery' | 'route-map';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#blog-page') || hash === '#blog') {
        setCurrentView('blog');
        const match = hash.match(/#blog-page-(.+)/);
        if (match) {
          setSelectedArticleId(match[1]);
        }
      } else if (hash === '#gallery-page' || hash === '#gallery-all') {
        setCurrentView('gallery');
      } else if (hash === '#route-map-page' || hash === '#full-route') {
        setCurrentView('route-map');
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ViewState, targetSectionOrArticleId?: string) => {
    setCurrentView(view);
    if (view === 'blog') {
      setSelectedArticleId(targetSectionOrArticleId || null);
      window.location.hash = targetSectionOrArticleId ? `blog-page-${targetSectionOrArticleId}` : 'blog-page';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'gallery') {
      window.location.hash = 'gallery-page';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'route-map') {
      window.location.hash = 'route-map-page';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (targetSectionOrArticleId) {
        window.location.hash = targetSectionOrArticleId;
        setTimeout(() => {
          const el = document.getElementById(targetSectionOrArticleId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.location.hash = 'home';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] selection:bg-[#00A3FF] selection:text-white font-sans">
      <Navbar currentView={currentView} onNavigate={(v, section) => navigateTo(v, section)} />

      {currentView === 'home' && (
        <main>
          <Hero />
          <About />
          <Objectives />
          <EventDetails />
          <RouteMap onNavigateToRouteMap={() => navigateTo('route-map')} />
          <Register />
          <Gallery onNavigateToGallery={() => navigateTo('gallery')} />
          <Partners />
          <BlogNews onNavigateToBlog={(artId) => navigateTo('blog', artId)} />
          <FAQ />
        </main>
      )}

      {currentView === 'blog' && (
        <BlogPage
          initialArticleId={selectedArticleId}
          onBackToHome={() => navigateTo('home')}
        />
      )}

      {currentView === 'gallery' && (
        <GalleryPage onBackToHome={() => navigateTo('home')} />
      )}

      {currentView === 'route-map' && (
        <RouteMapPage onBackToHome={() => navigateTo('home')} />
      )}

      <Footer />
    </div>
  );
};

export default App;
