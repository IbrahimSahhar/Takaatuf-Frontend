// filepath: src/features/krs/pages/CreateRequestPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants";

const REVIEW_FEE = 5;

const CATEGORIES = ["Survey", "Essay", "Photo(s)", "Video(s)", "Errand/Chore"];

const NEIGHBORHOODS = [
  "All locations", "Gaza City", "Rimal", "Shujaiya", "Tal Al-Hawa", "Sheikh Radwan",
  "Al-Nasr", "Al Darraj", "Al-Tuffah", "Al-Sabra", "Al-Shati'", "Al-Moghrarah",
  "Deir Al-Balah", "Al-Nusairat", "Al-Bureij", "Al-Maghazi", "Khan Younis", "Rafah",
];

/**
 * Validation Helpers
 */
function isValidMoney(val) {
  const s = String(val ?? "").trim();
  if (!s || !/^\d+(\.\d{1,2})?$/.test(s)) return false;
  const n = Number(s);
  return Number.isFinite(n) && n > 0;
}

function isValidInt(val) {
  const s = String(val ?? "").trim();
  if (!/^\d+$/.test(s)) return false;
  const n = Number(s);
  return Number.isFinite(n) && n >= 1;
}

function formatCurrency(n) {
  const num = Number(n);
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(safe);
}

export default function CreateRequestPage() {
  const navigate = useNavigate();
  
  // Form State
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [budget, setBudget] = useState("");
  const [providers, setProviders] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Memoized payout calculation for Task 5/11 logic
  const payoutPerKP = useMemo(() => {
    const b = Number(budget);
    const k = Number(providers);
    if (!Number.isFinite(b) || !Number.isFinite(k) || k < 1) return 0;
    const distributable = b - REVIEW_FEE;
    if (distributable <= 0) return 0;
    const per = distributable / k;
    return Math.round(per * 100) / 100;
  }, [budget, providers]);

  // Comprehensive Form Validation
  const errors = useMemo(() => {
    const e = {};
    if (submitAttempted) {
      if (!category) e.category = "Please select a category.";
      if (String(details).trim().length < 50)
        e.details = "Request details must be at least 50 characters.";
      
      if (!isValidMoney(budget)) {
        e.budget = "Please enter a valid budget amount.";
      } else {
        const b = Number(budget);
        if (b <= REVIEW_FEE) e.budget = `Budget must be greater than ${formatCurrency(REVIEW_FEE)} (Review Fee).`;
      }
      
      if (!isValidInt(providers)) e.providers = "Please enter a valid number of providers (min 1).";

      if (isValidMoney(budget) && isValidInt(providers)) {
        if (!(payoutPerKP > 0)) e.payout = "Calculation error: Check your budget and provider count.";
      }
      
      if (!neighborhood) e.neighborhood = "Please select a neighborhood.";
    }
    return e;
  }, [submitAttempted, category, details, budget, providers, neighborhood, payoutPerKP]);

  const onAttachmentsChange = (e) => {
    setUploadError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) { setAttachments([]); return; }
    
    for (const f of files) {
      const isVideo = (f.type || "").startsWith("video/");
      const isImage = (f.type || "").startsWith("image/");
      
      if (!isVideo && !isImage) {
        setUploadError("Only images or videos are allowed.");
        return;
      }
      // Size limits: Video 100MB, Image 10MB
      if (isVideo && f.size > 100 * 1024 * 1024) {
        setUploadError("Video files must be 100MB or less.");
        return;
      }
      if (isImage && f.size > 10 * 1024 * 1024) {
        setUploadError("Image files must be 10MB or less.");
        return;
      }
    }
    setAttachments(files);
  };

  /**
   * Form Submission - Transitions from Task 5 to Task 11
   */
  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    // Passing essential payment data to the next route (Task 11)
    navigate(ROUTES.PAYMENT, { 
      replace: false,
      state: { 
        budget: Number(budget),
        reviewFee: REVIEW_FEE,
        total: Number(budget) + REVIEW_FEE,
        requestDetails: { category, details, neighborhood, providers }
      } 
    });
  };

  const cardStyle = { borderRadius: 10 };

  return (
    <div className="container-fluid py-4">
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        
        {/* Section 1: Core Details */}
        <div className="card shadow-sm mb-4" style={cardStyle}>
          <div className="card-body p-4">
            <h5 className="mb-3 fw-bold">Request Details</h5>
            <div className="mb-3">
              <label className="form-label fw-semibold">Category</label>
              <select
                className={`form-select ${errors.category ? "is-invalid" : ""}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              {errors.category && <div className="invalid-feedback">{errors.category}</div>}
            </div>
            <div className="mb-0">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className={`form-control ${errors.details ? "is-invalid" : ""}`}
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe your request in detail (minimum 50 characters)..."
              />
              {errors.details && <div className="invalid-feedback">{errors.details}</div>}
            </div>
          </div>
        </div>

        {/* Section 2: Financial Configuration */}
        <div className="card shadow-sm mb-4" style={{ ...cardStyle, border: "2px solid #B7A9FF" }}>
          <div className="card-body p-4">
            <h5 className="mb-3 fw-bold">Budget Allocation</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Overall Budget (USD)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={`form-control ${errors.budget ? "is-invalid" : ""}`}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., 500"
                />
                {errors.budget && <div className="invalid-feedback">{errors.budget}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">No. of Providers</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control ${errors.providers ? "is-invalid" : ""}`}
                  value={providers}
                  onChange={(e) => setProviders(e.target.value)}
                  placeholder="e.g., 5"
                />
                {errors.providers && <div className="invalid-feedback">{errors.providers}</div>}
              </div>
            </div>
            <div className="p-3 bg-light rounded-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Payout per Provider:</span>
                <span className="fw-bold text-primary fs-5">{formatCurrency(payoutPerKP)}</span>
              </div>
              {errors.payout && <div className="text-danger small mt-1">{errors.payout}</div>}
            </div>
          </div>
        </div>

        {/* Section 3: Localization & Assets */}
        <div className="card shadow-sm mb-4" style={cardStyle}>
          <div className="card-body p-4">
            <h5 className="mb-3 fw-bold">Additional Info</h5>
            <div className="mb-3">
              <label className="form-label fw-semibold">Target Neighborhood</label>
              <select
                className={`form-select ${errors.neighborhood ? "is-invalid" : ""}`}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              >
                <option value="">Select a neighborhood</option>
                {NEIGHBORHOODS.map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
              {errors.neighborhood && <div className="invalid-feedback">{errors.neighborhood}</div>}
            </div>
            <div className="mb-0">
              <label className="form-label fw-semibold">Attachments (Media)</label>
              <input type="file" className="form-control" multiple accept="image/*,video/*" onChange={onAttachmentsChange} />
              {uploadError && <div className="text-danger small mt-2">{uploadError}</div>}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <form onSubmit={onSubmit}>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 shadow-sm"
            style={{ borderRadius: 12, fontWeight: 700 }}
          >
            Continue to Secure Payment
          </button>
          <p className="text-center text-muted small mt-3">
             <i className="bi bi-shield-lock-fill me-1"></i>
             Next step: Secure checkout with PayPal or Credit Card
          </p>
        </form>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

