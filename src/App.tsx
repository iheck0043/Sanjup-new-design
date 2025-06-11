import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuestionnaireForm from "./pages/QuestionnaireForm";
import QuestionnaireList from "./pages/QuestionnaireList";
import Surveys from "./pages/Surveys";
import BillboardTest from "./pages/BillboardTest";
import AdTestQuestions from "./pages/AdTestQuestions";
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
            path="/adtest/:id"
            element={
              <PrivateRoute>
                <BillboardTest />
              </PrivateRoute>
            }
          />
          <Route
            path="/adtest/:id/questions"
            element={
              <PrivateRoute>
                <AdTestQuestions />
              </PrivateRoute>
            }
          />
          <Route
            path="/surveys"
            element={
              <PrivateRoute>
                <Surveys />
              </PrivateRoute>
            }
          />
          <Route
            path="/list"
            element={
              <PrivateRoute>
                <QuestionnaireList />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Surveys />
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
