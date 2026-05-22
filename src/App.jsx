import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Formulae = lazy(() => import("./pages/Formulae"));
const Home = lazy(() => import("./pages/Home"));
const Learn = lazy(() => import("./pages/Learn"));
const Login = lazy(() => import("./pages/Login"));
const Models = lazy(() => import("./pages/Models"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Signup = lazy(() => import("./pages/Signup"));

function RouteLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-electric opacity-20" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/models/:subject" element={<Models />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/formulae"
                element={
                  <ProtectedRoute>
                    <Formulae />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
