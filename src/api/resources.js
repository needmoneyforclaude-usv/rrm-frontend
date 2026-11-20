import {apiRequest} from './client.js';

/** @return {!Promise<!Array<Object>>} */
export function getCategories() {
  return apiRequest('/api/categories');
}

/**
 * @param {?number=} categoryId
 * @return {!Promise<!Array<Object>>}
 */
export function getResources(categoryId) {
  return apiRequest('/api/resources', {params: {category_id: categoryId}});
}

/**
 * @param {number|string} resourceId
 * @return {!Promise<Object>}
 */
export function getResource(resourceId) {
  return apiRequest(`/api/resources/${resourceId}`);
}

/**
 * @param {number|string} resourceId
 * @return {!Promise<!Array<Object>>}
 */
export function getResourceMaintenance(resourceId) {
  return apiRequest(`/api/resources/${resourceId}/maintenance`);
}

/**
 * @param {{name: string, description: ?string, price_per_hour: number,
 *     category_id: ?number}} data
 * @return {!Promise<Object>}
 */
export function createResource(data) {
  return apiRequest('/api/resources', {method: 'POST', body: data});
}

/**
 * @param {number} resourceId
 * @param {Object} data aceleasi campuri ca la createResource
 * @return {!Promise<Object>}
 */
export function updateResource(resourceId, data) {
  return apiRequest(`/api/resources/${resourceId}`,
      {method: 'PUT', body: data});
}

/**
 * Citeste fisierul ca base64 (fara prefixul "data:...;base64,").
 * @param {!File} file
 * @return {!Promise<string>}
 */
function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Nu am putut citi imaginea'));
    reader.readAsDataURL(file);
  });
}

/**
 * Urca poza unei resurse.
 * @param {number} resourceId
 * @param {!File} file
 * @return {!Promise<Object>} resursa actualizata
 */
export async function uploadResourceImage(resourceId, file) {
  const contentBase64 = await readAsBase64(file);
  return apiRequest(`/api/resources/${resourceId}/image`, {
    method: 'POST',
    body: {filename: file.name, content_base64: contentBase64},
  });
}
