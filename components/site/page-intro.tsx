import Link from "next/link";
export function PageIntro({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-intro">
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link> / {title}
      </nav>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children}
    </header>
  );
}
