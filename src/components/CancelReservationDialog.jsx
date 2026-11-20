import {useState} from 'react';
import {cancelReservation} from '../api/reservations.js';
import {formatHours, formatShortDay, reservationCode} from '../utils/format.js';

/**
 * Confirmarea anularii unei rezervari (wireframe 06).
 * @param {{reservation: Object, onClose: function(),
 *     onCancelled: function()}} props
 * @return {JSX.Element}
 */
export default function CancelReservationDialog({reservation, onClose,
  onCancelled}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleCancel = async () => {
    setSending(true);
    setError('');
    try {
      await cancelReservation(reservation.id, reason.trim());
      onCancelled();
    } catch (e) {
      setError(e.message);
      setSending(false);
    }
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true">
        <h2>Anulezi rezervarea {reservationCode(reservation.id)}?</h2>
        <p>
          {reservation.resource_name}, {formatShortDay(reservation.start_time)},{' '}
          {formatHours(reservation.start_time, reservation.end_time)}.
        </p>
        <p className="muted">
          Intervalul devine liber si echipa e notificata.
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
            Pastreaza
          </button>
          <button type="button" className="btn btn-danger"
            onClick={handleCancel} disabled={sending}>
            {sending ? 'Se anuleaza...' : 'Anuleaza rezervarea'}
          </button>
        </div>
      </div>
    </div>
  );
}
