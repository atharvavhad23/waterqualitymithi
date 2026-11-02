import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// A simple RouterLink component to stand in for react-router-dom's Link
const RouterLink = ({ to, children, className }) => (
    <Link to={to} className={className}>
        {children}
    </Link>
);

// --- Icon Components (in a real project, these would be from a library) ---
// This icon has been updated to the wave symbol you provided.
const AppIcon = (props) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M 10 20 C 30 5, 70 35, 90 20" stroke="#42A5F5" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 10 40 C 30 25, 70 55, 90 40" stroke="#42A5F5" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 10 60 C 30 45, 70 75, 90 60" stroke="#42A5F5" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 10 80 C 30 65, 70 95, 90 80" stroke="#42A5F5" strokeWidth="8" strokeLinecap="round"/>
    </svg>
);
const FlaskConical = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.2 21.7a1.7 1.7 0 0 1-1.2-1.2L4.5 9.5a1.7 1.7 0 0 1 1.2-2.3l10.3-3.6a1.7 1.7 0 0 1 2.3 1.2l4.5 10.8a1.7 1.7 0 0 1-1.2 2.3L8.5 21.8a1.7 1.7 0 0 1-1.2.1z"/><path d="m14 11-3 3"/><path d="M11 14l3-3"/></svg>
);
const CheckCircle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
);
const Waves = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
);
const Wind = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
);
const Shield = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const TrendingUp = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
const MapPin = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const BarChart2 = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);
const Users = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>
);
const ClipboardCheck = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
);
const ChevronRight = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);
const Eye = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

// --- App Structure ---

function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28 bg-gray-50 overflow-hidden">
            <div className="absolute top-0 right-0 -mr-48 mt-20 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-32 mb-20 w-80 h-80 bg-blue-200/30 rounded-full filter blur-3xl opacity-50"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-1 mb-4">
                        <span className="text-4xl md:text-5xl">🌊</span>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight">
                            Mithi River Guardian
                        </h1>
                    </div>
                    <p className="mt-4 text-xl font-medium text-gray-700">
                        Monitor Water Quality
                    </p>
                    <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto">
                        Advanced water quality monitoring and analysis platform powered by machine learning. Get real-time insights, predictive analytics, and comprehensive reports for water safety.
                    </p>
                    <div className="mt-8 flex justify-center space-x-4">
                        <RouterLink to="/register" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 transition">
                            Start Monitoring <ChevronRight className="w-5 h-5 ml-2" />
                        </RouterLink>
                        <RouterLink to="/demo" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition">
                            View Demo
                        </RouterLink>
                    </div>
                </div>
                
                {/* Water Quality Index Dashboard - Below main content */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50">
                       <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Water Quality Index</h3>
                            <div className="flex items-center space-x-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-medium text-green-600">Live</span>
                            </div>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-gray-100/60 p-4 rounded-xl border border-gray-200/50">
                                <div className="flex items-center text-sm text-gray-500">
                                    <FlaskConical className="w-4 h-4 mr-2 text-blue-500"/>
                                    <span>pH Level</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 mt-1">7.2</p>
                            </div>
                            <div className="bg-gray-100/60 p-4 rounded-xl border border-gray-200/50">
                                <div className="flex items-center text-sm text-gray-500">
                                    <TrendingUp className="w-4 h-4 mr-2 text-green-500"/>
                                    <span>Quality</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 mt-1">85%</p>
                            </div>
                            <div className="bg-gray-100/60 p-4 rounded-xl border border-gray-200/50">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Waves className="w-4 h-4 mr-2 text-teal-500"/>
                                    <span>Turbidity</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0.8 <span className="text-base font-normal text-gray-500">NTU</span></p>
                            </div>
                            <div className="bg-gray-100/60 p-4 rounded-xl border border-gray-200/50">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Eye className="w-4 h-4 mr-2 text-sky-500"/>
                                    <span>Dissolved O₂</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 mt-1">8.2 <span className="text-base font-normal text-gray-500">mg/L</span></p>
                            </div>
                       </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Features() {
    const featuresList = [
        { icon: Shield, title: "Real-time Monitoring", description: "Continuous monitoring of water quality parameters with instant alerts and notifications for any anomalies." },
        { icon: TrendingUp, title: "Predictive Analytics", description: "AI-powered predictions to forecast water quality trends and prevent contamination before it happens." },
        { icon: MapPin, title: "Geographic Mapping", description: "Interactive maps showing water quality data across different locations with detailed geographic insights." },
        { icon: BarChart2, title: "Advanced Analytics", description: "Comprehensive reports and visualizations to help you understand water quality patterns and trends." },
        { icon: Users, title: "Multi-user Access", description: "Collaborative platform allowing multiple stakeholders to access and share water quality data securely." },
        { icon: ClipboardCheck, title: "Compliance Tracking", description: "Ensure compliance with environmental regulations and standards with automated tracking and reporting." },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Comprehensive Water Quality Solutions</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Our platform provides everything you need to monitor, analyze, and ensure water quality standards.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {featuresList.map((feature, index) => (
                        <div key={index} className="p-8 rounded-2xl transition-all duration-300 bg-gray-50/70 opacity-75 hover:opacity-100 hover:bg-white hover:shadow-xl hover:transform hover:-translate-y-2">
                            <div className="inline-block p-4 bg-blue-100/70 text-blue-600 rounded-xl mb-4">
                                <feature.icon className="w-8 h-8"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                            <p className="mt-2 text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Stats() {
    const statsList = [
        { value: "24/7", label: "Real-time Monitoring" },
        { value: "99.9%", label: "System Uptime" },
        { value: "1M+", label: "Data Points Analyzed" },
    ];

    return (
        <section className="bg-blue-600 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center py-12">
                    {statsList.map((stat, index) => (
                        <div key={index}>
                            <p className="text-4xl font-extrabold">{stat.value}</p>
                            <p className="mt-1 text-blue-200">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTA() {
    return (
        <section className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Start Monitoring Water Quality?</h2>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">Join thousands of organizations using AquaMonitor for reliable water quality analysis.</p>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} Mithi River Guardian. All rights reserved.</p>
                <p className="text-xs mt-2">
                    <a href="https://www.flaticon.com/free-icons/clean" title="clean icons" className="hover:text-blue-600">
                        Clean icons created by Freepik - Flaticon
                    </a>
                </p>
            </div>
        </footer>
    );
}

export default function Home() {
  return (
    <div className="bg-white">
        <div className="fixed top-0 right-0 p-6 z-50">
            <div className="flex items-center space-x-4">
                <RouterLink to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Sign In
                </RouterLink>
                <RouterLink to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    Get Started
                </RouterLink>
            </div>
        </div>
      <main>
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}