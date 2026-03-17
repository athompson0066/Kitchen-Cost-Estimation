/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, ArrowRight, User, AlertCircle, MapPin, Construction, CheckCircle2 } from 'lucide-react';
import { AgencyEstimator } from './components/AgencyEstimator';
import { KitchenEstimatorWidget } from './components/KitchenEstimatorWidget';

export default function App() {
  const [isAgencyPopupOpen, setIsAgencyPopupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-200 relative">
      {/* Hero Background Image */}
      <div className="absolute top-0 left-0 w-full h-[80vh] z-0 overflow-hidden">
        <img 
          src="https://tomhandyman.ca/images/resource/service-18.jpg" 
          alt="Kitchen Remodel" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/80 dark:bg-slate-900/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 dark:via-slate-900/80 dark:to-slate-900"></div>
      </div>
      
      {/* Landing Page Content */}
      <div className="pt-24 pb-32 px-6 lg:px-8 max-w-6xl mx-auto relative z-10 font-sans">
        
        {/* Header CTA */}
        <header className="flex justify-between items-center mb-24">
          <div className="flex items-center gap-3">
            <div className="bg-[#e67e22] text-white p-2 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">
              Aiolos<span className="text-[#e67e22]">Media</span>
            </span>
          </div>
        </header>

        {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-32"
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1] drop-shadow-lg">
              Stop Chasing Tire-Kickers.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e67e22] to-orange-400">
                Start Closing Projects.
              </span>
            </h1>
            <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
              The 2026 AI-Powered Kitchen Estimator for Pro Remodelers.
            </p>
            <button 
              onClick={() => setIsAgencyPopupOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#e67e22] hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-orange-500/20"
            >
              Try the Aiolos Estimator
            </button>
          </motion.div>



        {/* Features - Alternating Layout */}
        <div className="space-y-32 mb-32">
          
          {/* Feature 1: WHO (Text Left, Image Right) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sn">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">Built for the Modern Canadian Contractor</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                This isn't for the hobbyist. This is for the high-volume kitchen remodeler in cities like Toronto, Winnipeg, and Calgary who is tired of spending 5 hours a week driving to "look at jobs" that never materialize.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-6 h-6 text-[#e67e22] shrink-0" /> <span className="text-lg"><strong>Strategic Filtering:</strong> Filter out low-budget inquiries instantly.</span></li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-6 h-6 text-[#e67e22] shrink-0" /> <span className="text-lg"><strong>Immediate Trust:</strong> Professional, instant quotes build authority.</span></li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-6 h-6 text-[#e67e22] shrink-0" /> <span className="text-lg"><strong>24/7 Agent:</strong> Lead capture that works while your team is on-site.</span></li>
              </ul>
            </motion.div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 lg:h-[600px]"
            >
               <img src="/contractor_tablet_mockup.png" alt="Contractor using tablet" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            </motion.div>
          </div>

          {/* Feature 2: WHY & WHERE (Image Left, Text Right) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8 }}
               className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 lg:h-[600px] order-2 lg:order-1"
            >
               <img src="/luxury_kitchen.png" alt="Luxury Canadian Kitchen" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 space-y-12"
            >
              <div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">Because "Speed-to-Lead" is Everything</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  In 2026, if you don't respond to an inquiry with value within 5 minutes, you've already lost the job. Our tool uses grounded Canadian market data to provide realistic ranges instantly.
                </p>
              </div>
              
              <div>
                 <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Everywhere Your Customers Are</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>Widget:</strong> Float it on your homepage.</li>
                  <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>Social Bio:</strong> Convert Instagram clicks to leads.</li>
                  <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>Print:</strong> Scan QR codes from lawn signs.</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Feature 3: HOW (Horizontal Timeline) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="pt-16 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Construction className="w-6 h-6" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">The Seamless 3-Step Integration</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                We've made the tech invisible so you can focus on the construction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
              
              {/* Step 1 */}
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 shadow-xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">1</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Interaction</h4>
                <p className="text-slate-600 dark:text-slate-400">A homeowner answers 5 simple questions on your site via our sleek pop-up widget.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 shadow-xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">2</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Capture</h4>
                <p className="text-slate-600 dark:text-slate-400">Our AI instantly analyzes 2026 local pricing data and requests their contact info to unlock the report.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 shadow-xl flex items-center justify-center mb-6">
                   <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e67e22] to-orange-500 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">3</span>
                   </div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Delivery</h4>
                <p className="text-slate-600 dark:text-slate-400">You instantly get a Lead Alert breakdown. They receive a PDF estimate. You close the deal.</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* CTA Section */}
        <div className="text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-12 lg:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_theme(colors.white)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_theme(colors.slate.900)_1px,_transparent_0)] bg-[size:24px_24px]"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to put your lead gen on autopilot?</h2>
            <p className="text-lg text-slate-300 dark:text-slate-600 mb-8">Join the elite Canadian remodelers using Aiolos Media Intelligence.</p>
            <button 
              onClick={() => setIsAgencyPopupOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#e67e22] hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105"
            >
              Calculate Your Custom Integration
            </button>
          </div>
        </div>

      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#e67e22] text-white p-1.5 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Aiolos<span className="text-[#e67e22]">Media</span>
            </span>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Aiolos Media. All rights reserved.
          </p>
          
          <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-[#e67e22] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#e67e22] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#e67e22] transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Popups */}
      <AgencyEstimator isOpen={isAgencyPopupOpen} onClose={() => setIsAgencyPopupOpen(false)} />
      <KitchenEstimatorWidget />

    </div>
  );
}
