import { motion } from 'motion/react';
import { Store } from '../store';
import { useDailyTicker, useCountUp } from '../hooks/useAnimations';
import { Zap, Cloud, Leaf, Thermometer } from 'lucide-react';
import { useState } from 'react';

export default function ElectricityPage() {
  const totalAnnualMwh = Store.companies.reduce((acc, co) => acc + (co.annual_mwh || 0), 0);
  const totalDailyMwh = totalAnnualMwh / 365;
  const totalTwh = (totalAnnualMwh / 1000000).toFixed(1);
  const avgPue = (Store.companies.reduce((acc, co) => acc + (co.pue_avg || 0), 0) / Store.companies.length).toFixed(2);
  const avgRenewable = Math.round(Store.companies.reduce((acc, co) => acc + (co.renewable_actual_pct || 0), 0) / Store.companies.length);

  const liveMwh = useDailyTicker(totalDailyMwh);
  const liveCo2 = useDailyTicker(totalDailyMwh * 0.4); // Rough estimate: 0.4 tons CO2 per MWh
  const pueAvgCount = useCountUp(parseFloat(avgPue), 2000);
  const renewablePct = useCountUp(avgRenewable, 2000, '%');

  const [pueSlider, setPueSlider] = useState(parseFloat(avgPue));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl mb-4 leading-tight">The cloud runs on coal. Here's exactly how much.</h1>
        <p className="text-text-2 text-lg md:text-xl max-w-3xl mb-8">
          Power draw, PUE ratings, carbon intensity, and the renewable energy claims that don't hold up.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-8 md:gap-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2 sm:gap-4">
            <span className="mono text-warn text-5xl md:text-6xl">{liveMwh}</span>
            <span className="mono text-text-3 text-xs uppercase tracking-widest">MWh consumed today</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2 sm:gap-4">
            <span className="mono text-danger text-5xl md:text-6xl">{liveCo2}</span>
            <span className="mono text-text-3 text-xs uppercase tracking-widest">Tons CO₂ today</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-20">
        <div className="card p-6 md:p-8">
          <Zap className="w-6 h-6 text-warn mb-4" />
          <div className="mono text-2xl md:text-3xl mb-2">{pueAvgCount}</div>
          <p className="text-text-2 text-sm">Average Power Usage Effectiveness (PUE)</p>
        </div>
        <div className="card p-6 md:p-8">
          <Cloud className="w-6 h-6 text-text-3 mb-4" />
          <div className="mono text-2xl md:text-3xl mb-2">{totalTwh}T</div>
          <p className="text-text-2 text-sm">Annual aggregate power consumption (TWh)</p>
        </div>
        <div className="card p-6 md:p-8">
          <Leaf className="w-6 h-6 text-safe mb-4" />
          <div className="mono text-2xl md:text-3xl mb-2">{renewablePct}</div>
          <p className="text-text-2 text-sm">Facilities with verified renewable contracts</p>
        </div>
        <div className="card p-6 md:p-8">
          <Thermometer className="w-6 h-6 text-danger mb-4" />
          <div className="mono text-2xl md:text-3xl mb-2">32%</div>
          <p className="text-text-2 text-sm">Estimated waste heat captured globally</p>
        </div>
      </div>

      {/* PUE Explainer */}
      <section className="mb-16 md:mb-24 card p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">PUE Interactive Explainer</h2>
            <p className="text-text-2 text-sm md:text-base leading-relaxed mb-8">
              Power Usage Effectiveness (PUE) is the ratio of total power entering a data center to the power used by IT equipment. A PUE of 1.0 is perfect efficiency.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between mono text-[10px] uppercase text-text-3">
                <span>Efficiency Level</span>
                <span>PUE: {pueSlider.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="3.0" 
                step="0.01" 
                value={pueSlider}
                onChange={(e) => setPueSlider(parseFloat(e.target.value))}
                className="w-full accent-accent bg-bg-4 h-2 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-xs md:text-sm text-text-2 italic">
                "At PUE {pueSlider.toFixed(2)}, for every 1W powering servers, {(pueSlider - 1).toFixed(2)}W is wasted on cooling and overhead."
              </p>
            </div>
          </div>
          <div className="relative aspect-square bg-bg-3 border border-border-1 rounded-[4px] flex items-center justify-center p-8 md:p-12">
            {/* Outer: Total Power */}
            <div className="w-full h-full border-2 border-dashed border-border-3 rounded-[4px] flex items-center justify-center relative">
              <span className="absolute top-4 left-4 mono text-[8px] md:text-[10px] text-text-3 uppercase">Total Power Input</span>
              {/* Inner: IT Power */}
              <motion.div 
                animate={{ scale: 1 / pueSlider }}
                className="bg-accent/20 border border-accent rounded-[4px] w-full h-full flex items-center justify-center relative"
              >
                <span className="mono text-accent text-xs md:text-sm font-bold">IT COMPUTE</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16 md:mb-24">
        <h2 className="text-2xl md:text-3xl mb-8">Renewable Claims vs. Reality</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {Store.companies
            .filter(co => co.renewable_claimed_pct > 0)
            .sort((a, b) => (b.renewable_claimed_pct - b.renewable_actual_pct) - (a.renewable_claimed_pct - a.renewable_actual_pct))
            .map((co, i) => (
            <div key={co.id} className="card p-5 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="mono text-sm">{co.name}</span>
                <span className="text-[10px] text-text-3">Gap: {co.renewable_claimed_pct - co.renewable_actual_pct}pts</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] mono text-text-3 uppercase mb-1">
                    <span>Claimed Renewable</span>
                    <span>{co.renewable_claimed_pct}%</span>
                  </div>
                  <div className="h-2 bg-bg-4 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${co.renewable_claimed_pct}%` }}
                      viewport={{ once: true }}
                      className="h-full bg-safe"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mono text-text-3 uppercase mb-1">
                    <span>Actual Grid Mix</span>
                    <span>{co.renewable_actual_pct}%</span>
                  </div>
                  <div className="h-2 bg-bg-4 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${co.renewable_actual_pct}%` }}
                      viewport={{ once: true }}
                      className="h-full bg-warn"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
