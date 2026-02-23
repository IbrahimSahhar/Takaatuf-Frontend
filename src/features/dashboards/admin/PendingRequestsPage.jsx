// filepath: src/features/admin/pages/PendingRequestsPage.jsx
import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Card, OverlayTrigger, Tooltip, Offcanvas, ListGroup } from 'react-bootstrap';
import { FiCheckCircle, FiXCircle, FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiEye, FiInfo } from 'react-icons/fi';
import Swal from 'sweetalert2'; 

/**
 * Mock data representing pending knowledge requests.
 */
const INITIAL_MOCK_REQUESTS = [
  { id: 'REQ001', requester: 'Alice Johnson', category: 'Home Improvement', description: 'Need detailed instructions for solar panels installation on a flat roof. Including wiring and battery storage setup.', budget: '$500', kps: 2, neighborhood: 'Downtown', date: '2023-10-26', status: 'Pending', email: 'alice@example.com' },
  { id: 'REQ002', requester: 'Bob Smith', category: 'Technology', description: 'Guide to setting up a secure home network with VPN and firewall.', budget: '$750', kps: 1, neighborhood: 'Suburbia', date: '2023-10-25', status: 'Pending', email: 'bob@example.com' },
  { id: 'REQ003', requester: 'Charlie Brown', category: 'Finance', description: 'Investment strategies for beginners.', budget: '$600', kps: 1, neighborhood: 'Uptown', date: '2023-10-24', status: 'Pending', email: 'charlie@example.com' },
  { id: 'REQ004', requester: 'Charlie Brown', category: 'Finance', description: 'Investment strategies for beginners.', budget: '$600', kps: 1, neighborhood: 'Uptown', date: '2023-10-24', status: 'Pending', email: 'charlie@example.com' },
  { id: 'REQ005', requester: 'Charlie Brown', category: 'Finance', description: 'Investment strategies for beginners.', budget: '$600', kps: 1, neighborhood: 'Uptown', date: '2023-10-24', status: 'Pending', email: 'charlie@example.com' },
  { id: 'REQ006', requester: 'Charlie Brown', category: 'Finance', description: 'Investment strategies for beginners.', budget: '$600', kps: 1, neighborhood: 'Uptown', date: '2023-10-24', status: 'Pending', email: 'charlie@example.com' },
  { id: 'REQ007', requester: 'Dave Wilson', category: 'Health', description: 'Dietary plan for marathon runners.', budget: '$400', kps: 1, neighborhood: 'Eastside', date: '2023-10-23', status: 'Pending', email: 'dave@example.com' },
  { id: 'REQ008', requester: 'Eva Green', category: 'Education', description: 'Online tutoring setup guide.', budget: '$300', kps: 3, neighborhood: 'Westend', date: '2023-10-22', status: 'Pending', email: 'eva@example.com' },
];

