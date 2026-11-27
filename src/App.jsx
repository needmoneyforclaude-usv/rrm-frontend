import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AdminCalendarPage from './pages/AdminCalendarPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminMaintenancePage from './pages/AdminMaintenancePage.jsx';
import AdminReservationsPage from './pages/AdminReservationsPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ResourceDetailsPage from './pages/ResourceDetailsPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import TeamReservationsPage from './pages/TeamReservationsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route
            path="/resources/:resourceId"
            element={<ResourceDetailsPage />}
          />
          <Route path="/reservations" element={<TeamReservationsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/calendar" element={<AdminCalendarPage />} />
          <Route
            path="/admin/reservations"
            element={<AdminReservationsPage />}
          />
          <Route
            path="/admin/maintenance"
            element={<AdminMaintenancePage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
