import {useEffect, useMemo, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {getTeams} from '../api/auth.js';
import {getAllReservations} from '../api/reservations.js';
import {getResources} from '../api/resources.js';
import CancelReservationDialog from
  '../components/CancelReservationDialog.jsx';
import {canBeCancelled} from '../components/ReservationDetailsDialog.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  formatDateTime,
  formatHours,
  formatPrice,
  formatShortDay,
  reservationCode,
} from '../utils/format.js';

const STATUSES = [
  {value: '', label: 'Toate starile'},
  {value: 'PENDING', label: 'In asteptare'},
  {value: 'CONFIRMED', label: 'Confirmate'},
  {value: 'CANCELLED', label: 'Anulate'},
  {value: 'EXPIRED', label: 'Expirate'},
];

/**
 * Pagina de admin cu toate rezervarile si cine le-a facut.
 * @return {JSX.Element}
 */
export default function AdminReservationsPage() {
  const {user, loading: userLoading} = useOutletContext();
  const [reservations, setReservations] = useState([]);
  const [resources, setResources] = useState([]);
  const [teams, setTeams] = useState([]);
  const [status, setStatus] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toCancel, setToCancel] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    getResources().then(setResources).catch(() => null);
    getTeams().then(setTeams).catch(() => null);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    setLoading(true);
    getAllReservations({
      status,
      resourceId: resourceId || undefined,
      teamId: teamId || undefined,
    })
        .then((data) => {
          setReservations(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [isAdmin, status, resourceId, teamId, reloadKey]);

  const handleCancelled = () => {
    setToCancel(null);
    setSuccess('Rezervarea a fost anulata. Echipa a fost notificata.');
    setReloadKey((key) => key + 1);
  };

  // cautare dupa numele sau emailul celui care a rezervat
  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) {
      return reservations;
    }
    return reservations.filter((r) =>
      (r.user_name || '').toLowerCase().includes(text) ||
      (r.user_email || '').toLowerCase().includes(text));
  }, [reservations, search]);

  if (userLoading) {
    return <p className="muted">Se incarca...</p>;
  }
  if (!isAdmin) {
    return (
      <p className="message">
        Aceasta pagina este disponibila doar administratorilor.
      </p>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Toate rezervarile</h1>
          <p className="muted small">
            Cine a facut fiecare rezervare, pe ce resursa si pentru ce echipa.
          </p>
        </div>
      </div>

      <div className="filters-row">
        <input
          className="search-input"
          type="search"
          placeholder="Cauta dupa nume sau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
        >
          <option value="">Toate resursele</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="">Toate echipele</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}
      {loading ? (
        <p className="muted">Se incarca rezervarile...</p>
      ) : visible.length === 0 ? (
        <p className="message">Nu exista rezervari pentru filtrele alese.</p>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rezervat de</th>
                <th>Echipa</th>
                <th>Resursa</th>
                <th>Zi</th>
                <th>Interval</th>
                <th>Scop</th>
                <th>Pret final</th>
                <th>Stare</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>{reservationCode(r.id)}</td>
                  <td>
                    <div className="booked-by">
                      <strong>{r.user_name || '-'}</strong>
                      {r.user_email && (
                        <a className="small" href={`mailto:${r.user_email}`}>
                          {r.user_email}
                        </a>
                      )}
                      {r.created_at && (
                        <span className="muted small">
                          creata {formatDateTime(r.created_at)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{r.team_name || '-'}</td>
                  <td>{r.resource_name}</td>
                  <td>{formatShortDay(r.start_time)}</td>
                  <td>{formatHours(r.start_time, r.end_time)}</td>
                  <td>{r.purpose || <span className="muted">&mdash;</span>}</td>
                  <td>
                    {r.final_price != null ? formatPrice(r.final_price) : '-'}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="table-actions">
                    {canBeCancelled(r) ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSuccess('');
                          setToCancel(r);
                        }}
                      >
                        Anuleaza
                      </button>
                    ) : (
                      <span className="muted">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && (
        <p className="muted small">{visible.length} rezervari afisate</p>
      )}
      {toCancel && (
        <CancelReservationDialog
          reservation={toCancel}
          onClose={() => setToCancel(null)}
          onCancelled={handleCancelled}
        />
      )}
    </section>
  );
}