export default function PendingRequestsPage() {
  // --- Data & UI State ---
  const [requests, setRequests] = useState(INITIAL_MOCK_REQUESTS);
  const [showDetails, setShowDetails] = useState(false); // Controls the Side Drawer
  const [selectedRequest, setSelectedRequest] = useState(null); // Stores data for the drawer

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  // --- Drawer Handlers ---
  const handleOpenDetails = (req) => {
    setSelectedRequest(req);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  // --- Action Handlers ---

  // Handle Approve with confirmation
  const handleApprove = (id) => {
    Swal.fire({
      title: 'Approve Request?',
      text: "This request will be visible to Knowledge Partners.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      confirmButtonText: 'Yes, Approve it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(requests.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
        setShowDetails(false); // Close drawer after action
        Swal.fire('Approved!', 'The request has been approved.', 'success');
      }
    });
  };

  // Handle Reject Confirmation
  const handleReject = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to reject this request? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Reject it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Update the request status
        setRequests(requests.map(req => req.id === id ? { ...req, status: 'Rejected' } : req));
        
        // Close details view/drawer
        setShowDetails(false); 
        
        // Show success message
        Swal.fire(
          'Rejected!',
          'The request has been successfully rejected.',
          'success'
        );
      }
    });
  };

  // Pagination navigation
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-4 bg-light min-vh-100">
      
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '1.2rem' }}>
          Pending Knowledge Requests
        </h5>
        
        <div className="d-flex flex-wrap align-items-center gap-2">
          <InputGroup style={{ width: '260px' }}>
            <InputGroup.Text className="bg-white border-end-0 py-1 px-2">
              <FiSearch className="text-muted" size={16} />
            </InputGroup.Text>
            <Form.Control 
              placeholder="Search requests..." 
              className="border-start-0 ps-1 py-1" 
              style={{ fontSize: '0.85rem' }}
            />
          </InputGroup>

          <Form.Select className="py-1" style={{ width: '90px', fontSize: '0.85rem' }}>
            <option>All</option>
          </Form.Select>

          <Button variant="outline-dark" className="d-flex align-items-center gap-2 py-1 px-3" style={{ fontSize: '0.85rem' }}>
            <FiDownload size={14} /> Export
          </Button>

          <Form.Select className="py-1" style={{ width: '130px', fontSize: '0.85rem' }}>
            <option disabled selected>Bulk Actions</option>
            <option>Approve All</option>
            <option>Reject All</option>
          </Form.Select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Table hover responsive className="m-0 align-middle shadow-none">
          <thead className="bg-white border-bottom">
            <tr className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <th className="ps-4" style={{ width: '40px' }}><Form.Check /></th>
              <th>Request ID</th>
              <th>Requester</th>
              <th>Category</th>
              <th>Description</th>
              <th>Budget</th>
              <th className="text-center">KPs Needed</th>
              <th>Neighborhood</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.88rem' }}>
            {currentRequests.map((req) => (
              <tr key={req.id}>
                <td className="ps-4"><Form.Check /></td>
                <td className="fw-medium text-dark">{req.id}</td>
                <td className="fw-medium">
                  <div className="d-flex align-items-center gap-2">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${req.requester}&background=f8f9fa&color=6c757d`} 
                      alt="avatar" 
                      className="rounded-circle border"
                      style={{ width: '28px', height: '28px' }}
                    />
                    {req.requester}
                  </div>
                </td>
                <td>
                  <Badge bg="primary" className="bg-opacity-10 text-primary fw-medium px-3 py-2 rounded-pill border-0">
                    {req.category}
                  </Badge>
                </td>
                <td style={{ maxWidth: '200px' }}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id={`tooltip-${req.id}`}>{req.description}</Tooltip>}
                  >
                    <div className="text-truncate text-muted">{req.description}</div>
                  </OverlayTrigger>
                </td>
                <td className="fw-bold text-dark">{req.budget}</td>
                <td className="text-center">{req.kps}</td>
                <td>{req.neighborhood}</td>
                <td className="text-muted">{req.date}</td>
                <td>
                  <Badge 
                    bg={req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : 'danger'} 
                    className={`bg-opacity-10 text-${req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : 'danger'} fw-semibold px-3 py-2 rounded-pill border-0`}
                  >
                    {req.status}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-3">
                    {/* View Details Icon */}
                    <Button 
                      variant="link" 
                      className="p-0 text-primary border-0" 
                      onClick={() => handleOpenDetails(req)}
                    >
                      <FiEye size={18} />
                    </Button>

                    {/* Decision Buttons */}
                    {req.status === 'Pending' ? (
                      <>
                        <Button 
                          variant="link" 
                          className="p-0 text-success border-0" 
                          onClick={() => handleApprove(req.id)}
                        >
                          <FiCheckCircle size={18} />
                        </Button>
                        <Button 
                          variant="link" 
                          className="p-0 text-danger border-0" 
                          onClick={() => handleReject(req.id)}
                        >
                          <FiXCircle size={18} />
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted small">Processed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Dynamic Pagination Section */}
        <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-center">
          <div className="d-flex gap-2 align-items-center">
             <Button 
                variant="link" 
                className="text-decoration-none text-muted p-1 d-flex align-items-center shadow-none" 
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                <FiChevronLeft size={18} /> Previous
             </Button>

             <div className="bg-light text-dark rounded-2 px-3 py-1 fw-bold border" style={{ fontSize: '0.85rem' }}>
                {currentPage}
             </div>

             <Button 
                variant="link" 
                className="text-decoration-none text-muted p-1 d-flex align-items-center shadow-none"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight size={18} />
             </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* --- Side Drawer for Request Details --- */}
      <Offcanvas show={showDetails} onHide={handleCloseDetails} placement="end" style={{ width: '450px' }}>
        <Offcanvas.Header closeButton className="border-bottom bg-light">
          <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
            <FiInfo className="text-primary" /> Request Details
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedRequest && (
            <div className="d-flex flex-column h-100">
              {/* Requester Info Card */}
              <div className="mb-4 text-center">
                 <img 
                    src={`https://ui-avatars.com/api/?name=${selectedRequest.requester}&size=128&background=0d6efd&color=fff`} 
                    className="rounded-circle mb-2 border p-1 shadow-sm" alt="user" 
                    style={{ width: '80px' }}
                 />
                 <h5 className="mb-0 fw-bold">{selectedRequest.requester}</h5>
                 <p className="text-muted small">{selectedRequest.email || 'user@example.com'}</p>
              </div>

              {/* Data Summary List */}
              <ListGroup variant="flush" className="border rounded-3 mb-4 shadow-sm">
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                    <span className="text-muted small">Status</span>
                    <Badge bg={selectedRequest.status === 'Pending' ? 'warning' : 'success'} className="bg-opacity-10 text-dark border-0">
                      {selectedRequest.status}
                    </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3">
                    <span className="text-muted small">Budget Allocation</span>
                    <span className="fw-bold text-success">{selectedRequest.budget}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3">
                    <span className="text-muted small">Location</span>
                    <span className="fw-medium">{selectedRequest.neighborhood}</span>
                </ListGroup.Item>
              </ListGroup>

              {/* Full Description Box */}
              <div className="mb-4 flex-grow-1">
                <h6 className="fw-bold text-dark mb-2">Detailed Description</h6>
                <div className="p-3 bg-light rounded-3 text-muted border" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                  {selectedRequest.description}
                </div>
              </div>

              {/* Decision Buttons inside Drawer */}
              {selectedRequest.status === 'Pending' && (
                <div className="d-flex gap-2 mt-auto pt-3 border-top">
                  <Button 
                    variant="success" 
                    className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    <FiCheckCircle /> Approve
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleReject(selectedRequest.id)}
                  >
                    <FiXCircle /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

