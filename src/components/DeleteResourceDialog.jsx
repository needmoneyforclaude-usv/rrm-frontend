import {useState} from 'react';
import {deleteResource} from '../api/resources.js';

export default function DeleteResourceDialog({resource, onClose, onDeleted}) {
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleDelete = async () => {
    setSending(true);
    setError('');
    try {
      await deleteResource(resource.id);
      onDeleted();
    } catch (e) {
      setError(e.message);
      setSending(false);
    }
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true">
        <h2>Stergi resursa {resource.name}?</h2>
        <p className="muted">
          Se sterg si perioadele ei de mentenanta. Resursele care au
          rezervari nu pot fi sterse.
        </p>
        {error && <p className="message message-error">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary"
            onClick={onClose} disabled={sending}>
            Renunta
          </button>
          <button type="button" className="btn btn-danger"
            onClick={handleDelete} disabled={sending}>
            {sending ? 'Se sterge...' : 'Sterge resursa'}
          </button>
        </div>
      </div>
    </div>
  );
}
