import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Zap, Droplets, Trash2, ShieldAlert, Brain } from 'lucide-react';
import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function ActionsPage() {
  const [userContext, setUserContext] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAdvice = async () => {
    if (!userContext) return;
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this user context: "${userContext}", provide 3-5 highly specific, technical, and actionable steps to reduce their digital environmental footprint. Focus on data center impact, water waste, and carbon. Use a direct, investigative tone.`,
        config: {
          systemInstruction: "You are an environmental impact consultant. Provide concise, high-impact advice for reducing digital waste.",
        },
      });
      setAiAdvice(response.text || "Unable to generate advice at this time.");
    } catch (error) {
      console.error("AI Advice generation failed:", error);
      setAiAdvice("Error generating advice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const categories = [
    {
      title: "Digital Hygiene",
      icon: Trash2,
      color: "text-accent",
      actions: [
        "Purge 'Zombie' Data: Delete old cloud backups and unused email threads. Every GB stored consumes ~0.015 kWh/year.",
        "Unsubscribe from Noise: Automated marketing emails account for massive aggregate server load. Use tools to bulk-unsubscribe.",
        "Optimize Streaming: Lowering resolution from 4K to 1080p reduces data transfer and server processing energy by up to 75%."
      ]
    },
    {
      title: "Infrastructure Choice",
      icon: Zap,
      color: "text-warn",
      actions: [
        "Audit Your Hosting: If you run a site, move to providers with verified PUE < 1.2 and 24/7 carbon-free energy matching.",
        "Edge Computing: Use edge functions for processing to reduce long-haul data transit across the backbone.",
        "Green Software: Implement efficient code patterns. Python/Ruby consume significantly more energy than Rust/C++ for the same tasks."
      ]
    },
    {
      title: "Corporate Advocacy",
      icon: ShieldAlert,
      color: "text-danger",
      actions: [
        "Demand Per-Site Disclosure: Pressure providers (AWS, Oracle) to publish per-facility water consumption data.",
        "Support Water-Positive Pledges: Hold companies accountable to their 2030 goals through public inquiry and shareholder action.",
        "Local Policy: Advocate for data center zoning laws that require closed-loop cooling in water-stressed regions."
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl mb-4 leading-tight">Take Action. Stop the Drain.</h1>
        <p className="text-text-2 text-lg md:text-xl max-w-3xl">
          Data centers don't have to be a black box. Here is how you can reduce your personal and professional impact on the planet's resources.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 md:mb-24">
        {categories.map((cat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-8 flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <cat.icon className={`w-6 h-6 ${cat.color}`} />
              <h2 className="text-xl">{cat.title}</h2>
            </div>
            <ul className="space-y-6 flex-1">
              {cat.actions.map((action, j) => (
                <li key={j} className="flex gap-4 items-start">
                  <CheckCircle2 className={`w-4 h-4 mt-1 shrink-0 ${cat.color} opacity-50`} />
                  <p className="text-text-2 text-sm leading-relaxed">{action}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <section className="card p-8 md:p-12 bg-bg-1 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Brain className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl mb-6 flex items-center gap-3">
            <Brain className="w-8 h-8 text-accent" />
            Personalized Action Plan
          </h2>
          <p className="text-text-2 mb-8">
            Tell us about your digital habits (e.g., "I run a small e-commerce site" or "I stream 4 hours of video daily") and we'll generate a custom reduction strategy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Describe your digital footprint..."
              className="flex-1 bg-bg-2 border border-border-2 rounded-[4px] px-4 py-3 text-sm mono focus:border-accent outline-none"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
            />
            <button 
              onClick={generateAdvice}
              disabled={isGenerating || !userContext}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {isGenerating ? "Analyzing..." : "Generate Strategy"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {aiAdvice && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-bg-2 border border-border-2 p-6 rounded-[4px] mono text-sm text-text-1 leading-relaxed whitespace-pre-wrap"
            >
              <div className="text-[10px] text-accent uppercase mb-4 tracking-widest font-bold">AI Generated Strategy</div>
              {aiAdvice}
            </motion.div>
          )}
        </div>
      </section>

      <section className="mt-24 text-center">
        <h2 className="text-3xl mb-8">Ready to dive deeper?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://www.thegreenwebfoundation.org/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-border-2 rounded-[3px] hover:bg-bg-2 transition-colors flex items-center gap-2">
            The Green Web Foundation <ArrowRight className="w-4 h-4" />
          </a>
          <a href="https://sustainablewebdesign.org/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-border-2 rounded-[3px] hover:bg-bg-2 transition-colors flex items-center gap-2">
            Sustainable Web Design <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
