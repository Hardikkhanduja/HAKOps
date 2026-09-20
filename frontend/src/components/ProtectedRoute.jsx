import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthSession } from "../utils/session";

export default function ProtectedRoute() {
  const location = useLocation();
  const session = getAuthSession();

  if (!session?.sessionId) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
