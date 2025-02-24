import type React from "react";

interface TypographyI {
  children: React.ReactNode;
}

export function H1({ children }: TypographyI) {
  return (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      {children}
    </h1>
  );
}

export function H2({ children }: TypographyI) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

export function H3({ children }: TypographyI) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {children}{" "}
    </h3>
  );
}

export function H4({ children }: TypographyI) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}{" "}
    </h4>
  );
}

export function P({ children }: TypographyI) {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}

export function Blockquote({ children }: TypographyI) {
  return (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
  );
}

export function TypographyInlineCode({ children }: TypographyI) {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}

export function TypographyLead({ children }: TypographyI) {
  return <p className="text-xl text-muted-foreground">{children}</p>;
}

export function TypographyLarge({ children }: TypographyI) {
  return <div className="text-lg font-semibold">{children}</div>;
}

export function TypographySmall({ children }: TypographyI) {
  return <small className="text-sm font-medium leading-none">{children}</small>;
}
export function TypographyMuted({ children }: TypographyI) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
