import {useCallback, useEffect, useMemo, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {getTeams} from '../api/auth.js';
import {getAllReservations} from '../api/reservations.js';
import {getResources} from '../api/resources.js';
import CancelReservationDialog from
  '../components/CancelReservationDialog.jsx';
import ReservationDetailsDialog from
  '../components/ReservationDetailsDialog.jsx';
import {addDays, formatHours, toIsoDate} from '../utils/format.js';

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam', 'Dum'];
const INACTIVE = ['CANCELLED', 'EXPIRED'];

/**
 * Lunea saptamanii care contine data.
 * @param {!Date} date
 * @return {!Date}
 */
function mondayOf(date) {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/**
 * @param {!Date} date
 * @return {string} ex. "30.11"
 */
function dayMonth(date) {
  return toIsoDate(date).slice(8, 10) + '.' + toIsoDate(date).slice(5, 7);
}

/**
 * Calendarul adminului: toate rezervarile din saptamana, pe resurse si zile.
 * La click pe o rezervare se deschid detaliile, de unde poate fi anulata.
 * @return {JSX.Element}
 */
export default function AdminCalendarPage() {
  const {user, loading: userLoading} = useOutletContext();
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const [resources, setResources] = useState([]);
  const [teams, setTeams] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const days = useMemo(
      () => Array.from({length: 7}, (_, i) => addDays(monday, i)), [monday]);
  const today = toIsoDate(new Date());

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    getResources().then(setResources).catch((e) => setError(e.message));
    getTeams().then(setTeams).catch(() => null);
  }, [isAdmin]);

  const loadReservations = useCallback(() => {
    setLoading(true);
    return getAllReservations({
      teamId: teamId || undefined,
      dateFrom: toIsoDate(monday),
      dateTo: toIsoDate(addDays(monday, 6)),
    })
        .then((data) => {
          setReservations(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [monday, teamId]);

  useEffect(() => {
    if (isAdmin) {
      loadReservations();
    }
  }, [isAdmin, loadReservations]);

  // rezervarile grupate pe resursa si zi: {"resursa|2026-11-30": [...]}
  const cells = useMemo(() => {
    const grouped = {};
    reservations
        .filter((r) => showInactive || !INACTIVE.includes(r.status))
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .forEach((r) => {
          const key = `${r.resource_id}|${r.start_time.slice(0, 10)}`;
          (grouped[key] = grouped[key] || []).push(r);
        });
    return grouped;
  }, [reservations, showInactive]);

  const activeCount = reservations
      .filter((r) => !INACTIVE.includes(r.status)).length;

  const handleCancelled = async () => {
    setToCancel(null);
    setSelected(null);
    setSuccess('Rezervarea a fost anulata. Echipa a fost notificata.');
    await loadReservations();
  };

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
          <h1>Calendar rezervari</h1>
          <p className="muted small">
            Click pe o rezervare ca sa vezi detaliile sau sa o anulezi.
          </p>
        </div>
      </div>

      <div className="filters-row admin-calendar-toolbar">
        <button className="btn btn-secondary"
          onClick={() => setMonday(addDays(monday, -7))}>&larr;</button>
        <span className="week-label">
          {dayMonth(days[0])} &ndash; {dayMonth(days[6])}
        </span>
        <button className="btn btn-secondary"
          onClick={() => setMonday(addDays(monday, 7))}>&rarr;</button>
        <button className="btn btn-secondary"
          onClick={() => setMonday(mondayOf(new Date()))}>Azi</button>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="">Toate echipele</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Arata anulate si expirate
        </label>
        <span className="muted small">
          {loading ? 'Se incarca...' : `${activeCount} rezervari active`}
        </span>
      </div>

      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}

      <div className="card table-wrapper">
        <div className="admin-calendar">
          <div className="admin-calendar-corner">Resursa</div>
          {days.map((day, i) => (
            <div key={i} className={'admin-calendar-day' +
              (toIsoDate(day) === today ? ' is-today' : '')}>
              {DAY_NAMES[i]} {dayMonth(day)}
            </div>
          ))}

          {resources.map((resource) => (
            <div key={resource.id} className="admin-calendar-row">
              <div className="admin-calendar-resource">{resource.name}</div>
              {days.map((day) => {
                const iso = toIsoDate(day);
                const items = cells[`${resource.id}|${iso}`] || [];
                return (
                  <div key={iso} className={'admin-calendar-cell' +
                    (iso === today ? ' is-today' : '')}>
                    {items.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`booking-chip booking-${r.status
                            .toLowerCase()}`}
                        title={`${r.user_name} (${r.team_name})`}
                        onClick={() => {
                          setSuccess('');
                          setSelected(r);
                        }}
                      >
                        <strong>
                          {formatHours(r.start_time, r.end_time)}
                        </strong>
                        <span>{r.team_name}</span>
                        <span className="booking-user">{r.user_name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-legend">
        <span><i className="booking-confirmed" /> Confirmata</span>
        <span><i className="booking-pending" /> In asteptare</span>
        <span><i className="booking-cancelled" /> Anulata / expirata</span>
      </div>

      {selected && !toCancel && (
        <ReservationDetailsDialog
          reservation={selected}
          onClose={() => setSelected(null)}
          onCancel={setToCancel}
        />
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
