import { StrictMode } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { App } from "./App";
import { NotFound } from "./NotFound";

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Static only: the 404 page ships no JavaScript.
export function renderNotFound() {
  return renderToStaticMarkup(<NotFound />);
}
