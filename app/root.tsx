import { Outlet, Links, Meta, Scripts, ScrollRestoration } from "react-router";

import "./app.css";

export const links = () => [
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter&display=swap" },
];

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Aquí se renderizan todas las rutas hijas */}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: any) {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>Error</h1>
      <pre>{error?.message}</pre>
    </main>
  );
}
