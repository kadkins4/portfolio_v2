import React from "react";

interface MarkdocNode {
  type: string;
  attributes?: Record<string, unknown>;
  children?: MarkdocNode[];
}

function renderNode(node: MarkdocNode, key: number | string): React.ReactNode {
  const children = node.children ?? [];

  switch (node.type) {
    case "document":
      return children.map((child, i) => renderNode(child, i));

    case "paragraph":
      return <p key={key}>{children.map((c, i) => renderNode(c, i))}</p>;

    case "heading": {
      const level = (node.attributes?.level as number) ?? 2;
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return <Tag key={key}>{children.map((c, i) => renderNode(c, i))}</Tag>;
    }

    case "text":
      return String(node.attributes?.content ?? "");

    case "strong":
      return <strong key={key}>{children.map((c, i) => renderNode(c, i))}</strong>;

    case "em":
      return <em key={key}>{children.map((c, i) => renderNode(c, i))}</em>;

    case "link": {
      const href = String(node.attributes?.href ?? "#");
      const external = href.startsWith("http");
      return (
        <a
          key={key}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children.map((c, i) => renderNode(c, i))}
        </a>
      );
    }

    case "list": {
      const ordered = Boolean(node.attributes?.ordered);
      const Tag = ordered ? "ol" : "ul";
      return <Tag key={key}>{children.map((c, i) => renderNode(c, i))}</Tag>;
    }

    case "item":
      return <li key={key}>{children.map((c, i) => renderNode(c, i))}</li>;

    case "code":
      return <code key={key}>{String(node.attributes?.content ?? "")}</code>;

    case "fence":
      return (
        <pre key={key}>
          <code>{String(node.attributes?.content ?? "")}</code>
        </pre>
      );

    case "blockquote":
      return <blockquote key={key}>{children.map((c, i) => renderNode(c, i))}</blockquote>;

    case "hardbreak":
      return <br key={key} />;

    case "hr":
      return <hr key={key} />;

    default:
      return null;
  }
}

export function renderMarkdoc(result: { node: unknown }): React.ReactNode[] {
  const root = result.node as MarkdocNode;
  const rootChildren = root.children ?? [];
  return rootChildren.map((child, i) => renderNode(child, i));
}

export function extractText(node: unknown): string {
  const n = node as MarkdocNode;
  if (n.type === "text") {
    return String(n.attributes?.content ?? "");
  }
  return (n.children ?? []).map(extractText).join(" ");
}
