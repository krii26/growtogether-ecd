import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <Header />
      <div style={{ paddingTop: 0, paddingBottom: 64 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/children" element={<Children />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/std_dashboard" element={<StdDashboard />} />
          <Route path="/teacher_dashboard" element={<TeacherDash />} />
          <Route path="/students" element={<Student />} />
          <Route path="/publish-results" element={<PublishResults />} />
          <Route path="/e-library" element={<ELibrary />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;