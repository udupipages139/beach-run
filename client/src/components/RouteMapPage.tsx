import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowLeft,
  Navigation,
  Compass,
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  X,
  Droplets,
  Award,
  Camera,
  Eye,
  Info
} from 'lucide-react';

export interface RouteWaypoint {
  id: string;
  name: string;
  distance: string;
  elevation: string;
  surface: string;
  description: string;
  highlights: string[];
  image: string;
  xPercent: number; // percentage on map image for hotspot pins
  yPercent: number;
}

export const routeWaypoints: RouteWaypoint[] = [
  {
    id: 'padukere',
    name: 'START LINE: PADUKERE GROUND',
    distance: '0.0 KM (FLAG-OFF 5:30 AM)',
    elevation: '2m above sea level',
    surface: 'Paved Asphalt & Open Beach Sand',
    description: 'The starting arena situated near Malpe Sea Walk & Padukere estuary. 1,500 runners assemble under morning sunrise lights.',
    highlights: ['Medical & Triage Tent', 'Bag Deposit Counter', 'Warm-up Zone', 'Pre-race Hydration'],
    image: '/images/checkpoints/PADUKERE GROUND.webp',
    xPercent: 30,
    yPercent: 15,
  },
  {
    id: 'padukare-school',
    name: 'PADUKARE SCHOOL GROUND',
    distance: '3.0 KM TURNAROUND',
    elevation: '3m above sea level',
    surface: 'Smooth Coastal Asphalt',
    description: 'Runner pack separates along the firm coastal road parallel to coastal coconut plantations.',
    highlights: ['3K Timing Mat', 'Water & Electrolyte Station', 'Local School Cheer Squad'],
    image: '/images/checkpoints/PADUKARE SCHOOL GROUND.jpg',
    xPercent: 47,
    yPercent: 29,
  },
  {
    id: 'blue-wave',
    name: 'BLUE WAVE WARRIORS PADUKARE',
    distance: '5.0 KM CHECKPOINT',
    elevation: '2m above sea level',
    surface: 'Hard-packed Sand & Paved Track',
    description: 'Transition zone near Katpadi estuary connector and Hanging Bridge access trail.',
    highlights: ['5K Timing Split Mat', 'Fresh Tender Coconuts', 'First Aid Station'],
    image: '/images/checkpoints/Blue Wave Warriors Padukare.png',
    xPercent: 51,
    yPercent: 43,
  },
  {
    id: 'mattu-beach',
    name: 'MATTU BEACH',
    distance: '10.0 KM TURNAROUND',
    elevation: '1m above sea level',
    surface: 'Wet Firm Shoreline Sand',
    description: 'Famed shoreline stretch near Pangala river basin. Ocean breeze and wide open sand vistas.',
    highlights: ['10K Timing Split Mat', 'Energy Gel & Fruit Station', 'Sponge Cooling Zone'],
    image: '/images/checkpoints/mattu-beach2.jpg',
    xPercent: 57,
    yPercent: 63,
  },
  {
    id: 'yard-beach',
    name: 'YARD BEACH ULLIYARGOLI',
    distance: '13.5 KM CORRIDOR',
    elevation: '2m above sea level',
    surface: 'Dune Sand & Shoreline Path',
    description: 'Final coastal stretch before approaching Kapu granite rock formations. Intense spectator cheer zone.',
    highlights: ['13.5K Hydration Spot', 'Traditional Chende Drum Beats', 'Recovery Hydration'],
    image: '/images/hero_section/udupipages-Beach-Run4.jpg.jpeg',
    xPercent: 65,
    yPercent: 81,
  },
  {
    id: 'kapu-lighthouse',
    name: 'FINISH LINE: KAPU LIGHT HOUSE',
    distance: '15.2 KM VICTORIES (EST. 33-90 MIN)',
    elevation: '12m above sea level (Finish Arch)',
    surface: 'Granite Path & Finish Carpet',
    description: 'Historic 1901 Kapu Light House atop majestic ocean rocks marking the official finish line.',
    highlights: ['Official Finisher Medal Desk', 'Breakfast & Tender Coconut Pavilion', 'Cold Plunge Zone', 'Physio Recovery Tents'],
    image: '/images/checkpoints/KAPU LIGHT HOUSE.jpg',
    xPercent: 71,
    yPercent: 93,
  }
];

interface RouteMapPageProps {
  onBackToHome: () => void;
}

