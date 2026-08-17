# JWT Auth Lab — Stateless Session Console

A browser-only demo of JWT-based authentication: mock login, real HMAC-SHA256
token signing (via the Web Crypto API), claim decoding, signature
verification, tamper detection, and expiry simulation.

## Files

- `index.html` — page structure and markup
- `style.css` — all styling (dark "security console" theme)
- `script.js` — mock user directory, token build/decode/verify logic, UI wiring

## Running it

No build step or server required — open `index.html` directly in a browser,
or serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Demo accounts

| Username | Password    | Role          |
|----------|-------------|---------------|
| admin    | admin123    | administrator |
| alice    | wonderland  | analyst       |
| bob      | builder123  | viewer        |

## Notes

Tokens are signed client-side purely to visualize how JWTs work. In a real
system, signing must happen on the server so the secret key is never exposed
to the browser.
