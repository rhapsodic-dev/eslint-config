export function getStatus(isPending, isFailed) {
  if (isPending || isFailed) return 'unavailable';
  return 'ready';
}
