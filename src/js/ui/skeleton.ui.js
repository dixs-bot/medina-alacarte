export function createProductSkeleton(count = 6) {
  return Array(count)
    .fill('')
    .map(() => `
      <div class="skeleton-card"></div>
    `)
    .join('');
}
