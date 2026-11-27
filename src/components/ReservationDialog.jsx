import {useEffect, useRef, useState} from 'react';
import {getTeams} from '../api/auth.js';
import {
  cancelReservation,
  confirmReservation,
  createReservation,
} from '../api/reservations.js';
import {formatPrice} from '../utils/format.js';
import {affiliationYears} from '../utils/pricing.js';

const WEEK_DAYS = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri',
  'Sambata'];

export default function ReservationDialog({resource, interval, user, onClose,
  onDone}) {
  const [reservation, setReservation] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const created = useRef(false);

  useEffect(() => {
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
    getTeams()
        .then((teams) => {
          const team = teams.find((t) => t.id === user.team_id);
          setTeamName(team ? team.name : '');
        })
        .catch(() => null);
  }, [resource.id, interval, user.team_id]);

  const handleConfirm = async () => {
    setSending(true);
    setError('');
    try {
      await confirmReservation(reservation.id, purpose.trim());
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

  const start = new Date(interval.start_time);
  const end = new Date(interval.end_time);
  const hours = (end - start) / 3600000;
  const years = affiliationYears(user.affiliation_date);

  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true">
        <h2>Rezervare &ndash; {resource.name}</h2>
        <dl className="dialog-info">
          <dt>Zi</dt>
          <dd>
            {WEEK_DAYS[start.getDay()]}{' '}
            {interval.start_time.slice(8, 10)}.{interval.start_time.slice(5, 7)}
          </dd>
          <dt>Interval</dt>
          <dd>
            {interval.start_time.slice(11, 16)}&ndash;
            {interval.end_time.slice(11, 16)} ({hours} h)
          </dd>
          <dt>Echipa</dt>
          <dd>{teamName || '-'}</dd>
        </dl>

        <label>
          Scop (optional)
          <input
            type="text"
            maxLength={255}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </label>

        {!reservation && !error && <p className="muted">Se verifica...</p>}

        {reservation && (
          <div className="price-box">
            <div>
              <span>Pret de baza</span>
              <span>{formatPrice(reservation.price)}</span>
            </div>
            <div>
              <span>Reducere loyalty ({years} ani)</span>
              <span>
                &minus;{formatPrice(reservation.price -
                  reservation.final_price)} ({reservation.discount}%)
              </span>
            </div>
            <div className="price-total">
              <span>Total</span>
              <span>{formatPrice(reservation.final_price)}</span>
            </div>
          </div>
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
