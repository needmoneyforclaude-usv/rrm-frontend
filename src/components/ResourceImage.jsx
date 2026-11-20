import {useState} from 'react';

/**
 * Imaginea unei resurse. Daca nu are imagine sau fisierul lipseste,
 * se afiseaza placeholder-ul din wireframe.
 * @param {{resource: Object}} props
 * @return {JSX.Element}
 */
export default function ResourceImage({resource}) {
  const [failed, setFailed] = useState(false);

  if (!resource.image_url || failed) {
    return <div className="image-placeholder" />;
  }
  return (
    <img
      className="resource-image"
      src={resource.image_url}
      alt={resource.name}
      onError={() => setFailed(true)}
    />
  );
}
