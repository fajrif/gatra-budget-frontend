import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ConfirmProvider } from '@/context/ConfirmContext';

// Pages
import Login from '@/pages/Login';
import UserProfile from '@/pages/UserProfile';
import Dashboard from '@/pages/Dashboard';

// Address reference pages (admin only)
import Countries from '@/pages/masters/Countries';
import Provinces from '@/pages/masters/Provinces';
import Cities from '@/pages/masters/Cities';
import Areas from '@/pages/masters/Areas';

// Budget master data pages (admin only)
import Clients from '@/pages/masters/Clients';
import ContractTypes from '@/pages/masters/ContractTypes';
import CostTypes from '@/pages/masters/CostTypes';

// Projects (open to any authenticated user)
import Projects from '@/pages/operationals/Projects';
import ProjectDetail from '@/pages/operationals/ProjectDetail';
import Transactions from '@/pages/operationals/Transactions';
import Invoices from '@/pages/operationals/Invoices';

// Operational pages
import Users from '@/pages/operationals/Users';
import UserAddresses from '@/pages/operationals/UserAddresses';

// Reports
import ReportSample from '@/pages/reports/ReportSample';
import MonthlyReport from '@/pages/reports/MonthlyReport';

// Layout
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AuthProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserProfile />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Address reference — admin only */}
              <Route
                path="/countries"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <Countries />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/provinces"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <Provinces />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cities"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <Cities />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/areas"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <Areas />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Projects — open to any authenticated user */}
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
                path="/projects/:projectId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectDetail />
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
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Budget master data — admin only */}
              <Route
                path="/clients"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <Clients />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/contract-types"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <ContractTypes />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cost-types"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <CostTypes />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Users management — admin only */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Current user's addresses */}
              <Route
                path="/my-addresses"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserAddresses />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Reports */}
              <Route
                path="/reports/sample"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportSample />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Monthly report — admin only (remaining budget and margin) */}
              <Route
                path="/reports/monthly"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <MonthlyReport />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
