import {useState} from 'react';
import {rejectReservation} from '../api/reservations.js';
import {formatHours, formatShortDay, reservationCode} from '../utils/format.js';

export default function RejectReservationDialog({reservation, onClose,
  onRejected}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleReject = async () => {
    setSending(true);
    setError('');
    try {
      await rejectReservation(reservation.id, reason.trim());
      onRejected();
    } catch (e) {
      setError(e.message);
      setSending(false);
    }
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true">
        <h2>Respingi cererea {reservationCode(reservation.id)}?</h2>
        <p>
          {reservation.team_name}, {reservation.resource_name},{' '}
          {formatShortDay(reservation.start_time)},{' '}
          {formatHours(reservation.start_time, reservation.end_time)}.
        </p>
        <p className="muted">
          Team Lead-ul care a trimis cererea primeste notificare.
        </p>
        <label>
          Motiv (optional)
          <textarea
            rows={3}
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {error && <p className="message message-error">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary"
            onClick={onClose} disabled={sending}>
            Renunta
          </button>
          <button type="button" className="btn btn-danger"
            onClick={handleReject} disabled={sending}>
            {sending ? 'Se respinge...' : 'Respinge cererea'}
          </button>
        </div>
      </div>
    </div>
  );
}