export const RouteMapPage: React.FC<RouteMapPageProps> = ({ onBackToHome }) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState<RouteWaypoint>(routeWaypoints[0]);
  const [locationPhotoModal, setLocationPhotoModal] = useState<RouteWaypoint | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleDownloadGPX = () => {
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Udupipages Beach Run 2026">
  <metadata>
    <name>Udupipages Beach Run 15.2KM Official Route</name>
    <desc>Padukere Ground to Kapu Light House Coastal Track</desc>
  </metadata>
  <trk>
    <name>15.2KM Coastal Track</name>
    <trkseg>
      <trkpt lat="13.3142" lon="74.7082"><ele>2.0</ele><name>Padukere Ground Start</name></trkpt>
      <trkpt lat="13.2921" lon="74.7180"><ele>3.0</ele><name>Padukare School Ground</name></trkpt>
      <trkpt lat="13.2750" lon="74.7250"><ele>2.0</ele><name>Blue Wave Warriors</name></trkpt>
      <trkpt lat="13.2420" lon="74.7360"><ele>1.0</ele><name>Mattu Beach</name></trkpt>
      <trkpt lat="13.2310" lon="74.7410"><ele>2.0</ele><name>Yard Beach Ulliyargoli</name></trkpt>
      <trkpt lat="13.2241" lon="74.7431"><ele>12.0</ele><name>Kapu Light House Finish</name></trkpt>
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Udupi_Beach_Run_15.2KM_Official_Route.gpx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkerClick = (wp: RouteWaypoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWaypoint(wp);
    setLocationPhotoModal(wp);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A0A0A] font-sans pb-24 pt-20">
      
      {/* Top Header & Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#00A3FF] hover:text-[#0066FF] uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME LANDING PAGE</span>
          </button>

          <div className="flex items-center space-x-3 text-xs text-slate-600 font-mono">
            <span>INTERACTIVE MAP • CLICK LOCATION TO VIEW PHOTO</span>
            <span>•</span>
            <span className="text-[#00A3FF] font-bold">TOTAL DISTANCE: 15.2 KM</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Hero Header */}
        <div className="mb-10 text-center sm:text-left space-y-3 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-50 border border-[#00A3FF]/40 rounded-full text-xs font-semibold tracking-widest text-[#00A3FF] uppercase">
            <Navigation className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span>INTERACTIVE LOCATION PHOTO EXPLORER</span>
          </div>
          <h1 className="font-thunder text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0A0A0A] uppercase tracking-wide">
            OFFICIAL <span className="text-gradient">ROUTE MAP & LOCATION</span> PHOTOS
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-3xl leading-relaxed">
            Click directly on any location pin on the map below to instantly display real photography and ground details for that exact checkpoint.
          </p>
        </div>

        {/* Course Summary Metrics Pill Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase block font-medium">TOTAL COURSE DISTANCE</span>
            <span className="font-thunder text-3xl sm:text-4xl text-[#00A3FF]">15.2 KM</span>
            <span className="text-xs text-slate-600 block">Padukere to Kapu Light House</span>
          </div>
          <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase block font-medium">ESTIMATED RUN TIME</span>
            <span className="font-thunder text-3xl sm:text-4xl text-[#0A0A0A]">33 – 90 MIN</span>
            <span className="text-xs text-slate-600 block">Based on pace & sand conditions</span>
          </div>
          <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase block font-medium">HYDRATION STATIONS</span>
            <span className="font-thunder text-3xl sm:text-4xl text-[#00A3FF]">6 SPOTS</span>
            <span className="text-xs text-slate-600 block">Every 2.5 KM along route</span>
          </div>
          <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase block font-medium">COURSE ELEVATION</span>
            <span className="font-thunder text-3xl sm:text-4xl text-[#0A0A0A]">1M – 12M</span>
            <span className="text-xs text-slate-600 block">Flattest coastal track in Karnataka</span>
          </div>
        </div>

        {/* Main Route Map Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column: Official Google Maps Route Image with Interactive Location Hotspots */}
          <div className="lg:col-span-7 bg-white border border-slate-200 shadow-md p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-[#00A3FF]" />
                <span className="text-xs font-mono font-bold text-[#0A0A0A] uppercase tracking-wider">
                  CLICK ANY LOCATION PIN TO VIEW PHOTO
                </span>
              </div>
              <button
                onClick={() => setImageModalOpen(true)}
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#00A3FF] hover:text-[#0066FF] uppercase"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>EXPAND FULL MAP</span>
              </button>
            </div>

            {/* Uploaded Google Maps Route Image Container with Pin Overlays */}
            <div className="relative w-full bg-slate-900 border border-slate-200 overflow-hidden select-none">
              <img
                src="/images/route-map-google.png"
                alt="Official Udupipages Beach Run 15.2KM Google Maps Route"
                className="w-full h-auto object-contain block"
              />

              {/* Interactive Location Pins Overlay */}
              {routeWaypoints.map((wp) => {
                const isSelected = selectedWaypoint.id === wp.id;
                return (
                  <div
                    key={wp.id}
                    style={{
                      left: `${wp.xPercent}%`,
                      top: `${wp.yPercent}%`,
                    }}
                    onClick={(e) => handleMarkerClick(wp, e)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Pulse Ring for Selected Pin */}
                      {isSelected && (
                        <div className="w-9 h-9 rounded-full bg-[#00A3FF]/40 border-2 border-[#00A3FF] flex items-center justify-center animate-ping absolute inset-0" />
                      )}

                      {/* Map Pin Icon Badge */}
                      <div
                        className={`px-2 py-1 rounded-full flex items-center space-x-1.5 shadow-xl transition-transform group-hover:scale-125 border ${
                          isSelected
                            ? 'bg-[#00A3FF] text-white border-white'
                            : 'bg-black/85 text-white border-[#00A3FF]/70 hover:bg-[#00A3FF]'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider whitespace-nowrap hidden sm:inline-block">
                          {wp.id === 'padukere' ? '0.0K' : wp.id === 'padukare-school' ? '3K' : wp.id === 'blue-wave' ? '5K' : wp.id === 'mattu-beach' ? '10K' : wp.id === 'yard-beach' ? '13.5K' : '15.2K'}
                        </span>
                      </div>

                      {/* Hover Tooltip Preview Badge */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/95 border border-[#00A3FF]/60 text-white p-2 rounded-none text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl pointer-events-none z-30 space-y-1">
                        <span className="font-bold text-[#00A3FF] block">{wp.name}</span>
                        <span className="text-gray-300 block">{wp.distance}</span>
                        <span className="text-emerald-400 font-bold block">📸 CLICK TO VIEW PHOTO</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-slate-700 text-[11px] font-mono text-white flex items-center space-x-2">
                <Info className="w-3.5 h-3.5 text-[#00A3FF]" />
                <span>TAP ANY CAMERA PIN ON MAP TO SEE PHOTO</span>
              </div>
            </div>

            {/* Action Buttons below Map */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleDownloadGPX}
                className="px-4 py-2.5 bg-slate-900 text-white hover:bg-[#00A3FF] transition-colors text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD GPX FILE FOR GARMIN / STRAVA</span>
              </button>

              <a
                href="https://maps.google.com/?q=Padukere+Ground+Udupi"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-sky-50 text-[#00A3FF] border border-[#00A3FF]/40 hover:bg-[#00A3FF] hover:text-white transition-colors text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OPEN IN GOOGLE MAPS APP</span>
              </a>
            </div>
          </div>

          {/* Right Column: Checkpoint Details & Location Photo Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-thunder text-2xl text-[#0A0A0A] uppercase tracking-wider">
                SELECT A COURSE CHECKPOINT
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Select any location below or click on the map pins to reveal the ground photography and facilities.
              </p>

              {/* Waypoint Selection Buttons */}
              <div className="space-y-2 pt-2">
                {routeWaypoints.map((wp) => {
                  const isSelected = selectedWaypoint.id === wp.id;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => {
                        setSelectedWaypoint(wp);
                        setLocationPhotoModal(wp);
                      }}
                      className={`w-full text-left p-3.5 border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#00A3FF] text-white border-[#00A3FF] shadow-xs'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-[#00A3FF]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold uppercase tracking-wide block">
                          {wp.name}
                        </span>
                        <span className={`text-[11px] font-mono block ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                          {wp.distance}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Camera className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#00A3FF]'}`} />
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Waypoint Detailed Card with Photo Display */}
            <div className="bg-white p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-[#00A3FF] uppercase font-bold tracking-widest bg-sky-50 px-2 py-0.5 border border-sky-200">
                    {selectedWaypoint.distance}
                  </span>
                  <h4 className="font-thunder text-2xl text-[#0A0A0A] mt-1">
                    {selectedWaypoint.name}
                  </h4>
                </div>
              </div>

              {/* Location Photo Display */}
              <div
                onClick={() => setLocationPhotoModal(selectedWaypoint)}
                className="relative h-48 w-full overflow-hidden bg-slate-900 cursor-pointer border border-slate-200 group"
              >
                <img
                  src={selectedWaypoint.image}
                  alt={selectedWaypoint.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                  <span className="bg-[#00A3FF] text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                    LOCATION PHOTO
                  </span>
                  <span className="bg-black/80 px-2 py-0.5 text-[10px] uppercase font-bold flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-[#00A3FF]" />
                    <span>CLICK TO ENLARGE</span>
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {selectedWaypoint.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-50 p-3 border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">SURFACE TYPE</span>
                  <span className="font-bold text-[#0A0A0A]">{selectedWaypoint.surface}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ELEVATION</span>
                  <span className="font-bold text-[#0A0A0A]">{selectedWaypoint.elevation}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  ON-SITE FACILITIES & HIGHLIGHTS:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                  {selectedWaypoint.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A3FF]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>

        {/* Safety & Hydration Logistics */}
        <div className="bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono text-[#00A3FF] uppercase font-bold tracking-widest bg-black px-3 py-1 border border-[#00A3FF]/40">
              SAFETY & HYDRATION LOGISTICS
            </span>
            <h3 className="font-thunder text-3xl sm:text-4xl text-white uppercase">
              ZERO-PLASTICS HYDRATION & MEDICAL CORRIDOR
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Medical ambulances, mobile paramedical teams on quad bikes, and eco-hydration points are spaced continuously along the 15.2KM route.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <Droplets className="w-6 h-6 text-[#00A3FF]" />
              <h4 className="font-thunder text-xl text-white">ECO HYDRATION SPOTS</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Hydration stations every 2.5KM featuring natural tender coconut water, isotonic electrolyte drinks, and compostable paper cups.
              </p>
            </div>

            <div className="space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#00A3FF]" />
              <h4 className="font-thunder text-xl text-white">MEDICAL & EMERGENCY</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                3 ACLS Ambulances stationed at Padukere, Mattu Beach, and Kapu Light House, backed by 15 mobile doctors on electric scooters.
              </p>
            </div>

            <div className="space-y-2">
              <Award className="w-6 h-6 text-[#00A3FF]" />
              <h4 className="font-thunder text-xl text-white">CHIP TIMING MATS</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                RFID electronic timing mats placed at Start (0K), 5K Checkpoint, 10K Turnaround, and Kapu Finish Line (15.2K).
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Location Photo Pop-up Modal when clicking map pins */}
      <AnimatePresence>
        {locationPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border border-slate-200 max-w-2xl w-full p-6 space-y-4 relative shadow-2xl"
            >
              <button
                onClick={() => setLocationPhotoModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-black bg-slate-100 border border-slate-300 transition-colors"
                aria-label="Close Location Photo"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="inline-block text-xs font-mono text-[#00A3FF] uppercase font-bold tracking-widest bg-sky-50 px-2.5 py-0.5 border border-sky-200">
                  {locationPhotoModal.distance}
                </span>
                <h3 className="font-thunder text-3xl text-[#0A0A0A]">
                  {locationPhotoModal.name}
                </h3>
              </div>

              {/* Large Photo Display */}
              <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-900 border border-slate-200 relative">
                <img
                  src={locationPhotoModal.image}
                  alt={locationPhotoModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#00A3FF] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 uppercase">
                  REAL LOCATION PHOTOGRAPH
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {locationPhotoModal.description}
              </p>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setLocationPhotoModal(null)}
                  className="px-6 py-2.5 bg-sunset-gradient text-white font-sans text-xs uppercase font-extrabold tracking-wider hover:opacity-95"
                >
                  CLOSE PREVIEW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Map Modal */}
      <AnimatePresence>
        {imageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="relative max-w-5xl w-full bg-black border border-slate-800 p-4 space-y-4">
              <div className="flex justify-between items-center text-white border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-[#00A3FF] uppercase tracking-wider">
                  UDUPIPAGES BEACH RUN 15.2KM OFFICIAL GOOGLE MAPS COURSE
                </span>
                <button
                  onClick={() => setImageModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-black">
                <img
                  src="/images/route-map-google.png"
                  alt="Official Udupipages Beach Run 15.2KM Google Maps Route Fullscreen"
                  className="max-h-[80vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
