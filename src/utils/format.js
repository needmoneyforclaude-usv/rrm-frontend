const dateTimeFormat = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormat = new Intl.DateTimeFormat('ro-RO', {
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * @param {number} value
 * @return {string} ex. "120,00 lei"
 */
export function formatPrice(value) {
  return `${Number(value).toFixed(2).replace('.', ',')} lei`;
}

/**
 * @param {string} value data ISO din API
 * @return {string} ex. "25.11.2026, 10:00"
 */
export function formatDateTime(value) {
  return dateTimeFormat.format(new Date(value));
}

/**
 * @param {string} start
 * @param {string} end
 * @return {string} ex. "25.11.2026, 10:00 - 12:00"
 */
export function formatInterval(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${dateTimeFormat.format(startDate)} - ${timeFormat.format(endDate)}`;
  }
  return `${dateTimeFormat.format(startDate)} - ${dateTimeFormat.format(endDate)}`;
}

/**
 * @param {!Date} date
 * @return {string} ex. "2026-11-20"
 */
export function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * @param {!Date} date
 * @param {number} days
 * @return {!Date}
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const SHORT_DAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam'];

/**
 * @param {string} value data ISO
 * @return {string} ex. "Mie 28.10"
 */
export function formatShortDay(value) {
  const date = new Date(value);
  return `${SHORT_DAYS[date.getDay()]} ${value.slice(8, 10)}.${value.slice(5, 7)}`;
}

/**
 * @param {string} start
 * @param {string} end
 * @return {string} ex. "12:00-14:00"
 */
export function formatHours(start, end) {
  return `${start.slice(11, 16)}-${end.slice(11, 16)}`;
}

/**
 * @param {number} id
 * @return {string} ex. "R-0042"
 */
export function reservationCode(id) {
  return `R-${String(id).padStart(4, '0')}`;
}
