# KMITL Facility Reservation System — Auth Pages

Next.js 14 (App Router) + Tailwind CSS

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout (font setup)
│   ├── globals.css                         # Tailwind + shared component classes
│   ├── page.tsx                            # Redirects / → /login
│   ├── login/
│   │   └── page.tsx                        # Sign In page
│   ├── register/
│   │   └── page.tsx                        # Sign Up page
│   └── forgot-password/
│       ├── page.tsx                        # Forgot Password page
│       ├── create-password/
│       │   └── page.tsx                    # Create New Password page
│       └── reset-password/
│           └── page.tsx                    # Success / Reset Password page
└── components/
    ├── AuthLayout.tsx                      # Shared page wrapper (logo + footer)
    └── PasswordStrength.tsx                # Reusable password strength bar
```

## Routes

| Route                                  | Page                  |
|----------------------------------------|-----------------------|
| `/login`                               | Sign In               |
| `/register`                            | Sign Up               |
| `/forgot-password`                     | Forgot Password       |
| `/forgot-password/create-password`     | Create New Password   |
| `/forgot-password/reset-password`      | Reset Success         |

## Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/login`.

## Tech Stack
- **Next.js 14** — App Router
- **Tailwind CSS v3** — utility-first styling
- **Plus Jakarta Sans** — loaded via `next/font/google`
- **TypeScript**
# SD---SPORTCOMPLEX
# SD---SPORTCOMPLEX
# SD
