import React, { useState, Fragment } from 'react';

// --- Icon Components ---
// In a real app, you'd use a library like lucide-react
const Calendar = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y2="2"/><line x1="8" x2="8" y2="2"/><line x1="3" x2="21" y1="10"/></svg>
);
const MapPin = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const Users = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>
);
const Droplets = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.02C8.23 8.5 7 9.82 7 11.5c0 .96.78 1.75 1.75 1.75"/>
    <path d="M10.41 9.92a2.2 2.2 0 0 0-1.44 3.2.5.5 0 0 1-.36.36c-1.3.56-2.61.03-3.2-1.12-1.24-2.4-1.03-5.3.5-7.4C7 3.82 8.7 3 10.5 3c2.7 0 5.2 2.7 5.5 5.5.3 2.4-1.1 4.5-3.1 5.5"/>
  </svg>
);
const X = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const Plus = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const CheckCircle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
);
const FileText = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);

// --- Sample Data ---
const upcomingEvents = [
    {
        id: 1,
        title: "Mahim Causeway Coastal Cleanup",
        date: "2025-10-25",
        location: "Mahim Causeway, Mumbai",
        volunteersSignedUp: 42,
        volunteersNeeded: 60,
        description: "Join us for a large-scale cleanup of the Mahim Causeway coastline. We'll be focusing on removing plastic waste and other debris that threatens marine life. All equipment will be provided.",
        whatToBring: ["Reusable water bottle", "Sunscreen and a hat", "Sturdy closed-toe shoes"],
        imageUrl: "https://placehold.co/600x400/3498db/ffffff?text=Cleanup+Drive"
    },
    {
        id: 2,
        title: "BKC Mithi River Bank Restoration",
        date: "2025-11-08",
        location: "Near BKC Connector, Mumbai",
        volunteersSignedUp: 28,
        volunteersNeeded: 40,
        description: "This drive focuses on the river banks near the Bandra-Kurla Complex. We will be clearing garbage and planting native saplings to help restore the natural habitat.",
        whatToBring: ["Gardening gloves (if you have them)", "Comfortable clothing", "A positive attitude!"],
        imageUrl: "https://placehold.co/600x400/2ecc71/ffffff?text=Restoration"
    },
    {
        id: 3,
        title: "Dharavi Estuary Cleanup",
        date: "2025-11-22",
        location: "Mithi River Estuary, Dharavi",
        volunteersSignedUp: 55,
        volunteersNeeded: 75,
        description: "A critical cleanup drive at the Mithi River estuary. This area accumulates a lot of waste, and our efforts here can make a huge impact on the river's health. In collaboration with local community leaders.",
        whatToBring: ["Rain boots or waterproof footwear", "A reusable bag for your belongings", "Energy and enthusiasm"],
        imageUrl: "https://placehold.co/600x400/e74c3c/ffffff?text=Community+Effort"
    }
];

const pastDrives = [
    { id: 1, title: "Powai Lake Cleanup", stat: "250kg of waste", imageUrl: "https://placehold.co/600x400/9b59b6/ffffff?text=Success!" },
    { id: 2, title: "Sanjay Gandhi Park Drive", stat: "150+ Volunteers", imageUrl: "https://placehold.co/600x400/f1c40f/ffffff?text=Big+Turnout!" },
    { id: 3, title: "Bandra Bandstand Cleanup", stat: "50 Trees Planted", imageUrl: "https://placehold.co/600x400/1abc9c/ffffff?text=Making+it+Green" },
];


// --- Reusable Components ---
function Header() {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 left-0 right-0 z-50 border-b border-gray-200/70">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <Droplets className="h-8 w-8 text-blue-600" />
                        <div>
                            <span className="text-xl font-bold text-gray-800">Mithi River Guardian</span>
                            <p className="text-xs text-gray-500">Community Cleanup Drives</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer className="bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} Mithi River Guardian. All rights reserved.</p>
            </div>
        </footer>
    );
}

