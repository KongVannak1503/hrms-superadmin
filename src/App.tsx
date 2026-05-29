import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import CompanyListPage from './pages/CompanyListPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import BranchDetailPage from './pages/BranchDetailPage';
import CompanyCreatePage from './pages/CompanyCreatePage';
import CompanyEditPage from './pages/CompanyEditPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import GlobalConfigPage from './pages/settings/GlobalConfigPage';
import UsersPage from './pages/settings/UsersPage';
import AllUsersPage from './pages/settings/AllUsersPage';
import AuditLogPage from './pages/settings/AuditLogPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected SuperAdmin Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/companies" element={<CompanyListPage />} />
              <Route path="/companies/create" element={<CompanyCreatePage />} />
              <Route path="/companies/:id" element={<CompanyDetailPage />} />
              <Route path="/companies/:companyId/branches/:branchId" element={<BranchDetailPage />} />
              <Route path="/companies/:id/edit" element={<CompanyEditPage />} />
              <Route path="/settings/global" element={<GlobalConfigPage />} />
              <Route path="/settings/users" element={<UsersPage />} />
              <Route path="/settings/users/all" element={<AllUsersPage />} />
              <Route path="/settings/audit" element={<AuditLogPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              {/* Add more superadmin routes here as needed */}
            </Route>
          </Routes>
        </Router>
      </LayoutProvider>
    </AuthProvider>
  );
}

export default App;
