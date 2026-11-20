import {Navigate, NavLink, Outlet} from 'react-router-dom';
import {clearToken, getToken} from '../api/client.js';
import {useCurrentUser} from '../hooks/useCurrentUser.js';
import NotificationsPanel from './NotificationsPanel.jsx';

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  LEAD: 'Team Lead',
  MEMBER: 'Membru',
};

/**
 * Initialele din nume, pentru avatar (ex. "Ion Popescu" -> "IP").
 * @param {string} name
 * @return {string}
 */
function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2)
      .map((part) => part[0].toUpperCase()).join('');
}

/**
 * Structura paginilor dupa login: bara de sus, meniul din stanga si
 * zona in care se afiseaza pagina curenta (ca in wireframe).
 * @return {JSX.Element}
 */
export default function Layout() {
  const {user, loading} = useCurrentUser();

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    clearToken();
    window.location.assign('/login');
  };

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo-box" />
        <span className="app-title">Research Resource Manager</span>
        <div className="topbar-right">
          {user && <NotificationsPanel />}
          {user && (
            <span className="avatar" title={
              `${user.name} (${ROLE_LABELS[user.role] || user.role})`}>
              {initials(user.name)}
            </span>
          )}
        </div>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <NavLink to="/" end>Catalog resurse</NavLink>
          {user?.team_id && (
            <NavLink to="/reservations">Rezervarile echipei</NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/maintenance">Mentenanta resurse</NavLink>
          )}
          <button type="button" className="sidebar-link"
            onClick={handleLogout}>
            Deconectare
          </button>
          {user && (
            <div className="sidebar-user">
              <strong>{user.name}</strong>
              <span className="muted">{ROLE_LABELS[user.role]}</span>
            </div>
          )}
        </aside>
        <main className="content">
          <Outlet context={{user, loading}} />
        </main>
      </div>
    </div>
  );
}
