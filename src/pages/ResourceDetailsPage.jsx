import {useEffect, useState} from 'react';
import {Link, useOutletContext, useParams} from 'react-router-dom';
import {
  getCategories,
  getResource,
  getResourceMaintenance,
} from '../api/resources.js';
import ReservationCalendar from '../components/ReservationCalendar.jsx';
import ReservationDialog from '../components/ReservationDialog.jsx';
import {formatInterval, formatPrice} from '../utils/format.js';

/**
 * Pagina de detalii a unei resurse.
 * @return {JSX.Element}
 */
export default function ResourceDetailsPage() {
  const {resourceId} = useParams();
  const {user} = useOutletContext();
  const [resource, setResource] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [maintenance, setMaintenance] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setError('');
    Promise.all([
      getResource(resourceId),
      getCategories(),
      getResourceMaintenance(resourceId),
    ])
        .then(([resourceData, categories, maintenanceData]) => {
          setResource(resourceData);
          const category = categories.find(
              (c) => c.id === resourceData.category_id);
          setCategoryName(category ? category.name : '');
          const now = new Date();
          setMaintenance(
              maintenanceData.filter((m) => new Date(m.end_time) > now));
        })
        .catch((e) => setError(e.status === 404 ?
          'Resursa nu exista.' :
          e.message));
  }, [resourceId]);

  if (error) {
    return (
      <section>
        <Link to="/">&larr; Inapoi la catalog</Link>
        <p className="message message-error">{error}</p>
      </section>
    );
  }
  if (!resource) {
    return <p className="muted">Se incarca...</p>;
  }

  return (
    <section className="details">
      <Link to="/">&larr; Inapoi la catalog</Link>
      <div className="card details-card">
        <div className="details-header">
          <div>
            {categoryName && <span className="badge">{categoryName}</span>}
            <h1>{resource.name}</h1>
          </div>
          <div className="details-price">
            {formatPrice(resource.price_per_hour)}
            <span className="muted"> / ora</span>
          </div>
        </div>
        <p>{resource.description || 'Fara descriere'}</p>
        <p className="muted">
          Echipele cu vechime primesc reducere de loyalty la rezervare.
        </p>
      </div>

      <div className="card">
        <h2>Perioade de mentenanta programate</h2>
        {maintenance.length === 0 ? (
          <p className="muted">Nu exista mentenanta programata.</p>
        ) : (
          <ul className="simple-list">
            {maintenance.map((m) => (
              <li key={m.id}>
                <strong>{formatInterval(m.start_time, m.end_time)}</strong>
                {m.reason && <span className="muted"> &ndash; {m.reason}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <h2>Calendar si rezervare</h2>
        {success && <p className="message message-success">{success}</p>}
        <ReservationCalendar
          resourceId={resourceId}
          reloadKey={calendarKey}
          onSelect={setSelected}
        />
        {user?.role === 'LEAD' ? (
          <button
            className="btn"
            disabled={!selected}
            onClick={() => {
              setSuccess('');
              setDialogOpen(true);
            }}
          >
            {selected ?
              `Rezerva ${formatInterval(selected.start_time,
                  selected.end_time)}` :
              'Alege un interval din calendar'}
          </button>
        ) : (
          <p className="muted">
            {user ?
              'Doar Team Lead-ul echipei poate face rezervari.' :
              <><Link to="/login">Intra in cont</Link> ca sa rezervi.</>}
          </p>
        )}
      </div>

      {dialogOpen && selected && (
        <ReservationDialog
          resource={resource}
          interval={selected}
          onClose={() => {
            setDialogOpen(false);
            setCalendarKey((k) => k + 1);
          }}
          onDone={(message) => {
            setDialogOpen(false);
            setSuccess(message);
            setCalendarKey((k) => k + 1);
          }}
        />
      )}
    </section>
  );
}
