export function affiliationYears(affiliationDate, onDate = new Date()) {
  const start = new Date(affiliationDate);
  let years = onDate.getFullYear() - start.getFullYear();
  const beforeAnniversary = onDate.getMonth() < start.getMonth() ||
    (onDate.getMonth() === start.getMonth() &&
      onDate.getDate() < start.getDate());
  if (beforeAnniversary) {
    years -= 1;
  }
  return Math.max(years, 0);
}

export function loyaltyDiscount(affiliationDate) {
  return Math.min(Math.floor(affiliationYears(affiliationDate) / 2) * 5, 25);
}
