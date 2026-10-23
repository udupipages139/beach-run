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
import { AdminDashboard } from './components/AdminDashboard';
import { TrainingTipsPage } from './components/pages/TrainingTipsPage';
import { HealthAndBeachesPage } from './components/pages/HealthAndBeachesPage';
import { WhyCoastlineCallingPage } from './components/pages/WhyCoastlineCallingPage';

type ViewState =
  | 'home'
  | 'blog'
  | 'gallery'
  | 'route-map'
  | 'admin'
  | 'training-tips'
  | 'health-and-beaches'
  | 'why-coastline-calling';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    const handleUrlRouting = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isAdmin =
        pathname === '/admin' ||
        pathname.startsWith('/admin') ||
        pathname.includes('/admin') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        hash.startsWith('#admin') ||
        hash.startsWith('#/admin') ||
        search.includes('view=admin') ||
        search.includes('admin');

      if (isAdmin) {
        setCurrentView('admin');
      } else if (
        hash === '#training-tips' ||
        hash === '#conquering-the-sand' ||
        pathname.includes('/training-tips') ||
        pathname.includes('/conquering-the-sand')
      ) {
        setCurrentView('training-tips');
      } else if (
        hash === '#health-and-beaches' ||
        hash === '#run-for-health' ||
        hash === '#run-for-health-protect-beaches' ||
        pathname.includes('/run-for-health')
      ) {
        setCurrentView('health-and-beaches');
      } else if (
        hash === '#why-coastline-calling' ||
        hash === '#why-udupis-coastline-is-calling-you' ||
        pathname.includes('/why-coastline') ||
        pathname.includes('/why-udupi')
      ) {
        setCurrentView('why-coastline-calling');
      } else if (hash.startsWith('#blog-page') || hash.startsWith('#blog-') || hash === '#blog' || pathname.startsWith('/blog')) {
        setCurrentView('blog');
        const matchPage = hash.match(/#blog-page-(.+)/);
        const matchDirect = hash.match(/#blog-(.+)/);
        if (matchPage) {
          setSelectedArticleId(matchPage[1]);
        } else if (matchDirect && matchDirect[1] !== 'page') {
          setSelectedArticleId(matchDirect[1]);
        } else if (pathname.startsWith('/blog/')) {
          const slug = pathname.replace('/blog/', '').replace(/\/$/, '');
          if (slug) setSelectedArticleId(slug);
        }
      } else if (hash === '#gallery-page' || hash === '#gallery-all') {
        setCurrentView('gallery');
      } else if (hash === '#route-map-page' || hash === '#full-route') {
        setCurrentView('route-map');
      } else {
        setCurrentView('home');
      }
    };


    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);
    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  const navigateTo = (view: ViewState, targetSectionOrArticleId?: string) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'blog') {
      setSelectedArticleId(targetSectionOrArticleId || null);
      window.location.hash = targetSectionOrArticleId ? `blog-page-${targetSectionOrArticleId}` : 'blog-page';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'training-tips') {
      window.location.hash = 'training-tips';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'health-and-beaches') {
      window.location.hash = 'health-and-beaches';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'why-coastline-calling') {
      window.location.hash = 'why-coastline-calling';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'gallery') {
      window.location.hash = 'gallery-page';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'route-map') {
      window.location.hash = 'route-map-page';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
        window.history.pushState({}, '', '/');
      }
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

  if (currentView === 'admin') {
    return <AdminDashboard onBackToHome={() => navigateTo('home')} />;
  }

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

      {currentView === 'training-tips' && (
        <TrainingTipsPage
          onBackToHome={() => navigateTo('home')}
          onNavigateToPost={(id) => navigateTo('blog', id)}
        />
      )}

      {currentView === 'health-and-beaches' && (
        <HealthAndBeachesPage
          onBackToHome={() => navigateTo('home')}
          onNavigateToPost={(id) => navigateTo('blog', id)}
        />
      )}

      {currentView === 'why-coastline-calling' && (
        <WhyCoastlineCallingPage
          onBackToHome={() => navigateTo('home')}
          onNavigateToPost={(id) => navigateTo('blog', id)}
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

