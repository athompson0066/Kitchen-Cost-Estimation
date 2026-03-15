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
  Sparkles,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseAgencyCsv, type AgencyPriceItem } from '../lib/agencyCsvParser';

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

export function AgencyEstimator() {
  const [step, setStep] = useState<Step>('calculator');
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });
  const [projectData, setProjectData] = useState<ProjectData>({ 
    market: 'Toronto',
    services: ['Core AI Estimator Engine (Gemini 3)', 'Custom Floating Popup Widget'] // Defaults
  });
  const [priceList, setPriceList] = useState<AgencyPriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    parseAgencyCsv().then(setPriceList).catch(err => {
      console.error("Failed to load price list:", err);
      setError("Failed to load price data. Please try again.");
    });
  }, []);

  const calculateTotals = () => {
    let buildTotal = 0;
    let monthlyTotal = 0;
    
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
      const payload = {
        userData,
        projectData,
        totals: {
          buildTotal,
          monthlyTotal
        },
        timestamp: new Date().toISOString()
      };

      const WEBHOOK_URL = 'https://hook.us1.make.com/PLACEHOLDER_WEBHOOK_URL';
      
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (webhookErr) {
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
    <div className="w-full max-w-md bg-white dark:bg-[#1e2124] rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden mx-auto">
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
        </div>

        <div className="relative">
          <h2 className="text-xl font-bold tracking-tight">AI Agency Quote</h2>
          
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
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative min-h-[450px]">
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
              <div className="space-y-6 flex flex-col h-full">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">ROI Calculator</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Configure your Agency Build Estimator to see live pricing.</p>
                </div>

                <div className="flex-1 space-y-6">
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

                <div className="pt-4">
                   <button 
                     onClick={() => setStep('lead-capture')}
                     className="w-full bg-[#e67e22] hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group shrink-0"
                   >
                     Get Detailed Build Roadmap
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            )}

            {/* STEP 2: LEAD CAPTURE  */}
            {step === 'lead-capture' && (
              <form onSubmit={handleLeadSubmit} className="space-y-5 flex flex-col h-full">
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

                <div className="pt-4 mt-auto">
                   <button 
                     type="submit"
                     disabled={isLoading}
                     className="w-full bg-[#e67e22] hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group"
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
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'success' && (
              <div className="space-y-6 flex flex-col justify-center text-center items-center h-full">
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

                <div className="pt-4 mt-4 w-full">
                   <button 
                      onClick={() => {
                         setStep('calculator');
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold py-3 flex items-center justify-center rounded-xl shadow-lg transition-colors"
                   >
                      Reset Estimator
                   </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
      
    </div>
  );
}
