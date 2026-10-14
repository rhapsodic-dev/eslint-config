export function getStatus(isPending, isFailed) {
  if (isPending) return 'unavailable';
  if (isFailed) return 'unavailable';
  return 'ready';
}
