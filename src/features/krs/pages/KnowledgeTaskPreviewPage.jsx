// filepath: src/features/tasks/KnowledgeTaskPreviewPage.jsx
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, FiMapPin, FiClock, 
  FiInfo, FiCheckCircle, FiAlertCircle, FiCalendar 
} from "react-icons/fi";
import { ROUTES } from "../../../constants";

/**
 * Knowledge Task Preview Page - Refined Version
 * Features: Compact UI, formatted dates, and acceptance logic.
 */

export default function KnowledgeTaskPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract task data from navigation state
  const { task } = location.state || {};

  // Helper to format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Redirect if accessed without task data
  if (!task) {
    return (
      <div className="container py-5 text-center">
        <FiAlertCircle size={40} className="text-muted mb-3" />
        <h5 className="fw-bold">Request details not found</h5>
        <button className="btn btn-primary btn-sm mt-3 rounded-pill px-4" onClick={() =>{
          navigate(ROUTES.DASH_KP)
        }}>
          Back to Dashboard
        </button>
      </div>
    );
  }



  return (
    <div className="bg-light min-vh-100 py-3">
      <div className="container" style={{ maxWidth: "750px" }}>
        
        {/* Compact Navigation Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button 
            className="btn btn-white btn-sm border shadow-sm rounded-pill d-flex align-items-center gap-2 px-3 text-muted fw-medium"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft size={15} /> Back
          </button>
          <span className="text-muted" style={{ fontSize: '1rem' }}>ID: {task.id}</span>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          {/* Header Section with smaller typography */}
          <div className="card-header bg-white border-0 p-4 text-center border-bottom">
            <div className="mb-2">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 border-0 fw-bold" style={{ fontSize: '1.5rem' }}>
                {task.category}
              </span>
            </div>
            <h4 className="fw-bold text-dark mb-2">{task.title}</h4>
            <div className="d-flex justify-content-center flex-wrap gap-3 text-muted" style={{ fontSize: '0.85rem' }}>
              <span className="d-flex align-items-center gap-1"><FiMapPin size={14} /> {task.location}</span>
              <span className="d-flex align-items-center gap-1"><FiCalendar size={14} /> {formatDate(task.createdAt)}</span>
              <span className="d-flex align-items-center gap-1"><FiClock size={14} /> 3-5 Days</span>
            </div>
          </div>

          <div className="card-body p-4">
            {/* Payout Information (More compact) */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="p-3 rounded-4 bg-primary text-white shadow-sm">
                  <div className="small opacity-75 fw-medium">Budget</div>
                  <h4 className="fw-bold mb-0">${task.payout}</h4>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-4 border bg-white shadow-sm text-center">
                  <div className="text-muted small fw-medium">Type</div>
                  <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem', marginTop: '4px' }}>One-time</h5>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                <FiInfo className="text-primary" /> Overview
              </h6>
              <div className="p-3 rounded-3 bg-light border border-dashed">
                <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {task.description || "Client is seeking professional assistance for this project. Please ensure high-quality delivery."}
                </p>
              </div>
            </div>

            {/* Core Requirements (Small list) */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2">Requirements</h6>
              <div className="row g-2">
                {[
                  "Delivery within deadline",
                  "Data confidentiality",
                  "Professional English",
                  "One round of revisions"
                ].map((item, index) => (
                  <div key={index} className="col-6">
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle className="text-success flex-shrink-0" size={14} />
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

           

          </div>
        </div>


<div className="text-center pb-4">
  <span className="text-muted small">
    Need help?{" "}
    <a 
      style={{ cursor: 'pointer' }} // عشان يظهر شكل اليد عند التأشير
      onClick={() => navigate(ROUTES.SUPPORT)} // هون التعديل: استخدمنا arrow function
      className="text-primary text-decoration-none fw-medium"
    >
      Contact Support
    </a>
  </span>
</div>

      </div>
    </div>
  );
}