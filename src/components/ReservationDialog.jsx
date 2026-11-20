import {useEffect, useRef, useState} from 'react';
import {
  cancelReservation,
  confirmReservation,
  createReservation,
} from '../api/reservations.js';
import {formatInterval, formatPrice} from '../utils/format.js';

/**
 * Dialogul de rezervare. La deschidere se creeaza rezervarea PENDING
 * (intervalul e blocat), se afiseaza pretul, apoi Team Lead-ul confirma.
 * @param {{resource: Object, interval: {start_time: string, end_time: string},
 *     onClose: function(), onDone: function(string)}} props
 * @return {JSX.Element}
 */
export default function ReservationDialog({resource, interval, onClose,
  onDone}) {
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const created = useRef(false);

  useEffect(() => {
    // in StrictMode efectul ruleaza de doua ori; rezervarea se creeaza o data
    if (created.current) {
      return;
    }
    created.current = true;
    createReservation({
      resource_id: resource.id,
      start_time: interval.start_time,
      end_time: interval.end_time,
    })
        .then(setReservation)
        .catch((e) => setError(e.message));
  }, [resource.id, interval]);

  const handleConfirm = async () => {
    setSending(true);
    setError('');
    try {
      await confirmReservation(reservation.id);
      onDone('Rezervarea a fost confirmata. Echipa a primit notificare.');
    } catch (e) {
      setError(e.message);
      setSending(false);
    }
  };

  const handleCancel = async () => {
    if (reservation) {
      await cancelReservation(reservation.id).catch(() => null);
    }
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true">
        <h2>Rezervare {resource.name}</h2>
        <p>
          <strong>{formatInterval(interval.start_time, interval.end_time)}</strong>
        </p>

        {!reservation && !error && <p className="muted">Se verifica...</p>}

        {reservation && (
          <table className="price-summary">
            <tbody>
              <tr>
                <td>Pret de baza</td>
                <td>{formatPrice(reservation.price)}</td>
              </tr>
              <tr>
                <td>Reducere loyalty</td>
                <td>{reservation.discount}%</td>
              </tr>
              <tr className="price-total">
                <td>Total</td>
                <td>{formatPrice(reservation.final_price)}</td>
              </tr>
            </tbody>
          </table>
        )}
        {reservation && (
          <p className="muted">
            Intervalul e blocat 10 minute. Daca nu confirmi, rezervarea expira.
          </p>
        )}

        {error && <p className="message message-error">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary"
            onClick={handleCancel} disabled={sending}>
            Renunta
          </button>
          <button type="button" className="btn" onClick={handleConfirm}
            disabled={!reservation || sending}>
            {sending ? 'Se confirma...' : 'Confirma rezervarea'}
          </button>
        </div>
      </div>
    </div>
  );
}
