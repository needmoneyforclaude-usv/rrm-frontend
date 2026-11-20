import {Link} from 'react-router-dom';

/**
 * Cardul unei resurse din catalog: imagine, nume, descriere, pret pe ora.
 * @param {{resource: Object, categoryName: ?string}} props
 * @return {JSX.Element}
 */
export default function ResourceCard({resource, categoryName}) {
  return (
    <Link to={`/resources/${resource.id}`} className="card resource-card">
      <div className="image-placeholder" />
      <h3>{resource.name}</h3>
      {categoryName && <span className="muted small">{categoryName}</span>}
      <p className="muted resource-description">
        {resource.description || 'Fara descriere'}
      </p>
      <p className="resource-price">
        {resource.in_maintenance ?
          <span className="maintenance-label">In mentenanta</span> :
          `${Number(resource.price_per_hour)} lei/h`}
      </p>
    </Link>
  );
}
