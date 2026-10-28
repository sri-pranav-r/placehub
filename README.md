# PlaceHub: MERN Placement & Internship Tracker

A full-stack placement cell website built on the **MERN stack**:

| | |
|---|---|
| **M**ongoDB | Database with Mongoose models, `$lookup` joins and `$merge` aggregations |
| **E**xpress | REST API, JWT authentication, role-based access |
| **R**eact | Vite + React Router single-page app (landing page, admin panel, student portal) |
| **N**ode.js | Runtime for the API and the third-party integrations |

The app includes:
- **CRUD** on Students, Companies, Drives and Applications
- **Merge operations**: `$lookup` eligibility matching, `$merge` report collections, and merging duplicate student records
- **External APIs (API keys)**: JSearch for live jobs, Gemini for AI resume review
- **Two portals**: the **placement office** (admin) manages everything, and **students** register, see the drives they're eligible for, apply and track their status

## Team

| Name | USN |
|---|---|
| Parikshit Prakash Pai | 1RV25CS121 |
| R Sri Pranav | 1RZ25CS128 |
| Prem Pratham | 1RV25CS135 |
| Prasanna Roy | 1RZ25CS120 |

## Documentation

| Document | Contents |
|---|---|
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Users, user stories with acceptance criteria, non-functional requirements, wireframes |
| [docs/DESIGN.md](docs/DESIGN.md) | Architecture, database design (collections, fields, rules, relationships) and the full REST API list |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Team workflow: feature branches, commit messages and pull requests |

## Quick start

Requires **Node.js 20 or newer** and **git**.

```bash
git clone https://github.com/sri-pranav-r/placehub.git
cd placehub
npm run install-all                          # installs root, server and client dependencies
cp server/.env.example server/.env           # Windows: copy server\.env.example server\.env
npm run dev
```

- Website: http://localhost:5173 (React dev server)
- API: http://localhost:5000 (Express)

With `MONGO_URI=memory` (the default) the API starts a built-in MongoDB, so nothing else needs installing. Its data is kept in `server/.data` (not committed), so it survives restarts. Sample data is loaded the first time it starts. To reset to the sample data, stop the site (Ctrl+C), run `npm run seed`, then start it again; only one process can open the built-in database at a time. Delete `server/.data` to start empty. The first `npm run install-all` downloads the database engine (a few hundred MB), so it can take several minutes; later starts take seconds.

If `JWT_SECRET` is left empty, the server generates one on first start and keeps it in `server/.data/jwt-secret`, so logins survive restarts.

### Persistent database

- **Local MongoDB**: set `MONGO_URI=mongodb://127.0.0.1:27017/placementdb` in `server/.env`, then `npm run seed`
- **MongoDB Atlas**: paste your `mongodb+srv://...` string into `MONGO_URI`, then `npm run seed`

### Demo logins (seeded, test-only)

| Role | Email | Password |
|---|---|---|
| Placement officer (admin) | `admin@placement.test` | `admin123` |
| Student | `ananya.rao@example.com` | `student123` |
| Student (low CGPA, sees fewer drives) | `arjun.nair@example.com` | `student123` |

In dev mode the login page has buttons that fill these in. You can also register a new student account.

### Production build (one server)

```bash
cp client/.env.example client/.env   # then fill in all four values
npm run build     # builds React into client/dist
npm start         # Express serves the API and the built site on http://localhost:5000
```

`npm run build` **fails on purpose** until `client/.env` has a custom domain (`https://`, not localhost or a `*.vercel.app`-style host), an operator name and a contact email. The privacy policy and terms show these values.

## Launch checklist

The site does not launch until every item is done.

| Item | Status |
|---|---|
| Favicon | Done: `client/public/favicon.svg` |
| No "Made with AI" tag | Done: none in the site. `npm run check:ui` checks for it. |
| Privacy Policy page | Done: `/privacy`, linked from the footer, the auth pages and the sidebar |
| Terms and Conditions page | Done: `/terms`. Registration requires accepting it, and the date is stored on the user. |
| Custom domain | **To do.** Buy or choose the domain, point its DNS at your host, enable HTTPS, then set `VITE_SITE_URL` |
| Operator name and contact email | **To do.** Set `VITE_OPERATOR_NAME` and `VITE_CONTACT_EMAIL` in `client/.env` |
| Legal review | **To do.** Have the placement office (or whoever operates the site) read both policies and confirm they match how it will really be run |
| Real data | **To do.** Use a real MongoDB (`MONGO_URI`) and do not run `npm run seed` in production, because the seed data is demo data |

## UI rules check

```bash
npm run check:ui
```

This scans the site's source for banned patterns: em/en dashes, emoji, gradients, purple colours, pill-shaped radii, decorative animations, "Made with / Built with" tags and cursor effects. It exits with an error if it finds any.

## Environment variables (`server/.env`)

