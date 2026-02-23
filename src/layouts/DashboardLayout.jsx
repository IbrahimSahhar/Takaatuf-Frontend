// filepath: src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Topbar from "../components/layout/Topbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

export default function DashboardLayout() {
  return (
    <>
      {/* Topbar */}
      <Topbar />

      {/* Body */}
      <Container fluid className="py-4">
        <Row className="g-3">
          {/* Sidebar */}
          <Col xs={12} md={3} lg={2}>
            <Sidebar />
          </Col>

          {/* Content */}
          <Col xs={12} md={9} lg={10}>
            <div
              className="border rounded p-3 bg-white"
              style={{ minHeight: 400 ,marginLeft:40}}
            >
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>
        <Footer/>

    </>
  );
}

