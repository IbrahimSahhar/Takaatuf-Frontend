// filepath: src/features/admin/pages/PendingPayoutsPage.jsx
import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Card, Dropdown, Modal, ListGroup } from 'react-bootstrap';
import { 
  FiSearch, FiDownload, FiChevronLeft, FiChevronRight, 
  FiMoreVertical, FiCalendar, FiEye, FiCheck, FiX, FiMessageCircle 
} from 'react-icons/fi';

/**
 * Initial Mock data for payout requests
 */
const INITIAL_PAYOUTS = [
  { id: 'PAY001', kpName: 'David Lee', kpId: 'KP101', amount: '$250', wallet: '0xab...r678', via: 'Wallet', date: '2023-11-01', status: 'Pending' },
  { id: 'PAY002', kpName: 'Michael Wong', kpId: 'KP103', amount: '$700', wallet: 'mike....com', via: 'PayPal', date: '2023-10-31', status: 'Pending' },
  { id: 'PAY003', kpName: 'Sarah Chen', kpId: 'KP102', amount: '$280', wallet: '0xde...u901', via: 'Wallet', date: '2023-10-30', status: 'Completed' },
  { id: 'PAY004', kpName: 'Jessica Kim', kpId: 'KP104', amount: '$400', wallet: 'jess....com', via: 'Bank Transfer', date: '2023-10-29', status: 'Pending' },
  { id: 'PAY005', kpName: 'Chris Green', kpId: 'KP105', amount: '$380', wallet: 'chri....com', via: 'PayPal', date: '2023-10-28', status: 'Failed' },
  { id: 'PAY006', kpName: 'John Doe', kpId: 'KP106', amount: '$150', wallet: '0x7y...z123', via: 'Wallet', date: '2023-10-27', status: 'Pending' },
  { id: 'PAY007', kpName: 'Linda May', kpId: 'KP107', amount: '$900', wallet: 'linda...com', via: 'PayPal', date: '2023-10-26', status: 'Pending' },
  { id: 'PAY008', kpName: 'Ray Hudson', kpId: 'KP108', amount: '$520', wallet: '0x99...p444', via: 'Wallet', date: '2023-10-25', status: 'Completed' },
];

