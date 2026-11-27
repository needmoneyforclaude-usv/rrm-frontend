const STATUS_LABELS = {
  PENDING: 'In asteptare',
  CONFIRMED: 'Confirmata',
  REJECTED: 'Respinsa',
  CANCELLED: 'Anulata',
  EXPIRED: 'Expirata',
  COMPLETED: 'Finalizata',
};

export default function StatusBadge({status}) {
  return (
    <span className={`badge status-${status.toLowerCase()}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
