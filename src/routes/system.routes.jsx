// filepath: src/routes/system.routes.jsx
import { Route } from "react-router-dom";
import { ROUTES } from "../constants";

/* Lazy Pages */
import { P } from "./lazyPages";

export const systemRoutes = () => {
  return (
    <>
      <Route path={ROUTES.FORBIDDEN} element={<P.ForbiddenPage />} />
      <Route path={ROUTES.NOT_FOUND} element={<P.NotFoundPage />} />
    </>
  );
};

