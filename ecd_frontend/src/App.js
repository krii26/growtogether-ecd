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

const AUTH_ACTIVE_USER_KEY = 'gt_active_auth_user';
const AUTH_LAST_ACTIVITY_KEY = 'gt_auth_last_activity';
const AUTH_LOGIN_AT_KEY = 'gt_auth_login_at';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

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

const getCurrentUser = () => {
  const rawUser = sessionStorage.getItem('user');
  if (!rawUser) {
    return null;
  }
  try {
    return JSON.parse(rawUser);
  } catch (_) {
    return null;
  }
};

const clearSessionAndRedirectToLogin = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem(AUTH_ACTIVE_USER_KEY);
  localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
  localStorage.removeItem(AUTH_LOGIN_AT_KEY);
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
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
    const user = getCurrentUser();
    const role = normalizeRole(user?.role);

    if (!token || !user?.id || !role) {
      return;
    }

    const userId = String(user.id);
    const now = Date.now();
    const activeUserId = localStorage.getItem(AUTH_ACTIVE_USER_KEY);

    if (activeUserId && activeUserId !== userId) {
      clearSessionAndRedirectToLogin();
      return;
    }

    localStorage.setItem(AUTH_ACTIVE_USER_KEY, userId);
    if (!localStorage.getItem(AUTH_LOGIN_AT_KEY)) {
      localStorage.setItem(AUTH_LOGIN_AT_KEY, String(now));
    }
    if (!localStorage.getItem(AUTH_LAST_ACTIVITY_KEY)) {
      localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, String(now));
    }

    let lastWriteTs = 0;
    const touchActivity = () => {
      const ts = Date.now();
      if (ts - lastWriteTs < 5000) {
        return;
      }
      lastWriteTs = ts;
      if (localStorage.getItem(AUTH_ACTIVE_USER_KEY) === userId) {
        localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, String(ts));
      }
    };

    const enforceTimeouts = () => {
      if (!sessionStorage.getItem('token')) {
        return;
      }

      const currentActiveUserId = localStorage.getItem(AUTH_ACTIVE_USER_KEY);
      if (currentActiveUserId && currentActiveUserId !== userId) {
        clearSessionAndRedirectToLogin();
        return;
      }

      const loginAt = Number(localStorage.getItem(AUTH_LOGIN_AT_KEY) || 0);
      const lastActivity = Number(localStorage.getItem(AUTH_LAST_ACTIVITY_KEY) || 0);
      const nowTs = Date.now();
      if ((loginAt && nowTs - loginAt > ABSOLUTE_TIMEOUT_MS) || (lastActivity && nowTs - lastActivity > IDLE_TIMEOUT_MS)) {
        if (localStorage.getItem(AUTH_ACTIVE_USER_KEY) === userId) {
          localStorage.removeItem(AUTH_ACTIVE_USER_KEY);
          localStorage.removeItem(AUTH_LOGIN_AT_KEY);
          localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
        }
        clearSessionAndRedirectToLogin();
      }
    };

    const onStorage = (event) => {
      if (![AUTH_ACTIVE_USER_KEY, AUTH_LAST_ACTIVITY_KEY, AUTH_LOGIN_AT_KEY].includes(event.key)) {
        return;
      }

      const currentActiveUserId = localStorage.getItem(AUTH_ACTIVE_USER_KEY);
      if (!currentActiveUserId || currentActiveUserId !== userId) {
        clearSessionAndRedirectToLogin();
      }
    };

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, touchActivity, { passive: true }));
    window.addEventListener('storage', onStorage);
    const intervalId = window.setInterval(enforceTimeouts, 15000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, touchActivity));
      window.removeEventListener('storage', onStorage);
      window.clearInterval(intervalId);
    };
  }, []);

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