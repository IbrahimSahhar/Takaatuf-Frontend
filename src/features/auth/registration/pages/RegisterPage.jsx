// filepath: src/features/auth/registration/pages/RegisterPage.jsx
import { Container } from "react-bootstrap";
import RegisterCard from "../components/RegisterCard";

/*
  RegisterPage Component
   Acts as the top-level container for the registration flow.
   It centers the RegisterCard horizontally and adds vertical padding
   to ensure a clean layout across different screen sizes.
 */
export default function RegisterPage() {
  return (
    <Container className="py-5 d-flex justify-content-center">
      {/* The core registration logic and form UI are encapsulated 
        within the RegisterCard component to maintain separation of concerns.
      */}
      <RegisterCard />
    </Container>
  );
}