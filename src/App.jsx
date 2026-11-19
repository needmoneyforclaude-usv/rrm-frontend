import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AdminMaintenancePage from './pages/AdminMaintenancePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ResourceDetailsPage from './pages/ResourceDetailsPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import TeamReservationsPage from './pages/TeamReservationsPage.jsx';

/**
 * Rutele aplicatiei.
 * @return {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/resources/:resourceId"
            element={<ResourceDetailsPage />}
          />
          <Route path="/reservations" element={<TeamReservationsPage />} />
          <Route
            path="/admin/maintenance"
            element={<AdminMaintenancePage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
