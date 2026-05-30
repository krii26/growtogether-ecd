import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Children from './pages/Children';
import Milestones from './pages/Milestones';
import Register from './pages/Register';
import Login from './pages/Login';
import StdDashboard from './pages/StdDashboard';
import TeacherDash from './pages/TeacherDash';
import ELibrary from './pages/ELibrary';
import Student from './pages/Student';
import PublishResults from './pages/PublishResults';
import Activities from './pages/Activities';
import AdminDashboard from './pages/AdminDashboard';
import ChatRoom from './pages/ChatRoom';
import Header from './components/Header';
import Footer from './components/Footer';
import API from './api/api';

const normalizeRole = (role) => {
  const normalized = (role || '').toString().trim().toUpperCase();
  if (normalized === 'SUPER_ADMIN') {
    return 'ADMIN';
  }
  return normalized;
};

const getCurrentRole = () => {
  const rawUser = sessionStorage.getItem('user');
  if (!rawUser) {
    return '';
  }
  try {
    const user = JSON.parse(rawUser);
    return normalizeRole(user?.role);
  } catch (_) {
    return '';
  }
};

const getDefaultPathByRole = (role) => {
  if (role === 'ADMIN') {
    return '/admin_dashboard';
  }
  if (role === 'TEACHER') {
    return '/teacher_dashboard';
  }
  if (role === 'PARENT') {
    return '/std_dashboard';
  }
  return '/login';
};

const ProtectedRoleRoute = ({ element, allowedRoles }) => {
  const token = sessionStorage.getItem('token');
  const role = getCurrentRole();
  const isAuthenticated = Boolean(token) || Boolean(role);

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDefaultPathByRole(role)} replace />;
  }

  return element;
};

const App = () => {
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = getCurrentRole();

    if (!token || !role) {
      return;
    }

    const baseEndpoints = ['children/', 'milestones/', 'activities/', 'elibrary/'];

    const roleEndpoints = {
      PARENT: ['progress_reports/', 'follow_up_messages/'],
      TEACHER: ['progress_reports/', 'elibrary/'],
      ADMIN: ['user_profiles/', 'progress_reports/', 'follow_up_messages/'],
    };

    const endpoints = Array.from(new Set([...(baseEndpoints || []), ...((roleEndpoints[role] || []))]));

    Promise.allSettled(endpoints.map((endpoint) => API.get(endpoint))).catch(() => {});
  }, []);

  return (
    <Router>
      <Header />
      <div style={{ paddingTop: 0, paddingBottom: 64 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/std_dashboard"
            element={<ProtectedRoleRoute allowedRoles={['PARENT']} element={<StdDashboard />} />}
          />
          <Route
            path="/children"
            element={<ProtectedRoleRoute allowedRoles={['PARENT', 'ADMIN']} element={<Children />} />}
          />
          <Route
            path="/milestones"
            element={<ProtectedRoleRoute allowedRoles={['PARENT', 'ADMIN']} element={<Milestones />} />}
          />
          <Route
            path="/activities"
            element={<ProtectedRoleRoute allowedRoles={['PARENT', 'ADMIN']} element={<Activities />} />}
          />
          <Route
            path="/teacher_dashboard"
            element={<ProtectedRoleRoute allowedRoles={['TEACHER']} element={<TeacherDash />} />}
          />
          <Route
            path="/students"
            element={<ProtectedRoleRoute allowedRoles={['TEACHER', 'ADMIN']} element={<Student />} />}
          />
          <Route
            path="/publish-results"
            element={<ProtectedRoleRoute allowedRoles={['TEACHER', 'ADMIN']} element={<PublishResults />} />}
          />
          <Route
            path="/admin_dashboard"
            element={<ProtectedRoleRoute allowedRoles={['ADMIN']} element={<AdminDashboard />} />}
          />
          <Route
            path="/e-library"
            element={<ProtectedRoleRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']} element={<ELibrary />} />}
          />
          <Route
            path="/chat"
            element={<ProtectedRoleRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']} element={<ChatRoom />} />}
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;