import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-4">
        <div className="premium-surface w-full max-w-md rounded-3xl p-6 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-electric/20 border-t-electric" />
          <p className="mt-4 font-black text-white">Syncing student cockpit...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