export default function PendingPayoutsPage() {
  // --- States ---
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Modal Visibility States ---
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const [selectedPayout, setSelectedPayout] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  
  // --- Pagination Logic ---
  const totalPages = Math.ceil(payouts.length / itemsPerPage);
  const currentPayouts = payouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Action Handlers ---

  // Handle opening Approval Modal
  const handleApproveClick = (payout) => {
    setSelectedPayout(payout);
    setTransactionId('');
    setShowApproveModal(true);
  };

  // Confirm payout with Transaction ID
  const confirmPayout = () => {
    if (!transactionId.trim()) return;
    setPayouts(prev => prev.map(p => 
      p.id === selectedPayout.id ? { ...p, status: 'Completed' } : p
    ));
    setShowApproveModal(false);
  };

  // Handle opening Reject Modal
  const handleRejectClick = (payout) => {
    setSelectedPayout(payout);
    setShowRejectModal(true);
  };

  // Confirm Rejection logic
  const confirmReject = () => {
    setPayouts(prev => prev.map(p => 
      p.id === selectedPayout.id ? { ...p, status: 'Failed' } : p
    ));
    setShowRejectModal(false);
  };

  // View Details Handler
  const handleViewDetails = (payout) => {
    setSelectedPayout(payout);
    setShowDetailsModal(true);
  };

  // Contact KP Handler
  const handleContact = (payout) => {
    setSelectedPayout(payout);
    setShowContactModal(true);
  };

  // Pagination Handlers
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

  return (
    <div className="p-4 bg-light min-vh-100">
      
      {/* Updated Header Section based on Reference Image */}
      <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <h5 className="fw-bold m-0 text-dark">Pending Payouts</h5>
          <Badge bg="light" className="text-muted border fw-normal px-2" style={{ fontSize: '0.75rem' }}>
            {payouts.filter(p => p.status === 'Pending').length} Pending
          </Badge>
        </div>
        
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Search by KP ID or name */}
          <InputGroup style={{ width: '220px' }}>
            <InputGroup.Text className="bg-white border-end-0 py-1 pe-1">
              <FiSearch size={14} className="text-muted" />
            </InputGroup.Text>
            <Form.Control 
              placeholder="Search by KP ID or name..." 
              className="border-start-0 ps-1 py-1" 
              style={{ fontSize: '0.8rem' }} 
            />
          </InputGroup>

          {/* Status Filter */}
          <Form.Select style={{ width: '110px', fontSize: '0.8rem' }} className="py-1 shadow-none">
            <option>All</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>Failed</option>
          </Form.Select>

          {/* Date Range Picker */}
          <InputGroup style={{ width: '180px' }}>
            <InputGroup.Text className="bg-white border-end-0 py-1 pe-1">
              <FiCalendar size={14} className="text-muted" />
            </InputGroup.Text>
            <Form.Control 
              placeholder="Date range" 
              className="border-start-0 ps-1 py-1" 
              style={{ fontSize: '0.8rem' }} 
            />
          </InputGroup>

          {/* Export Button */}
          <Button variant="outline-dark" className="d-flex align-items-center gap-1 py-1 px-2 shadow-none" style={{ fontSize: '0.8rem' }}>
            <FiDownload size={13} /> Export
          </Button>
        </div>
      </div>

      {/* Payouts Table Card */}
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Table hover responsive className="m-0 align-middle shadow-none">
          <thead className="bg-white border-bottom">
            <tr className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '600' }}>
              <th className="ps-4" style={{ width: '40px' }}><Form.Check /></th>
              <th>PAYOUT ID</th>
              <th>KP IDENTIFIER</th>
              <th>AMOUNT</th>
              <th>WALLET ADDRESS</th>
              <th>VIA</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th className="text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.88rem' }}>
            {currentPayouts.map((pay) => (
              <tr key={pay.id}>
                <td className="ps-4">{pay.status === 'Pending' && <Form.Check />}</td>
                <td className="fw-medium">{pay.id}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${pay.kpName}&background=f8f9fa&color=6c757d`} 
                      alt="avatar" className="rounded-circle border" style={{ width: '28px' }}
                    />
                    <div>
                      <span className="fw-bold d-block">{pay.kpName}</span>
                      <small className="text-muted">({pay.kpId})</small>
                    </div>
                  </div>
                </td>
                <td className="fw-bold text-dark">{pay.amount}</td>
                <td className="text-muted font-monospace" style={{ fontSize: '0.8rem' }}>{pay.wallet}</td>
                <td>
                  <Badge bg="primary" className="bg-opacity-10 text-primary fw-medium px-2 py-1 border-0" style={{ fontSize: '0.75rem' }}>
                    {pay.via}
                  </Badge>
                </td>
                <td className="text-muted small">{pay.date}</td>
                <td>
                  <Badge 
                    bg={pay.status === 'Completed' ? 'success' : pay.status === 'Failed' ? 'danger' : 'secondary'} 
                    className={`bg-opacity-10 text-${pay.status === 'Completed' ? 'success' : pay.status === 'Failed' ? 'danger' : 'muted'} fw-semibold px-2 py-1 border-0`}
                  >
                    ● {pay.status}
                  </Badge>
                </td>
                <td className="text-center">
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="p-0 text-muted shadow-none border-0 no-caret">
                      <FiMoreVertical size={18} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="shadow border-0" style={{ fontSize: '0.85rem' }}>
                      <Dropdown.Item onClick={() => handleViewDetails(pay)} className="d-flex align-items-center gap-2 py-2">
                        <FiEye size={14} /> View Details
                      </Dropdown.Item>
                      
                      {pay.status === 'Pending' && (
                        <>
                          <Dropdown.Item onClick={() => handleApproveClick(pay)} className="d-flex align-items-center gap-2 py-2 text-success">
                            <FiCheck size={14} /> Approve Payout
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleRejectClick(pay)} className="d-flex align-items-center gap-2 py-2 text-danger">
                            <FiX size={14} /> Reject Request
                          </Dropdown.Item>
                        </>
                      )}

                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => handleContact(pay)} className="d-flex align-items-center gap-2 py-2 text-primary">
                        <FiMessageCircle size={14} /> Contact KP
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination Section */}
        <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-center align-items-center gap-2">
          <Button variant="link" className="text-decoration-none text-muted p-1 shadow-none" onClick={handlePrev} disabled={currentPage === 1}>
            <FiChevronLeft size={18} /> Previous
          </Button>
          <div className="bg-primary text-white rounded-2 px-3 py-1 fw-bold">{currentPage}</div>
          <Button variant="link" className="text-decoration-none text-muted p-1 shadow-none" onClick={handleNext} disabled={currentPage === totalPages}>
            Next <FiChevronRight size={18} />
          </Button>
        </Card.Footer>
      </Card>

      {/* --- MODALS SECTION --- */}

      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold h5 text-success">Complete Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted small mb-3">
            Please enter the Transaction ID for the payment made to <strong>{selectedPayout?.kpName}</strong>.
          </p>
          <Form.Group>
            <Form.Label className="small fw-bold">Transaction ID / Reference</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="e.g. TXN-9872165" 
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="py-2 shadow-none"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowApproveModal(false)}>Cancel</Button>
          <Button variant="success" onClick={confirmPayout} disabled={!transactionId.trim()} className="px-4 text-white">Confirm Completion</Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered size="sm">
        <Modal.Body className="text-center py-4">
          <FiX size={48} className="text-danger mb-3" />
          <h5 className="fw-bold">Reject Payout?</h5>
          <p className="text-muted small">This action will mark the payout as failed. This cannot be undone.</p>
          <div className="d-flex gap-2 justify-content-center mt-4">
            <Button variant="light" className="w-50" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="danger" className="w-50" onClick={confirmReject}>Yes, Reject</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* View Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold h5">Payout Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <ListGroup variant="flush" className="small border rounded">
            <ListGroup.Item className="d-flex justify-content-between">
              <span className="text-muted">Payout ID:</span> <span className="fw-bold">{selectedPayout?.id}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between">
              <span className="text-muted">KP Name:</span> <span className="fw-bold">{selectedPayout?.kpName}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between">
              <span className="text-muted">Amount:</span> <span className="fw-bold text-dark">{selectedPayout?.amount}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between">
              <span className="text-muted">Wallet Address:</span> <span className="font-monospace">{selectedPayout?.wallet}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between">
              <span className="text-muted">Payment Method:</span> <span>{selectedPayout?.via}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between">
              <span className="text-muted">Request Date:</span> <span>{selectedPayout?.date}</span>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="primary" className="w-100" onClick={() => setShowDetailsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Contact Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold h5">Contact KP</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <FiMessageCircle size={40} className="text-primary mb-3" />
          <p>Redirecting to chat with <strong>{selectedPayout?.kpName}</strong> ({selectedPayout?.kpId})...</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="w-100" onClick={() => setShowContactModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

