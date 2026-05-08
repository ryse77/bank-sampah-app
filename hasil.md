Run npm run build

> bank-sampah-app@0.1.0 build
> next build

⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 7.3s
  Running TypeScript ...
Failed to type check.

./app/(auth)/login/page.tsx:99:15
Type error: 'data' is possibly 'null'.

   97 |
   98 |       // Simpan auth data
>  99 |       setAuth(data.user, data.token);
      |               ^
  100 |
  101 |       // PENTING: Gunakan window.location.href untuk redirect
  102 |       window.location.href = '/dashboard';
Next.js build worker exited with code: 1 and signal: null
Error: Process completed with exit code 1.