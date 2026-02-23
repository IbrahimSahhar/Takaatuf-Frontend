// filepath: src/features/tasks/KnowledgeTaskCompletedPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, FiCheckCircle, FiDownload, 
  FiStar, FiCalendar, FiDollarSign, FiFileText 
} from "react-icons/fi";

/**
 * Knowledge Task Completed Page
 * Purpose: Shows the final result, feedback, and payment summary.
 */

export default function KnowledgeTaskCompletedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract task data
  const { task } = location.state || {};

  // Date formatter helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  if (!task) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-muted">Task record not found</h4>
        <button className="btn btn-primary mt-3 rounded-pill px-4" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container" style={{ maxWidth: "800px" }}>
        
        {/* Navigation */}
        <button 
          className="btn btn-white btn-sm border shadow-sm rounded-pill d-flex align-items-center gap-2 px-3 mb-4 text-muted fw-medium"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft size={14} /> Back to History
        </button>

        {/* Success Banner */}
        <div className="card border-0 shadow-sm rounded-4 bg-success text-white mb-4 overflow-hidden">
          <div className="card-body p-4 p-md-5 text-center">
            <FiCheckCircle size={50} className="mb-3 opacity-75" />
            <h2 className="fw-bold mb-1">Mission Completed!</h2>
            <p className="opacity-75 mb-0">This task was successfully delivered and paid.</p>
          </div>
        </div>

        <div className="row g-4">
          {/* Main Info */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <span className="badge bg-light text-dark border rounded-pill px-3 py-1 mb-3" style={{ fontSize: '0.75rem' }}>
                  {task.category}
                </span>
                <h4 className="fw-bold text-dark mb-4">{task.title}</h4>
                
                {/* Client Feedback Section */}
                <div className="p-3 rounded-4 bg-light border border-dashed mb-4">
                  <h6 className="fw-bold d-flex align-items-center gap-2 mb-2">
                    <FiStar className="text-warning" fill="currentColor" /> Client Feedback
                  </h6>
                  <p className="text-secondary italic mb-2 small">
                    "Excellent work! The solution was very professional and delivered on time. Highly recommended."
                  </p>
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => <FiStar key={star} className="text-warning" fill="currentColor" size={14} />)}
                  </div>
                </div>

                {/* Deliverables */}
                <h6 className="fw-bold mb-3">Your Final Deliverables</h6>
                <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center gap-2">
                      <FiFileText className="text-primary" />
                      <div>
                        <div className="small fw-bold">Final_Report_v2.pdf</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Uploaded on {formatDate(task.completionDate)}</div>
                      </div>
                    </div>
                    <button className="btn btn-light btn-sm rounded-circle"><FiDownload size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="col-md-4">
            {/* Payment Summary */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4 text-center">
                <h6 className="text-muted small fw-bold text-uppercase mb-3">Payment Summary</h6>
                <div className="display-6 fw-bold text-primary mb-1">${task.payout}</div>
                <span className="badge bg-success-subtle text-success rounded-pill px-3">Transaction Paid</span>
                <hr />
                <div className="text-start">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Completed:</span>
                    <span className="small fw-bold">{formatDate(task.completionDate)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Method:</span>
                    <span className="small fw-bold">Wallet Transfer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="card border-0 shadow-sm rounded-4 bg-light">
              <div className="card-body p-4 text-center">
                <h6 className="fw-bold mb-2 small">Need Support?</h6>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>If there is an issue with this transaction, contact our team.</p>
                <button className="btn btn-outline-secondary btn-sm w-100 rounded-pill">Open Dispute</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}