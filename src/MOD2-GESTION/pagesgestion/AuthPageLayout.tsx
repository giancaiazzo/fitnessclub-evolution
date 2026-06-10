import React from "react";
import GridShape from "../common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <div className="relative z-10 min-h-screen bg-gradient-to-br from-background via-card to-background">
  <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div className="pointer-events-none absolute inset-0 opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)",
          backgroundSize: "42px 42px",
        }}
      ></div>
    </div>

    <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
    <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>

    <div className="relative z-10 flex w-full max-w-md items-center justify-center">
      {children}
    </div>

    <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 items-center justify-center lg:grid">
      <div className="relative flex items-center justify-center opacity-20">
        <GridShape />
      </div>
    </div>

    <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
      <ThemeTogglerTwo />
    </div>
  </div>
</div>
  );
}
