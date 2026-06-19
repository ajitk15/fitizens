import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlForImage } from "@/sanity/image";

/** Styled renderer for the blog's Portable Text body. */
const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = urlForImage(value);
      if (!url) return null;
      return (
        <span className="my-8 block overflow-hidden rounded-2xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={value?.alt || ""} loading="lazy" className="h-auto w-full object-cover" />
        </span>
      );
    },
  },
  block: {
    h2: ({ children }) => <h2 className="mt-10 font-display text-3xl uppercase">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 font-display text-2xl uppercase">{children}</h3>,
    normal: ({ children }) => <p className="mt-4 leading-relaxed text-muted">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-accent pl-4 italic text-muted">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">{children}</ul>,
    number: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const external = href.startsWith("http");
      return (
        <a
          href={href}
          className="text-accent underline underline-offset-2 hover:opacity-80"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export function PortableBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
