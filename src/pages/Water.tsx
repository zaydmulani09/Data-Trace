import { motion } from 'motion/react';
import { Store } from '../store';
import { useDailyTicker, useCountUp } from '../hooks/useAnimations';
import { Droplets, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';

export default function WaterPage() {
  const totalDailyGallons = Store.datacenters.reduce((acc, dc) => acc + (dc.daily_water_gallons || 0), 0);
  const totalAnnualGallons = totalDailyGallons * 365;
  const avgStress = Math.round((Store.datacenters.filter(dc => dc.water_stress_score >= 3).length / Store.datacenters.length) * 100);
  const gallonsPerSecond = (totalDailyGallons / 86400).toFixed(1);

  const liveGallons = useDailyTicker(totalDailyGallons);
  const pools = useCountUp(Math.round(totalDailyGallons / 660000), 2500);
  const stressPct = useCountUp(avgStress, 2000, '%');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl mb-4 leading-tight">How much water did data centers drink today?</h1>
        <p className="text-text-2 text-lg md:text-xl max-w-3xl mb-8">
          Real consumption estimates. Regional stress scores. The numbers they'd rather you not see.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2 sm:gap-4">
          <span className="mono text-accent text-5xl md:text-6xl">{liveGallons}</span>
          <span className="mono text-text-3 text-xs uppercase tracking-widest">Gallons used today</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
        <div className="card p-6 md:p-8">
          <Droplets className="w-6 h-6 text-accent mb-4" />
          <div className="mono text-2xl md:text-3xl mb-2">{pools}</div>
          <p className="text-text-2 text-sm">Olympic pools filled today (1 pool = 660K gal)</p>
        </div>
        <div className="card p-6 md:p-8">
          <AlertTriangle className="w-6 h-6 text-warn mb-4" />
          <div className="mono text-2xl md:text-3xl mb-2">{stressPct}</div>
          <p className="text-text-2 text-sm">Facilities in high water-stress zones</p>
        </div>
        <div className="card p-6 md:p-8">
          <BarChart3 className="w-6 h-6 text-safe mb-4" />
          <div className="mono text-2xl md:text-3xl mb-2">{gallonsPerSecond}</div>
          <p className="text-text-2 text-sm">Gallons per second (current aggregate rate)</p>
        </div>
      </div>

      <section className="mb-16 md:mb-24">
        <h2 className="text-2xl md:text-3xl mb-8">Company Transparency Leaderboard</h2>
        <div className="space-y-6">
          {Store.companies.sort((a, b) => b.hydroscore - a.hydroscore).map((co, i) => (
            <motion.div 
              key={co.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: co.color }} />
                  <span className="mono text-sm">{co.name}</span>
                  <span className={`text-[10px] mono px-2 py-0.5 rounded-full uppercase ${
                    co.transparency === 'full' ? 'bg-safe-2 text-safe' : 
                    co.transparency === 'partial' ? 'bg-warn-2 text-warn' : 'bg-danger-2 text-danger'
                  }`}>
                    {co.transparency} Disclosure
                  </span>
                </div>
                <div className="mono text-[10px] md:text-xs text-text-2">
                  {co.disclosed_annual_gallons > 0 
                    ? `${(co.disclosed_annual_gallons / 1000000000).toFixed(1)}B gal/yr`
                    : 'No per-site disclosure'}
                </div>
              </div>
              <div className="h-4 bg-bg-3 rounded-full overflow-hidden border border-border-1">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${co.hydroscore}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full"
                  style={{ backgroundColor: co.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 mb-16 md:mb-24">
        <div>
          <h2 className="text-2xl md:text-3xl mb-8">Water Equivalency</h2>
          <div className="space-y-4">
            {[
              { label: 'Daily Drinking Water', val: `${(totalDailyGallons / 0.5 / 1000000).toFixed(1)}M people`, desc: 'Based on 0.5 gal/person/day' },
              { label: 'Corn Irrigation', val: `${(totalDailyGallons / 25000).toFixed(0)} Acres`, desc: 'Normalized daily irrigation equivalent' },
              { label: 'City Equivalent', val: `${(totalDailyGallons / 150000000).toFixed(1)}× Phoenix`, desc: 'Compared to Phoenix daily municipal use' },
            ].map((eq, i) => (
              <div key={i} className="card p-5 md:p-6 flex justify-between items-center gap-4">
                <div>
                  <div className="mono text-[10px] text-text-3 uppercase mb-1">{eq.label}</div>
                  <div className="text-text-2 text-xs md:text-sm">{eq.desc}</div>
                </div>
                <div className="mono text-lg md:text-xl text-accent whitespace-nowrap">{eq.val}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-6 md:p-8 flex flex-col justify-center">
          <h3 className="text-xl md:text-2xl mb-6">Cooling Methodology</h3>
          <p className="text-text-2 text-sm md:text-base leading-relaxed mb-6">
            Data centers primarily use water for evaporative cooling. While more energy-efficient than air cooling, it consumes massive amounts of local water.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-safe" />
              <span className="text-sm">Evaporative (High Water)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="text-sm">Air Cooled (High Power)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-warn" />
              <span className="text-sm">Liquid (High Density)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-text-3" />
              <span className="text-sm">Hybrid Systems</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
