# PlaceHub: Database Design and REST API

## 1. Architecture

```
React client (Vite)  --HTTP/JSON-->  Express API (Node.js)  --Mongoose-->  MongoDB
                                         |
                                         +--> JSearch API (job listings)
                                         +--> Gemini API (resume review)
```

All requests to protected routes carry a JWT in the `Authorization: Bearer <token>` header. The server checks the token and the user's role before running the route.

## 2. Collections

### Entity relationships
```
User 0..1 ──── 1 Student                (a student's login account)
Company 1 ──── * Drive
Drive   1 ──── * Application * ──── 1 Student
```

### users
| Field | Type | Rules |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase, email format |
| passwordHash | String | required, bcrypt hash, never returned by the API |
| role | String | `admin` or `student` (default `student`) |
| student | ObjectId → students | set for student accounts |
| acceptedTermsAt | Date | when the user accepted the terms |
| createdAt, updatedAt | Date | automatic |

### students
| Field | Type | Rules |
|---|---|---|
| usn | String | required, unique, stored in upper case |
| name | String | required |
| email | String | required, lowercase, email format |
| phone | String | optional |
| branch | String | required, one of CSE, ISE, AIML, CD, CY, ECE, EEE, ETE, EIE, ME, CV, CH, BT, IEM, AE |
| cgpa | Number | required, 0 to 10 |
| backlogs | Number | default 0, at least 0 |
| gradYear | Number | 2000 to 2100 |
| skills | [String] | default empty |
| resumeText | String | up to 10,000 characters |
| placed | Boolean | set automatically when any application is "offered" |

### companies
| Field | Type | Rules |
|---|---|---|
| name | String | required, unique |
| sector, location, website | String | optional |
| hrEmail | String | optional, lowercase |

### drives
| Field | Type | Rules |
|---|---|---|
| company | ObjectId → companies | required |
| role | String | required |
| packageLPA | Number | at least 0 |
| driveDate | Date | optional |
| minCgpa | Number | default 0, 0 to 10 |
| maxBacklogs | Number | default 0 |
| branches | [String] | allowed branches; empty means all branches |
| status | String | `upcoming`, `ongoing` or `completed` |
| source | String | `manual` or `jsearch` |
| applyLink | String | optional |

### applications
| Field | Type | Rules |
|---|---|---|
| student | ObjectId → students | required |
| drive | ObjectId → drives | required |
| status | String | `applied`, `shortlisted`, `interview`, `offered` or `rejected` |
| remarks | String | optional |

A unique index on `(student, drive)` stops a student applying to the same drive twice.

### Report collections (written by `$merge`)
| Collection | Built from | Contents |
|---|---|---|
| branchstats | students grouped by branch | total students, placed, average CGPA, placement % |
| placementstats | applications joined to drives and companies, grouped by company | applications, offers, rejections, conversion rate, average and maximum package |

### Integrity rules
- Deleting a company deletes its drives and their applications.
- Deleting a drive deletes its applications.
- Deleting a student deletes their applications and login account.
- Any change to an application recalculates the student's `placed` flag.

## 3. REST API

Base path: `/api`. All bodies are JSON. Errors return `{ "error": "message" }` with status 400 (invalid input), 401 (not logged in), 403 (wrong role), 404 (not found) or 409 (duplicate).

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/meta` | Branches and status lists for forms |
| GET | `/public/stats` | Totals, recruiters and upcoming drives for the home page |
| POST | `/auth/register` | Create a student account (requires `acceptTerms: true`) |
| POST | `/auth/login` | Log in; returns `{ token, user }` |
| GET | `/auth/me` | Current user (needs a token) |

Logging out is handled in the client by discarding the token.

### Student (role `student`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Own profile |
| PUT | `/me` | Update phone, skills and resume text |
| GET | `/me/eligible` | Eligible drives (`$lookup`) |
| GET | `/me/applications` | Own applications |
| POST | `/me/applications` | Apply to a drive `{ drive }` |
| DELETE | `/me/applications/:id` | Withdraw (only while "applied") |
| POST | `/me/resume-review` | Gemini resume review `{ driveId? }` |

### Placement office (role `admin`): CRUD
The same five endpoints exist for `students`, `companies`, `drives` and `applications`:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/<resource>` | List (query parameters filter by field) |
| GET | `/<resource>/:id` | Read one |
| POST | `/<resource>` | Create |
| PUT | `/<resource>/:id` | Update |
| DELETE | `/<resource>/:id` | Delete (with cascades) |

Any logged-in user can read `companies` and `drives`. Only admins can change them.

### Placement office: reports and merge operations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/overview` | Dashboard counts and application pipeline |
| GET | `/reports/eligible/:studentId` | Eligible drives for a student (`$lookup`) |
| POST | `/reports/branch-stats/refresh` | Rebuild `branchstats` with `$merge` |
| GET | `/reports/branch-stats` | Read `branchstats` |
| POST | `/reports/company-stats/refresh` | Rebuild `placementstats` with `$merge` |
| GET | `/reports/company-stats` | Read `placementstats` |
| GET | `/reports/duplicates` | Students sharing an email |
| POST | `/students/merge` | Merge two student records `{ keepId, removeId }` |

### External APIs
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/external/status` | any | Which API keys are configured |
| GET | `/external/jobs?query=` | any | JSearch job search |
| POST | `/external/jobs/import` | admin | Save a listing as a company and drive |
| POST | `/external/resume-review/:studentId` | admin | Gemini review of any student |
