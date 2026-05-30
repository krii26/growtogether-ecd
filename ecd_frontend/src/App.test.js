import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => {
  return {
    BrowserRouter: ({ children }) => <>{children}</>,
    Routes: ({ children }) => <>{children}</>,
    Route: ({ path, element }) => (path === '/' ? element : null),
    Navigate: () => null,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => jest.fn(),
  };
}, { virtual: true });

jest.mock('./pages/Home', () => () => <div>Nurturing Growth</div>);
jest.mock('./pages/Children', () => () => <div>Children</div>);
jest.mock('./pages/Milestones', () => () => <div>Milestones</div>);
jest.mock('./pages/Register', () => () => <div>Register</div>);
jest.mock('./pages/Login', () => () => <div>Login</div>);
jest.mock('./pages/StdDashboard', () => () => <div>Std Dashboard</div>);
jest.mock('./pages/TeacherDash', () => () => <div>Teacher Dashboard</div>);
jest.mock('./pages/ELibrary', () => () => <div>E-Library</div>);
jest.mock('./pages/Student', () => () => <div>Student</div>);
jest.mock('./pages/PublishResults', () => () => <div>Publish Results</div>);
jest.mock('./pages/Activities', () => () => <div>Activities</div>);
jest.mock('./pages/AdminDashboard', () => () => <div>Admin Dashboard</div>);
jest.mock('./pages/ChatRoom', () => () => <div>Chat</div>);
jest.mock('./components/Header', () => () => <div>GrowTogether</div>);
jest.mock('./components/Footer', () => () => <div>Footer</div>);

const App = require('./App').default;

test('renders the GrowTogether home experience', () => {
  render(<App />);
  expect(screen.getAllByText(/GrowTogether/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Nurturing Growth/i)).toBeInTheDocument();
});
