// Server entry used only at build time by scripts/prerender.mjs to turn public
// routes into static HTML (fast first paint, and crawlers see real content).
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { takeSsrHead } from "./utils/useSeo.js";

export function render(url) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StaticRouter>
    </StrictMode>,
  );
  return { html, head: takeSsrHead() };
}
