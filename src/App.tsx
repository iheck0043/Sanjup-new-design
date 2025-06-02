import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import Login from "./pages/Login";
import Surveys from "./pages/Surveys";
import QuestionnaireForm from "./pages/QuestionnaireForm";
import { Toaster } from "sonner";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const storedToken = localStorage.getItem("access_token");

  if (!accessToken && !storedToken) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Surveys />
              </PrivateRoute>
            }
          />
          <Route
            path="/questionnaire/new"
            element={
              <PrivateRoute>
                <QuestionnaireForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/questionnaire/:id"
            element={
              <PrivateRoute>
                <QuestionnaireForm />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </Router>
  );
}

export default App;
