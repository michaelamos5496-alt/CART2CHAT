// Serializes structured data for a <script type="application/ld+json">
// tag. JSON.stringify does not escape "<", so owner-controlled strings
// (a business or product name containing "</script>") could otherwise
// break out of the tag. Escaping "<" as a unicode sequence neutralizes
// that without changing the parsed JSON value.
export function toJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
