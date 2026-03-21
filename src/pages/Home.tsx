import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useDailyTicker } from '../hooks/useAnimations';
import { useEffect, useRef } from 'react';
import { Store } from '../store';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalAnnualMwh = Store.companies.reduce((acc, co) => acc + (co.annual_mwh || 0), 0);
  const totalDailyMwh = totalAnnualMwh / 365;
  const totalDailyGallons = Store.datacenters.reduce((acc, dc) => acc + (dc.daily_water_gallons || 0), 0);
  const totalDailyCo2 = totalDailyMwh * 0.4; // Rough estimate: 0.4 tons CO2 per MWh

  const gallons = useDailyTicker(totalDailyGallons);
  const mwh = useDailyTicker(totalDailyMwh);
  const co2 = useDailyTicker(totalDailyCo2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; dx: number; dy: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 194, 168, 0.15)';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />
      
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl max-w-5xl leading-[0.9] mb-8"
        >
          Every search. Every stream. Every server. They're all drinking the planet dry.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-text-2 text-lg md:text-xl max-w-2xl mb-12"
        >
          DataTrace maps the real environmental cost of the infrastructure you use every day.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12">
          <div className="flex flex-col items-center">
            <span className="mono text-accent text-3xl mb-2">{gallons}</span>
            <span className="mono text-[10px] text-text-3 uppercase tracking-widest">Gallons consumed today</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="mono text-warn text-3xl mb-2">{mwh}</span>
            <span className="mono text-[10px] text-text-3 uppercase tracking-widest">MWh consumed today</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="mono text-danger text-3xl mb-2">{co2}</span>
            <span className="mono text-[10px] text-text-3 uppercase tracking-widest">Tons CO₂ today</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link to="/map" className="btn-primary">Explore the Map</Link>
          <Link to="/analysis" className="px-6 py-2 border border-border-2 rounded-[3px] hover:bg-bg-2 transition-colors">View Analysis</Link>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-bg-1 border-y border-border-1 py-3 overflow-hidden whitespace-nowrap relative">
        <div className="flex animate-ticker-left">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-12 px-6 items-center mono text-[11px] text-text-3 uppercase">
              <span>{Store.companies[0].name} {Store.getFacilitiesByCompany(Store.companies[0].id)[0].city}: {(Store.getFacilitiesByCompany(Store.companies[0].id)[0].daily_water_gallons / 1000).toFixed(0)}K gal/day</span>
              <span className="w-1 h-1 rounded-full bg-border-3" />
              <span>{Store.companies[1].name}: {Store.companies[1].transparency} disclosure</span>
              <span className="w-1 h-1 rounded-full bg-border-3" />
              <span>US data centers: {(totalAnnualMwh / 1000000).toFixed(1)}TWh/year</span>
              <span className="w-1 h-1 rounded-full bg-border-3" />
              <span>{Math.round((Store.datacenters.filter(dc => dc.water_stress_score >= 3).length / Store.datacenters.length) * 100)}% in water-stressed zones</span>
              <span className="w-1 h-1 rounded-full bg-border-3" />
              <span>Average PUE: {(Store.companies.reduce((acc, co) => acc + co.pue_avg, 0) / Store.companies.length).toFixed(2)}</span>
              <span className="w-1 h-1 rounded-full bg-border-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { val: `${(totalDailyGallons * 365 / 1000000000).toFixed(0)}B`, label: 'Gallons', desc: 'Estimated annual data center water use' },
          { val: (Store.companies.reduce((acc, co) => acc + co.pue_avg, 0) / Store.companies.length).toFixed(2), label: 'PUE', desc: 'Average Power Usage Effectiveness' },
          { val: `${Math.round((Store.datacenters.filter(dc => dc.water_stress_score >= 3).length / Store.datacenters.length) * 100)}%`, label: 'Stress', desc: 'Facilities in high water-stress zones' },
          { val: `${(totalAnnualMwh / 1000000).toFixed(0)}T`, label: 'TWh', desc: 'Annual global power consumption' },
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-8"
          >
            <div className="mono text-text-3 text-xs uppercase mb-2">{s.label}</div>
            <div className="mono text-4xl mb-4">{s.val}</div>
            <p className="text-text-2 text-sm">{s.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Findings */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-4xl mb-12">Critical Findings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { stat: '355M gal', title: "A city's water supply. Revealed by lawsuit.", desc: "Google's The Dalles facility used far more than reported until public records were unsealed in 2022." },
            { stat: '$0', title: "Amazon's water disclosure penalty.", desc: "While publishing 90-page reports, per-facility water use remains a closely guarded secret." },
            { stat: '2.2×', title: "The stress multiplier.", desc: "Using water in Phoenix is not the same as using it in Oregon. We weight for regional scarcity." },
            { stat: '2030', title: "The year everyone promises to fix this.", desc: "Four of the five largest cloud providers have made water-positive pledges. None are yet verifiable." },
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-8 flex gap-8 items-start"
            >
              <div className="mono text-accent text-2xl whitespace-nowrap">{f.stat}</div>
              <div>
                <h3 className="text-xl mb-2">{f.title}</h3>
                <p className="text-text-2 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
