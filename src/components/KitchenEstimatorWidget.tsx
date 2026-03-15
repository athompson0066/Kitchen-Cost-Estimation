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
import { getGeminiModel } from '../lib/gemini';
import { parseKitchenCsv, type KitchenPriceItem } from '../lib/kitchenCsvParser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'user-info' | 'kitchen-size' | 'materials' | 'services' | 'estimate';

interface UserData {
  name: string;
  email: string;
  city: string;
}

interface ProjectData {
  sqft: string;
  cabinetQuality: string;
  countertopType: string;
  additionalItems: string[];
}

const CABINET_OPTIONS = [
  { id: 'Custom Hardwood (Built-in)', label: 'Custom Hardwood', desc: 'Premium built-in luxury', icon: Hammer },
  { id: 'Semi-Custom Plywood', label: 'Semi-Custom', desc: 'High quality & flexible', icon: Home },
  { id: 'RTA (Stock) - Plywood Box', label: 'RTA (Stock)', desc: 'Budget-friendly plywood', icon: Construction }
];

const COUNTERTOP_OPTIONS = [
  { id: 'Quartz (Calacatta Premium)', label: 'Premium Quartz', desc: 'Calacatta marble style', icon: Sparkles },
  { id: 'Butcher Block (Walnut)', label: 'Walnut Butcher Block', desc: 'Warm natural wood', icon: Home },
  { id: 'Laminate (High-Def)', label: 'HD Laminate', desc: 'Cost-effective durability', icon: Construction }
];

const SERVICE_OPTIONS = [
  'Full Kitchen Rip-out', 
  'Luxury Vinyl Plank (LVP)', 
  'Porcelain Tile (Large Format)', 
  'Rough-in (Sink/Dishwasher)', 
  'Kitchen Circuits & Panel Upgrade', 
  'Pot Light Install (Set of 6)', 
  'Subway Tile (Ceramic)', 
  'Walls & Ceiling (Premium)'
];

