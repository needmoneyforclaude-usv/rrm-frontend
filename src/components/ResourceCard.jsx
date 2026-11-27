import {Link} from 'react-router-dom';
import ResourceImage from './ResourceImage.jsx';

export default function ResourceCard({resource, categoryName}) {
  return (
    <Link to={`/resources/${resource.id}`} className="card resource-card">
      <ResourceImage resource={resource} />
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
