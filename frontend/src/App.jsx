import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Tasks from './pages/Tasks';
import TasksWeekView from './pages/TasksWeekView';
import Invoices from './pages/Invoices';
import ProfitOverview from './pages/ProfitOverview';
import Pipeline from './pages/Pipeline';
import CalendarEnhanced from './pages/CalendarEnhanced';
import Projects from './pages/Projects';
import Pricing from './pages/Pricing';
import QuotesArchive from './pages/QuotesArchive';
import AICaptions from './pages/AICaptions';
import GoogleDrive from './pages/GoogleDrive';
import GoogleCallback from './components/GoogleCallback';
import Admin from './pages/Admin';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tasks/week"
            element={
              <ProtectedRoute>
                <Layout>
                  <TasksWeekView />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profit-overview"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfitOverview />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <Layout>
                  <Pipeline />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Layout>
                  <CalendarEnhanced />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <Layout>
                  <Pricing />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/quotes-archive"
            element={
              <ProtectedRoute>
                <Layout>
                  <QuotesArchive />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/ai-captions"
            element={
              <ProtectedRoute>
                <Layout>
                  <AICaptions />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/google-drive"
            element={
              <ProtectedRoute>
                <Layout>
                  <GoogleDrive />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/google-callback" element={<GoogleCallback />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
