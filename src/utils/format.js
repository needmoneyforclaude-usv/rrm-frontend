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

export function formatPrice(value) {
  return `${Number(value).toFixed(2).replace('.', ',')} lei`;
}

export function formatDateTime(value) {
  return dateTimeFormat.format(new Date(value));
}

export function formatInterval(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${dateTimeFormat.format(startDate)} - ${timeFormat.format(endDate)}`;
  }
  return `${dateTimeFormat.format(startDate)} - ${dateTimeFormat.format(endDate)}`;
}

export function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const SHORT_DAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam'];

export function formatShortDay(value) {
  const date = new Date(value);
  return `${SHORT_DAYS[date.getDay()]} ${value.slice(8, 10)}.${value.slice(5, 7)}`;
}

export function formatHours(start, end) {
  return `${start.slice(11, 16)}-${end.slice(11, 16)}`;
}

export function reservationCode(id) {
  return `R-${String(id).padStart(4, '0')}`;
}
