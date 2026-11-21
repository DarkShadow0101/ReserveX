export function extractErrorMessage(error, fallback = 'An unexpected error occurred') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  if (error.response?.data) {
    const data = error.response.data;
    if (data.message) return data.message;
    if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.message || e).join(', ');
    }
  }

  if (error.message) return error.message;
  return fallback;
}
