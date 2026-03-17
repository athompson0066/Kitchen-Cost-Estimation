/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Construction, X, Calculator, Loader2, Home, Hammer, Sparkles, ShieldCheck, CheckCircle2, ChevronRight, Send, MapPin, CalendarDays, Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getGeminiModel } from '../lib/gemini';
import { parseKitchenCsv, type KitchenPriceItem } from '../lib/kitchenCsvParser';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
}

interface ProjectData {
  sqft: string;
  cabinetQuality: string;
  countertopType: string;
  additionalItems: string[];
  layoutDescription: string;
  jobDate: string;
  jobTime: string;
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

type FieldState = 'name' | 'email' | 'phone' | 'city' | 'postalCode' | 'sqft' | 'layoutDescription' | 'cabinetQuality' | 'countertopType' | 'additionalItems' | 'jobDate' | 'jobTime' | 'confirm_estimate' | 'done';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  type: 'text' | 'options' | 'services' | 'estimate' | 'typing' | 'date' | 'time' | 'cityPrompt';
  content: string | any;
  options?: any[];
}

export function KitchenEstimatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [currentField, setCurrentField] = useState<FieldState>('name');
  
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', phone: '', city: '', postalCode: '' });
  const [projectData, setProjectData] = useState<ProjectData>({ 
    sqft: '', cabinetQuality: '', countertopType: '', additionalItems: [], layoutDescription: '', jobDate: '', jobTime: ''
  });
  const [priceList, setPriceList] = useState<KitchenPriceItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tempServices, setTempServices] = useState<string[]>([]);
  const [tempPickerValue, setTempPickerValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    parseKitchenCsv().then(setPriceList).catch(err => {
      console.error("Failed to load price list:", err);
    });
  }, []);

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: '1', role: 'bot', type: 'text', content: "Hi, I'm Sammie! I've spent years analyzing kitchen renovations. I'm here to take the guesswork out of your budget and give you a realistic, tailored estimate." }
      ]);
      
      const typingId = Date.now().toString() + '-typing';
      setTimeout(() => {
        setMessages(prev => [...prev, { id: typingId, role: 'bot', type: 'typing', content: '' }]);
      }, 300);

      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { id: '2', role: 'bot', type: 'text', content: "Let's get started. What's your full name?" }
        ]);
      }, 1500);
    }
  }, [isOpen]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, tempServices, inputValue, tempPickerValue]);

  const addBotMessage = (msg: Omit<ChatMessage, 'id' | 'role'>, delay = 600) => {
    const typingId = Date.now().toString() + '-typing';
    setMessages(prev => [...prev, { id: typingId, role: 'bot', type: 'typing', content: '' }]);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { ...msg, id: Date.now().toString(), role: 'bot' }
      ]);
    }, delay);
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', type: 'text', content: val }]);
    setInputValue("");
    processAnswer(val);
  };

  const processAnswer = (answer: string) => {
    switch (currentField) {
      case 'name':
        setUserData(prev => ({ ...prev, name: answer }));
        setCurrentField('email');
        addBotMessage({ type: 'text', content: `Nice to meet you, ${answer.split(' ')[0]}! What's your email address so we can send you a copy of the estimate?` });
        break;
      case 'email':
        setUserData(prev => ({ ...prev, email: answer }));
        setCurrentField('phone');
        addBotMessage({ type: 'text', content: `Got it. Just in case our designers need to reach out, what's a good phone number for you?` });
        break;
      case 'phone':
        setUserData(prev => ({ ...prev, phone: answer }));
        setCurrentField('city');
        addBotMessage({ 
          type: 'cityPrompt', 
          content: `Great. Please type the city where the project is located.` 
        });
        break;
      case 'city':
        setUserData(prev => ({ ...prev, city: answer }));
        setCurrentField('postalCode');
        addBotMessage({ type: 'text', content: `Thanks! And what is the ZIP or Postal Code for the property?` });
        break;
      case 'postalCode':
        setUserData(prev => ({ ...prev, postalCode: answer }));
        setCurrentField('sqft');
        addBotMessage({ type: 'text', content: `Awesome. Roughly how large is the kitchen space in square feet? (Average is ~150)` });
        break;
      case 'sqft':
        setProjectData(prev => ({ ...prev, sqft: answer }));
        setCurrentField('jobDate');
        setTempPickerValue('');
        addBotMessage({ 
          type: 'date', 
          content: `When were you hoping to get this project started? Select a target date below:`
        });
        break;
      case 'layoutDescription':
        setProjectData(prev => ({ ...prev, layoutDescription: answer }));
        setCurrentField('cabinetQuality');
        addBotMessage({ 
          type: 'options', 
          content: `Awesome. Now let's pick some finishes. What style of cabinets are you envisioning?`,
          options: CABINET_OPTIONS.map(c => ({ label: c.label, value: c.id, desc: c.desc, icon: c.icon }))
        });
        break;
      default:
        break;
    }
  };

  const handleOptionSelect = (val: string, label: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', type: 'text', content: label }]);
    
    switch (currentField) {
      case 'cabinetQuality':
        setProjectData(prev => ({ ...prev, cabinetQuality: val }));
        setCurrentField('countertopType');
        addBotMessage({ 
          type: 'options', 
          content: `Excellent choice. And what about countertops?`,
          options: COUNTERTOP_OPTIONS.map(c => ({ label: c.label, value: c.id, desc: c.desc, icon: c.icon }))
        });
        break;
      case 'countertopType':
        setProjectData(prev => ({ ...prev, countertopType: val }));
        setCurrentField('additionalItems');
        addBotMessage({ 
          type: 'services', 
          content: `Almost done! Select any additional services or materials you might need for the project.`
        });
        break;
    }
  };

  const confirmDate = () => {
    if (!tempPickerValue) return;
    const dateObj = new Date(tempPickerValue);
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setProjectData(prev => ({ ...prev, jobDate: tempPickerValue }));
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', type: 'text', content: dateStr }]);
    
    setCurrentField('jobTime');
    setTempPickerValue('');
    addBotMessage({ type: 'time', content: 'What time of day generally works best for the work to take place?' });
  };

  const confirmTime = () => {
    if (!tempPickerValue) return;
    
    // Format if it's a 24h standard time string
    let displayTime = tempPickerValue;
    if (tempPickerValue.includes(':')) {
       try {
         const [hours, minutes] = tempPickerValue.split(':');
         const date = new Date();
         date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
         displayTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
       } catch (e) {}
    }

    setProjectData(prev => ({ ...prev, jobTime: tempPickerValue }));
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', type: 'text', content: displayTime }]);
    
    setCurrentField('layoutDescription');
    addBotMessage({ type: 'text', content: `Perfect. Finally, briefly describe your current kitchen layout or how you want it to change.` });
  };

  const toggleTempService = (service: string) => {
    setTempServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
  };

  const confirmServices = () => {
    setProjectData(prev => ({ ...prev, additionalItems: tempServices }));
    setCurrentField('confirm_estimate');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', type: 'text', content: `${tempServices.length} additional services selected.` }]);
    
    addBotMessage({ type: 'text', content: "Okay, I have everything I need! Give me just a second to calculate your estimate based on our current pricing models." });
    setTimeout(() => {
      generateEstimate();
    }, 1500);
  };

  const generateEstimate = async () => {
    setIsLoading(true);
    setCurrentField('done');
    
    const typingId = 'estimate-typing';
    setMessages(prev => [...prev, { id: typingId, role: 'bot', type: 'typing', content: '' }]);

    try {
      const ai = getGeminiModel();
      const csvContext = JSON.stringify(priceList, null, 2);
      
      const systemInstruction = `
Role: You are the "Aiolos Lead-Filter Agent," a utility tool designed to qualify residential kitchen leads in Canada.

Core Objective: Transform raw homeowner inquiries into a structured JSON "Project Scope" using the provided Kitchen_Renovation_Estimator_2026.csv.

1. Data Grounding & Pricing Logic:
- Strict Adherence: Use ONLY the material and labor costs found in the CSV.
- Broad Ranges: Instead of a single "Grand Total," provide a Budget Range (e.g., +/- 15%). 
- Regional Multipliers: Apply the 1.25x factor for Toronto, 1.0x for Winnipeg.

2. Structure requirement:
You MUST return ONLY valid JSON matching this exact structure, with no markdown code blocks formatting it.
{
  "intro": "A friendly personalized greeting acknowledging their city and space.",
  "breakdown": [
    { "category": "String", "estimated_cost": "String" }
  ],
  "totalRange": "String",
  "leadGrade": "A/B/C",
  "disclaimer": "String"
}

Data Context:
${csvContext}
`;

      const prompt = `
Name: ${userData.name}
City: ${userData.city}
Postal Code: ${userData.postalCode}
Job Date: ${projectData.jobDate}
Job Time: ${projectData.jobTime}
Sqft: ${projectData.sqft}
Cabinets: ${projectData.cabinetQuality}
Counters: ${projectData.countertopType}
Extras: ${tempServices.join(', ')}
Layout: ${projectData.layoutDescription}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction, responseMimeType: "application/json" }
      });

      const resultText = response.text || '{}';
      const cleanJson = resultText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
      const result = JSON.parse(cleanJson);
      
      setMessages(prev => prev.filter(m => m.id !== typingId));
      
      addBotMessage({ type: 'text', content: result.intro }, 0);
      addBotMessage({ type: 'estimate', content: result }, 800);
      
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== typingId));
      addBotMessage({ type: 'text', content: "I'm so sorry, but I ran into an issue calculating your estimate. Let me connect you with a human expert!" }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const isTextInput = ['name', 'email', 'phone', 'city', 'postalCode', 'sqft', 'layoutDescription'].includes(currentField);

  return (
    <>
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-[min(calc(100vw-32px),480px)] h-[min(85vh,700px)] bg-white dark:bg-[#1a1c1e] rounded-[24px] shadow-2xl border border-slate-200/50 dark:border-slate-800 z-50 flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 shrink-0 relative overflow-hidden flex items-center justify-between">
              <div className="absolute inset-0">
                 <img src="/estimator_header.png" alt="Luxury Kitchen Header" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/10"></div>
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-orange-500/50 shrink-0 overflow-hidden shadow-sm">
                  <img src="https://cdn.prod.website-files.com/666ad77562dfabab1eb27f6c/66fbe5aea2e37e10f5fe1c9e_666ad77562dfabab1eb280b1_art-of-professional-headshots%20(1).jpeg" alt="Sammie Stewart" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-bold tracking-tight text-white leading-tight text-base">Sammie Stewart</h2>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Cost Estimator
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="relative text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-[#111213] flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    key={msg.id} 
                    className={cn(
                      "flex max-w-[85%]", // Wider allowable space for elements
                      msg.role === 'user' ? "ml-auto justify-end" : "justify-start"
                    )}
                  >
                    {/* Bot Avatar */}
                    {msg.role === 'bot' && (
                      <div className="w-6 h-6 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 mt-1 mr-2 flex items-center justify-center border border-slate-300 dark:border-slate-700 overflow-hidden">
                        <img src="https://cdn.prod.website-files.com/666ad77562dfabab1eb27f6c/66fbe5aea2e37e10f5fe1c9e_666ad77562dfabab1eb280b1_art-of-professional-headshots%20(1).jpeg" alt="Sammie" className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex flex-col gap-1 w-full",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      {msg.type === 'typing' && (
                         <div className="bg-white dark:bg-[#25282a] border border-slate-200 dark:border-slate-800 px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 w-fit">
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                         </div>
                      )}
                      
                      {msg.type === 'text' && (
                        <div className={cn(
                          "px-4 py-2.5 rounded-[18px] text-[15px] leading-relaxed w-fit shadow-sm border",
                          msg.role === 'user' 
                            ? "bg-[#e67e22] text-white rounded-tr-sm border-orange-600/20" 
                            : "bg-white dark:bg-[#1e2022] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                      )}

                      {msg.type === 'cityPrompt' && (
                        <div className="space-y-2 w-full max-w-[280px]">
                           <div className="bg-white dark:bg-[#1e2022] border border-slate-200 dark:border-slate-800 rounded-[20px] rounded-tl-sm shadow-sm overflow-hidden flex flex-col">
                             <div className="h-[80px] w-full relative">
                               <img src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600&auto=format&fit=crop" alt="Cityscape Map Skyline" className="w-full h-full object-cover opacity-80" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 px-3">
                                  <div className="flex items-center gap-1.5 text-white bg-black/30 backdrop-blur-md px-2 py-1 rounded-full text-xs font-semibold shadow-sm border border-white/20">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Location</span>
                                  </div>
                               </div>
                             </div>
                             <div className="p-3 text-[15px] leading-relaxed w-full text-slate-800 dark:text-slate-200 bg-white dark:bg-[#1e2022]">
                               {msg.content}
                             </div>
                           </div>
                        </div>
                      )}

                      {msg.type === 'date' && (
                        <div className="space-y-2 w-full max-w-[300px]">
                          <div className="px-4 py-2.5 rounded-[18px] text-[15px] leading-relaxed w-fit shadow-sm border bg-white dark:bg-[#1e2022] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm">
                            {msg.content}
                          </div>
                          {currentField === 'jobDate' && (
                            <div className="bg-white dark:bg-[#1e2022] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 w-full shadow-sm flex flex-col gap-3">
                              <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                <input 
                                  type="date"
                                  min={new Date().toISOString().split('T')[0]}
                                  value={tempPickerValue}
                                  onChange={e => setTempPickerValue(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#e67e22] text-slate-800 dark:text-slate-200 font-medium"
                                />
                              </div>
                              <button
                                disabled={!tempPickerValue}
                                onClick={confirmDate}
                                className="w-full bg-[#e67e22] hover:bg-orange-600 focus:ring-2 focus:ring-[#e67e22] disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 outline-none text-white font-semibold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                              >
                                Confirm Date
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.type === 'time' && (
                        <div className="space-y-2 w-full max-w-[300px]">
                          <div className="px-4 py-2.5 rounded-[18px] text-[15px] leading-relaxed w-fit shadow-sm border bg-white dark:bg-[#1e2022] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm">
                            {msg.content}
                          </div>
                          {currentField === 'jobTime' && (
                            <div className="bg-white dark:bg-[#1e2022] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 w-full shadow-sm flex flex-col gap-3">
                              <div className="grid grid-cols-3 gap-2">
                                {[{ l: 'Morning', v: '09:00' }, { l: 'Afternoon', v: '14:00' }, { l: 'Evening', v: '18:00' }].map((t) => (
                                   <button 
                                     key={t.v}
                                     onClick={() => setTempPickerValue(t.v)}
                                     className={cn(
                                       "py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center",
                                       tempPickerValue === t.v ? "bg-orange-50 border-[#e67e22] text-[#e67e22] dark:bg-orange-900/30" : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-[#17191b] dark:border-slate-700/50 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                                     )}
                                   >{t.l}</button>
                                ))}
                              </div>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                <input 
                                  type="time"
                                  value={tempPickerValue}
                                  onChange={e => setTempPickerValue(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-[#17191b] border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#e67e22] text-slate-800 dark:text-slate-200 font-medium"
                                />
                              </div>
                              <button
                                disabled={!tempPickerValue}
                                onClick={confirmTime}
                                className="w-full bg-[#e67e22] hover:bg-orange-600 focus:ring-2 focus:ring-[#e67e22] disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 outline-none text-white font-semibold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                              >
                                Confirm Time
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.type === 'options' && (
                        <div className="space-y-2 w-full max-w-[340px]">
                          {msg.content && (
                            <div className="px-4 py-2.5 rounded-[18px] text-[15px] leading-relaxed w-fit shadow-sm border bg-white dark:bg-[#1e2022] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm">
                              {msg.content}
                            </div>
                          )}
                          <div className={cn("inline-flex flex-col gap-2 min-w-[200px] w-full", msg.options?.[0]?.icon ? "" : "")}>
                            {msg.options?.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => handleOptionSelect(opt.value, opt.label)}
                                className={cn(
                                  "text-left p-3 rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-900 dark:text-orange-100 shadow-sm transition-all focus:ring-2 focus:ring-[#e67e22] outline-none",
                                  opt.icon && "flex items-center gap-3 p-3 bg-white dark:bg-[#1e2022] hover:border-[#e67e22] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                                )}
                              >
                                {opt.icon && (
                                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-[#e67e22]">
                                    <opt.icon className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-sm">{opt.label}</div>
                                  {opt.desc && <div className="text-[11px] opacity-70 leading-tight mt-0.5">{opt.desc}</div>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.type === 'services' && (
                        <div className="space-y-2 w-full max-w-[340px]">
                           <div className="px-4 py-2.5 rounded-[18px] text-[15px] leading-relaxed w-fit shadow-sm border bg-white dark:bg-[#1e2022] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm">
                              {msg.content}
                           </div>
                           <div className="bg-white dark:bg-[#1e2022] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2 shadow-sm w-full">
                             <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                               {SERVICE_OPTIONS.map(item => (
                                 <button
                                   key={item}
                                   onClick={() => toggleTempService(item)}
                                   className={cn(
                                     "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors flex justify-between items-center group",
                                     tempServices.includes(item)
                                       ? "bg-orange-50 border-orange-200 text-[#e67e22] dark:bg-orange-900/20 dark:border-orange-500/30"
                                       : "bg-slate-50 border-slate-200 dark:bg-[#17191b] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                                   )}
                                 >
                                   <span className="truncate pr-2">{item}</span>
                                   <div className={cn(
                                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                      tempServices.includes(item)
                                        ? "bg-[#e67e22] border-[#e67e22]"
                                        : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                                    )}>
                                      {tempServices.includes(item) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                 </button>
                               ))}
                             </div>
                             <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                               <button
                                 onClick={confirmServices}
                                 className="w-full bg-[#e67e22] hover:bg-orange-600 focus:ring-2 focus:ring-[#e67e22] outline-none text-white font-semibold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                               >
                                 Continue
                                 <ChevronRight className="w-4 h-4" />
                               </button>
                             </div>
                           </div>
                        </div>
                      )}

                      {msg.type === 'estimate' && (
                        <div className="w-[340px] bg-white dark:bg-[#1e2022] border border-slate-200 dark:border-slate-800 rounded-[20px] rounded-tl-sm shadow-xl overflow-hidden flex flex-col mt-2 hover:shadow-2xl transition-shadow duration-300">
                          <div className="bg-green-50 dark:bg-green-900/10 px-4 py-3 border-b border-green-100 dark:border-green-800/20 flex flex-col justify-center items-center text-center gap-1.5 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                             <div className="bg-white dark:bg-green-900/30 p-2 rounded-full shadow-sm mb-1 z-10">
                               <ShieldCheck className="w-6 h-6 text-green-500" />
                             </div>
                             <span className="font-extrabold text-green-800 dark:text-green-400 text-sm z-10 w-full truncate">Your AI Project Scope</span>
                          </div>
                          
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              {msg.content?.breakdown?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0 grow">
                                  <span className="text-slate-600 dark:text-slate-400 w-1/2 pr-2 leading-tight">{item.category}</span>
                                  <span className="font-semibold text-slate-900 dark:text-slate-200 text-right w-1/2 xs">{item.estimated_cost}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1 items-center text-center mt-2 shadow-inner">
                              <span className="font-bold text-slate-800 dark:text-slate-300 text-xs uppercase tracking-widest">Total Budget Range</span>
                              <span className="text-2xl font-black text-[#e67e22]">{msg.content?.totalRange}</span>
                            </div>
                            
                            <div className="text-[10px] text-slate-400 leading-tight text-center px-2">
                              * {msg.content?.disclaimer}
                            </div>
                          </div>
                          
                          <div className="p-3 pt-0 mt-auto">
                            <button 
                              onClick={() => window.print()}
                              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white p-3 font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                            >
                               Book Consultation
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                <div className="h-4 w-full shrink-0"></div>
              </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-[#1a1c1e] border-t border-slate-200 dark:border-slate-800 shrink-0 relative flex-col">
              <form 
                onSubmit={handleSendText}
                className={cn(
                  "relative flex items-end gap-2 transition-opacity duration-300",
                  !isTextInput || isLoading ? "opacity-30 pointer-events-none" : "opacity-100"
                )}
              >
                {currentField === 'layoutDescription' ? (
                  <textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendText();
                      }
                    }}
                    placeholder="Describe your layout..."
                    disabled={!isTextInput || isLoading}
                    className="flex-1 bg-slate-50 hover:bg-white focus:bg-white dark:bg-[#25282a] border border-slate-200 dark:border-slate-800 rounded-[18px] px-4 py-3 outline-none focus:ring-2 focus:ring-[#e67e22]/30 focus:border-[#e67e22] text-[15px] resize-none h-[80px] custom-scrollbar transition-all"
                  />
                ) : (
                  <input
                    type={currentField === 'email' ? 'email' : currentField === 'phone' ? 'tel' : currentField === 'sqft' ? 'number' : 'text'}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Type your response..."
                    disabled={!isTextInput || isLoading}
                    className="flex-1 bg-slate-50 hover:bg-white focus:bg-white dark:bg-[#25282a] border border-slate-200 dark:border-slate-800 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#e67e22]/30 focus:border-[#e67e22] text-[15px] h-[48px] transition-all"
                  />
                )}
                
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || !isTextInput || isLoading}
                  className="w-[48px] h-[48px] shrink-0 bg-[#e67e22] hover:bg-orange-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
