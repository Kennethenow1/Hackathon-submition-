import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

type NavigationMdViewProps = {
  markdown: string;
  className?: string;
};

const mdComponents: Components = {
  a: ({ href, children, ...rest }) => (
    <a
      {...rest}
      href={href}
      className="brief-nav-md__a"
      {...(href?.startsWith("http")
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
    >
      {children}
    </a>
  ),
};

/** Renders structural navigation markdown with theme typography (read-only preview). */
export function NavigationMdView({ markdown, className = "" }: NavigationMdViewProps) {
  const trimmed = markdown?.trim() ?? "";
  if (!trimmed) {
    return (
      <p className={"brief-nav-md brief-nav-md--empty " + className}>
        No navigation draft yet.
      </p>
    );
  }

  return (
    <div className={"brief-nav-md " + className}>
      <ReactMarkdown components={mdComponents}>{markdown}</ReactMarkdown>
    </div>
  );
}
