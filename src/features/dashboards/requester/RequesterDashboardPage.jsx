// filepath: src/features/dashboards/requester/RequesterDashboardPage.jsx

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  ProgressBar,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

/**
 * RequesterDashboardPage
 * - Displays user's active and completed knowledge requests.
 * - Features dynamic progress bars, budget formatting, and pagination.
 * - Includes a 'Create New Request' action positioned at the top-right.
 */

// Helper to format budget as per design (e.g., USD250)
function formatBudget(amount, currency = "USD", locale = "en-US") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return `${currency}0`;

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);

  return `${currency}${formatted}`;
}

const isCompleted = (progress) => Number(progress) >= 100;

function normalizeProgress(progress) {
  const p = Number(progress);
  if (!Number.isFinite(p)) return 0;
  return Math.min(Math.max(Math.round(p), 0), 100);
}



// --- MOCK DATA (Simulating Backend Response) ---
async function mockFetchKrRequests({ shouldFail = false } = {}) {
  await new Promise((r) => setTimeout(r, 600));
  if (shouldFail) throw new Error("Network error");

  return [
    {
      id: "req_101",
      category: "Survey",
      title: "Customer Satisfaction Survey for Q1",
      description:
        "Detailed survey to gauge customer satisfaction across all product lines.",
      created_at: "2024-03-15",
      budget: 250,
      currency: "USD",
      progress: 75,
    },
    {
      id: "req_100",
      category: "Video(s)",
      title: "Explainer Video for New Feature Launch",
      description:
        "Create a 90-second animated explainer video highlighting key benefits.",
      created_at: "2024-03-10",
      budget: 1200,
      currency: "USD",
      progress: 50,
    },
    {
      id: "req_099",
      category: "Errand/Chore",
      title: "Document Pickup from Legal Department",
      description:
        "Retrieve signed contracts from the legal department and deliver to finance.",
      created_at: "2024-02-20",
      budget: 50,
      currency: "USD",
      progress: 90,
    },
    {
      id: "req_080",
      category: "Essay",
      title: "Market Analysis Report: AI in Healthcare",
      description:
        "Comprehensive research paper on current trends in healthcare AI.",
      created_at: "2024-03-01",
      budget: 500,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_079",
      category: "Photo(s)",
      title: "Product Photography for E-commerce",
      description:
        "High-resolution images of new product SKUs for online store upload.",
      created_at: "2024-02-28",
      budget: 300,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_070",
      category: "Survey",
      title: "Internal Team Feedback Survey",
      description:
        "Anonymous survey to gather feedback from engineering teams.",
      created_at: "2024-02-18",
      budget: 150,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_101",
      category: "Survey",
      title: "Customer Satisfaction Survey for Q1",
      description:
        "Detailed survey to gauge customer satisfaction across all product lines.",
      created_at: "2024-03-15",
      budget: 250,
      currency: "USD",
      progress: 75,
    },
    {
      id: "req_100",
      category: "Video(s)",
      title: "Explainer Video for New Feature Launch",
      description:
        "Create a 90-second animated explainer video highlighting key benefits.",
      created_at: "2024-03-10",
      budget: 1200,
      currency: "USD",
      progress: 50,
    },
    {
      id: "req_099",
      category: "Errand/Chore",
      title: "Document Pickup from Legal Department",
      description:
        "Retrieve signed contracts from the legal department and deliver to finance.",
      created_at: "2024-02-20",
      budget: 50,
      currency: "USD",
      progress: 90,
    },
    {
      id: "req_080",
      category: "Essay",
      title: "Market Analysis Report: AI in Healthcare",
      description:
        "Comprehensive research paper on current trends in healthcare AI.",
      created_at: "2024-03-01",
      budget: 500,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_079",
      category: "Photo(s)",
      title: "Product Photography for E-commerce",
      description:
        "High-resolution images of new product SKUs for online store upload.",
      created_at: "2024-02-28",
      budget: 300,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_070",
      category: "Survey",
      title: "Internal Team Feedback Survey",
      description:
        "Anonymous survey to gather feedback from engineering teams.",
      created_at: "2024-02-18",
      budget: 150,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_101",
      category: "Survey",
      title: "Customer Satisfaction Survey for Q1",
      description:
        "Detailed survey to gauge customer satisfaction across all product lines.",
      created_at: "2024-03-15",
      budget: 250,
      currency: "USD",
      progress: 75,
    },
    {
      id: "req_100",
      category: "Video(s)",
      title: "Explainer Video for New Feature Launch",
      description:
        "Create a 90-second animated explainer video highlighting key benefits.",
      created_at: "2024-03-10",
      budget: 1200,
      currency: "USD",
      progress: 50,
    },
    {
      id: "req_099",
      category: "Errand/Chore",
      title: "Document Pickup from Legal Department",
      description:
        "Retrieve signed contracts from the legal department and deliver to finance.",
      created_at: "2024-02-20",
      budget: 50,
      currency: "USD",
      progress: 90,
    },
    {
      id: "req_080",
      category: "Essay",
      title: "Market Analysis Report: AI in Healthcare",
      description:
        "Comprehensive research paper on current trends in healthcare AI.",
      created_at: "2024-03-01",
      budget: 500,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_079",
      category: "Photo(s)",
      title: "Product Photography for E-commerce",
      description:
        "High-resolution images of new product SKUs for online store upload.",
      created_at: "2024-02-28",
      budget: 300,
      currency: "USD",
      progress: 100,
    },
    {
      id: "req_070",
      category: "Survey",
      title: "Internal Team Feedback Survey",
      description:
        "Anonymous survey to gather feedback from engineering teams.",
      created_at: "2024-02-18",
      budget: 150,
      currency: "USD",
      progress: 100,
    },
  ];
}


