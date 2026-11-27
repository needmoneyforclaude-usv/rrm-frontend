import {useEffect, useState} from 'react';
import {
  createMaintenance,
  getAffectedReservations,
} from '../api/maintenance.js';
import {getTeams} from '../api/auth.js';
import {formatShortDay} from '../utils/format.js';

export default function MaintenanceDialog({resource, onClose, onSaved}) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [affected, setAffected] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState({});

  useEffect(() => {
    getTeams()
        .then((data) => setTeams(
            Object.fromEntries(data.map((t) => [t.id, t.name]))))
        .catch(() => null);
  }, []);

  const intervalValid = startTime && endTime && endTime > startTime;

  useEffect(() => {
    setAffected(null);
    if (!intervalValid) {
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      getAffectedReservations(resource.id, startTime, endTime)
          .then((data) => active && setAffected(data))
          .catch((e) => active && setError(e.message));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [resource.id, startTime, endTime, intervalValid]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!intervalValid) {
      setError('Ora de sfarsit trebuie sa fie dupa ora de start.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await createMaintenance(resource.id, {
        start_time: startTime,
        end_time: endTime,
        reason: reason.trim() || null,
      });
      onSaved(result);
    } catch (e) {
      setError(e.status === 405 ?
        'Salvarea mentenantei nu este inca disponibila in backend.' :
        e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form
        className="dialog"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>Mentenanta &ndash; {resource.name}</h2>

        <div className="form-row">
          <label>
            Inceput
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </label>
          <label>
            Sfarsit
            <input
              type="datetime-local"
              value={endTime}
              min={startTime || undefined}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Motiv
          <input
            type="text"
            maxLength={255}
            placeholder="ex. update drivere, calibrare"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>

        {intervalValid && affected && (
          <div className="affected">
            {affected.length === 0 ? (
              <p className="muted">
                Nicio rezervare nu este afectata de aceasta perioada.
              </p>
            ) : (
              <>
                <p className="affected-warning">
                  {affected.length === 1 ?
                    '1 rezervare afectata' :
                    `${affected.length} rezervari afectate`} (vor fi anulate)
                </p>
                <ul className="simple-list">
                  {affected.map((reservation) => (
                    <li key={reservation.id}>
                      Echipa {teams[reservation.team_id] ||
                        `#${reservation.team_id}`}{' '}
                      &ndash; {formatShortDay(reservation.start_time)},{' '}
                      {reservation.start_time.slice(11, 16)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {error && <p className="message message-error">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Renunta
          </button>
          <button
            type="submit"
            className={affected?.length ? 'btn btn-danger' : 'btn'}
            disabled={saving || !intervalValid}
          >
            {saving ? 'Se salveaza...' :
              affected?.length ? 'Salveaza si anuleaza' : 'Salveaza'}
          </button>
        </div>
      </form>
    </div>
  );
}
