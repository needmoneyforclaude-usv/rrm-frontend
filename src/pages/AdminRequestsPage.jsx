import {useEffect, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {approveReservation, getAllReservations} from '../api/reservations.js';
import RejectReservationDialog from
  '../components/RejectReservationDialog.jsx';
import {
  formatDateTime,
  formatHours,
  formatPrice,
  formatShortDay,
  reservationCode,
} from '../utils/format.js';

function overlaps(a, b) {
  return a.id !== b.id && a.resource_id === b.resource_id &&
    a.start_time < b.end_time && a.end_time > b.start_time;
}

export default function AdminRequestsPage() {
  const {user, loading: userLoading} = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [toReject, setToReject] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    setLoading(true);
    getAllReservations({status: 'PENDING'})
        .then((data) => {
          setRequests([...data].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)));
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [isAdmin, reloadKey]);

  const handleApprove = async (request) => {
    setSendingId(request.id);
    setError('');
    setSuccess('');
    try {
      await approveReservation(request.id);
      setSuccess(`Cererea ${reservationCode(request.id)} a fost aprobata. ` +
        'Echipa a primit notificare.');
      setReloadKey((key) => key + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingId(null);
    }
  };

  const handleRejected = () => {
    setSuccess(`Cererea ${reservationCode(toReject.id)} a fost respinsa.`);
    setToReject(null);
    setReloadKey((key) => key + 1);
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
          <h1>Cereri rezervare</h1>
          <p className="muted small">
            Cererile trimise de Team Lead-uri. Daca aprobi o cerere, celelalte
            cereri pe acelasi interval se resping automat.
          </p>
        </div>
      </div>

      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}
      {loading ? (
        <p className="muted">Se incarca cererile...</p>
      ) : requests.length === 0 ? (
        <p className="message">Nu exista cereri in asteptare.</p>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cerut de</th>
                <th>Echipa</th>
                <th>Resursa</th>
                <th>Zi</th>
                <th>Interval</th>
                <th>Scop</th>
                <th>Pret final</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{reservationCode(r.id)}</td>
                  <td>
                    <div className="booked-by">
                      <strong>{r.user_name || '-'}</strong>
                      {r.created_at && (
                        <span className="muted small">
                          trimisa {formatDateTime(r.created_at)}
                        </span>
                      )}
                      {requests.some((other) => overlaps(r, other)) && (
                        <span className="small text-warning">
                          Mai sunt cereri pe acest interval
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
                  <td className="table-actions">
                    <button
                      className="btn"
                      disabled={sendingId === r.id}
                      onClick={() => handleApprove(r)}
                    >
                      {sendingId === r.id ? 'Se aproba...' : 'Aproba'}
                    </button>{' '}
                    <button
                      className="btn btn-danger"
                      disabled={sendingId === r.id}
                      onClick={() => {
                        setSuccess('');
                        setToReject(r);
                      }}
                    >
                      Respinge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {toReject && (
        <RejectReservationDialog
          reservation={toReject}
          onClose={() => setToReject(null)}
          onRejected={handleRejected}
        />
      )}
    </section>
  );
}