| Key | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | `memory`, a local MongoDB or an Atlas URI |
| `JWT_SECRET` | Signs login tokens. Optional in development (generated automatically, see above). For production, set your own: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RAPIDAPI_KEY` | JSearch: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch → Subscribe (free) |
| `GEMINI_API_KEY` | Gemini: https://aistudio.google.com/app/apikey |
| `GEMINI_MODEL` | Defaults to `gemini-3.8-flash`. If you get a 404, change it to a current model from AI Studio. |

API keys never reach the browser. React calls `/api/external/...` or `/api/me/resume-review`, and Express calls the third-party API using the key from `.env`.

## Project structure

```
package.json                 root scripts (dev runs server + client together)
docs/                        requirements, wireframes, database design, API list
scripts/check-ui-rules.js    audit for banned UI patterns (npm run check:ui)
server/
  server.js                  Express app, route mounting, error handler, serves client/dist
  config/db.js               MongoDB connection (real, or the built-in development database)
  middleware/auth.js         JWT sign/verify, requireRole, adminForWrites
  models/                    User, Student, Company, Drive, Application (+ cascade hooks)
  services/                  placement.js ($lookup eligibility, apply), gemini.js, HttpError
  routes/
    auth.js                  register / login / me
    me.js                    student portal endpoints
    crud.js                  generic CRUD router factory
    students.js              + POST /merge
    companies.js drives.js applications.js
    reports.js               $lookup / $merge aggregations
    external.js              JSearch + Gemini
    public.js                landing-page stats, dropdown metadata
  seed.js                    sample data + demo logins
client/
  src/
    main.jsx App.jsx         router + route guards
    api.js hooks.js utils.js
    context/                 AuthContext (JWT session), FeedbackContext (toasts, confirm dialog)
    components/              AppLayout (sidebar), PublicLayout, Modal, DataTable, EntityForm, ...
    pages/
      Landing.jsx Login.jsx Register.jsx Jobs.jsx
      admin/                 Dashboard, Students, Companies, Drives, Applications
      student/               Overview, Drives, Profile (+ MyApplications)
    styles.css               design system (light theme)
```

## Data model

```
User ──(student)──> Student
Company 1 ── * Drive 1 ── * Application * ── 1 Student
```

- **User**: login account (`role`: admin | student), bcrypt-hashed password
- **Drive**: eligibility criteria `minCgpa`, `maxBacklogs`, `branches` (empty = all)
- **Application**: unique on `(student, drive)`. `student.placed` updates automatically from offers.
- **Cascades**: deleting a company removes its drives and their applications. Deleting a drive removes its applications. Deleting a student removes their applications and login account.

## API

### Auth & public
| Method | Path | |
|---|---|---|
| POST | `/api/auth/register` | student sign-up (links to an existing USN if the email matches) |
| POST | `/api/auth/login` | returns `{ token, user }` |
| GET | `/api/auth/me` | current user |
| GET | `/api/meta`, `/api/public/stats` | dropdown values, landing-page numbers |

### Student portal (`role: student`)
| Method | Path | |
|---|---|---|
| GET / PUT | `/api/me` | own profile (only phone, skills and resume are editable) |
| GET | `/api/me/eligible` | `$lookup` eligible drives |
| GET / POST | `/api/me/applications` | own applications / apply |
| DELETE | `/api/me/applications/:id` | withdraw (only while "applied") |
| POST | `/api/me/resume-review` | Gemini review |

### Admin CRUD (`students`, `companies`, `drives`, `applications`)
`GET /api/<resource>` · `GET /:id` · `POST /` · `PUT /:id` · `DELETE /:id`. Any logged-in user can read companies and drives.

### Merge operations (admin)
| Method | Path | What it shows |
|---|---|---|
| GET | `/api/reports/eligible/:studentId` | `$lookup` with a pipeline: student → matching open drives → nested `$lookup` to companies |
| POST | `/api/reports/company-stats/refresh` | `$lookup` applications→drives→companies, `$group`, **`$merge` into `placementstats`** |
| POST | `/api/reports/branch-stats/refresh` | `$group` students by branch, **`$merge` into `branchstats`** |
| GET | `/api/reports/duplicates` | `$group` by email to find duplicate students |
| POST | `/api/students/merge` | merges two student records (skills, details, applications, login) |
| GET | `/api/reports/overview` | dashboard counts + `$group` application pipeline |

### External
| Method | Path | |
|---|---|---|
| GET | `/api/external/jobs?query=` | JSearch live listings (any logged-in user) |
| POST | `/api/external/jobs/import` | save a listing as Company + Drive (admin) |
| POST | `/api/external/resume-review/:studentId` | Gemini review of any student (admin) |

## Demo flow (for the viva)

1. **Landing page** → live stats from MongoDB → **Log in** as the admin.
2. **Dashboard** → application pipeline → click **Run $merge** on both reports. The tables underneath are read back from the `branchstats` and `placementstats` collections that `$merge` just wrote.
3. **Students** → the target icon on Ananya's row shows eligible drives (`$lookup`) → **Apply**.
4. **Students** → **Merge duplicates** → **Select** Rahul's pair → **Merge records**.
5. **Applications** → change a status to `offered` → the student shows as "placed".
6. Log out and log in as **Ananya** → overview, eligible drives, application progress, **Profile** → AI review.
7. Log in as **Arjun** → **Drives** shows why he isn't eligible for most drives.
8. **Live Jobs** → search → (admin) **Import as drive**.

## `$lookup` vs `$merge`

- `$lookup` is a **read-time join**, like SQL `LEFT OUTER JOIN`. Nothing is stored.
- `$merge` writes the aggregation output **into a collection**. It upserts on `on: '_id'`, using `whenMatched` (`replace` | `merge` | `keepExisting` | `fail` | pipeline) and `whenNotMatched` (`insert` | `discard` | `fail`). It is used here to build summary tables (materialised views) that the dashboard reads quickly.
