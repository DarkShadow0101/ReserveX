/**
 * Currency utility for ReserveX
 * The backend strictly stores monetary values in integer paise (₹1 = 100 paise).
 */

export function formatPaiseToINR(paise, showDecimals = false) {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  const rupees = Number(paise) / 100;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(rupees);
}

export function formatPriceStarting(ticketTypes) {
  if (!ticketTypes || !Array.isArray(ticketTypes) || ticketTypes.length === 0) {
    return 'Free';
  }
  
  // Find minimum price among active ticket tiers
  const activeTiers = ticketTypes.filter(t => t.isActive !== false);
  if (activeTiers.length === 0) return 'Sold Out';

  const minPrice = Math.min(...activeTiers.map(t => Number(t.price || 0)));
  if (minPrice === 0) return 'Free';
  
  return `${formatPaiseToINR(minPrice)} onwards`;
}
