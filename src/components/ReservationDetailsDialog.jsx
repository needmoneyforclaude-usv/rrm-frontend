import {Link} from 'react-router-dom';
import {
  formatDateTime,
  formatHours,
  formatPrice,
  formatShortDay,
  reservationCode,
} from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';

/**
 * Se mai poate anula: e activa si nu a inceput inca.
 * @param {Object} reservation
 * @return {boolean}
 */
export function canBeCancelled(reservation) {
  return ['PENDING', 'CONFIRMED'].includes(reservation.status) &&
    new Date(reservation.start_time) > new Date();
}

/**
 * Detaliile unei rezervari, deschise din calendarul adminului.
 * @param {{reservation: Object, onClose: function(),
 *     onCancel: function(Object)}} props
 * @return {JSX.Element}
 */
export default function ReservationDetailsDialog({reservation, onClose,
  onCancel}) {
  const rows = [
    ['Resursa', reservation.resource_name],
    ['Zi', formatShortDay(reservation.start_time)],
    ['Interval', formatHours(reservation.start_time, reservation.end_time)],
    ['Echipa', reservation.team_name || '-'],
    ['Rezervat de', reservation.user_name ?
      `${reservation.user_name} (${reservation.user_email})` : '-'],
    ['Creata la', reservation.created_at ?
      formatDateTime(reservation.created_at) : '-'],
    ['Scop', reservation.purpose || '-'],
    ['Pret final', reservation.final_price != null ?
      formatPrice(reservation.final_price) +
        (reservation.discount > 0 ? ` (-${reservation.discount}%)` : '') :
      '-'],
  ];

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title-row">
          <h2>Rezervarea {reservationCode(reservation.id)}</h2>
          <StatusBadge status={reservation.status} />
        </div>
        <dl className="details-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="dialog-actions">
          <Link className="btn btn-secondary"
            to={`/resources/${reservation.resource_id}`}>
            Vezi resursa
          </Link>
          <button type="button" className="btn btn-secondary"
            onClick={onClose}>
            Inchide
          </button>
          {canBeCancelled(reservation) && (
            <button type="button" className="btn btn-danger"
              onClick={() => onCancel(reservation)}>
              Anuleaza rezervarea
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
