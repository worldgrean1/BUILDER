import { Navigate } from "react-router-dom";

/**
 * Root entry — redirects to the default workspace page.
 * Keeps the SPA deterministic: every visit lands on /creator.
 */
const Index = () => <Navigate to="/creator" replace />;

export default Index;
