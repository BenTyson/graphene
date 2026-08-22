// installAuthFetch.js — the ONLY place the fetch wrapper is switched on.
//
// This file exists so that `authFetch.js` can be imported for its helpers
// (services/api.js needs `getAuthHeader()` for the CSV download) WITHOUT that
// import installing a global side effect. Installation is this module's whole job,
// and this module is imported from exactly one place:
//
//   client/src/js/app-refactored.js  — as its FIRST import statement.
//
// Why first: ES module dependencies are evaluated depth-first in import order, so
// putting this at the top of the entry module guarantees the wrapper is on
// `window.fetch` before any other module body runs. That matters because
// `services/AuthService.js` fires `GET /api/auth/me` at import time.
// It is also comfortably before Alpine — the Alpine CDN <script defer> sits later in
// document order than the app-refactored.js module script, and Alpine's x-init is
// what triggers the app's first data load.
//
// Why the proforma embed does not get it: `client/src/js/proforma-embed.js` is a
// separate Vite entry and does not import app-refactored.js, so this module is not
// in its graph and `window.fetch` there stays native. The embed's only API call,
// `/api/proforma/share/:token`, is therefore untouched — belt-and-braces on top of
// the explicit share-path skip inside authFetch.js.

import { installAuthFetch } from './authFetch.js';

installAuthFetch();
