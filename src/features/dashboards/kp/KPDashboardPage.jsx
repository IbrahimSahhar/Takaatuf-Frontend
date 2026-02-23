/* eslint-disable react-hooks/set-state-in-effect */
// filepath: src/features/dashboards/kp/KPDashboardPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiMapPin, FiChevronDown, FiAlertCircle } from "react-icons/fi";

/**
 * Knowledge Provider (KP) Dashboard
 * Added: Confirmation Modal for accepting requests.
 * Fixed: Removed "Create New Request" button from available requests section.
 */

// --- HELPERS ---

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
};

// --- SUB-COMPONENTS ---

function FilterBar({ totalCount, onSearch, activeCategory, setActiveCategory }) {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted small fw-medium">{totalCount} Requests Found</div>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-3 bg-white shadow-sm px-3">
          <FiFilter /> Filters
        </button>
      </div>
      
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <div className="position-relative" style={{ minWidth: '280px' }}>
          <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input 
            type="text" 
            className="form-control ps-5 rounded-3 border-light shadow-sm" 
            placeholder="Search requests..." 
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {['Content Writing', 'Design', 'Development', 'Software', 'Research'].map(cat => (
          <button 
            key={cat} 
            className={`btn btn-sm rounded-pill px-3 border shadow-sm transition-all ${activeCategory === cat ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function KPDashboardPage() {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [data, setData] = useState({ earnings: 1234.56, requests: [] });
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Load initial mock data
  const loadData = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        requests: [
          { id: "1", category: "Software", title: "Debug API Integration for E-commerce Platform", description: "Identify and resolve issues with product catalog API synchronization.", location: "Downtown Office", payout: 250, progress: 75, status: "In Progress", type: "active", createdAt: "2026-02-01" },
          { id: "2", category: "Research", title: "Market Analysis for SaaS Product Launch", description: "Gather data on competitor pricing and target audience demographics.", location: "Remote", payout: 400, progress: 90, status: "Awaiting Review", type: "active", createdAt: "2026-02-02" },
          { id: "5", category: "Design", title: "Review UI kit consistency", location: "Remote", payout: 180, kpsNeeded: 1, type: "available", createdAt: "2026-02-05" },
          { id: "6", category: "Content Writing", title: "Onboarding email sequence", location: "Remote", payout: 120, kpsNeeded: 2, type: "available", createdAt: "2026-02-04" },
          { id: "7", category: "Development", title: "Fix dashboard sorting", location: "Tech Hub", payout: 150, type: "completed", completionDate: "2026-01-25", status: "Paid" },
          { id: "8", category: "Research", title: "Market Survey Analysis", location: "Remote", payout: 300, type: "completed", completionDate: "2026-01-20", status: "Completed" }
        ]
      }));
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- ACTIONS ---

  // Trigger modal before accepting
  const triggerAcceptModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const confirmAcceptRequest = () => {
    if (!selectedTask) return;
    
    setData(prev => ({
      ...prev,
      requests: prev.requests.map(req => 
        req.id === selectedTask.id ? { ...req, type: 'active', status: 'In Progress', progress: 0 } : req
      )
    }));
    
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleViewDetails = (req) => {
    if (req.type === 'available') {
      navigate(`/task-preview/${req.id}`, { state: { task: req } });
    } else if (req.type === 'completed') {
      navigate(`/task-completed/${req.id}`, { state: { task: req } });
    } else {
      navigate(`/task/${req.id}`, { state: { task: req } });
    }
  };

  // --- MEMOS ---

  const filteredAvailable = useMemo(() => {
    return data.requests.filter(r => 
      r.type === 'available' &&
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!activeCategory || r.category === activeCategory)
    );
  }, [data.requests, searchQuery, activeCategory]);

  const activeReqs = data.requests.filter(r => r.type === 'active');
  const completedReqs = data.requests.filter(r => r.type === 'completed');

  if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container" style={{ maxWidth: '1050px' }}>
        
        {/* EARNINGS SUMMARY SECTION */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body d-flex justify-content-between align-items-center p-4">
            <div>
                <h5 className="mb-0 fw-bold">Earnings Summary</h5>
                <p className="small text-muted mb-0">Total earned since last payout.</p>
            </div>
            <h2 className="fw-bold text-primary mb-0">{formatCurrency(data.earnings)}</h2>
          </div>
        </div>

        {/* ACTIVE REQUESTS SECTION */}
        {activeReqs.length > 0 && (
          <section className="mb-5">
            <h5 className="fw-bold mb-4">Active Requests</h5>
            {activeReqs.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 border-0" style={{ fontSize: '0.7rem' }}>{req.category}</span>
                    <span className="small fw-bold text-dark" style={{ fontSize: '0.75rem' }}>{req.status}</span>
                  </div>
                  
                  <h6 className="fw-bold mb-1" style={{ fontSize: '1.05rem' }}>{req.title}</h6>
                  <p className="text-muted small mb-2">{req.description}</p>
                  
                  <div className="small text-muted mb-2">
                    <FiMapPin size={14} className="me-1" /> {req.location}
                  </div>
                  
                  <div className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                    Payout: {formatCurrency(req.payout)}
                  </div>
                  
                  <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                    Progress: {req.progress}%
                  </div>

                  <div className="d-flex align-items-center gap-3 mt-1">
                    <div className="flex-grow-1">
                        <div className="progress" style={{ height: 4, borderRadius: 10 }}>
                            <div className="progress-bar" style={{ width: `${req.progress}%` }}></div>
                        </div>
                    </div>
                    <button className="btn btn-light btn-sm rounded-3 border shadow-sm px-3" style={{ fontSize: '0.8rem' }} onClick={() => handleViewDetails(req)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* AVAILABLE REQUESTS SECTION */}
        <section className="mb-5">
          <h5 className="fw-bold mb-3">Available Requests</h5>
          <FilterBar totalCount={filteredAvailable.length} onSearch={setSearchQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          {filteredAvailable.map(req => (
            <div key={req.id} className="card border-0 shadow-sm rounded-4 mb-3 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-info-subtle text-dark rounded-pill mb-2">{req.category}</span>
                  <h6 className="fw-bold mb-1">{req.title}</h6>
                  <div className="small text-muted"><FiMapPin /> {req.location} | Payout: {formatCurrency(req.payout)}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-light btn-sm rounded-pill px-3 border" onClick={() => handleViewDetails(req)}>Details</button>
                  <button className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onClick={() => triggerAcceptModal(req)}>Accept Request</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* COMPLETED REQUESTS ACCORDION */}
        <div className="card border-0 shadow-sm rounded-4 mb-5 overflow-hidden">
          <div 
            className="card-header bg-white p-3 d-flex justify-content-between align-items-center border-0" 
            style={{ cursor: 'pointer' }}
            onClick={() => setIsCompletedOpen(!isCompletedOpen)}
          >
            <h6 className="fw-bold mb-0">Completed Requests ({completedReqs.length})</h6>
            <FiChevronDown style={{ transform: isCompletedOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
          </div>
          
          {isCompletedOpen && (
            <div className="card-body p-0 border-top">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light small text-muted">
                    <tr>
                      <th className="ps-4 border-0 py-3">Task Title</th>
                      <th className="border-0 py-3">Category</th>
                      <th className="border-0 py-3">Date</th>
                      <th className="pe-4 border-0 py-3 text-end">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedReqs.map(req => (
                      <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(req)}>
                        <td className="ps-4 fw-bold text-dark">{req.title}</td>
                        <td><span className="badge bg-light text-dark border rounded-pill px-3">{req.category}</span></td>
                        <td className="text-muted small">{formatDate(req.completionDate)}</td>
                        <td className="pe-4 text-end fw-bold text-primary">{formatCurrency(req.payout)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* CONFIRMATION MODAL */}
        {showModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content border-0 shadow-lg rounded-4">
                  <div className="modal-body p-4 text-center">
                    <div className="mb-3 text-warning">
                      <FiAlertCircle size={48} />
                    </div>
                    <h5 className="fw-bold mb-2">Accept this Request?</h5>
                    <p className="text-muted small px-3">
                      By accepting "<strong>{selectedTask?.title}</strong>", it will be added to your active tasks. Please ensure you can complete it within the required timeframe.
                    </p>
                    <div className="d-flex gap-2 mt-4">
                      <button 
                        type="button" 
                        className="btn btn-light flex-grow-1 rounded-pill border py-2 fw-medium" 
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary flex-grow-1 rounded-pill py-2 fw-medium shadow-sm" 
                        onClick={confirmAcceptRequest}
                      >
                        Yes, Accept
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// /* eslint-disable react-hooks/set-state-in-effect */
// // filepath: src/features/dashboards/kp/KPDashboardPage.jsx
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { FiSearch, FiFilter, FiMapPin, FiChevronDown, FiCheckCircle } from "react-icons/fi";

// /**
//  * Knowledge Provider (KP) Dashboard
//  * Refined Active Requests to match provided UI design.
//  */

// // Helper to format currency values
// const formatCurrency = (amount) =>
//   new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

// // Helper to format dates for display
// const formatDate = (iso) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
// };

// // --- SUB-COMPONENTS ---

// function FilterBar({ totalCount, onSearch, activeCategory, setActiveCategory }) {
//   return (
//     <div className="mb-4">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="text-muted small fw-medium">{totalCount} Requests Found</div>
//         <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-3 bg-white shadow-sm px-3">
//           <FiFilter /> Filters
//         </button>
//       </div>
      
//       <div className="d-flex flex-wrap gap-2 align-items-center">
//         <div className="position-relative" style={{ minWidth: '280px' }}>
//           <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
//           <input 
//             type="text" 
//             className="form-control ps-5 rounded-3 border-light shadow-sm" 
//             placeholder="Search requests..." 
//             onChange={(e) => onSearch(e.target.value)}
//           />
//         </div>

//         {['Content Writing', 'Design', 'Development', 'Software', 'Research'].map(cat => (
//           <button 
//             key={cat} 
//             className={`btn btn-sm rounded-pill px-3 border shadow-sm transition-all ${activeCategory === cat ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
//             onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
//           >
//             {cat}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function KPDashboardPage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [data, setData] = useState({ earnings: 1234.56, requests: [] });
//   const [isCompletedOpen, setIsCompletedOpen] = useState(false);

//   // Load initial mock data
//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setTimeout(() => {
//       setData(prev => ({
//         ...prev,
//         requests: [
//           { id: "1", category: "Software", title: "Debug API Integration for E-commerce Platform", description: "Identify and resolve issues with product catalog API synchronization.", location: "Downtown Office", payout: 250, progress: 75, status: "In Progress", type: "active", createdAt: "2026-02-01" },
//           { id: "2", category: "Research", title: "Market Analysis for SaaS Product Launch", description: "Gather data on competitor pricing and target audience demographics.", location: "Remote", payout: 400, progress: 90, status: "Awaiting Review", type: "active", createdAt: "2026-02-02" },
//           { id: "5", category: "Design", title: "Review UI kit consistency", location: "Remote", payout: 180, kpsNeeded: 1, type: "available", createdAt: "2026-02-05" },
//           { id: "6", category: "Content Writing", title: "Onboarding email sequence", location: "Remote", payout: 120, kpsNeeded: 2, type: "available", createdAt: "2026-02-04" },
//           { id: "7", category: "Development", title: "Fix dashboard sorting", location: "Tech Hub", payout: 150, type: "completed", completionDate: "2026-01-25", status: "Paid" },
//           { id: "8", category: "Research", title: "Market Survey Analysis", location: "Remote", payout: 300, type: "completed", completionDate: "2026-01-20", status: "Completed" }
//         ]
//       }));
//       setLoading(false);
//     }, 600);
//   }, []);

//   useEffect(() => { loadData(); }, [loadData]);

//   // Handle Accept logic
//   const handleAcceptRequest = (id) => {
//     setData(prev => ({
//       ...prev,
//       requests: prev.requests.map(req => 
//         req.id === id ? { ...req, type: 'active', status: 'In Progress', progress: 0 } : req
//       )
//     }));
//   };

//   // Navigation based on task type
//   const handleViewDetails = (req) => {
//     if (req.type === 'available') {
//       navigate(`/task-preview/${req.id}`, { state: { task: req } });
//     } else if (req.type === 'completed') {
//       navigate(`/task-completed/${req.id}`, { state: { task: req } });
//     } else {
//       navigate(`/task/${req.id}`, { state: { task: req } });
//     }
//   };

//   const filteredAvailable = useMemo(() => {
//     return data.requests.filter(r => 
//       r.type === 'available' &&
//       r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
//       (!activeCategory || r.category === activeCategory)
//     );
//   }, [data.requests, searchQuery, activeCategory]);

//   const activeReqs = data.requests.filter(r => r.type === 'active');
//   const completedReqs = data.requests.filter(r => r.type === 'completed');

//   if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-primary"></div></div>;

//   return (
//     <div className="bg-light min-vh-100 py-4">
//       <div className="container" style={{ maxWidth: '1050px' }}>
        
//         {/* EARNINGS SUMMARY SECTION */}
//         <div className="card border-0 shadow-sm rounded-4 mb-4">
//           <div className="card-body d-flex justify-content-between align-items-center p-4">
//             <div>
//                 <h5 className="mb-0 fw-bold">Earnings Summary</h5>
//                 <p className="small text-muted mb-0">Total earned since last payout.</p>
//             </div>
//             <h2 className="fw-bold text-primary mb-0">{formatCurrency(data.earnings)}</h2>
//           </div>
//         </div>

//         {/* ACTIVE REQUESTS SECTION - MATCHED TO UI DESIGN */}
//         {activeReqs.length > 0 && (
//           <section className="mb-5">
//             <h5 className="fw-bold mb-4">Active Requests</h5>
//             {activeReqs.map(req => (
//               <div key={req.id} className="card border-0 shadow-sm rounded-3 mb-3">
//                 <div className="card-body p-4">
//                   <div className="d-flex justify-content-between align-items-start mb-2">
//                     <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 border-0" style={{ fontSize: '0.7rem' }}>{req.category}</span>
//                     <span className="small fw-bold text-dark" style={{ fontSize: '0.75rem'}}>{req.status}</span>
//                   </div>
                  
//                   <h6 className="fw-bold mb-1" style={{ fontSize: '1.05rem' }}>{req.title}</h6>
//                   <p className="text-muted small mb-2">{req.description}</p>
                  
//                   <div className="small text-muted mb-2">
//                     <FiMapPin size={14} className="me-1" /> {req.location}
//                   </div>
                  
//                   <div className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
//                     Payout: {formatCurrency(req.payout)}
//                   </div>
                  
//                   <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
//                     Progress: {req.progress}%
//                   </div>

//                   <div className="d-flex align-items-center gap-3 mt-1">
//                     <div className="flex-grow-1">
//                         <div className="progress" style={{ height: 4, borderRadius: 10 }}>
//                             <div className="progress-bar" style={{ width: `${req.progress}%` }}></div>
//                         </div>
//                     </div>
//                     <button className="btn btn-light btn-sm rounded-3 border shadow-sm px-3" style={{ fontSize: '0.8rem' }} onClick={() => handleViewDetails(req)}>
//                       View Details
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </section>
//         )}

//         {/* AVAILABLE REQUESTS SECTION */}
//         <section className="mb-5">
//           <h5 className="fw-bold mb-3">Available Requests</h5>
//           <FilterBar totalCount={filteredAvailable.length} onSearch={setSearchQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
//           {filteredAvailable.map(req => (
//             <div key={req.id} className="card border-0 shadow-sm rounded-4 mb-3 p-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <span className="badge bg-info-subtle text-dark rounded-pill mb-2">{req.category}</span>
//                   <h6 className="fw-bold mb-1">{req.title}</h6>
//                   <div className="small text-muted"><FiMapPin /> {req.location} | Payout: {formatCurrency(req.payout)}</div>
//                 </div>
//                 <div className="d-flex gap-2">
//                   <button className="btn btn-light btn-sm rounded-pill px-3 border" onClick={() => handleViewDetails(req)}>Details</button>
//                   <button className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onClick={() => handleAcceptRequest(req.id)}>Accept Request</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </section>

//         {/* COMPLETED REQUESTS ACCORDION */}
//         <div className="card border-0 shadow-sm rounded-4 mb-5 overflow-hidden">
//           <div 
//             className="card-header bg-white p-3 d-flex justify-content-between align-items-center border-0" 
//             style={{ cursor: 'pointer' }}
//             onClick={() => setIsCompletedOpen(!isCompletedOpen)}
//           >
//             <h6 className="fw-bold mb-0">Completed Requests ({completedReqs.length})</h6>
//             <FiChevronDown style={{ transform: isCompletedOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
//           </div>
          
//           {isCompletedOpen && (
//             <div className="card-body p-0 border-top">
//               <div className="table-responsive">
//                 <table className="table table-hover align-middle mb-0">
//                   <thead className="bg-light small text-muted">
//                     <tr>
//                       <th className="ps-4 border-0 py-3">Task Title</th>
//                       <th className="border-0 py-3">Category</th>
//                       <th className="border-0 py-3">Date</th>
//                       <th className="pe-4 border-0 py-3 text-end">Payout</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {completedReqs.map(req => (
//                       <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(req)}>
//                         <td className="ps-4 fw-bold text-dark">{req.title}</td>
//                         <td><span className="badge bg-light text-dark border rounded-pill px-3">{req.category}</span></td>
//                         <td className="text-muted small">{formatDate(req.completionDate)}</td>
//                         <td className="pe-4 text-end fw-bold text-primary">{formatCurrency(req.payout)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

