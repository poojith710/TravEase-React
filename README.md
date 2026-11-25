# TravEase — React + Vite

React conversion of the supplied HTML/CSS/JavaScript academic travel booking project. Uses React components, useState, useEffect, React Router, and browser LocalStorage. Original CSS and seed inventory reused. The original archive contained no actual image files. All travel data and payment are simulated; no live APIs or backend. Demo login is not production authentication. Signup saves a local account with a salted password hash; logout removes only the active session. Accounts created before this fix must be registered again. Use the same browser and localhost port to access saved accounts. Do not use real payment or personal details.

## Run in VS Code
Open this folder (the one containing package.json). Run `npm install`, then `npm run dev`. Open the local URL in the terminal. To build, run `npm run build`.

Demo user: user@travease.com / 1234. Admin: admin / admin123.

Home → Results → Seats → Passenger → Payment → Confirmation (print or save to PDF) → My Bookings (cancel). Admin can add/delete services and view bookings. Original demo search fallback and seat inventory conventions are retained. Browser storage is origin-specific; existing Live Server data will not automatically migrate.