function RequestCard({ req }) {
  const navigate = useNavigate();
  const p = normalizeProgress(req.progress);
  const done = isCompleted(p);
  const statusText = done ? "Completed" : "In Progress";
  const statusClass = done ? "text-success" : "text-primary";

  return (
    <Card
      className="h-100 shadow-sm border-2 rounded-4"
      style={{ borderColor: "#eceef1"}}
    >
      <Card.Body className="p-3 p-md-4 d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <Badge
            bg="light"
            text="dark"
            className="border px-2 py-1 fw-normal text-muted"
            style={{ fontSize: "0.75rem" }}
          >
            {req.category}
          </Badge>
          <div className="text-muted small" style={{ fontSize: "0.8rem" }}>
            {req.created_at}
          </div>
        </div>

        <h6 className="fw-bold mt-2 mb-2 text-dark">{req.title}</h6>
        <div
          className="text-muted small mb-3"
          style={{ minHeight: 42, fontSize: "0.85rem", lineHeight: "1.4" }}
        >
          {req.description}
        </div>

        <div className="mt-auto">
          <div className="small mb-2">
            <span className="fw-semibold text-dark">Budget:</span>{" "}
            <span className="text-muted">
              {formatBudget(req.budget, req.currency)}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="flex-grow-1">
              <ProgressBar now={p} style={{ height: 6, borderRadius: 999 }} />
            </div>
            <div
              className={`small fw-semibold ${statusClass}`}
              style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}
            >
              {done ? statusText : `${p}% ${statusText}`}
            </div>
          </div>

          {/* This is the ONLY addition: View Details Button */}
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="w-100 rounded-3 fw-bold"
            onClick={() => navigate(`/requests/${req.id}`, { state: { requestData: req } })}
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function RequesterDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [requests, setRequests] = useState([]);
  const [limitActive, setLimitActive] = useState(6);
  const [limitCompleted, setLimitCompleted] = useState(6);



  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [requests]);

  const activeReqs = useMemo(
    () => sorted.filter((r) => !isCompleted(r.progress)),
    [sorted],
  );
  const completedReqs = useMemo(
    () => sorted.filter((r) => isCompleted(r.progress)),
    [sorted],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await mockFetchKrRequests();
      if (!data || data.length === 0) throw new Error("No requests found.");
      setRequests(data);
    } catch {
      setErrorMsg(
        "Failed to load your requests. Please check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container className="py-4 py-md-2" style={{ maxWidth: 1140 }}>
      {/* Header section with Right-Aligned CTA */}
      <div className="d-flex justify-content-end align-items-center mb-4">
        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.CREATE_REQUEST)}
          className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
          style={{ borderRadius: "8px", fontSize: "0.95rem" }}
        >
          <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span>
          Create New Request
        </Button>
      </div>

      {/* Error State */}
      {errorMsg && (
        <Alert
          variant="danger"
          className="d-flex align-items-center justify-content-between border-0 shadow-sm mb-4"
          style={{ borderRadius: "12px" }}
        >
          <div className="d-flex align-items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
          <Button variant="outline-danger" size="sm" onClick={load}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Updating dashboard...</p>
        </div>
      ) : (
        <>
          {/* Active Requests Section */}
          <section className="mb-5">
            <h4 className="fw-bold mb-3 text-dark">Active Requests</h4>
            {activeReqs.length === 0 ? (
              <p className="text-muted">No active requests found.</p>
            ) : (
              <>
                <Row className="g-4">
                  {activeReqs.slice(0, limitActive).map((r) => (
                    <Col key={r.id} xs={12} md={6} lg={4}>
                      <RequestCard req={r} />
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => setLimitActive((n) => n + 6)}
                    disabled={activeReqs.length <= limitActive}
                  >
                    Load More Active Requests
                  </Button>
                </div>
              </>
            )}
          </section>

          {/* Completed Requests Section */}
          <section>
            <h4 className="fw-bold mb-3 text-dark">Completed Requests</h4>
            {completedReqs.length === 0 ? (
              <p className="text-muted">No completed requests yet.</p>
            ) : (
              <>
                <Row className="g-4">
                  {completedReqs.slice(0, limitCompleted).map((r) => (
                    <Col key={r.id} xs={12} md={6} lg={4}>
                      <RequestCard req={r} />
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => setLimitCompleted((n) => n + 6)}
                    disabled={completedReqs.length <= limitCompleted}
                  >
                    Load More Completed Requests
                  </Button>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </Container>
  );
}
// // filepath: src/features/dashboards/requester/RequesterDashboardPage.jsx

// import { useEffect, useMemo, useState, useCallback } from "react";
// import {
//   Alert,
//   Badge,
//   Button,
//   Card,
//   Container,
//   ProgressBar,
//   Row,
//   Col,
//   Spinner,
// } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { ROUTES } from "../../../constants/routes";

// /**
//  * RequesterDashboardPage
//  * - Displays user's active and completed knowledge requests.
//  * - Features dynamic progress bars, budget formatting, and pagination.
//  * - Includes a 'Create New Request' action positioned at the top-right.
//  */

// // Helper to format budget as per design (e.g., USD250)
// function formatBudget(amount, currency = "USD", locale = "en-US") {
//   const n = Number(amount);
//   if (!Number.isFinite(n)) return `${currency}0`;

//   const formatted = new Intl.NumberFormat(locale, {
//     maximumFractionDigits: 0,
//     minimumFractionDigits: 0,
//   }).format(n);

//   return `${currency}${formatted}`;
// }

// const isCompleted = (progress) => Number(progress) >= 100;

// function normalizeProgress(progress) {
//   const p = Number(progress);
//   if (!Number.isFinite(p)) return 0;
//   return Math.min(Math.max(Math.round(p), 0), 100);
// }



// // --- MOCK DATA (Simulating Backend Response) ---
// async function mockFetchKrRequests({ shouldFail = false } = {}) {
//   await new Promise((r) => setTimeout(r, 600));
//   if (shouldFail) throw new Error("Network error");

//   return [
//     {
//       id: "req_101",
//       category: "Survey",
//       title: "Customer Satisfaction Survey for Q1",
//       description:
//         "Detailed survey to gauge customer satisfaction across all product lines.",
//       created_at: "2024-03-15",
//       budget: 250,
//       currency: "USD",
//       progress: 75,
//     },
//     {
//       id: "req_100",
//       category: "Video(s)",
//       title: "Explainer Video for New Feature Launch",
//       description:
//         "Create a 90-second animated explainer video highlighting key benefits.",
//       created_at: "2024-03-10",
//       budget: 1200,
//       currency: "USD",
//       progress: 50,
//     },
//     {
//       id: "req_099",
//       category: "Errand/Chore",
//       title: "Document Pickup from Legal Department",
//       description:
//         "Retrieve signed contracts from the legal department and deliver to finance.",
//       created_at: "2024-02-20",
//       budget: 50,
//       currency: "USD",
//       progress: 90,
//     },
//     {
//       id: "req_080",
//       category: "Essay",
//       title: "Market Analysis Report: AI in Healthcare",
//       description:
//         "Comprehensive research paper on current trends in healthcare AI.",
//       created_at: "2024-03-01",
//       budget: 500,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_079",
//       category: "Photo(s)",
//       title: "Product Photography for E-commerce",
//       description:
//         "High-resolution images of new product SKUs for online store upload.",
//       created_at: "2024-02-28",
//       budget: 300,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_070",
//       category: "Survey",
//       title: "Internal Team Feedback Survey",
//       description:
//         "Anonymous survey to gather feedback from engineering teams.",
//       created_at: "2024-02-18",
//       budget: 150,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_101",
//       category: "Survey",
//       title: "Customer Satisfaction Survey for Q1",
//       description:
//         "Detailed survey to gauge customer satisfaction across all product lines.",
//       created_at: "2024-03-15",
//       budget: 250,
//       currency: "USD",
//       progress: 75,
//     },
//     {
//       id: "req_100",
//       category: "Video(s)",
//       title: "Explainer Video for New Feature Launch",
//       description:
//         "Create a 90-second animated explainer video highlighting key benefits.",
//       created_at: "2024-03-10",
//       budget: 1200,
//       currency: "USD",
//       progress: 50,
//     },
//     {
//       id: "req_099",
//       category: "Errand/Chore",
//       title: "Document Pickup from Legal Department",
//       description:
//         "Retrieve signed contracts from the legal department and deliver to finance.",
//       created_at: "2024-02-20",
//       budget: 50,
//       currency: "USD",
//       progress: 90,
//     },
//     {
//       id: "req_080",
//       category: "Essay",
//       title: "Market Analysis Report: AI in Healthcare",
//       description:
//         "Comprehensive research paper on current trends in healthcare AI.",
//       created_at: "2024-03-01",
//       budget: 500,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_079",
//       category: "Photo(s)",
//       title: "Product Photography for E-commerce",
//       description:
//         "High-resolution images of new product SKUs for online store upload.",
//       created_at: "2024-02-28",
//       budget: 300,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_070",
//       category: "Survey",
//       title: "Internal Team Feedback Survey",
//       description:
//         "Anonymous survey to gather feedback from engineering teams.",
//       created_at: "2024-02-18",
//       budget: 150,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_101",
//       category: "Survey",
//       title: "Customer Satisfaction Survey for Q1",
//       description:
//         "Detailed survey to gauge customer satisfaction across all product lines.",
//       created_at: "2024-03-15",
//       budget: 250,
//       currency: "USD",
//       progress: 75,
//     },
//     {
//       id: "req_100",
//       category: "Video(s)",
//       title: "Explainer Video for New Feature Launch",
//       description:
//         "Create a 90-second animated explainer video highlighting key benefits.",
//       created_at: "2024-03-10",
//       budget: 1200,
//       currency: "USD",
//       progress: 50,
//     },
//     {
//       id: "req_099",
//       category: "Errand/Chore",
//       title: "Document Pickup from Legal Department",
//       description:
//         "Retrieve signed contracts from the legal department and deliver to finance.",
//       created_at: "2024-02-20",
//       budget: 50,
//       currency: "USD",
//       progress: 90,
//     },
//     {
//       id: "req_080",
//       category: "Essay",
//       title: "Market Analysis Report: AI in Healthcare",
//       description:
//         "Comprehensive research paper on current trends in healthcare AI.",
//       created_at: "2024-03-01",
//       budget: 500,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_079",
//       category: "Photo(s)",
//       title: "Product Photography for E-commerce",
//       description:
//         "High-resolution images of new product SKUs for online store upload.",
//       created_at: "2024-02-28",
//       budget: 300,
//       currency: "USD",
//       progress: 100,
//     },
//     {
//       id: "req_070",
//       category: "Survey",
//       title: "Internal Team Feedback Survey",
//       description:
//         "Anonymous survey to gather feedback from engineering teams.",
//       created_at: "2024-02-18",
//       budget: 150,
//       currency: "USD",
//       progress: 100,
//     },
//   ];
// }
//   // Inside RequestCard component


// function RequestCard({ req }) {
//   const p = normalizeProgress(req.progress);
//   const done = isCompleted(p);
//   const statusText = done ? "Completed" : "In Progress";
//   const statusClass = done ? "text-success" : "text-primary";

//   return (
//     <Card
//       className="h-100 shadow-sm border-2 rounded-4"
//       style={{ borderColor: "#eceef1"}}
//     >
//       <Card.Body className="p-3 p-md-4 d-flex flex-column">
//         <div className="d-flex align-items-start justify-content-between gap-2">
//           <Badge
//             bg="light"
//             text="dark"
//             className="border px-2 py-1 fw-normal text-muted"
//             style={{ fontSize: "0.75rem" }}
//           >
//             {req.category}
//           </Badge>
//           <div className="text-muted small" style={{ fontSize: "0.8rem" }}>
//             {req.created_at}
//           </div>
//         </div>

//         <h6 className="fw-bold mt-2 mb-2 text-dark">{req.title}</h6>
//         <div
//           className="text-muted small mb-3"
//           style={{ minHeight: 42, fontSize: "0.85rem", lineHeight: "1.4" }}
//         >
//           {req.description}
//         </div>

//         <div className="mt-auto">
//           <div className="small mb-2">
//             <span className="fw-semibold text-dark">Budget:</span>{" "}
//             <span className="text-muted">
//               {formatBudget(req.budget, req.currency)}
//             </span>
//           </div>

//           <div className="d-flex align-items-center gap-2">
//             <div className="flex-grow-1">
//               <ProgressBar now={p} style={{ height: 6, borderRadius: 999 }} />
//             </div>
//             <div
//               className={`small fw-semibold ${statusClass}`}
//               style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}
//             >
//               {done ? statusText : `${p}% ${statusText}`}
//             </div>
//           </div>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// }

// export default function RequesterDashboardPage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [requests, setRequests] = useState([]);
//   const [limitActive, setLimitActive] = useState(6);
//   const [limitCompleted, setLimitCompleted] = useState(6);



//   const sorted = useMemo(() => {
//     return [...requests].sort(
//       (a, b) => new Date(b.created_at) - new Date(a.created_at),
//     );
//   }, [requests]);

//   const activeReqs = useMemo(
//     () => sorted.filter((r) => !isCompleted(r.progress)),
//     [sorted],
//   );
//   const completedReqs = useMemo(
//     () => sorted.filter((r) => isCompleted(r.progress)),
//     [sorted],
//   );

//   const load = useCallback(async () => {
//     setLoading(true);
//     setErrorMsg("");
//     try {
//       const data = await mockFetchKrRequests();
//       if (!data || data.length === 0) throw new Error("No requests found.");
//       setRequests(data);
//     } catch {
//       setErrorMsg(
//         "Failed to load your requests. Please check your internet connection and try again.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   return (
//     <Container className="py-4 py-md-2" style={{ maxWidth: 1140 }}>
//       {/* Header section with Right-Aligned CTA */}
//       <div className="d-flex justify-content-end align-items-center mb-4">
//         <Button
//           variant="primary"
//           onClick={() => navigate(ROUTES.CREATE_REQUEST)}
//           className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
//           style={{ borderRadius: "8px", fontSize: "0.95rem" }}
//         >
//           <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span>
//           Create New Request
//         </Button>
//       </div>

//       {/* Error State */}
//       {errorMsg && (
//         <Alert
//           variant="danger"
//           className="d-flex align-items-center justify-content-between border-0 shadow-sm mb-4"
//           style={{ borderRadius: "12px" }}
//         >
//           <div className="d-flex align-items-center gap-2">
//             <span>⚠️</span> {errorMsg}
//           </div>
//           <Button variant="outline-danger" size="sm" onClick={load}>
//             Retry
//           </Button>
//         </Alert>
//       )}

//       {/* Loading State */}
//       {loading ? (
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="text-muted mt-2">Updating dashboard...</p>
//         </div>
//       ) : (
//         <>
//           {/* Active Requests Section */}
//           <section className="mb-5">
//             <h4 className="fw-bold mb-3 text-dark">Active Requests</h4>
//             {activeReqs.length === 0 ? (
//               <p className="text-muted">No active requests found.</p>
//             ) : (
//               <>
//                 <Row className="g-4">
//                   {activeReqs.slice(0, limitActive).map((r) => (
//                     <Col key={r.id} xs={12} md={6} lg={4}>
//                       <RequestCard req={r} />
//                     </Col>
//                   ))}
//                 </Row>
//                 <div className="text-center mt-4">
//                   <Button
//                     variant="outline-primary"
//                     onClick={() => setLimitActive((n) => n + 6)}
//                     disabled={activeReqs.length <= limitActive}
//                   >
//                     Load More Active Requests
//                   </Button>
//                 </div>
//               </>
//             )}
//           </section>

//           {/* Completed Requests Section */}
//           <section>
//             <h4 className="fw-bold mb-3 text-dark">Completed Requests</h4>
//             {completedReqs.length === 0 ? (
//               <p className="text-muted">No completed requests yet.</p>
//             ) : (
//               <>
//                 <Row className="g-4">
//                   {completedReqs.slice(0, limitCompleted).map((r) => (
//                     <Col key={r.id} xs={12} md={6} lg={4}>
//                       <RequestCard req={r} />
//                     </Col>
//                   ))}
//                 </Row>
//                 <div className="text-center mt-4">
//                   <Button
//                     variant="outline-primary"
//                     onClick={() => setLimitCompleted((n) => n + 6)}
//                     disabled={completedReqs.length <= limitCompleted}
//                   >
//                     Load More Completed Requests
//                   </Button>
//                 </div>
//               </>
//             )}
//           </section>
//         </>
//       )}
//     </Container>
//   );
// }

