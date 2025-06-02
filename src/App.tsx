
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import Layout from "./components/Layout";
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
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Surveys />} />
                    <Route path="/questionnaire/new" element={<QuestionnaireForm />} />
                    <Route path="/questionnaire/:id" element={<QuestionnaireForm />} />
                    <Route path="/profile" element={<div className="p-6">صفحه پروفایل</div>} />
                  </Routes>
                </Layout>
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
