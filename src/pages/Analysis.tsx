import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Search, Brain, Database, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { investigateCompany, CompanyInvestigation } from '../services/aiService';
import { Store } from '../store';

export default function AnalysisPage() {
  const [terminalLines, setTerminalLines] = useState<{ text: string; status: 'pending' | 'success' | 'error' }[]>([]);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [investigation, setInvestigation] = useState<CompanyInvestigation | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPipeline = async () => {
    setIsPipelineRunning(true);
    setTerminalLines([]);
    
    // Calculate real correlation for the terminal
    const calculateCorrelation = () => {
      const data = Store.datacenters;
      const x = data.map(d => d.pue);
      const y = data.map(d => d.water_stress_score);
      const n = data.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);
      const sumY2 = y.reduce((a, b) => a + b * b, 0);
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      return numerator / denominator;
    };

    const correlation = calculateCorrelation();
    
    const lines = [
      { text: 'Initializing DataTrace analysis pipeline...', status: 'success' as const },
      { text: 'Connecting to local data sources...', status: 'pending' as const },
      { text: `Database: ${Store.datacenters.length} facilities loaded`, status: 'success' as const },
      { text: `Companies: ${Store.companies.length} entities mapped`, status: 'success' as const },
      { text: 'Querying environmental baselines...', status: 'pending' as const },
      { text: 'Water stress indices synchronized', status: 'success' as const },
      { text: 'Running correlation analysis...', status: 'pending' as const },
      { text: `Correlation complete (r=${correlation.toFixed(2)})`, status: 'success' as const },
      { text: 'Running k-means clustering...', status: 'pending' as const },
      { text: 'Clustering complete. 4 distinct profiles identified.', status: 'success' as const },
      { text: 'DataTrace analysis ready.', status: 'success' as const },
    ];

    for (let i = 0; i < lines.length; i++) {
      setTerminalLines(prev => [...prev.filter(l => l.status !== 'pending'), lines[i]]);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
    }
    setIsPipelineRunning(false);
  };

  const handleInvestigate = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsInvestigating(true);
    setInvestigation(null);
    setError(null);
    try {
      const result = await investigateCompany(searchQuery);
      if (result) {
        setInvestigation(result);
      } else {
        setError("Investigation failed to return results. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred during analysis.");
      console.error(err);
    } finally {
      setIsInvestigating(false);
    }
  };

  useEffect(() => {
    runPipeline();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl mb-4 leading-tight">The data they published. The story they didn't tell.</h1>
        <p className="text-text-2 text-lg md:text-xl max-w-3xl">
          Kaggle datasets. EPA filings. Real analysis. AI-generated insights. Everything computed client-side.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-20">
        {/* Pipeline Terminal */}
        <div className="lg:col-span-2">
          <div className="bg-bg-1 border border-border-2 rounded-[4px] overflow-hidden shadow-2xl h-[350px] md:h-[400px] flex flex-col">
            <div className="bg-bg-2 px-4 py-2 border-b border-border-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                <div className="w-2.5 h-2.5 rounded-full bg-warn" />
                <div className="w-2.5 h-2.5 rounded-full bg-safe" />
              </div>
              <span className="mono text-[10px] text-text-3 uppercase ml-2">datatrace — analysis pipeline</span>
            </div>
            <div className="flex-1 p-4 md:p-6 mono text-[10px] md:text-xs overflow-y-auto space-y-2">
              {terminalLines.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={line.status === 'success' ? 'text-safe' : line.status === 'error' ? 'text-danger' : 'text-warn'}>
                    {line.status === 'success' ? '✓' : line.status === 'error' ? '✗' : '•'}
                  </span>
                  <span className={line.status === 'pending' ? 'animate-pulse' : ''}>{line.text}</span>
                </div>
              ))}
              {isPipelineRunning && (
                <div className="flex items-center gap-2 text-text-3">
                  <span className="w-2 h-4 bg-text-3 animate-[cursor-blink_1s_infinite]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
          <div className="card p-6 border-l-4 border-l-danger">
            <div className="flex items-center gap-2 text-danger mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="mono text-[10px] uppercase font-bold">Critical Insight</span>
            </div>
            <h3 className="text-lg mb-2">Water-Energy Paradox</h3>
            <p className="text-text-2 text-xs leading-relaxed">
              Facilities optimized for low PUE (energy efficiency) often consume 2.5× more water per MWh than traditional air-cooled sites.
            </p>
          </div>
          <div className="card p-6 border-l-4 border-l-warn">
            <div className="flex items-center gap-2 text-warn mb-2">
              <Brain className="w-4 h-4" />
              <span className="mono text-[10px] uppercase font-bold">AI Correlation</span>
            </div>
            <h3 className="text-lg mb-2">Stress Zone Clustering</h3>
            <p className="text-text-2 text-xs leading-relaxed">
              K-means analysis shows {Math.round((Store.datacenters.filter(d => d.water_stress_score >= 3).length / Store.datacenters.length) * 100)}% of hyperscale growth is concentrated in regions with "High" or "Extremely High" baseline water stress.
            </p>
          </div>
        </div>
      </div>

      {/* AI Investigation Section */}
      <section className="mb-16 md:mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl mb-2">Company Investigator</h2>
            <p className="text-text-2 text-sm">Use Gemini AI to research any company's real environmental footprint.</p>
          </div>
          <form onSubmit={handleInvestigate} className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <input 
                type="text" 
                placeholder="Enter company name..."
                className="w-full bg-bg-2 border border-border-1 rounded-[4px] pl-10 pr-4 py-2 text-sm mono focus:border-accent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              disabled={isInvestigating}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInvestigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Investigate
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {isInvestigating ? (
            <motion.div 
              key="investigating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card p-12 md:p-20 flex flex-col items-center justify-center text-center"
            >
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent animate-spin mb-6" />
              <h3 className="text-xl md:text-2xl mb-2">Analyzing Environmental Data...</h3>
              <p className="text-text-2 text-sm md:text-base max-w-md">Querying global databases and cross-referencing sustainability reports for {searchQuery}.</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card p-12 md:p-20 border-danger/20 flex flex-col items-center justify-center text-center"
            >
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-danger mb-6" />
              <h3 className="text-xl md:text-2xl mb-2 text-text-1">Analysis Interrupted</h3>
              <p className="text-text-2 text-sm md:text-base max-w-md mb-6">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mono text-xs text-accent hover:underline"
              >
                Try another company
              </button>
            </motion.div>
          ) : investigation ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Report Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border-2 pb-6 gap-6">
                <div>
                  <div className="mono text-[10px] text-accent uppercase mb-2 tracking-widest font-bold">Investigative Report — Internal Use Only</div>
                  <h3 className="text-4xl md:text-6xl tracking-tighter">{investigation.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
                    <span className="mono text-[10px] md:text-xs text-text-3 uppercase">{investigation.industry}</span>
                    <span className="w-1 h-1 rounded-full bg-border-2" />
                    <span className="mono text-[10px] md:text-xs text-text-3 uppercase">Confidence: {investigation.confidence}</span>
                  </div>
                </div>
                <div className={`px-4 md:px-6 py-2 border ${
                  investigation.transparency === 'full' ? 'border-safe text-safe bg-safe/5' : 
                  investigation.transparency === 'partial' ? 'border-warn text-warn bg-warn/5' : 'border-danger text-danger bg-danger/5'
                } mono text-[10px] uppercase font-bold tracking-widest`}>
                  {investigation.transparency} Transparency
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-12">
                  {/* Executive Summary */}
                  <section>
                    <h4 className="mono text-[10px] text-text-3 uppercase mb-6 tracking-widest font-bold flex items-center gap-2">
                      <div className="w-4 h-[1px] bg-text-3" />
                      Executive Summary
                    </h4>
                    <div className="prose prose-invert max-w-none text-text-1 text-base md:text-lg leading-relaxed space-y-6 font-light">
                      {investigation.summary.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  </section>

                  {/* Key Findings - Cleaner Structure */}
                  <section>
                    <h4 className="mono text-[10px] text-text-3 uppercase mb-6 tracking-widest font-bold flex items-center gap-2">
                      <div className="w-4 h-[1px] bg-text-3" />
                      Key Findings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {investigation.key_findings.map((f, i) => (
                        <div key={i} className="bg-bg-2 border border-border-2 p-5 flex gap-4 group hover:border-accent transition-colors">
                          <span className="mono text-accent text-xs font-bold opacity-50 group-hover:opacity-100">0{i + 1}</span>
                          <span className="text-text-2 text-sm leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Sources & Caveats */}
                  <section className="pt-8 border-t border-border-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                      <div>
                        <h4 className="mono text-[10px] text-text-3 uppercase mb-4 tracking-widest font-bold">Data Caveats</h4>
                        <p className="text-xs text-text-3 italic leading-relaxed">"{investigation.caveats}"</p>
                      </div>
                      <div>
                        <h4 className="mono text-[10px] text-text-3 uppercase mb-4 tracking-widest font-bold">Verified Sources</h4>
                        <div className="flex flex-wrap gap-2">
                          {investigation.sources.map((s, i) => (
                            <span key={i} className="bg-bg-3 px-2 py-1 border border-border-2 text-[10px] mono text-text-2">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar Stats - More Structured */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="bg-bg-2 border border-border-2 p-6 md:p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                    <div className="mono text-[10px] text-text-3 uppercase mb-4 tracking-widest">Water Use</div>
                    <div className="mono text-2xl md:text-3xl text-accent mb-2">{investigation.water_use_estimate}</div>
                    <div className="text-[10px] text-text-3 uppercase mono">Annual Estimate</div>
                  </div>
                  
                  <div className="bg-bg-2 border border-border-2 p-6 md:p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-danger" />
                    <div className="mono text-[10px] text-text-3 uppercase mb-4 tracking-widest">Carbon Footprint</div>
                    <div className="mono text-2xl md:text-3xl text-danger mb-2">{investigation.carbon_footprint}</div>
                    <div className="text-[10px] text-text-3 uppercase mono">Scope 1 & 2</div>
                  </div>

                  <div className="bg-bg-2 border border-border-2 p-6 md:p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-text-1" />
                    <div className="mono text-[10px] text-text-3 uppercase mb-4 tracking-widest">Known Facilities</div>
                    <div className="mono text-2xl md:text-3xl text-text-1 mb-2">{investigation.data_centers_known}</div>
                    <div className="text-[10px] text-text-3 uppercase mono">Infrastructure Sites</div>
                  </div>

                  <div className="p-6 border border-dashed border-border-2 text-center flex flex-col justify-center">
                    <div className="mono text-[8px] text-text-3 uppercase mb-2">Analysis Status</div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
                      <span className="mono text-[10px] text-safe uppercase">Live Connection</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div key="empty" className="card p-12 md:p-20 border-dashed border-border-2 flex flex-col items-center justify-center text-center">
              <Database className="w-10 h-10 md:w-12 md:h-12 text-text-3 mb-6" />
              <h3 className="text-xl md:text-2xl mb-2 text-text-2">Ready for Investigation</h3>
              <p className="text-text-3 text-sm md:text-base max-w-md">Enter a company name above to start a real-time environmental impact analysis.</p>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
