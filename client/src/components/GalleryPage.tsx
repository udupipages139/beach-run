import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Eye,
  X,
  ArrowLeft,
  MapPin,
  Search,
  Filter
} from 'lucide-react';

export interface GalleryPhoto {
  id: number;
  title: string;
  alt: string;
  category: string;
  src: string;
  camera?: string;
  location?: string;
  iso?: string;
}

export const fullGalleryPhotos: GalleryPhoto[] = [
  {
    id: 1,
    title: 'COASTAL SHORELINE MARATHON',
    alt: 'Documentary action photograph of coastal trail runners conquering the tide line at sunrise.',
    category: '15K MARATHON',
    src: '/images/gallery/will-saunders.jpg',
    camera: 'Sony α7R V • 24-70mm f/2.8',
    location: 'Padukere Beach (13.3142° N, 74.7082° E)',
    iso: 'ISO 200, 1/1250s, f/4.0'
  },
  {
    id: 2,
    title: 'UDUPI COASTAL CORRIDOR VISTA',
    alt: 'Panoramic golden coastline where fresh river estuaries merge with the Arabian Sea in Udupi.',
    category: 'AERIAL DRONE',
    src: '/images/gallery/ashish-thanthry-Y8G0AHhbr1A-unsplash.jpg',
    camera: 'DJI Mavic 3 Cine • Hasselblad 24mm',
    location: 'Kapu Coastline (13.2241° N, 74.7431° E)',
    iso: 'ISO 100, 1/800s, f/2.8'
  },
  {
    id: 3,
    title: 'ATMOSPHERIC SEA RIDGE',
    alt: 'Early morning sea breeze along the dune sand trail near Padukere Ground.',
    category: 'COASTAL ECOLOGY',
    src: '/images/gallery/hemendra-ahuja-tILxrAivG-U-unsplash.jpg',
    camera: 'Canon EOS R5 • RF 50mm f/1.2',
    location: 'Padukere Dune Track',
    iso: 'ISO 400, 1/2000s, f/2.0'
  },
  {
    id: 4,
    title: 'PALM-FRINGED ESTUARY PATH',
    alt: 'Scenic tropical palm tree corridor running alongside Udupi coastline.',
    category: 'AERIAL DRONE',
    src: '/images/gallery/kushal-pradhan-M5NULfQW7no-unsplash.jpg',
    camera: 'DJI Air 3 • 70mm Telephoto',
    location: 'Mattu Estuary Ridge',
    iso: 'ISO 100, 1/1000s, f/2.8'
  },
  {
    id: 5,
    title: 'SUNSET SHORELINE SPRINT',
    alt: 'Vibrant sunset colors reflecting over coastal waters as runners push forward.',
    category: '15K MARATHON',
    src: '/images/gallery/sonaal-bangera-ZRT81xV1Ln0-unsplash.jpg',
    camera: 'Nikon Z9 • 70-200mm f/2.8',
    location: 'Kapu Lighthouse Shore',
    iso: 'ISO 800, 1/640s, f/2.8'
  },
  {
    id: 6,
    title: 'COASTAL MOVEMENT IMPACT',
    alt: 'Official Udupipages Beach Run coastal marathon athletic banner artwork.',
    category: 'EVENT IMPACT',
    src: '/images/gallery/coastal-runner-bg.png',
    camera: 'Digital Media Master Render',
    location: 'Padukere Flag-off Arena',
    iso: 'Native RGB Studio Color'
  },
  {
    id: 7,
    title: 'PADDLING THE TIDE LINE',
    alt: 'Athletes pacing alongside breaking waves on firm wet shoreline sand.',
    category: '15K MARATHON',
    src: '/images/hero_section/udupipages-Beach-Run5.jpg.jpeg',
    camera: 'Fujifilm X-T5 • XF 16-55mm f/2.8',
    location: 'Padukere 3K Turnaround',
    iso: 'ISO 320, 1/1600s, f/4.0'
  },
  {
    id: 8,
    title: 'THE HISTORIC 1901 LIGHTHOUSE',
    alt: 'Granite boulders and historic light house standing tall above coastal waves.',
    category: 'COASTAL ECOLOGY',
    src: '/images/hero_section/udupipages-Beach-Run2.jpg.jpeg',
    camera: 'Sony α1 • 14mm Ultra-Wide',
    location: 'Kapu Light House Summit',
    iso: 'ISO 100, 1/2500s, f/5.6'
  }
];

