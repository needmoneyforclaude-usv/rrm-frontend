import {useEffect, useState} from 'react';
import {Link, useOutletContext, useParams} from 'react-router-dom';
import {getCategories, getResource} from '../api/resources.js';
import ReservationCalendar from '../components/ReservationCalendar.jsx';
import ReservationDialog from '../components/ReservationDialog.jsx';
import ResourceImage from '../components/ResourceImage.jsx';
import {loyaltyDiscount} from '../utils/pricing.js';

export default function ResourceDetailsPage() {
  const {resourceId} = useParams();
  const {user} = useOutletContext();
  const [resource, setResource] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [picked, setPicked] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setError('');
    Promise.all([getResource(resourceId), getCategories()])
        .then(([resourceData, categories]) => {
          setResource(resourceData);
          const category = categories.find(
              (c) => c.id === resourceData.category_id);
          setCategoryName(category ? category.name : '');
        })
        .catch((e) => setError(e.status === 404 ?
          'Resursa nu exista.' :
          e.message));
  }, [resourceId]);

  const handlePick = (slot) => {
    setMessage('');
    if (user?.role !== 'LEAD') {
      setMessage('Doar Team Lead-ul echipei poate face rezervari.');
      return;
    }
    setPicked(slot);
  };

  const closeDialog = (text) => {
    setPicked(null);
    setCalendarKey((k) => k + 1);
    if (text) {
      setMessage(text);
    }
  };

  if (error) {
    return (
      <section>
        <Link to="/">&larr; Catalog resurse</Link>
        <p className="message message-error">{error}</p>
      </section>
    );
  }
  if (!resource) {
    return <p className="muted">Se incarca...</p>;
  }

  const discount = user ? loyaltyDiscount(user.affiliation_date) : 0;

  return (
    <section className="details-layout">
      <div className="details-main">
        <Link to="/" className="small">&larr; Catalog resurse</Link>
        <h1>{resource.name}</h1>
        {message && <p className="message">{message}</p>}
        <ReservationCalendar
          resourceId={resourceId}
          reloadKey={calendarKey}
          onPick={handlePick}
        />
      </div>

      <aside className="details-side">
        <ResourceImage resource={resource} />
        <dl className="details-info">
          <dt>Categorie</dt>
          <dd>{categoryName || '-'}</dd>
          <dt>Specificatii</dt>
          <dd>{resource.description || '-'}</dd>
          <dt>Pret</dt>
          <dd>{Number(resource.price_per_hour)} lei / ora</dd>
          <dt>Reducerea echipei</dt>
          <dd>{discount}%</dd>
        </dl>
        <p className="hint">Click pe un slot liber &rarr; rezervare</p>
      </aside>

      {picked && (
        <ReservationDialog
          resource={resource}
          interval={picked}
          user={user}
          onClose={() => closeDialog()}
          onDone={closeDialog}
        />
      )}
    </section>
  );
}