function EventModal({ event, onClose }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        setIsRegistering(true);
        
        // Save registration to localStorage
        const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
        const registrationData = {
            id: Date.now(),
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            registrationDate: new Date().toISOString(),
            status: 'Registered'
        };
        
        registeredEvents.push(registrationData);
        localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
        
        // Simulate API call
        setTimeout(() => {
            setIsRegistering(false);
            setIsSubmitted(true);
        }, 1500);
    };

    if (!event) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-8 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200">
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{event.title}</h2>
                            <div className="flex items-center space-x-4 text-gray-600 mt-4">
                                <div className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-500" /> {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</div>
                                <div className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-500" /> {event.location}</div>
                            </div>
                            <p className="mt-4 text-gray-700">{event.description}</p>

                            <div className="mt-6">
                                <h3 className="font-bold text-gray-800">What to Bring:</h3>
                                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                                    {event.whatToBring.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <img src={event.imageUrl} alt={event.title} className="rounded-lg object-cover w-full h-48 mb-6" />
                            {isSubmitted ? (
                                <div className="bg-green-50 border border-green-200 text-center p-8 rounded-lg">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                                    <h3 className="text-xl font-bold text-green-800">You're Registered!</h3>
                                    <p className="mt-2 text-green-700">Thank you for joining the cause. We've sent a confirmation to your email. See you there!</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-xl font-bold text-center text-gray-800">Volunteer Registration</h3>
                                    <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="name" className="sr-only">Full Name</label>
                                            <input type="text" id="name" required placeholder="Full Name" className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"/>
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="sr-only">Email Address</label>
                                            <input type="email" id="email" required placeholder="Email Address" className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-3"/>
                                        </div>
                                        <button type="submit" disabled={isRegistering} className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 transition disabled:bg-blue-400">
                                            {isRegistering ? 'Registering...' : 'Register Now'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Page Sections ---

function UpcomingDrives({ onEventClick, showRegistrationsModal, setShowRegistrationsModal }) {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Upcoming Cleanup Drives</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Join our community of volunteers and make a direct impact on the health of the Mithi River. Find an event near you and sign up today.
                    </p>
                    
                    {/* View Registered Events Button */}
                    <div className="mt-8">
                        <button
                            onClick={() => setShowRegistrationsModal(true)}
                            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                        >
                            <FileText className="w-5 h-5 mr-2"/>
                            View Registered Events
                        </button>
                    </div>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group">
                            <img src={event.imageUrl} alt={event.title} className="h-56 w-full object-cover"/>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</div>
                                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {event.location}</div>
                                </div>
                                <div className="mt-4 flex-grow">
                                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(event.volunteersSignedUp / event.volunteersNeeded) * 100}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                                        <span><span className="font-bold">{event.volunteersSignedUp}</span> signed up</span>
                                        <span><span className="font-bold">{event.volunteersNeeded}</span> needed</span>
                                    </div>
                                </div>
                                <button onClick={() => onEventClick(event)} className="mt-6 w-full inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 transition group-hover:scale-105 transform">
                                    View Details & Register
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function HostDriveCTA() {
    return (
        <section className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-blue-600 text-white rounded-2xl p-12 text-center shadow-xl">
                    <h2 className="text-3xl font-extrabold">Want to organize a cleanup?</h2>
                    <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">Lead the change in your community. We'll provide the support and resources you need to host a successful cleanup drive.</p>
                    <button className="mt-8 inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-600 bg-white border border-transparent rounded-lg shadow-sm hover:bg-blue-50 transition">
                       <Plus className="w-6 h-6 mr-3"/> Host Your Own Drive
                    </button>
                </div>
            </div>
        </section>
    );
}

function PastDrives() {
    return (
        <section className="py-20 bg-gray-50">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Our Past Successes</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Take a look at the incredible impact our community has made together. Every volunteer, every bag of trash, makes a difference.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {pastDrives.map(drive => (
                        <div key={drive.id} className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <img src={drive.imageUrl} alt={drive.title} className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6 text-white">
                                <h3 className="text-xl font-bold">{drive.title}</h3>
                                <p className="mt-1 text-lg font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">{drive.stat}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>
    );
}

// --- Registered Events Modal Component ---
function RegisteredEventsModal({ showModal, setShowModal }) {
    const [registeredEvents, setRegisteredEvents] = useState([]);

    // Load registered events from localStorage on component mount
    React.useEffect(() => {
        const events = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
        setRegisteredEvents(events);
    }, [showModal]);

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">My Registered Events</h2>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Modal Content - Scrollable */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {registeredEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Registered Events</h3>
                            <p className="text-gray-500">You haven't registered for any cleanup events yet. Browse upcoming events and sign up to make a difference!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {registeredEvents.map((registration) => (
                                <div key={registration.id} className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <CheckCircle className="w-6 h-6 text-green-600"/>
                                                <h3 className="text-xl font-bold text-gray-900">{registration.eventTitle}</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-green-600"/>
                                                    <span>Event Date: {new Date(registration.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-green-600"/>
                                                    <span>{registration.eventLocation}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-green-600"/>
                                                    <span>Registered: {new Date(registration.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-green-600"/>
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">{registration.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Main App Component ---
export default function Cleanup() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);

    return (
        <div className="bg-white min-h-screen">
            <Header />
            <main>
                <UpcomingDrives 
                    onEventClick={setSelectedEvent} 
                    showRegistrationsModal={showRegistrationsModal}
                    setShowRegistrationsModal={setShowRegistrationsModal}
                />
                <HostDriveCTA />
                <PastDrives />
            </main>
            <Footer />
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
            <RegisteredEventsModal 
                showModal={showRegistrationsModal} 
                setShowModal={setShowRegistrationsModal} 
            />
        </div>
    );
}