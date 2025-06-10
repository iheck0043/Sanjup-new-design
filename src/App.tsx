
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuestionnaireForm from "./pages/QuestionnaireForm";
import QuestionnaireList from "./pages/QuestionnaireList";
import Audience from "./pages/Audience";
import Index from "./pages/Index";
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route
            path="/audience"
            element={
              <PrivateRoute>
                <Audience />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <QuestionnaireList />
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
