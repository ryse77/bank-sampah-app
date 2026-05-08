Run npm run lint

> bank-sampah-app@0.1.0 lint
> eslint


/home/runner/work/bank-sampah-app/bank-sampah-app/app/(auth)/login/page.tsx
Error:   67:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   87:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/(auth)/register/page.tsx
Error:   71:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/components/PWAInstallPrompt.tsx
  19:7  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

/home/runner/work/bank-sampah-app/bank-sampah-app/app/components/PWAInstallPrompt.tsx:19:7
  17 |     // Check if already installed
  18 |     if (window.matchMedia('(display-mode: standalone)').matches) {
> 19 |       setIsInstalled(true);
     |       ^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  20 |       return;
  21 |     }
  22 |  react-hooks/set-state-in-effect

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/antrian-sampah/page.tsx
Error:   72:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/artikel/create/page.tsx
Warning:     5:31  warning  'Upload' is defined but never used                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
Error:    14:21  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:    63:31  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:    77:21  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Warning:   135:21  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/artikel/edit/[id]/page.tsx
Error:    15:21  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:    41:39  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Warning:    54:22  warning  'e' is defined but never used                                                                                                                                                                                                                                                            @typescript-eslint/no-unused-vars
Error:   124:31  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   138:21  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Warning:   205:17  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
Warning:   217:21  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/artikel/page.tsx
Error:    48:21  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Warning:   102:19  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/complete-profile/page.tsx
Error:   35:10  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   62:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/edukasi/[id]/page.tsx
Warning:    5:10  warning  'BookOpen' is defined but never used                                                                                                                                                                                                                                                     @typescript-eslint/no-unused-vars
Warning:   96:13  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/edukasi/page.tsx
Warning:    74:15  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
Warning:   138:19  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/laporan/page.tsx
Warning:     4:10  warning  'laporanService' is defined but never used                                                                     @typescript-eslint/no-unused-vars
Warning:    48:10  warning  'exporting' is assigned a value but never used                                                                 @typescript-eslint/no-unused-vars
Warning:    55:6   warning  React Hook useEffect has a missing dependency: 'fetchStats'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Error:    83:47  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:    88:55  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:    93:64  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:   107:38  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:   144:31  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:   183:48  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:   188:56  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:   193:63  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:   257:21  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any
Error:   658:58  error    Unexpected any. Specify a different type                                                                       @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/layout.tsx
Error:   12:9  error  Unexpected any. Specify a different type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           @typescript-eslint/no-explicit-any
  27:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/layout.tsx:27:5
  25 |
  26 |   useEffect(() => {
> 27 |     setIsMounted(true);
     |     ^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  28 |   }, []);
  29 |
  30 |   useEffect(() => {  react-hooks/set-state-in-effect

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/member/page.tsx
Warning:     7:8   warning  'Link' is defined but never used                                                                                @typescript-eslint/no-unused-vars
Warning:    51:6   warning  React Hook useEffect has a missing dependency: 'loadMembers'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Error:   115:19  error    Unexpected any. Specify a different type                                                                        @typescript-eslint/no-explicit-any
Error:   143:19  error    Unexpected any. Specify a different type                                                                        @typescript-eslint/no-explicit-any
Error:   169:19  error    Unexpected any. Specify a different type                                                                        @typescript-eslint/no-explicit-any
Error:   231:21  error    Unexpected any. Specify a different type                                                                        @typescript-eslint/no-explicit-any
Error:   258:21  error    Unexpected any. Specify a different type                                                                        @typescript-eslint/no-explicit-any
Error:   295:21  error    Unexpected any. Specify a different type                                                                        @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/page.tsx
Warning:    35:24  warning  'logout' is assigned a value but never used                                                                                                                                                                                                                                              @typescript-eslint/no-unused-vars
Error:    88:43  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:    89:45  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   188:50  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   194:52  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   195:45  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   199:50  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   215:23  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   216:36  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Error:   219:56  error    Unexpected any. Specify a different type                                                                                                                                                                                                                                                 @typescript-eslint/no-explicit-any
Warning:   277:6   warning  React Hook useEffect has missing dependencies: 'fetchAdminPengelolaStats', 'fetchLatestArtikel', 'fetchSettings', 'fetchStats', and 'fetchUserData'. Either include them or remove the dependency array                                                                                  react-hooks/exhaustive-deps
Warning:   293:6   warning  React Hook useEffect has missing dependencies: 'fetchAdminPengelolaStats', 'fetchStats', and 'fetchUserData'. Either include them or remove the dependency array                                                                                                                         react-hooks/exhaustive-deps
Warning:   674:21  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/pencairan/page.tsx
Warning:   32:6   warning  React Hook useEffect has a missing dependency: 'loadPencairan'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Error:   60:21  error    Unexpected any. Specify a different type                                                                          @typescript-eslint/no-explicit-any
Error:   97:56  error    Unexpected any. Specify a different type                                                                          @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/profile/page.tsx
Error:   53:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/riwayat-sampah/page.tsx
Error:   141:64  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   162:53  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/saldo/page.tsx
Warning:    7:18  warning  'ArrowDownCircle' is defined but never used  @typescript-eslint/no-unused-vars
Error:   42:21  error    Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/scan/page.tsx
Warning:    71:10  warning  'errorMessage' is defined but never used                         @typescript-eslint/no-unused-vars
Error:    75:19  error    Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
Warning:   101:14  warning  'err' is defined but never used                                  @typescript-eslint/no-unused-vars
Error:   128:19  error    Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
Error:   148:13  error    Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
Error:   167:19  error    Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
Error:   203:19  error    Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
Error:   240:19  error    Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
Error:   315:29  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities
Error:   315:40  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/setor-sampah/page.tsx
Error:   60:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/app/dashboard/settings/page.tsx
Warning:    40:6   warning  React Hook useEffect has missing dependencies: 'fetchJenisSampah' and 'fetchSettings'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
Error:    57:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:    81:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:   142:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:   180:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:   216:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:   265:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:   319:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:   358:19  error    Unexpected any. Specify a different type                                                                                                   @typescript-eslint/no-explicit-any
Error:   474:63  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`                                                                            react/no-unescaped-entities
Error:   474:74  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`                                                                            react/no-unescaped-entities
Error:   531:74  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`                                                                            react/no-unescaped-entities
Error:   531:85  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`                                                                            react/no-unescaped-entities
Error:   755:61  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`                                                                            react/no-unescaped-entities
Error:   755:73  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`                                                                            react/no-unescaped-entities

/home/runner/work/bank-sampah-app/bank-sampah-app/app/page.tsx
  36:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

/home/runner/work/bank-sampah-app/bank-sampah-app/app/page.tsx:36:5
  34 |
  35 |     // User belum login, tampilkan landing page
> 36 |     setIsChecking(false);
     |     ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  37 |   }, [user, _hasHydrated]);
  38 |
  39 |   useEffect(() => {                                                        react-hooks/set-state-in-effect
  42:7  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

/home/runner/work/bank-sampah-app/bank-sampah-app/app/page.tsx:42:7
  40 |     // Check if app is not already installed
  41 |     if (window.matchMedia('(display-mode: standalone)').matches) {
> 42 |       setShowInstallButton(false);
     |       ^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  43 |       return;
  44 |     }
  45 |  react-hooks/set-state-in-effect

/home/runner/work/bank-sampah-app/bank-sampah-app/lib/api.ts
Error:    54:20  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:    63:18  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:    71:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   109:30  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/lib/auth.ts
Warning:   18:12  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/bank-sampah-app/bank-sampah-app/lib/store/authStore.ts
Warning:   35:14  warning  'error' is defined but never used         @typescript-eslint/no-unused-vars
Warning:   43:14  warning  'error' is defined but never used         @typescript-eslint/no-unused-vars
Warning:   51:14  warning  'error' is defined but never used         @typescript-eslint/no-unused-vars
Error:   94:33  error    Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/proxy.ts
Warning:   3:31  warning  'req' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/bank-sampah-app/bank-sampah-app/scripts/create-admin.js
Error:    7:1   error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:    8:16  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:    9:16  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:   10:26  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports

/home/runner/work/bank-sampah-app/bank-sampah-app/scripts/generate-icons.js
Error:    1:12  error    A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:    2:14  error    A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:   15:15  error    A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Warning:   16:14  warning  'error' is defined but never used        @typescript-eslint/no-unused-vars

/home/runner/work/bank-sampah-app/bank-sampah-app/scripts/regenerate-qr-codes.js
Error:   17:1   error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:   18:18  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:   19:16  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
Error:   20:26  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports

/home/runner/work/bank-sampah-app/bank-sampah-app/tests/api/backup-import.test.ts
Error:   22:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   30:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   38:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   50:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   58:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   66:10  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   89:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/tests/api/financial-auth-guards.test.ts
Error:   28:113  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   36:44   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   41:113  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   49:47   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   54:110  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   62:46   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   67:110  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   75:47   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/tests/api/financial-schema-validation.test.ts
Error:   28:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   36:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   44:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   52:47  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   60:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   68:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   76:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   84:47  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/tests/api/jenis-sampah-guards.test.ts
Error:   25:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   26:97  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   34:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   42:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   43:87  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   44:81  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   50:37  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/tests/api/member-scan.test.ts
Error:   24:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   27:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   35:12  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   37:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   45:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   54:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   56:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   57:61  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   65:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/tests/api/pencairan-approve.test.ts
Error:   22:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   33:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   41:73  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   42:52  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   50:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/bank-sampah-app/bank-sampah-app/tests/api/setoran-validate.test.ts
Error:   22:73   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   33:35   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   41:81   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   42:100  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Error:   50:35   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 168 problems (138 errors, 30 warnings)

Error: Process completed with exit code 1.