import {useEffect, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {getResources} from '../api/resources.js';
import MaintenanceDialog from '../components/MaintenanceDialog.jsx';
import ResourceFormDialog from '../components/ResourceFormDialog.jsx';
import ResourceImage from '../components/ResourceImage.jsx';
import {formatPrice} from '../utils/format.js';

/**
 * Zona de admin: lista resurselor, adaugare / editare resursa si setarea
 * perioadelor de mentenanta.
 * @return {JSX.Element}
 */
export default function AdminMaintenancePage() {
  const {user, loading} = useOutletContext();
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // null = inchis, {} = resursa noua, altfel resursa editata
  const [editing, setEditing] = useState(null);

  const loadResources = () => {
    getResources().then(setResources).catch((e) => setError(e.message));
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleResourceSaved = (saved, wasEdit) => {
    setEditing(null);
    setSuccess(wasEdit ?
      `Resursa ${saved.name} a fost actualizata.` :
      `Resursa ${saved.name} a fost adaugata.`);
    loadResources();
  };

  if (loading) {
    return <p className="muted">Se incarca...</p>;
  }
  if (user?.role !== 'ADMIN') {
    return (
      <p className="message">
        Aceasta pagina este disponibila doar administratorilor.
      </p>
    );
  }

  const handleSaved = (result) => {
    const cancelled = result?.cancelled_reservations ??
      result?.cancelledReservations ?? 0;
    setSuccess(`Mentenanta pentru ${selected.name} a fost salvata. ` +
      `Rezervari anulate: ${cancelled}.`);
    setSelected(null);
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Gestionare resurse</h1>
          <p className="muted small">
            Adauga resurse noi, editeaza-le sau seteaza perioade de mentenanta.
          </p>
        </div>
        <button
          className="btn"
          onClick={() => {
            setSuccess('');
            setEditing({});
          }}
        >
          + Adauga resursa
        </button>
      </div>
      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}
      <div className="card table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Resursa</th>
              <th>Pret / ora</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td className="thumb-cell">
                  <ResourceImage resource={resource} />
                </td>
                <td>{resource.name}</td>
                <td>{formatPrice(resource.price_per_hour)}</td>
                <td className="table-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSuccess('');
                      setEditing(resource);
                    }}
                  >
                    Editeaza
                  </button>{' '}
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSuccess('');
                      setSelected(resource);
                    }}
                  >
                    Seteaza mentenanta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <ResourceFormDialog
          resource={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={handleResourceSaved}
        />
      )}
      {selected && (
        <MaintenanceDialog
          resource={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
