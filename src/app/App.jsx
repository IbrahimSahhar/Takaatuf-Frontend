// filepath: src/app/App.jsx

import AppRoutes from "./routes";
import AppProviders from "./providers";


/**
 * Root Component
 * Wraps the entire application with necessary providers and sets up routing.
 */
export default function App() {
  


  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}