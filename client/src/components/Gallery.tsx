import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Eye, X, Glasses, ArrowRight } from 'lucide-react';

interface GalleryProps {
  onNavigateToGallery?: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onNavigateToGallery }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<null | typeof photos[0]>(null);

  const photos = [
    {
      id: 1,
      title: 'COASTAL SHORELINE MARATHON',
      alt: 'Documentary action photograph of coastal trail runners conquering the tide line at sunrise.',
      category: '15K MARATHON',
      src: '/images/gallery/will-saunders.jpg',
    },
    {
      id: 2,
      title: 'UDUPI COASTAL CORRIDOR VISTA',
      alt: 'Panoramic golden coastline where fresh river estuaries merge with the Arabian Sea in Udupi.',
      category: 'NATURAL BEAUTY',
      src: '/images/gallery/ashish-thanthry-Y8G0AHhbr1A-unsplash.jpg',
    },
    {
      id: 3,
      title: 'ATMOSPHERIC SEA RIDGE',
      alt: 'Early morning sea breeze along the dune sand trail near Padukere Ground.',
      category: 'COURSE TRAIL',
      src: '/images/gallery/hemendra-ahuja-tILxrAivG-U-unsplash.jpg',
    },
    {
      id: 4,
      title: 'PALM-FRINGED ESTUARY PATH',
      alt: 'Scenic tropical palm tree corridor running alongside Udupi coastline.',
      category: 'ECO CORRIDOR',
      src: '/images/gallery/kushal-pradhan-M5NULfQW7no-unsplash.jpg',
    },
    {
      id: 5,
      title: 'SUNSET SHORELINE SPRINT',
      alt: 'Vibrant sunset colors reflecting over coastal waters as runners push forward.',
      category: 'SUNSET MARATHON',
      src: '/images/gallery/sonaal-bangera-ZRT81xV1Ln0-unsplash.jpg',
    },
    {
      id: 6,
      title: 'COASTAL MOVEMENT IMPACT',
      alt: 'Official Udupipages Beach Run coastal marathon athletic banner artwork.',
      category: 'EVENT IMPACT',
      src: '/images/gallery/coastal-runner-bg.png',
    },
  ];

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-slate-50 text-[#0A0A0A] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#00A3FF] uppercase block">
            VISUAL DOCUMENTARY
          </span>
          <h2 className="font-thunder text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase">
            COASTAL RUNNING <span className="text-gradient font-thunder">GALLERY</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-normal">
            Moody, documentary trail-running imagery capturing the raw spirit of Udupi’s coast.
          </p>
        </div>

        {/* Gallery Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative cursor-pointer overflow-hidden bg-slate-900 border border-slate-200 hover:border-[#00A3FF] shadow-sm hover:shadow-md transition-all aspect-[4/3]"
            >
              {/* Real Photography Asset */}
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-widest text-[#00A3FF] bg-black/80 px-2 py-1 uppercase font-bold border border-[#00A3FF]/40">
                    {photo.category}
                  </span>
                  <Camera className="w-5 h-5 text-white/70 group-hover:text-[#00A3FF] transition-colors" />
                </div>

                <div className="space-y-1 text-white">
                  <h3 className="font-thunder text-2xl group-hover:text-[#00A3FF] transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-normal line-clamp-2 leading-relaxed">
                    {photo.alt}
                  </p>
                </div>
              </div>

              {/* Hover Zoom Icon */}
              <div className="absolute inset-0 bg-[#00A3FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-[#00A3FF]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore Full Photo Gallery Button */}
        {onNavigateToGallery && (
          <div className="mt-12 text-center">
            <button
              onClick={onNavigateToGallery}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#00A3FF] via-[#0066FF] to-[#00A3FF] text-white font-sans text-sm sm:text-base font-extrabold uppercase tracking-widest shadow-lg hover:scale-105 transition-all space-x-3 border border-white/20"
            >
              <Camera className="w-5 h-5" />
              <span>EXPLORE FULL PHOTO & MEDIA GALLERY</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>

      {/* Photo Lightbox Popup */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-black border border-slate-800 overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/70 hover:bg-[#00A3FF] text-white flex items-center justify-center transition-colors border border-white/20"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative max-h-[75vh] w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>

              <div className="p-6 bg-slate-900 text-white space-y-2 border-t border-slate-800">
                <span className="text-xs font-mono text-[#00A3FF] uppercase font-bold tracking-widest">
                  {selectedPhoto.category}
                </span>
                <h3 className="font-thunder text-3xl">{selectedPhoto.title}</h3>
                <p className="text-sm text-gray-300 font-normal leading-relaxed">
                  {selectedPhoto.alt}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