interface GalleryPageProps {
  onBackToHome: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onBackToHome }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', '15K MARATHON', 'AERIAL DRONE', 'COASTAL ECOLOGY', 'EVENT IMPACT'];

  const filteredPhotos = fullGalleryPhotos.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.alt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-sans pb-24 pt-20">
      
      {/* Top Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Hero Header */}
        <div className="mb-10 text-center sm:text-left space-y-3 border-b border-slate-200 pb-8">
          <h1 className="font-thunder text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase tracking-wide">
            COASTAL RUNNING <span className="text-gradient-orange">PHOTO & MEDIA GALLERY</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-700 font-normal max-w-3xl leading-relaxed">
            Atmospheric documentary photography capturing the athletic grit, tide lines, sand dunes, and natural beauty of Udupi’s coast.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photography title or topic..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 text-xs sm:text-sm text-[#0A0A0A] placeholder-slate-400 focus:outline-none focus:border-[#FF7A30]"
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

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:block" />
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                    active
                      ? 'bg-[#FF7A30] text-white border-[#FF7A30] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-[#FF7A30] hover:text-[#FF7A30]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative cursor-pointer overflow-hidden bg-slate-900 border border-slate-200 hover:border-[#FF7A30] transition-all aspect-[4/3] shadow-md"
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-widest text-[#FF7A30] bg-black/80 px-2.5 py-0.5 uppercase font-bold border border-[#FF7A30]/40">
                    {photo.category}
                  </span>
                  <Camera className="w-4 h-4 text-white/70 group-hover:text-[#FF7A30] transition-colors" />
                </div>

                <div className="space-y-1 text-white">
                  <h3 className="font-thunder text-2xl font-extrabold group-hover:text-[#FF7A30] transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-normal line-clamp-2 leading-relaxed">
                    {photo.alt}
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 bg-[#FF7A30]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-[#FF7A30]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Highlights Reel */}
        <div className="bg-slate-50 p-8 border border-slate-200 space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#FF7A30] uppercase font-bold tracking-widest bg-amber-50 px-2.5 py-1 border border-[#FF7A30]/40">
              DOCUMENTARY VIDEO HIGHLIGHTS
            </span>
            <h3 className="font-thunder text-3xl font-extrabold text-[#0A0A0A] uppercase">
              OFFICIAL 4K MARATHON TRAILER
            </h3>
          </div>

          <div className="relative aspect-video max-w-4xl mx-auto bg-black border border-slate-200 overflow-hidden shadow-md">
            <video
              src="/hero_section video.mp4"
              controls
              className="w-full h-full object-cover"
              poster="/images/gallery/ashish-thanthry-Y8G0AHhbr1A-unsplash.jpg"
            />
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative max-w-4xl w-full bg-white border border-slate-300 overflow-hidden shadow-2xl">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/80 hover:bg-[#FF7A30] text-white flex items-center justify-center transition-colors border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative max-h-[70vh] w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              <div className="p-6 bg-white text-[#0A0A0A] space-y-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[#FF7A30] uppercase font-extrabold tracking-widest">
                    {selectedPhoto.category}
                  </span>
                  {selectedPhoto.camera && (
                    <span className="text-xs font-mono text-slate-500">
                      {selectedPhoto.camera}
                    </span>
                  )}
                </div>

                <h3 className="font-thunder text-3xl font-extrabold text-[#0A0A0A]">{selectedPhoto.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
                  {selectedPhoto.alt}
                </p>

                {selectedPhoto.location && (
                  <div className="text-[11px] text-slate-600 font-mono flex items-center space-x-2 pt-2 border-t border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7A30]" />
                    <span>GPS: {selectedPhoto.location}</span>
                    <span>•</span>
                    <span>EXIF: {selectedPhoto.iso}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
