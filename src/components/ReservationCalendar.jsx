import {useEffect, useMemo, useState} from 'react';
import {getAvailability} from '../api/reservations.js';
import {addDays, toIsoDate} from '../utils/format.js';

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin'];

const STATUS_LABELS = {
  FREE: 'Liber',
  BOOKED: 'Ocupat',
  TEAM: 'Echipa ta',
  MAINTENANCE: 'Mentenanta',
  PAST: '-',
};

/**
 * Calendarul saptamanal al unei resurse (luni-vineri, sloturi de 2 ore).
 * Click pe un slot liber -> onPick(slot).
 * @param {{resourceId: string, reloadKey: number,
 *     onPick: function({start_time: string, end_time: string})}} props
 * @return {JSX.Element}
 */
export default function ReservationCalendar({resourceId, reloadKey, onPick}) {
  const [week, setWeek] = useState(toIsoDate(new Date()));
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    getAvailability(resourceId, week)
        .then(setSlots)
        .catch((e) => setError(e.message));
  }, [resourceId, week, reloadKey]);

  const days = useMemo(() => {
    const byDay = [];
    for (const slot of slots) {
      const day = slot.start_time.slice(0, 10);
      let group = byDay.find((d) => d.day === day);
      if (!group) {
        group = {day, slots: []};
        byDay.push(group);
      }
      group.slots.push(slot);
    }
    return byDay;
  }, [slots]);

  const hours = days.length ? days[0].slots.map((s) => s.start_time) : [];

  const changeWeek = (offset) => {
    setWeek(toIsoDate(addDays(new Date(week), offset * 7)));
  };

  return (
    <div className="calendar">
      <div className="calendar-toolbar">
        <button className="btn btn-secondary" onClick={() => changeWeek(-1)}>
          &larr;
        </button>
        <span className="muted">
          {days.length > 0 &&
            `${formatDay(days[0].day)} - ${formatDay(days[days.length - 1].day)}`}
        </span>
        <button className="btn btn-secondary" onClick={() => changeWeek(1)}>
          &rarr;
        </button>
      </div>
      {error && <p className="message message-error">{error}</p>}
      <div className="calendar-grid"
        style={{gridTemplateColumns: `56px repeat(${days.length}, 1fr)`}}>
        <div />
        {days.map((d, index) => (
          <div key={d.day} className="calendar-day">
            {DAY_NAMES[index]} {d.day.slice(8, 10)}
          </div>
        ))}
        {hours.map((hourStart, row) => [
          <div key={`h-${hourStart}`} className="calendar-hour">
            {hourStart.slice(11, 16)}
          </div>,
          ...days.map((d) => {
            const slot = d.slots[row];
            return (
              <button
                key={slot.start_time}
                type="button"
                className={`slot slot-${slot.status.toLowerCase()}`}
                disabled={slot.status !== 'FREE'}
                onClick={() => onPick(slot)}
              >
                {STATUS_LABELS[slot.status]}
              </button>
            );
          }),
        ])}
      </div>
    </div>
  );
}

/**
 * @param {string} day "2026-11-23"
 * @return {string} "23.11"
 */
function formatDay(day) {
  return `${day.slice(8, 10)}.${day.slice(5, 7)}`;
}
