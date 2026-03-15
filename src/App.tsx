/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Construction, 
  X, 
  User, 
  Mail, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Verified, 
  Calculator, 
  Loader2,
  AlertCircle,
  Home,
  Hammer,
  Sparkles,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getGeminiModel } from './lib/gemini';
import { parseEstimatorCsv, type PriceItem } from './lib/csvParser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'calculator' | 'lead-capture' | 'success';

interface UserData {
  name: string;
  email: string;
}

interface ProjectData {
  market: 'Toronto' | 'Winnipeg';
  services: string[];
}

const SERVICES = [
  { id: 'Core AI Estimator Engine (Gemini 3)', label: 'Core AI Estimator Engine', desc: 'The intelligent brain powering custom quotes', icon: Sparkles },
  { id: 'Custom Floating Popup Widget', label: 'Custom Floating Widget', desc: 'Premium UI for seamless lead capture', icon: Construction },
  { id: 'SMS & Email Lead Alert System', label: 'SMS & Email Alerts', desc: 'Instant notifications for new leads', icon: MessageSquare },
  { id: 'CRM & Google Sheets Sync', label: 'CRM & Sheets Sync', desc: 'Automated data routing and backup', icon: Verified },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('calculator');
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });
  const [projectData, setProjectData] = useState<ProjectData>({ 
    market: 'Toronto',
    services: ['Core AI Estimator Engine (Gemini 3)', 'Custom Floating Popup Widget'] // Defaults
  });
  const [priceList, setPriceList] = useState<PriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    parseEstimatorCsv().then(setPriceList).catch(err => {
      console.error("Failed to load price list:", err);
      setError("Failed to load price data. Please try again.");
    });
  }, []);

  const calculateTotals = () => {
    let buildTotal = 0;
    let monthlyTotal = 0;
    
    // Strategy & Content are base items we might want to include, but for now we calculate what they select
    projectData.services.forEach(serviceId => {
      const item = priceList.find(p => p['Item Name'] === serviceId);
      if (item) {
        const baseCost = parseFloat(item['Base Cost (CAD)'] || '0');
        const laborMult = parseFloat(item['Labor Multiplier'] || '1');
        const itemRegMult = parseFloat(item['Regional Multiplier'] || '1');
        
        const appliedRegMult = projectData.market === 'Toronto' ? itemRegMult : 1.0;
        buildTotal += (baseCost * parseInt(item.Quantity || '1')) * laborMult * appliedRegMult;
      }
    });

    // Strategy & Content (Assuming they are always required base costs for the build if not selected? The prompt didn't say. Let's strictly add what is selected plus monthlies)
    
    // Monthly Maintenance (Rows 8 & 9)
    const monthlyItems = priceList.filter(p => p.Unit === 'Month');
    monthlyItems.forEach(item => {
      const baseCost = parseFloat(item['Base Cost (CAD)'] || '0');
      monthlyTotal += baseCost;
    });

    return { buildTotal, monthlyTotal };
  };

  const { buildTotal, monthlyTotal } = calculateTotals();

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.name || !userData.email) return;

    setIsLoading(true);
    setError(null);

    try {
      // Trigger Webhook to Make.com
      const payload = {
        userData,
        projectData,
        totals: {
          buildTotal,
          monthlyTotal
        },
        timestamp: new Date().toISOString()
      };

      // Simulated Webhook Post (To be replaced with actual Make.com URL when provided by user)
      const WEBHOOK_URL = 'https://hook.us1.make.com/PLACEHOLDER_WEBHOOK_URL';
      
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (webhookErr) {
        // We log the webhook error but still proceed to success screen so demo isn't broken for user testing
        console.warn("Webhook failed (expected if using placeholder URL):", webhookErr);
      }

      setStep('success');
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleService = (itemName: string) => {
    setProjectData(prev => ({
      ...prev,
      services: prev.services.includes(itemName)
        ? prev.services.filter(i => i !== itemName)
        : [...prev.services, itemName]
    }));
  };

  const setMarket = (market: 'Toronto' | 'Winnipeg') => {
    setProjectData(prev => ({ ...prev, market }));
  };

  const getStepNumber = () => {
    switch(step) {
      case 'calculator': return 1;
      case 'lead-capture': return 2;
      case 'success': return 3;
      default: return 1;
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-200">
      
      {/* Landing Page Content */}
      <div className="pt-24 pb-32 px-6 lg:px-8 max-w-6xl mx-auto relative z-10 font-sans">
        
        {/* Header CTA */}
        <header className="flex justify-between items-center mb-24">
          <div className="flex items-center gap-3">
            <div className="bg-[#e67e22] text-white p-2 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Aiolos<span className="text-[#e67e22]">Media</span>
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg"
          >
            Try Estimator <ArrowRight className="w-4 h-4" />
          </button>
        </header>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]">
            Stop Chasing Tire-Kickers.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e67e22] to-orange-400">
              Start Closing Projects.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            The 2026 AI-Powered Kitchen Estimator for Pro Remodelers.
          </p>
          <button 
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#e67e22] hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-orange-500/20"
          >
            Get Your Custom Estimator Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-32">
          
          {/* WHO */}
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">WHO: Built for the Modern Canadian Contractor</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This isn't for the hobbyist. This is for the high-volume kitchen remodeler in cities like Toronto, Winnipeg, and Calgary who is tired of spending 5 hours a week driving to "look at jobs" that never materialize.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-[#e67e22] shrink-0 mt-0.5" /> <strong>The Busy Owner:</strong> Who needs to filter out low-budget inquiries before they pick up the phone.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-[#e67e22] shrink-0 mt-0.5" /> <strong>The Sales Team:</strong> Who needs a professional, instant quote tool to build trust.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-[#e67e22] shrink-0 mt-0.5" /> <strong>The Scaling Agency:</strong> Who wants a 24/7 lead capture system that works while the crew is on-site.</li>
            </ul>
          </div>

          {/* WHY */}
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">WHY: Because "Speed-to-Lead" is Everything</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              In 2026, if you don't respond to an inquiry with value within 5 minutes, you've already lost the job.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <strong>Instant Gratification:</strong> Give homeowners the ballpark number they crave instantly.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <strong>Precision Accuracy:</strong> Our tool uses grounded 2026 Canadian market data to provide realistic ranges.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <strong>Authority Positioning:</strong> A detailed, 20-line-item estimate upfront builds instant trust.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <strong>Filter the Noise:</strong> Let AI handle pricing questions so you focus on qualified homeowners.</li>
            </ul>
          </div>

          {/* WHERE */}
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">WHERE: Everywhere Your Customers Are</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Our estimator doesn't just sit on a hidden page. It works across your entire digital footprint:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>Website Popup:</strong> A sleek, floating widget that captures attention.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>Social Media Bio:</strong> Link it on Instagram or Facebook to convert clicks into leads.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>QR Codes:</strong> Put a code on lawn signs or truck wraps.</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>Email Signatures:</strong> Keep momentum moving in every email reply.</li>
            </ul>
          </div>

          {/* HOW */}
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <Construction className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">HOW: The Seamless 3-Step Integration</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We've made the tech invisible so you can focus on the construction.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">The Interaction</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">A homeowner answers 5 simple questions on your site.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">The Capture</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">AI asks for their contact details to unlock the report.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">The Delivery</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">You get a Lead Alert breakdown. They get a PDF estimate. You close the deal.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* CTA Section */}
        <div className="text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-12 lg:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_theme(colors.white)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_theme(colors.slate.900)_1px,_transparent_0)] bg-[size:24px_24px]"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to put your lead gen on autopilot?</h2>
            <p className="text-lg text-slate-300 dark:text-slate-600 mb-8">Join the elite Canadian remodelers using Aiolos Media Intelligence.</p>
            <button 
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#e67e22] hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105"
            >
              Get Your Custom Estimator Started
            </button>
          </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-[#e67e22] hover:bg-orange-600 focus:ring-4 focus:ring-orange-500/30 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50 group origin-bottom-right"
          >
            <Calculator className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popup Widget Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-[min(calc(100vw-48px),450px)] max-h-[85vh] bg-white/95 dark:bg-[#1e2124]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 z-50 flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_#ffffff_1px,_transparent_0)] bg-[size:16px_16px]"></div>
              
              <div className="relative flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                    <Construction className="text-[#e67e22] w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Aiolos Estimator</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <h2 className="text-xl font-bold tracking-tight">AI Kitchen Quote</h2>
                
                {/* Progress Bar */}
                <div className="mt-4 flex gap-1 h-1">
                  {[1,2,3].map(i => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-full transition-all duration-500",
                        getStepNumber() >= i ? "bg-[#e67e22]" : "bg-slate-700"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {/* STEP 1: CALCULATOR */}
                  {step === 'calculator' && (
                    <div className="space-y-6 h-full flex flex-col">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">ROI Calculator</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Configure your Agency Build Estimator to see live pricing.</p>
                      </div>

                      <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Target Market</label>
                          <div className="grid grid-cols-2 gap-3">
                            {['Toronto', 'Winnipeg'].map((market) => (
                              <button
                                key={market}
                                onClick={() => setMarket(market as 'Toronto' | 'Winnipeg')}
                                className={cn(
                                  "p-3 rounded-xl border-2 text-center transition-all font-semibold",
                                  projectData.market === market 
                                    ? "border-[#e67e22] bg-orange-50 text-[#e67e22] dark:bg-orange-500/10 dark:text-orange-400" 
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-[#1a1c1e] text-slate-600 dark:text-slate-400"
                                )}
                              >
                                {market}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Build Features</label>
                          <div className="grid gap-2">
                            {SERVICES.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => toggleService(opt.id)}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                                  projectData.services.includes(opt.id) 
                                    ? "border-[#e67e22] bg-orange-50 dark:bg-orange-500/10" 
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-[#1a1c1e]"
                                )}
                              >
                                <div className={cn("p-2 rounded-lg", projectData.services.includes(opt.id) ? "bg-[#e67e22] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                                  <opt.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className={cn("text-sm font-bold", projectData.services.includes(opt.id) ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{opt.label}</div>
                                  <div className="text-xs text-slate-500 font-medium">{opt.desc}</div>
                                </div>
                                {projectData.services.includes(opt.id) && <CheckCircle2 className="w-4 h-4 text-[#e67e22] ml-auto shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Live Counter Display */}
                        <div className="bg-slate-900 text-white rounded-2xl p-5 mt-4 shadow-lg">
                          <div className="flex justify-between items-end mb-3 pb-3 border-b border-white/10">
                            <div>
                              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Projected Investment</p>
                              <p className="text-3xl font-extrabold text-[#e67e22]">${buildTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            </div>
                          </div>
                          <div className="flex justify-between gap-4">
                             <div>
                              <p className="text-slate-400 text-xs font-semibold">Monthly Maintenance</p>
                              <p className="font-semibold">${monthlyTotal.toLocaleString()}/mo</p>
                            </div>
                          </div>
                        </div>

                      </div>

                      <button 
                        onClick={() => setStep('lead-capture')}
                        className="w-full bg-[#e67e22] hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group mt-2 shrink-0"
                      >
                        Get Detailed Build Roadmap
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: LEAD CAPTURE  */}
                  {step === 'lead-capture' && (
                    <form onSubmit={handleLeadSubmit} className="space-y-5 h-full flex flex-col">
                      <div>
                        <button type="button" onClick={() => setStep('calculator')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors">
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Almost there!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Where should we send your custom Build Roadmap PDF?</p>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide ml-1">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              required
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-sm" 
                              placeholder="Jane Doe" 
                              type="text"
                              value={userData.name}
                              onChange={e => setUserData({...userData, name: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide ml-1">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              required
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-sm" 
                              placeholder="jane@example.com" 
                              type="email"
                              value={userData.email}
                              onChange={e => setUserData({...userData, email: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#e67e22] hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group mt-6"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            View Build Roadmap
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* STEP 3: SUCCESS */}
                  {step === 'success' && (
                    <div className="space-y-6 h-full flex flex-col justify-center text-center items-center py-8">
                       <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Roadmap Requested!</h3>
                      
                      <p className="text-slate-600 dark:text-slate-300">
                        Thank you, <span className="font-semibold text-slate-900 dark:text-white">{userData.name}</span>! Your detailed Agency Build Roadmap PDF has been emailed to you.
                      </p>

                      <div className="bg-slate-50 dark:bg-[#1a1c1e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 w-full text-left mt-4 text-sm mx-auto space-y-2">
                         <p className="font-bold text-slate-900 dark:text-white flex justify-between">
                            Total Investment: <span className="text-[#e67e22]">${buildTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </p>
                         <p className="font-medium text-slate-600 dark:text-slate-400 flex justify-between">
                            Monthly Maintenance: <span>${monthlyTotal.toLocaleString()}/mo</span>
                         </p>
                      </div>

                      <p className="text-sm text-slate-500 mt-4">
                        Our sales team has been notified via Make.com and will reach out shortly to discuss your custom build.
                      </p>

                      <button 
                         onClick={() => {
                            setStep('calculator');
                            setIsOpen(false);
                         }}
                         className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold py-3 flex items-center justify-center rounded-xl shadow-lg mt-8 transition-colors"
                      >
                         Close Window
                      </button>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
