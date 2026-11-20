/**
 * Aceeasi regula ca in backend (services/pricing.py): 5% pentru fiecare
 * 2 ani completi de afiliere, maxim 25%.
 */

/**
 * @param {string} affiliationDate data ISO, ex. "2021-10-01"
 * @param {!Date=} onDate
 * @return {number} anii completi de afiliere
 */
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

/**
 * @param {string} affiliationDate
 * @return {number} procentul de reducere
 */
export function loyaltyDiscount(affiliationDate) {
  return Math.min(Math.floor(affiliationYears(affiliationDate) / 2) * 5, 25);
}
