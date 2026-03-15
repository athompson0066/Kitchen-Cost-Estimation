/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Star, 
  Calculator, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getGeminiModel } from './lib/gemini';
import { parseEstimatorCsv, type PriceItem } from './lib/csvParser';
import ReactMarkdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'user-info' | 'project-details' | 'estimate';

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

export default function App() {
  const [step, setStep] = useState<Step>('user-info');
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', city: '' });
  const [projectData, setProjectData] = useState<ProjectData>({ 
    sqft: '', 
    cabinetQuality: '', 
    countertopType: '',
    additionalItems: []
  });
  const [priceList, setPriceList] = useState<PriceItem[]>([]);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    parseEstimatorCsv().then(setPriceList).catch(err => {
      console.error("Failed to load price list:", err);
      setError("Failed to load price data. Please try again.");
    });
  }, []);

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userData.name && userData.email && userData.city) {
      setStep('project-details');
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

  const toggleItem = (itemName: string) => {
    setProjectData(prev => ({
      ...prev,
      additionalItems: prev.additionalItems.includes(itemName)
        ? prev.additionalItems.filter(i => i !== itemName)
        : [...prev.additionalItems, itemName]
    }));
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#17191b] flex items-center justify-center p-4 font-sans selection:bg-orange-200">
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#1e2124] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header Section */}
          <div className="bg-slate-900 p-6 pb-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_#ffffff_1px,_transparent_0)] bg-[size:24px_24px]"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Construction className="text-[#e67e22] w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Aiolos Media AI Estimator</span>
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="relative text-3xl font-bold leading-tight tracking-tight">Kitchen Remodeling</h2>
            <p className="relative text-slate-400 text-sm mt-1 italic">Professional Canadian craftsmanship for your home.</p>
          </div>

          {/* Form Body */}
          <div className="p-8 -mt-6 bg-white dark:bg-[#1e2124] rounded-t-3xl relative z-10">
            {step === 'user-info' && (
              <form onSubmit={handleUserInfoSubmit} className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Get Your Free Quote</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in your details to start your transformation.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-slate-900 dark:text-slate-100" 
                        placeholder="John Doe" 
                        type="text"
                        value={userData.name}
                        onChange={e => setUserData({...userData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-slate-900 dark:text-slate-100" 
                        placeholder="john@example.com" 
                        type="email"
                        value={userData.email}
                        onChange={e => setUserData({...userData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Project City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <select 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-slate-900 dark:text-slate-100 appearance-none"
                        value={userData.city}
                        onChange={e => setUserData({...userData, city: e.target.value})}
                      >
                        <option value="" disabled>Select your city</option>
                        <option value="Toronto">Toronto</option>
                        <option value="Winnipeg">Winnipeg</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#e67e22] hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Next
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            )}

            {step === 'project-details' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Project Details</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Tell us about your kitchen space.</p>
                  </div>
                  <button onClick={() => setStep('user-info')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Kitchen Square Footage</label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-slate-900 dark:text-slate-100" 
                        placeholder="e.g. 150" 
                        type="number"
                        value={projectData.sqft}
                        onChange={e => setProjectData({...projectData, sqft: e.target.value})}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">sq ft</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Cabinet Selection</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-slate-900 dark:text-slate-100 appearance-none"
                      value={projectData.cabinetQuality}
                      onChange={e => setProjectData({...projectData, cabinetQuality: e.target.value})}
                    >
                      <option value="" disabled>Select Cabinet Type</option>
                      <option value="Custom Hardwood (Built-in)">Custom Hardwood (Built-in)</option>
                      <option value="Semi-Custom Plywood">Semi-Custom Plywood</option>
                      <option value="RTA (Stock) - Plywood Box">RTA (Stock) - Plywood Box</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Countertop Selection</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-[#e67e22] outline-none transition-all text-slate-900 dark:text-slate-100 appearance-none"
                      value={projectData.countertopType}
                      onChange={e => setProjectData({...projectData, countertopType: e.target.value})}
                    >
                      <option value="" disabled>Select Countertop Type</option>
                      <option value="Quartz (Calacatta Premium)">Quartz (Calacatta Premium)</option>
                      <option value="Laminate (High-Def)">Laminate (High-Def)</option>
                      <option value="Butcher Block (Walnut)">Butcher Block (Walnut)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Additional Services</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Full Kitchen Rip-out', 'Luxury Vinyl Plank (LVP)', 'Porcelain Tile (Large Format)', 'Rough-in (Sink/Dishwasher)', 'Kitchen Circuits & Panel Upgrade', 'Pot Light Install (Set of 6)', 'Subway Tile (Ceramic)', 'Painting'].map(item => (
                        <button
                          key={item}
                          onClick={() => toggleItem(item)}
                          className={cn(
                            "text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                            projectData.additionalItems.includes(item)
                              ? "bg-orange-50 border-orange-200 text-[#e67e22] dark:bg-orange-900/20 dark:border-orange-800"
                              : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-[#17191b] dark:border-slate-700 dark:text-slate-400"
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    onClick={generateEstimate}
                    disabled={isLoading || !projectData.sqft || !projectData.cabinetQuality || !projectData.countertopType}
                    className="w-full bg-[#e67e22] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Calculating Estimate...
                      </>
                    ) : (
                      <>
                        Generate AI Estimate
                        <Calculator className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'estimate' && estimate && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Estimate Summary</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Based on 2026 Canadian pricing data.</p>
                  </div>
                  <button onClick={() => setStep('project-details')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none overflow-x-auto">
                  <div className="bg-slate-50 dark:bg-[#17191b] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="markdown-body">
                      <ReactMarkdown>
                        {estimate}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-4 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                  <Verified className="text-[#e67e22] w-5 h-5" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verified AI Estimation</span>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-[#e67e22] hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Book a Free Consultation
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-medium">
                    Prices are estimates only and may vary based on site inspections.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Progress & Trust Indicators */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1.5">
                <div className={cn("h-1.5 w-10 rounded-full transition-all", step === 'user-info' ? "bg-[#e67e22]" : "bg-orange-200 dark:bg-orange-900/40")} />
                <div className={cn("h-1.5 w-10 rounded-full transition-all", step === 'project-details' ? "bg-[#e67e22]" : "bg-slate-200 dark:bg-slate-700")} />
                <div className={cn("h-1.5 w-10 rounded-full transition-all", step === 'estimate' ? "bg-[#e67e22]" : "bg-slate-200 dark:bg-slate-700")} />
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Step {step === 'user-info' ? '1' : step === 'project-details' ? '2' : '3'} of 3
              </span>
            </div>

            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-1.5">
                <Verified className="text-slate-400 w-4 h-4" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="text-slate-400 w-4 h-4" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Top Rated Pros</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
