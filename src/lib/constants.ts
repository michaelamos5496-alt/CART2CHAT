// Shared across every paginated list (products, orders, admin businesses,
// admin orders) so page sizes don't silently drift between features.
export const PAGE_SIZE = 15;

// Shared image upload ceiling, applied before client-side compression.
export const MAX_IMAGE_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// Postgrest's .range(from, to) is an inclusive-inclusive byte-range-style
// pair, not a page/limit pair — every paginated query was re-deriving this
// by hand. `page` is 1-indexed.
export function getPageRange(page: number, pageSize: number = PAGE_SIZE) {
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to, currentPage };
}
