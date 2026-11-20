import {useEffect, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {getWeekStatistics} from '../api/statistics.js';
import {addDays, toIsoDate} from '../utils/format.js';

/**
 * Dashboard-ul administratorului (wireframe 07): rezervari active,
 * resurse in mentenanta si gradul de ocupare pe resursa.
 * @return {JSX.Element}
 */
export default function AdminDashboardPage() {
  const {user, loading} = useOutletContext();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [week, setWeek] = useState(toIsoDate(new Date()));

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }
    getWeekStatistics(week).then(setStats).catch((e) => setError(e.message));
  }, [user?.role, week]);

  const changeWeek = (offset) => {
    setWeek(toIsoDate(addDays(new Date(week), offset * 7)));
  };

  if (loading) {
    return <p className="muted">Se incarca...</p>;
  }
  if (user?.role !== 'ADMIN') {
    return <p className="message">Pagina este doar pentru administratori.</p>;
  }
  if (error) {
    return <p className="message message-error">{error}</p>;
  }
  if (!stats) {
    return <p className="muted">Se incarca statisticile...</p>;
  }

  const monday = new Date(stats.week_start);
  const friday = addDays(monday, 4);
  const average = stats.resources.length ?
    Math.round(stats.resources.reduce((sum, r) =>
      sum + r.occupancy_percent, 0) / stats.resources.length) :
    0;

  return (
    <section>
      <h1>Dashboard</h1>
      <div className="calendar-toolbar">
        <button className="btn btn-secondary" onClick={() => changeWeek(-1)}>
          &larr;
        </button>
        <span className="muted small">
          Saptamana {monday.getDate()}&ndash;{friday.getDate()}{' '}
          {friday.toLocaleDateString('ro-RO', {month: 'long'})}
        </span>
        <button className="btn btn-secondary" onClick={() => changeWeek(1)}>
          &rarr;
        </button>
      </div>

      <div className="stat-cards">
        <div className="card stat-card">
          <span className="muted small">Rezervari active</span>
          <strong>{stats.active_reservations}</strong>
        </div>
        <div className="card stat-card">
          <span className="muted small">Ocupare medie</span>
          <strong>{average}%</strong>
        </div>
        <div className="card stat-card">
          <span className="muted small">In mentenanta</span>
          <strong>{stats.in_maintenance}</strong>
        </div>
      </div>

      <h2>Ocupare pe resursa</h2>
      <div className="card occupancy-list">
        {stats.resources.map((r) => (
          <div key={r.resource_id} className="occupancy-row">
            <span>{r.resource_name}</span>
            <div className="occupancy-bar">
              <div style={{width: `${r.occupancy_percent}%`}} />
            </div>
            <span className="muted">{r.occupancy_percent}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
