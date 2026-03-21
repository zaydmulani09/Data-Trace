import { useEffect, useRef, useState, ChangeEvent } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, DataCenter } from '../store';
import { Search, X, Info, Droplets, Zap, Building2, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<DataCenter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DataCenter[]>([]);
  const [colorMode, setColorMode] = useState<'stress' | 'pue' | 'company' | 'carbon'>('stress');

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [37.8, -96],
      zoom: 4,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
    }).addTo(mapRef.current);

    renderMarkers();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    renderMarkers();
  }, [colorMode]);

  const renderMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    Store.datacenters.forEach((dc) => {
      const color = getMarkerColor(dc);
      const size = Math.max(8, Math.min(24, dc.daily_water_gallons / 100000));

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative group">
            <div class="absolute inset-0 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
            <div class="w-full h-full rounded-full border border-white/20" style="background-color: ${color}; width: ${size}px; height: ${size}px;"></div>
          </div>
        `,
        iconSize: [size, size],
      });

      const marker = L.marker([dc.lat, dc.lon], { icon }).addTo(mapRef.current!);
      marker.on('click', () => setSelectedFacility(dc));
    });
  };

  const getMarkerColor = (dc: DataCenter) => {
    if (colorMode === 'stress') {
      if (dc.water_stress_score < 1.5) return '#22c97a';
      if (dc.water_stress_score < 3) return '#e08a00';
      return '#e03535';
    }
    if (colorMode === 'pue') {
      if (dc.pue < 1.15) return '#22c97a';
      if (dc.pue < 1.3) return '#e08a00';
      return '#e03535';
    }
    if (colorMode === 'carbon') {
      if (!dc.carbon_intensity_local) return '#4a4a46';
      if (dc.carbon_intensity_local < 200) return '#22c97a';
      if (dc.carbon_intensity_local < 400) return '#e08a00';
      return '#e03535';
    }
    return Store.getCompany(dc.company_id)?.color || '#00c2a8';
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = Store.datacenters.filter(dc => 
      dc.name.toLowerCase().includes(q.toLowerCase()) ||
      dc.city.toLowerCase().includes(q.toLowerCase()) ||
      dc.company_id.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);
    setSearchResults(results);
  };

  const flyTo = (dc: DataCenter) => {
    mapRef.current?.flyTo([dc.lat, dc.lon], 10, { duration: 1.5 });
    setSelectedFacility(dc);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col relative">
      {/* Search Bar */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-4">
        <div className="relative">
          <div className="bg-bg-2 border border-border-1 rounded-[4px] flex items-center px-4 h-12 shadow-2xl">
            <Search className="w-4 h-4 text-text-3 mr-3" />
            <input
              type="text"
              placeholder="Search data centers, companies, or cities..."
              className="bg-transparent border-none outline-none flex-1 mono text-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && <X className="w-4 h-4 text-text-3 cursor-pointer" onClick={() => setSearchQuery('')} />}
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-3 border border-border-2 rounded-[4px] overflow-hidden shadow-2xl max-h-[60vh] overflow-y-auto">
              {searchResults.map(dc => (
                <div 
                  key={dc.id}
                  onClick={() => flyTo(dc)}
                  className="p-4 hover:bg-bg-4 cursor-pointer flex justify-between items-center border-b border-border-1 last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium">{dc.name}</div>
                    <div className="text-xs text-text-2">{Store.getCompany(dc.company_id)?.name} · {dc.city}, {dc.state}</div>
                  </div>
                  <div className={`text-[10px] mono px-2 py-0.5 rounded-full ${dc.water_stress_score > 3 ? 'bg-danger-2 text-danger' : 'bg-safe-2 text-safe'}`}>
                    Stress: {dc.water_stress_score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 md:top-24 right-4 md:right-6 z-[1000] flex flex-col gap-2">
        {[
          { id: 'stress', label: 'Water Stress', icon: Droplets },
          { id: 'pue', label: 'PUE Rating', icon: Zap },
          { id: 'carbon', label: 'Carbon Intensity', icon: Cloud },
          { id: 'company', label: 'By Company', icon: Building2 },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setColorMode(mode.id as any)}
            className={`flex items-center gap-3 px-3 md:px-4 py-2 rounded-[4px] border text-[10px] md:text-xs mono transition-all ${
              colorMode === mode.id 
                ? 'bg-accent text-bg-0 border-accent' 
                : 'bg-bg-2 text-text-2 border-border-1 hover:border-border-2'
            }`}
          >
            <mode.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>

      <div ref={mapContainerRef} className="flex-1" />

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedFacility && (
          <motion.div
            initial={{ x: window.innerWidth < 768 ? 0 : '100%', y: window.innerWidth < 768 ? '100%' : 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: window.innerWidth < 768 ? 0 : '100%', y: window.innerWidth < 768 ? '100%' : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 md:top-0 right-0 w-full md:max-w-md h-[70vh] md:h-full bg-bg-1 border-t md:border-t-0 md:border-l border-border-2 z-[1001] p-6 md:p-8 overflow-y-auto shadow-2xl"
          >
            <button 
              onClick={() => setSelectedFacility(null)}
              className="absolute top-4 md:top-6 right-4 md:right-6 p-2 hover:bg-bg-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <div className="mono text-xs text-accent uppercase tracking-widest mb-2">
                {Store.getCompany(selectedFacility.company_id)?.name}
              </div>
              <h2 className="text-3xl mb-1">{selectedFacility.name}</h2>
              <div className="text-text-2 text-sm">{selectedFacility.city}, {selectedFacility.state}, {selectedFacility.country}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="card p-4">
                <div className="text-[10px] mono text-text-3 uppercase mb-1">Daily Water</div>
                <div className="mono text-xl">{(selectedFacility.daily_water_gallons / 1000).toFixed(0)}K <span className="text-xs text-text-3">gal</span></div>
              </div>
              <div className="card p-4">
                <div className="text-[10px] mono text-text-3 uppercase mb-1">Annual Power</div>
                <div className="mono text-xl">{(selectedFacility.annual_mwh / 1000).toFixed(0)}K <span className="text-xs text-text-3">MWh</span></div>
              </div>
              <div className="card p-4">
                <div className="text-[10px] mono text-text-3 uppercase mb-1">PUE Rating</div>
                <div className="mono text-xl">{selectedFacility.pue.toFixed(2)}</div>
              </div>
              <div className="card p-4">
                <div className="text-[10px] mono text-text-3 uppercase mb-1">Water Stress</div>
                <div className={`mono text-xl ${selectedFacility.water_stress_score > 3 ? 'text-danger' : 'text-safe'}`}>
                  {selectedFacility.water_stress_score.toFixed(1)}<span className="text-xs text-text-3">/5.0</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mono text-xs text-text-3 uppercase mb-4 flex items-center gap-2">
                <Info className="w-3 h-3" /> Disclosure Status
              </h4>
              <div className={`p-4 rounded-[4px] border ${selectedFacility.disclosed ? 'bg-safe-2 border-safe/20 text-safe' : 'bg-warn-2 border-warn/20 text-warn'}`}>
                <div className="font-semibold text-sm mb-1">{selectedFacility.disclosed ? 'Publicly Disclosed' : 'Estimated Data'}</div>
                <p className="text-xs opacity-80 leading-relaxed">{selectedFacility.disclosure_note || 'This facility does not publicly report per-site water consumption. Figures are modeled based on regional baselines and facility square footage.'}</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mono text-xs text-text-3 uppercase mb-4">Facility Specs</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-border-1 pb-2">
                  <span className="text-text-2">Cooling Type</span>
                  <span className="mono capitalize">{selectedFacility.cooling_type}</span>
                </li>
                <li className="flex justify-between border-b border-border-1 pb-2">
                  <span className="text-text-2">Water Source</span>
                  <span className="mono">{selectedFacility.water_source || 'Unknown'}</span>
                </li>
                <li className="flex justify-between border-b border-border-1 pb-2">
                  <span className="text-text-2">Local Grid</span>
                  <span className="mono">{selectedFacility.grid_name || 'Unknown'}</span>
                </li>
                <li className="flex justify-between border-b border-border-1 pb-2">
                  <span className="text-text-2">Carbon Intensity</span>
                  <span className="mono">{selectedFacility.carbon_intensity_local || 'N/A'} <span className="text-[10px] text-text-3">gCO₂/kWh</span></span>
                </li>
                <li className="flex justify-between border-b border-border-1 pb-2">
                  <span className="text-text-2">Renewable Energy</span>
                  <span className="mono">{selectedFacility.renewable_pct}%</span>
                </li>
                <li className="flex justify-between border-b border-border-1 pb-2">
                  <span className="text-text-2">Estimated Servers</span>
                  <span className="mono">{selectedFacility.servers_estimated.toLocaleString()}</span>
                </li>
                <li className="flex justify-between border-b border-border-1 pb-2">
                  <span className="text-text-2">Operational Since</span>
                  <span className="mono">{selectedFacility.operational_since}</span>
                </li>
              </ul>
            </div>

            {selectedFacility.certifications && selectedFacility.certifications.length > 0 && (
              <div className="mb-8">
                <h4 className="mono text-xs text-text-3 uppercase mb-4">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFacility.certifications.map((cert, i) => (
                    <span key={i} className="bg-bg-3 px-2 py-1 rounded-[2px] text-[10px] mono text-text-3 border border-border-1">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
