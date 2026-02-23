// filepath: src/features/krs/pages/KnowledgeTaskPage.jsx

import  { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Button,
  Alert,
  Form,
} from "react-bootstrap";
import {
  ChevronLeft,
  Info,
  Upload,
  FileText,
  X,
  RotateCcw,
  Pointer,
  GraduationCap,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

/**
 * KnowledgeTaskPage Component
 * Displays specific task details and submission area.
 * Data is received via route state from the Dashboard.
 */
export default function KnowledgeTaskPage() {
  // 1. Hooks initialization (Correct Order)
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Task ID from URL

  // 2. Data Retrieval from Navigation State
  const taskData = location.state?.task;

  // Fallback values if data is missing (e.g., page refresh)
  const displayTitle = "Task Details";
  const displayCategory = taskData?.category || "General";
  const displayBudget = taskData?.budget ? `$${taskData.budget}` : "$0.00";
  const displayDescription =
    taskData?.description || "No description provided.";
  const displayDate = taskData?.created_at || "N/A";
  const knowledgeProviderAssigned = 4;

  // 3. Component Local State
  const [workDescription, setWorkDescription] = useState(
    "Collected 3 photos so far; will capture remaining at peak market hours.",
  );

  // Mock files for UI consistency with the provided image
  const [files, setFiles] = useState([
    { id: 1, name: "file1.jpg", size: "2.4 MB" },
    { id: 2, name: "file2.png", size: "1.1 MB" },
  ]);
  // 2. دالة التعامل مع رفع الملفات (Add Files)
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const formattedFiles = newFiles.map((file, index) => ({
      id: Date.now() + index, // Unique ID
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB", // Convert to MB
    }));
    setFiles([...files, ...formattedFiles]);
  };

  // 3. دالة الحذف (Remove File)
  const removeFile = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  const progressValue = taskData?.progress || 45;

  return (
    <div className="bg-light min-vh-100 ">
      {/* --- Header / Navigation Bar --- */}
      <div className="bg-white border-bottom py-2 mb-4 shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            {/* Graduation Cap Logo Implementation */}
            <div
              className="bg-primary rounded d-flex align-items-center justify-content-center text-white"
              style={{ width: "35px", height: "35px" }}
            >
              <GraduationCap size={22} strokeWidth={2.5} />
            </div>
            <span
              className="fw-bold text-dark"
              style={{ fontSize: "1.2rem", letterSpacing: "0.5px" }}
            >
              TAKAATUF
            </span>
          </div>

          <Button
            variant="link"
            className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-semibold"
            onClick={() => navigate(ROUTES.DASH_KP)}
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </Button>
        </Container>
      </div>

      <Container style={{ maxWidth: "1000px" }}>
        {/* --- Alert Notification --- */}
        <Alert
          variant="primary"
          className="d-flex align-items-center gap-3 border-0 shadow-sm mb-4"
          style={{ borderRadius: "12px", backgroundColor: "#eef6ff" }}
        >
          <Info className="text-primary" size={24} />
          <div className="small text-dark">
            You are viewing task <strong>{id}</strong> assigned to you. Only
            authorized Knowledge Providers have access.
          </div>
        </Alert>

        {/* --- Task Details Card --- */}
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: "15px" }}
        >
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">{displayTitle}</h5>

            <Row className="mb-4">
              <Col md={12}>
                <label className="text-muted small fw-bold mb-1">
                  Request Category
                </label>
                <p className="fw-semibold">{displayCategory}</p>
              </Col>
              <Col md={12}>
                <label className="text-muted small fw-bold mb-1">
                  Request Description / Details
                </label>
                <div className="p-3 bg-light rounded-3 small text-secondary border">
                  {displayDescription}
                </div>
              </Col>
            </Row>

            <Row className="g-4">
              <Col md={6}>
                <label className="text-muted small fw-bold mb-1">
                  Required Deliverables
                </label>
                <ul className="small ps-3 text-secondary">
                  <li>
                    Original high-quality assets as per category requirements.
                  </li>
                  <li>Brief captions or documentation for each asset.</li>
                </ul>
              </Col>
              <Col md={6}>
                <label className="text-muted small fw-bold mb-1">
                  Location / Neighborhood
                </label>
                <p className="small">Remote / Field Work</p>
              </Col>
              <Col md={6}>
                <label className="text-muted small fw-bold mb-1">
                  Overall Budget
                </label>
                <p className="fw-bold text-dark">{displayBudget}</p>
              </Col>
              <Col md={6}>
                <label className="text-muted small fw-bold mb-1 text-primary">
                  My Payout Amount
                </label>
                <p className="fw-bold text-primary">$25.00</p>
              </Col>
              <Col md={6}>
                <label className="text-muted small fw-bold mb-1">
                  knowledge Provider Assigned
                </label>
                <p className="small">{knowledgeProviderAssigned}</p>
              </Col>
              <Col md={6}>
                <label className="text-muted small fw-bold mb-1">
                  Request Creation Date
                </label>
                <p className="small">{displayDate}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* --- Progress Tracking Section --- */}
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: "15px" }}
        >
          <Card.Body className="p-4">
            <h6 className="fw-bold mb-3 text-muted">My Progress</h6>
            <ProgressBar
              now={progressValue}
              style={{ height: "10px", borderRadius: "10px" }}
              className="mb-2"
            />
            <div className="text-center text-primary fw-bold small">
              {progressValue}% Complete
            </div>
          </Card.Body>
        </Card>

        {/* --- Submission Area --- */}
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: "15px" }}
        >
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">Submission Area</h5>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted">
                Your Work Progress Notes
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="bg-light border-0"
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Label className="small fw-bold text-muted">
              Media Uploads (Max 10 files)
            </Form.Label>
            {/* تعديل منطقة الـ Drag & Drop لتصبح قابلة للضغط */}
            <div
              className="border-dashed border-2 p-5 text-center mb-2"
              style={{
                cursor: "pointer",
                borderRadius: "15px",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#f8fafc",
              }}
              onClick={() => document.getElementById("fileInput").click()} // Trigger hidden input
            >
              <input
                type="file"
                id="fileInput"
                multiple
                hidden
                onChange={handleFileUpload}
              />
              <Upload className="text-muted mb-2" size={32} />
              <div className="small text-muted fw-semibold">
                Click to upload or drag files here
              </div>
              <div style={{ fontSize: "0.7rem" }} className="text-muted mt-1">
                Supported: JPG, PNG, MP4 (Max 25MB)
              </div>
            </div>

            <p className="text-danger small mb-4 fw-medium">
              ⚠️ Please upload at least 5 files for deliverables. (Current:{" "}
              {files.length})
            </p>
            <div className="d-flex flex-column gap-2 mb-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 shadow-sm"
                >
                  <div className="d-flex align-items-center gap-3">
                    <FileText className="text-primary" size={20} />
                    <div className="d-flex flex-column">
                      <span className="small fw-bold">{file.name}</span>
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {file.size}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <X
                      className="text-danger cursor-pointer"
                      size={18}
                      onClick={() => removeFile(file.id)}
                    />

                    <RotateCcw
                      className="text-muted cursor-pointer"
                      size={18}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* --- Action Buttons --- */}
            <div className="d-flex justify-content-end gap-3 mt-5">
              <Button
                variant="light"
                className="px-4 py-2 small fw-bold text-secondary border"
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                className="px-4 py-2 small fw-bold shadow-sm"
                style={{ opacity: 0.6 }}
              >
                Submit Final Work
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