export function KitchenEstimatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('user-info');
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', city: '' });
  const [projectData, setProjectData] = useState<ProjectData>({ 
    sqft: '', 
    cabinetQuality: '', 
    countertopType: '',
    additionalItems: []
  });
  const [priceList, setPriceList] = useState<KitchenPriceItem[]>([]);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    parseKitchenCsv().then(setPriceList).catch(err => {
      console.error("Failed to load price list:", err);
      setError("Failed to load price data. Please try again.");
    });
  }, []);

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userData.name && userData.email && userData.city) {
      setStep('kitchen-size');
    }
  };

  const handleSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectData.sqft) {
      setStep('materials');
    }
  };

  const generateEstimate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = getGeminiModel();
      
      const csvContext = JSON.stringify(priceList, null, 2);
      
      const systemInstruction = `
Role: You are the "Aiolos Media AI Estimator," a professional construction logic engine for the Canadian market.

Core Instruction: You must provide project estimates based EXCLUSIVELY on the data provided in the attached Kitchen_Renovation_Estimator_2026.csv file. Do not use outside pricing data or "general knowledge" for costs.

Data Context (CSV Content):
${csvContext}

Calculation Logic:
1. Identify Items: Match user inputs to the Item Name in the CSV.
2. Calculate Line Subtotals: Use the formula: (Base Material Cost * Quantity) * Labor Multiplier * Regional Multiplier.
3. Apply Regional Context:
   * If the user is in Toronto, use the Regional Multiplier provided in the CSV (1.25).
   * If the user is in Winnipeg, set the Regional Multiplier to 1.0.
4. Summary Math:
   * Calculate a Total Subtotal.
   * Add a 12% Contingency Fund.
   * Add Tax: 13% for Toronto/Ontario; 5% for Winnipeg/Manitoba.

Output Format:
Always provide a structured table showing the Category, Item, and Subtotal. Conclude with the Grand Total in CAD. Use Markdown for the table.

Guardrails: If a user asks for an item not in the CSV, state: "That item is not in our current 2026 price list. Please contact Aiolos Media for a custom quote."
      `;

      const prompt = `
User Details:
Name: ${userData.name}
Email: ${userData.email}
City: ${userData.city}

Project Details:
Kitchen Square Footage: ${projectData.sqft} sq ft
Cabinet Selection: ${projectData.cabinetQuality}
Countertop Selection: ${projectData.countertopType}
Additional Items Requested: ${projectData.additionalItems.join(', ')}

Please generate the estimate now.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
        }
      });

      setEstimate(response.text || "No estimate generated.");
      setStep('estimate');
    } catch (err: any) {
      console.error("AI Error:", err);
      if (err.message?.includes("API Key") || err.message?.includes("API key")) {
        setError("Invalid or missing API Key. Please click the 'Secrets' icon in the AI Studio sidebar and add your GEMINI_API_KEY.");
      } else {
        setError("An error occurred while generating your estimate. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleService = (itemName: string) => {
    setProjectData(prev => ({
      ...prev,
      additionalItems: prev.additionalItems.includes(itemName)
        ? prev.additionalItems.filter(i => i !== itemName)
        : [...prev.additionalItems, itemName]
    }));
  };

  const getStepNumber = () => {
    switch(step) {
      case 'user-info': return 1;
      case 'kitchen-size': return 2;
      case 'materials': return 3;
      case 'services': return 4;
      case 'estimate': return 5;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-200">
      


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
                  {[1,2,3,4,5].map(i => (
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
                  {/* STEP 1: USER INFO */}
                  {step === 'user-info' && (
                    <form onSubmit={handleUserInfoSubmit} className="space-y-5 h-full flex flex-col">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Let's get started</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Where should we send your detailed estimate?</p>
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

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide ml-1">Project City</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select 
                              required
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-sm appearance-none"
                              value={userData.city}
                              onChange={e => setUserData({...userData, city: e.target.value})}
                            >
                              <option value="" disabled>Select your city...</option>
                              <option value="Toronto">Toronto, ON</option>
                              <option value="Winnipeg">Winnipeg, MB</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#e67e22] hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group mt-6"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                  )}

                  {/* STEP 2: KITCHEN SIZE */}
                  {step === 'kitchen-size' && (
                    <form onSubmit={handleSizeSubmit} className="space-y-5 h-full flex flex-col">
                       <div>
                        <button type="button" onClick={() => setStep('user-info')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors">
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kitchen Size</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Estimate the square footage of your kitchen space.</p>
                      </div>

                      <div className="flex-1 flex flex-col justify-center py-8">
                        <div className="relative mx-auto w-48">
                          <input 
                            required
                            autoFocus
                            className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-700 focus:border-[#e67e22] dark:focus:border-[#e67e22] text-4xl text-center font-bold text-slate-900 dark:text-white py-2 outline-none transition-colors" 
                            placeholder="0" 
                            type="number"
                            min="50"
                            max="2000"
                            value={projectData.sqft}
                            onChange={e => setProjectData({...projectData, sqft: e.target.value})}
                          />
                          <span className="absolute -right-8 bottom-4 text-slate-400 font-medium">sq ft</span>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">Average standard kitchen is ~150 sq ft</p>
                      </div>

                      <button 
                        type="submit"
                        disabled={!projectData.sqft}
                        className="w-full bg-[#e67e22] hover:bg-orange-600 disabled:opacity-50 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group mt-6"
                      >
                        Next: Materials
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                  )}

                  {/* STEP 3: MATERIALS */}
                  {step === 'materials' && (
                    <div className="space-y-6 h-full flex flex-col">
                      <div>
                         <button onClick={() => setStep('kitchen-size')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors">
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Core Materials</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Select your preferred finishes.</p>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Cabinet Style</label>
                          <div className="grid gap-2">
                            {CABINET_OPTIONS.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setProjectData({...projectData, cabinetQuality: opt.id})}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                                  projectData.cabinetQuality === opt.id 
                                    ? "border-[#e67e22] bg-orange-50 dark:bg-orange-500/10" 
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-[#1a1c1e]"
                                )}
                              >
                                <div className={cn("p-2 rounded-lg", projectData.cabinetQuality === opt.id ? "bg-[#e67e22] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                                  <opt.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className={cn("text-sm font-bold", projectData.cabinetQuality === opt.id ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{opt.label}</div>
                                  <div className="text-xs text-slate-500 font-medium">{opt.desc}</div>
                                </div>
                                {projectData.cabinetQuality === opt.id && <CheckCircle2 className="w-4 h-4 text-[#e67e22] ml-auto shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Countertops</label>
                          <div className="grid gap-2">
                            {COUNTERTOP_OPTIONS.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setProjectData({...projectData, countertopType: opt.id})}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                                  projectData.countertopType === opt.id 
                                    ? "border-[#e67e22] bg-orange-50 dark:bg-orange-500/10" 
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-[#1a1c1e]"
                                )}
                              >
                                <div className={cn("p-2 rounded-lg", projectData.countertopType === opt.id ? "bg-[#e67e22] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                                  <opt.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className={cn("text-sm font-bold", projectData.countertopType === opt.id ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{opt.label}</div>
                                  <div className="text-xs text-slate-500 font-medium">{opt.desc}</div>
                                </div>
                                {projectData.countertopType === opt.id && <CheckCircle2 className="w-4 h-4 text-[#e67e22] ml-auto shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setStep('services')}
                        disabled={!projectData.cabinetQuality || !projectData.countertopType}
                        className="w-full bg-[#e67e22] hover:bg-orange-600 disabled:opacity-50 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group mt-6"
                      >
                        Next: Services
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* STEP 4: SERVICES */}
                  {step === 'services' && (
                    <div className="space-y-5 h-full flex flex-col">
                       <div>
                         <button onClick={() => setStep('materials')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors">
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Additional Services</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Select any extra labor or materials needed.</p>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 gap-2">
                          {SERVICE_OPTIONS.map(item => (
                            <button
                              key={item}
                              onClick={() => toggleService(item)}
                              className={cn(
                                "text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all flex justify-between items-center group",
                                projectData.additionalItems.includes(item)
                                  ? "bg-orange-50 border-orange-200 text-[#e67e22] dark:bg-orange-500/10 dark:border-orange-500/30"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 dark:bg-[#1a1c1e] dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300"
                              )}
                            >
                              {item}
                              <div className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                projectData.additionalItems.includes(item)
                                  ? "bg-[#e67e22] border-[#e67e22]"
                                  : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                              )}>
                                {projectData.additionalItems.includes(item) && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      <button 
                        onClick={generateEstimate}
                        disabled={isLoading}
                        className="w-full bg-[#e67e22] hover:bg-orange-600 disabled:opacity-50 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group mt-4 relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Pricing Data...
                          </>
                        ) : (
                          <>
                            Generate AI Estimate
                            <Sparkles className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* STEP 5: ESTIMATE */}
                  {step === 'estimate' && estimate && (
                    <div className="space-y-5 h-full flex flex-col">
                       <div>
                         <button onClick={() => setStep('services')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors">
                          <ArrowLeft className="w-3 h-3" /> Edit Requirements
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                          Your Custom Estimate
                        </h3>
                      </div>

                      <div className="flex-1 overflow-y-auto px-1 -mx-1">
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({node, ...props}: any) => <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1c1e] my-4 shadow-sm"><table className="w-full text-xs text-left" {...props} /></div>,
                              thead: ({node, ...props}: any) => <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold" {...props} />,
                              th: ({node, ...props}: any) => <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-700" {...props} />,
                              td: ({node, ...props}: any) => <td className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 last:border-0 font-medium" {...props} />,
                              h1: ({node, ...props}: any) => <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-0 mb-2" {...props} />,
                              h2: ({node, ...props}: any) => <h2 className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2" {...props} />,
                              h3: ({node, ...props}: any) => <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-2 uppercase tracking-wide" {...props} />,
                              p: ({node, ...props}: any) => <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3 text-sm" {...props} />,
                              ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-1 mb-4 text-slate-600 dark:text-slate-400 text-sm" {...props} />,
                              li: ({node, ...props}: any) => <li className="leading-relaxed" {...props} />,
                              strong: ({node, ...props}: any) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
                            }}
                          >
                            {estimate}
                          </ReactMarkdown>
                        </div>

                        <div className="mt-6 bg-[#e67e22]/10 border border-[#e67e22]/20 rounded-xl p-4 flex gap-3 text-sm items-start">
                          <MessageSquare className="w-5 h-5 text-[#e67e22] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-slate-800 dark:text-slate-200 font-semibold mb-1">Ready to move forward?</p>
                            <p className="text-slate-600 dark:text-slate-400">Our designers are ready to review this estimate with you and start planning your space.</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={() => window.print()}
                          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                        >
                          Save & Book Consultation
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
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
