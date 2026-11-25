# M3LOMH Platform — Deployment

1. **Firebase**: create a project → add a Web App → paste its config into `js/firebase-config.js`.
2. Enable **Authentication → Email/Password**; create your admin user; copy its **UID**.
3. **Firestore Database** (production mode) → Rules → paste `firestore.rules`, replace `ADMIN_UID_HERE` with your UID → Publish.
4. Authentication → Settings → **Authorized domains**: add `<user>.github.io`. Enable **App Check** (reCAPTCHA v3) when possible.
5. **GitHub Pages**: push this folder to a repo → Settings → Pages → Deploy from branch `main` / root.
6. Open `/vault-ctrl-m3.html` (never link to it). `/admin.html` is the honeypot decoy.
7. First run: in the vault, pick `site_settings` and save theme/social links. Promo codes: the Document ID **is** the code (uppercase), e.g. `M3LOMH25`.

## DOMPurify SRI
Generate the hash and add `integrity="sha384-..."` to the script tag in `index.html`:
`curl -s https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js | openssl dgst -sha384 -binary | openssl base64 -A`

## Notes
- All dynamic content is rendered with `textContent` (no `innerHTML`), and external URLs must be `https://`.
- Client-side lockout is a deterrent only; real protection is `firestore.rules` + Firebase Auth.
- GitHub Pages cannot set HTTP headers, so CSP is applied via `<meta>`.
