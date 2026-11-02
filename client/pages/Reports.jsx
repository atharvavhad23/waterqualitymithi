import React, { useState, useCallback } from 'react';

// --- Icon Components ---
// In a real app, these would be from a library like lucide-react
const FileText = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
const MapPin = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const Calendar = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y2="2"/><line x1="8" x2="8" y2="2"/><line x1="3" x2="21" y1="10"/></svg>
);
const AlertTriangle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17"/></svg>
);
const Droplets = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.02C8.23 8.5 7 9.82 7 11.5c0 .96.78 1.75 1.75 1.75"/>
    <path d="M10.41 9.92a2.2 2.2 0 0 0-1.44 3.2.5.5 0 0 1-.36.36c-1.3.56-2.61.03-3.2-1.12-1.24-2.4-1.03-5.3.5-7.4C7 3.82 8.7 3 10.5 3c2.7 0 5.2 2.7 5.5 5.5.3 2.4-1.1 4.5-3.1 5.5"/>
  </svg>
);
const Trash2 = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const UploadCloud = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
const UserX = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="16" y1="11" y2="17"/><line x1="16" x2="22" y1="11" y2="17"/></svg>
);


// --- Reusable Components ---
function Header() {
    return (
        <header className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <Droplets className="h-12 w-12 text-blue-600" />
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900">Mithi River Report Page</h1>
                </div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Real-time monitoring and analysis of water quality parameters
                </p>
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

// --- Main Report Page Component ---
function PollutionReportForm() {
    const [formData, setFormData] = useState({
        location: '',
        pollutionType: '',
        severity: '',
        incidentDate: '',
        description: '',
        isAnonymous: false,
    });
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [submittedReports, setSubmittedReports] = useState([]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...filesArray]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files)
                .filter(file => file.type.startsWith('image/'))
                .map(file => ({
                    file,
                    preview: URL.createObjectURL(file)
                }));
            setImages(prev => [...prev, ...filesArray]);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Form Data:", formData);
        console.log("Images:", images.map(i => i.file.name));
        
        // Create new report object
        const newReport = {
            id: submittedReports.length + 1,
            location: formData.location,
            pollutionType: formData.pollutionType,
            severity: formData.severity,
            date: formData.incidentDate || new Date().toISOString(),
            description: formData.description,
            status: "Pending Review",
            reportedBy: formData.isAnonymous ? "Anonymous" : "You",
            images: images.length,
            submittedAt: new Date().toISOString()
        };
        
        // Simulate API call
        setTimeout(() => {
            // Add to submitted reports
            setSubmittedReports(prev => [newReport, ...prev]);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="text-center max-w-md mx-auto py-12">
                 <FileText className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-gray-800">Report Submitted Successfully!</h2>
                <p className="mt-2 text-gray-600">Thank you for helping keep the Mithi River clean. Your report has been received and will be reviewed shortly.</p>
                <button onClick={() => { setIsSubmitted(false); setImages([]); setFormData({ location: '', pollutionType: '', severity: '', incidentDate: '', description: '', isAnonymous: false }); }} className="mt-6 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 transition">
                    Submit another report
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6">
                    <FileText className="w-8 h-8 text-white"/>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Report a Pollution Incident</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Help us protect our river ecosystem. If you witness pollution or environmental concerns, report them here to help maintain water quality standards.</p>
                
                {/* View Reports Button */}
                <div className="mt-8">
                    <button
                        onClick={() => setShowReportsModal(true)}
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                    >
                        <FileText className="w-5 h-5 mr-2"/>
                        View Previous Reports
                    </button>
                </div>
            </div>

            {/* Reports Modal */}
            {showReportsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Previous Pollution Reports</h2>
                                <button
                                    onClick={() => setShowReportsModal(false)}
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
                            {submittedReports.length === 0 ? (
                                /* Empty State */
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        You haven't submitted any pollution reports yet. Submit your first report below and it will appear here for tracking.
                                    </p>
                                </div>
                            ) : (
                                /* Reports List */
                                <div className="space-y-6">
                                    {submittedReports.map((report) => (
                                        <div key={report.id} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                                            {/* Report Header */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-4 h-4 rounded-full ${
                                                        report.status === 'Resolved' ? 'bg-green-500' :
                                                        report.status === 'In Progress' ? 'bg-yellow-500' :
                                                        report.status === 'Under Investigation' ? 'bg-blue-500' :
                                                        'bg-gray-500'
                                                    }`}></div>
                                                    <div>
                                                        <h3 className="font-semibold text-xl text-gray-900">{report.location}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">Report #{report.id} • {new Date(report.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                                        report.severity === 'High' ? 'bg-red-100 text-red-800' :
                                                        report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {report.severity} Priority
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Submitted {new Date(report.submittedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Report Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Pollution Type</p>
                                                    <p className="text-base text-gray-600">{report.pollutionType}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                                                    <p className="text-base text-gray-600">{report.status}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Reported By</p>
                                                    <p className="text-base text-gray-600">{report.reportedBy}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Evidence</p>
                                                    <p className="text-base text-gray-600">{report.images} image(s)</p>
                                                </div>
                                            </div>
                                            
                                            {/* Description */}
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-3">Description</p>
                                                <p className="text-base text-gray-600 leading-relaxed">{report.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowReportsModal(false)}
                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                
                {/* --- Box 1: Incident Details --- */}
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
                    <h2 className="text-xl font-bold text-gray-800 border-b border-gradient-to-r from-blue-200 to-cyan-200 pb-4 mb-6 flex items-center">
                        <AlertTriangle className="w-6 h-6 text-blue-600 mr-3"/>
                        Incident Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Box 1: Location */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                             <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location / Landmark</label>
                            <div className="relative">
                                <MapPin className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 z-10"/>
                                <input type="text" name="location" id="location" required value={formData.location} onChange={handleInputChange} className="pl-10 w-full rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80" placeholder="e.g., Near BKC bridge" />
                            </div>
                        </div>

                        {/* Box 2: Pollution Type */}
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-200/50 hover:shadow-lg transition-all duration-300">
                            <label htmlFor="pollutionType" className="block text-sm font-medium text-gray-700 mb-2">Type of Pollution</label>
                            <select id="pollutionType" name="pollutionType" required value={formData.pollutionType} onChange={handleInputChange} className="w-full rounded-lg border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500 bg-white/80">
                                <option value="">Select a type...</option>
                                <option>Solid Waste / Garbage</option>
                                <option>Industrial Discharge</option>
                                <option>Water Discoloration</option>
                                <option>Construction Debris</option>
                                <option>Other</option>
                            </select>
                        </div>
                        
                        {/* Box 3: Severity */}
                        <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 rounded-xl border border-teal-200/50 hover:shadow-lg transition-all duration-300">
                             <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                             <select id="severity" name="severity" required value={formData.severity} onChange={handleInputChange} className="w-full rounded-lg border-teal-300 focus:border-teal-500 focus:ring-teal-500 bg-white/80">
                                <option value="">Select severity...</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>

                        {/* Box 4: Date */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border border-green-200/50 hover:shadow-lg transition-all duration-300">
                            <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-2">Date and Time of Incident</label>
                            <div className="relative">
                                <Calendar className="w-5 h-5 text-green-500 absolute left-3 top-1/2 -translate-y-1/2 z-10"/>
                                <input type="datetime-local" name="incidentDate" id="incidentDate" required value={formData.incidentDate} onChange={handleInputChange} className="pl-10 w-full rounded-lg border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80" />
                            </div>
                        </div>

                        {/* Box 5: Description */}
                        <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200/50 hover:shadow-lg transition-all duration-300">
                             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                             <textarea id="description" name="description" rows="4" required value={formData.description} onChange={handleInputChange} className="w-full rounded-lg border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white/80 p-4" placeholder="Provide detailed information about the pollution incident:&#10;&#10;• What type of pollution did you observe?&#10;• Source of pollution if known&#10;• Severity and impact&#10;• Any other relevant details"></textarea>
                        </div>
                    </div>
                </div>

                {/* --- Box 2: Evidence & Submission Options --- */}
                 <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b border-gradient-to-r from-blue-200 to-cyan-200 pb-4 flex items-center">
                        <UploadCloud className="w-6 h-6 text-blue-600 mr-3"/>
                        Evidence & Reporting Options
                    </h2>
                    
                    {/* Image Upload */}
                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images (Optional)</label>
                        <div 
                            className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 hover:border-blue-400 transition-colors"
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="text-center">
                               <UploadCloud className="mx-auto h-12 w-12 text-gray-400"/>
                                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                                        <span>Upload files</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                        {/* Image Previews */}
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img src={image.preview} alt={`preview ${index}`} className="h-28 w-full object-cover rounded-lg"/>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                             <button type="button" onClick={() => removeImage(index)} className="p-2 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                     {/* Box 6: Anonymous Submission */}
                     <div className="!mt-8 bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start">
                        <div className="flex h-6 items-center">
                            <input id="isAnonymous" name="isAnonymous" type="checkbox" checked={formData.isAnonymous} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                            <label htmlFor="isAnonymous" className="font-medium text-gray-900">Submit Anonymously</label>
                            <p className="text-gray-500">Your personal information will not be submitted with this report.</p>
                        </div>
                    </div>
                 </div>

                {/* Submit Button */}
                <div className="text-center">
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 border border-transparent rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105">
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Submitting Report...
                            </>
                        ) : (
                            <>
                                <FileText className="w-5 h-5 mr-2"/>
                                Submit Pollution Report
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}


// --- Main App Component ---
export default function Reports() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main>
        <PollutionReportForm />
      </main>
      <Footer />
    </div>
  )
}