import {apiRequest} from './client.js';

export function getCategories() {
  return apiRequest('/api/categories');
}

export function getResources(categoryId) {
  return apiRequest('/api/resources', {params: {category_id: categoryId}});
}

export function getResource(resourceId) {
  return apiRequest(`/api/resources/${resourceId}`);
}

export function getResourceMaintenance(resourceId) {
  return apiRequest(`/api/resources/${resourceId}/maintenance`);
}

export function createResource(data) {
  return apiRequest('/api/resources', {method: 'POST', body: data});
}

export function updateResource(resourceId, data) {
  return apiRequest(`/api/resources/${resourceId}`,
      {method: 'PUT', body: data});
}

export function deleteResource(resourceId) {
  return apiRequest(`/api/resources/${resourceId}`, {method: 'DELETE'});
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Nu am putut citi imaginea'));
    reader.readAsDataURL(file);
  });
}

export async function uploadResourceImage(resourceId, file) {
  const contentBase64 = await readAsBase64(file);
  return apiRequest(`/api/resources/${resourceId}/image`, {
    method: 'POST',
    body: {filename: file.name, content_base64: contentBase64},
  });
}
