import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Dashboard from './Dashboard';
import { UserProvider } from './UserContext';
import HistoryPage from './HistoryPage';
import AdminDashboard from './adminDashboard';
import ManageRoles from './ManageRoles';

function App() {
  return (
    <Router>
      <UserProvider>
      <div>
        {/* <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </nav> */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<HistoryPage />} />  {/* Add HistoryPage route */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/manage-roles" element={<ManageRoles />} />

        </Routes>
      </div>
      </UserProvider>
    </Router>
  );
}

export default App;