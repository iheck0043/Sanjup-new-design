import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { ThemeProvider } from "./lib/theme-context";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuestionnaireForm from "./pages/QuestionnaireForm";
import QuestionnaireList from "./pages/QuestionnaireList";
import Surveys from "./pages/Surveys";
import BillboardTest from "./pages/BillboardTest";
import AdTestQuestions from "./pages/AdTestQuestions";
import Audience from "./pages/Audience";
import ReportResults from "./pages/ReportResults";
import Preview from "./pages/Preview";
import SurveyResultsDemo from "./components/SurveyResultsDemo";
import SurveyResultsRealDemo from "./components/SurveyResultsRealDemo";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sanjup-ui-theme">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/survey-results-demo"
              element={<SurveyResultsDemo />}
            />
            <Route
              path="/survey-results-real"
              element={<SurveyResultsRealDemo />}
            />

            {/* Protected routes with layout */}
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
              path="/questionnaire/:id/audience"
              element={
                <PrivateRoute>
                  <Audience />
                </PrivateRoute>
              }
            />
            <Route
              path="/questionnaire/:id/results"
              element={
                <PrivateRoute>
                  <ReportResults />
                </PrivateRoute>
              }
            />
            <Route
              path="/questionnaire/:id/preview"
              element={
                <PrivateRoute>
                  <Preview />
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
              path="/adtest/:id/audience"
              element={
                <PrivateRoute>
                  <Audience />
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
              path="/adtest/:id/results"
              element={
                <PrivateRoute>
                  <ReportResults />
                </PrivateRoute>
              }
            />
            <Route
              path="/adtest/:id/preview"
              element={
                <PrivateRoute>
                  <Preview />
                </PrivateRoute>
              }
            />
            <Route
              path="/surveys"
              element={
                <PrivateRoute>
                  <Layout>
                    <Surveys />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/list"
              element={
                <PrivateRoute>
                  <Layout>
                    <QuestionnaireList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Surveys />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster position="bottom-left" richColors closeButton />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
