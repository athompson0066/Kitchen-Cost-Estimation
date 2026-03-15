/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
        <div className="text-center max-w-4xl mx-auto mb-20">
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
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> <strong>Website Popup:</strong> A sleek, floating widget that captures attention. (See bottom right!)</li>
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
              onClick={() => setIsAgencyPopupOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#e67e22] hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105"
            >
              Calculate Your Custom Integration
            </button>
          </div>
        </div>

      </div>
      
      {/* Popups */}
      <AgencyEstimator isOpen={isAgencyPopupOpen} onClose={() => setIsAgencyPopupOpen(false)} />
      <KitchenEstimatorWidget />

    </div>
  );
}
