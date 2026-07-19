import type { ReactElement } from "react";

type JsonLdProps = {
  /** One or more schema.org objects. Each is emitted as its own script tag. */
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

/**
 * Renders schema.org JSON-LD. Server component; safe to embed in page bodies.
 */
export function JsonLd({ data }: JsonLdProps): ReactElement {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify output is safe inside a JSON-LD script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
