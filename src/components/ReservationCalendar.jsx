import {useEffect, useMemo, useState} from 'react';
import {getAvailability} from '../api/reservations.js';
import {addDays, toIsoDate} from '../utils/format.js';

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam', 'Dum'];

const STATUS_LABELS = {
  FREE: 'Liber',
  BOOKED: 'Rezervat',
  MAINTENANCE: 'Mentenanta',
  PAST: 'Trecut',
};

/**
 * Calendarul saptamanal al unei resurse. Se selecteaza un interval de
 * sloturi libere consecutive din aceeasi zi (click pe primul si pe ultimul).
 * @param {{resourceId: string, reloadKey: number,
 *     onSelect: function(?{start_time: string, end_time: string})}} props
 * @return {JSX.Element}
 */
export default function ReservationCalendar({resourceId, reloadKey,
  onSelect}) {
  const [week, setWeek] = useState(toIsoDate(new Date()));
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [first, setFirst] = useState(null);
  const [last, setLast] = useState(null);

  useEffect(() => {
    setError('');
    setFirst(null);
    setLast(null);
    onSelect(null);
    getAvailability(resourceId, week)
        .then(setSlots)
        .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isSelected = (slot) => {
    if (!first) {
      return false;
    }
    const end = last || first;
    return slot.start_time >= first.start_time &&
      slot.start_time <= end.start_time;
  };

  const handleClick = (slot) => {
    if (slot.status !== 'FREE') {
      return;
    }
    const sameDay = first &&
      first.start_time.slice(0, 10) === slot.start_time.slice(0, 10);
    if (!first || last || !sameDay || slot.start_time < first.start_time) {
      setFirst(slot);
      setLast(null);
      onSelect({start_time: slot.start_time, end_time: slot.end_time});
      return;
    }
    const between = slots.filter((s) => s.start_time >= first.start_time &&
      s.start_time <= slot.start_time);
    if (between.some((s) => s.status !== 'FREE')) {
      setError('Intervalul ales contine ore ocupate.');
      return;
    }
    setError('');
    setLast(slot);
    onSelect({start_time: first.start_time, end_time: slot.end_time});
  };

  const changeWeek = (offset) => {
    setWeek(toIsoDate(addDays(new Date(week), offset * 7)));
  };

  return (
    <div className="calendar">
      <div className="calendar-toolbar">
        <button className="btn btn-secondary" onClick={() => changeWeek(-1)}>
          &larr; Saptamana anterioara
        </button>
        <span className="muted">
          {days.length > 0 &&
            `${days[0].day} - ${days[days.length - 1].day}`}
        </span>
        <button className="btn btn-secondary" onClick={() => changeWeek(1)}>
          Saptamana urmatoare &rarr;
        </button>
      </div>
      {error && <p className="message message-error">{error}</p>}
      <div className="calendar-grid"
        style={{gridTemplateColumns: `60px repeat(${days.length}, 1fr)`}}>
        <div />
        {days.map((d, index) => (
          <div key={d.day} className="calendar-day">
            {DAY_NAMES[index]} {d.day.slice(8, 10)}.{d.day.slice(5, 7)}
          </div>
        ))}
        {hours.map((hourStart, row) => (
          <Row key={hourStart} hour={hourStart.slice(11, 16)}>
            {days.map((d) => {
              const slot = d.slots[row];
              return (
                <button
                  key={slot.start_time}
                  type="button"
                  className={`slot slot-${slot.status.toLowerCase()}` +
                    (isSelected(slot) ? ' slot-selected' : '')}
                  title={STATUS_LABELS[slot.status]}
                  disabled={slot.status !== 'FREE'}
                  onClick={() => handleClick(slot)}
                />
              );
            })}
          </Row>
        ))}
      </div>
      <div className="calendar-legend">
        <span><i className="slot slot-free" /> Liber</span>
        <span><i className="slot slot-booked" /> Rezervat</span>
        <span><i className="slot slot-maintenance" /> Mentenanta</span>
        <span><i className="slot slot-selected" /> Selectat</span>
      </div>
    </div>
  );
}

/**
 * Un rand din grila: ora + celulele zilelor.
 * @param {{hour: string, children: *}} props
 * @return {JSX.Element}
 */
function Row({hour, children}) {
  return (
    <>
      <div className="calendar-hour">{hour}</div>
      {children}
    </>
  );
}
