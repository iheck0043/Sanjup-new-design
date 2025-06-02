
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
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
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
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Surveys />} />
            <Route path="profile" element={<Profile />} />
            <Route path="questionnaire/new" element={<QuestionnaireForm />} />
            <Route path="questionnaire/:id" element={<QuestionnaireForm />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </Router>
  );
}

export default App;
