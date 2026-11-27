import {useEffect, useState} from 'react';
import {
  createResource,
  getCategories,
  updateResource,
  uploadResourceImage,
} from '../api/resources.js';

const MAX_IMAGE_MB = 5;

export default function ResourceFormDialog({resource, onClose, onSaved}) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: resource?.name || '',
    description: resource?.description || '',
    pricePerHour: resource ? String(resource.price_per_hour) : '',
    categoryId: resource?.category_id ? String(resource.category_id) : '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(resource?.image_url || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (event) => {
    setForm({...form, [event.target.name]: event.target.value});
  };

  const handleFile = (event) => {
    const selected = event.target.files[0];
    if (!selected) {
      return;
    }
    if (selected.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Imaginea poate avea maxim ${MAX_IMAGE_MB} MB.`);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price_per_hour: Number(form.pricePerHour),
      category_id: form.categoryId ? Number(form.categoryId) : null,
      image_url: resource?.image_url || null,
    };
    try {
      let saved = resource ?
        await updateResource(resource.id, data) :
        await createResource(data);
      if (file) {
        saved = await uploadResourceImage(saved.id, file);
      }
      onSaved(saved, Boolean(resource));
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form
        className="dialog dialog-wide"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>{resource ? `Editare – ${resource.name}` : 'Resursa noua'}</h2>

        <div className="resource-form-grid">
          <div className="resource-form-fields">
            <label>
              Nume
              <input name="name" value={form.name} onChange={handleChange}
                maxLength={100} required />
            </label>
            <label>
              Categorie
              <select name="categoryId" value={form.categoryId}
                onChange={handleChange} required>
                <option value="">Alege categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Specificatii
              <textarea name="description" rows={3}
                value={form.description} onChange={handleChange} />
            </label>
            <label>
              Pret pe ora (lei)
              <input name="pricePerHour" type="number" min="0" step="0.01"
                value={form.pricePerHour} onChange={handleChange} required />
            </label>
          </div>

          <div className="resource-form-image">
            {preview ?
              <img className="resource-image" src={preview} alt="" /> :
              <div className="image-placeholder" />}
            <label className="btn btn-secondary file-button">
              {preview ? 'Schimba poza' : 'Alege poza'}
              <input type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleFile} hidden />
            </label>
            <span className="muted small">jpg, png sau webp, maxim 5 MB</span>
          </div>
        </div>

        {error && <p className="message message-error">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}
            disabled={saving}>
            Renunta
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Se salveaza...' : 'Salveaza'}
          </button>
        </div>
      </form>
    </div>
  );
}
