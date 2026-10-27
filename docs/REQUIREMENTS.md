# PlaceHub: Requirements

## 1. Purpose

PlaceHub is a web application for campus placements. Students see the placement drives they are eligible for, apply to them and track each application. The placement office manages companies, drives and applications, and generates placement reports.

## 2. Users

| User | Description |
|---|---|
| Visitor | Anyone who opens the site without logging in |
| Student | A registered student with a USN, branch, CGPA and backlog count |
| Placement officer (admin) | Placement office staff who manage all placement data |

## 3. User stories

### Visitor
| ID | Story | Acceptance criteria |
|---|---|---|
| V1 | As a visitor, I want to see upcoming drives and overall placement figures, so that I know what the platform offers before signing up. | The home page lists upcoming drives (company, role, date, package) and shows student, placement-rate, offer and highest-package figures taken from the database. |
| V2 | As a visitor, I want to read the privacy policy and terms, so that I know how my data is used. | `/privacy` and `/terms` are linked from every public page. |

### Student
| ID | Story | Acceptance criteria |
|---|---|---|
| S1 | As a student, I want to register with my USN, branch and CGPA, so that the system can check my eligibility. | Registration requires name, USN, branch, CGPA, email, a password of at least 6 characters and acceptance of the terms. If the placement office already added my USN with the same email, my account is linked to that record. |
| S2 | As a student, I want to log in and log out. | Wrong credentials show "Wrong email or password". Logging out clears my session. |
| S3 | As a student, I want to see only the drives I am eligible for. | Drives are filtered by minimum CGPA, maximum backlogs and allowed branches. Completed drives are hidden. |
| S4 | As a student, I want to know why I cannot apply to a drive. | The Drives page lists the other drives with reasons such as "Needs CGPA 7". |
| S5 | As a student, I want to apply to a drive in one click. | Applying creates an application with status "applied". Applying twice to the same drive is refused. |
| S6 | As a student, I want to track the status of each application. | Each application shows applied, shortlisted, interview, offered or rejected, with a progress indicator. |
| S7 | As a student, I want to withdraw an application I made by mistake. | I can withdraw only while the status is still "applied". |
| S8 | As a student, I want to update my phone number, skills and resume. | These fields are editable. CGPA, backlogs and branch are read-only for students. |
| S9 | As a student, I want feedback on my resume for a specific drive. | The resume review sends my resume to the Gemini API and shows a score, strengths and improvements. |
| S10 | As a student, I want to browse external job listings. | The Live Jobs page searches the JSearch API. |

### Placement officer
| ID | Story | Acceptance criteria |
|---|---|---|
| A1 | As a placement officer, I want to add, edit and delete students, companies, drives and applications. | Full create, read, update and delete for all four collections, with validation messages for invalid input. |
| A2 | As a placement officer, I want to set eligibility rules for each drive. | Each drive has a minimum CGPA, maximum backlogs and a list of allowed branches (empty means all). |
| A3 | As a placement officer, I want to update each application's status. | Setting a status to "offered" marks the student as placed automatically. |
| A4 | As a placement officer, I want branch-wise and company-wise reports. | Reports are rebuilt from current data on request and stored with MongoDB `$merge`. |
| A5 | As a placement officer, I want to merge duplicate student records. | Students with the same email are listed as possible duplicates. Merging keeps one record, combines skills and moves applications. |
| A6 | As a placement officer, I want deleting a company to remove its drives and their applications. | Deletes cascade so no orphaned records remain. |
| A7 | As a placement officer, I want to add an external job listing as a drive. | A JSearch listing can be imported as a company and drive. |

## 4. Non-functional requirements

- Passwords are stored only as bcrypt hashes. Sessions use JWT tokens that expire after 7 days.
- Every API route checks the user's role: students cannot open admin routes (403), and requests without a token are refused (401).
- API keys for third-party services stay on the server and are never sent to the browser.
- Input is validated in the browser (required fields, number ranges) and again on the server (Mongoose schema rules). Errors are shown as clear messages.
- The interface works on phones (375 px) and desktops, in light and dark mode.

## 5. Wireframes

Low-fidelity wireframes of the main screens. The finished screens follow these layouts.

### Home page (public)
```
+--------------------------------------------------------------------+
| [P] PlaceHub     Features  How it works  Upcoming drives  [Log in] [Create account] |
+--------------------------------------------------------------------+
| FOR STUDENTS AND THE PLACEMENT OFFICE   |  +----------------------+ |
| Find the drives you qualify for.        |  | Upcoming drives      | |
| Track every application to an offer.    |  | Company   Role   LPA | |
| [Create student account] [See drives]   |  | ...                  | |
|                                         |  | Applied > Shortlisted| |
|                                         |  | > Interview > Offered| |
|                                         |  +----------------------+ |
+--------------------------------------------------------------------+
|  Students  |  % placed  |  Offers  |  Highest package               |
+--------------------------------------------------------------------+
| Two portals: [For students] [For the placement office]             |
+--------------------------------------------------------------------+
| Upcoming drives   [All] [Full-time] [Internships]                  |
| Company / role      Date       Package    Status      [>]          |
+--------------------------------------------------------------------+
| Footer: Privacy Policy | Terms and Conditions                       |
+--------------------------------------------------------------------+
```

### Login and registration
```
+---------------------------+----------------------------------------+
| [P] PlaceHub              |  Create your account                   |
|                           |  Full name [____________________]      |
| Placement drives,         |  USN [________]  Branch [CSE v]        |
| eligibility and           |  CGPA [____]     Backlogs [0]          |
| applications in one place.|  Email [_______________________]       |
|                           |  Password [____________________]       |
|                           |  [x] I agree to the Terms and Privacy  |
|                           |  [ Create account ]                    |
+---------------------------+----------------------------------------+
```

### Student overview
```
+------------+-------------------------------------------------------+
| PlaceHub   | Overview                                              |
|            | +---------------------------------------------------+ |
| Overview   | | (AR) Ananya Rao   1RV23CS101 · CSE   [Placed]     | |
| Drives     | +---------------------------------------------------+ |
| Profile    | [CGPA 9.1] [Open to apply 3] [Applications 2] [Offers 1]|
| Live Jobs  | +-----------------------+ +-------------------------+ |
|            | | Eligible drives       | | My applications         | |
|            | | Bosch  9 LPA  [Apply] | | Google  [Offered]       | |
| (user)     | | TCS    7 LPA  [Apply] | | Razorpay [Applied] [Withdraw]|
| [Log out]  | +-----------------------+ +-------------------------+ |
+------------+-------------------------------------------------------+
```

### Admin: students list
```
+------------+-------------------------------------------------------+
| PlaceHub   | Students          [Merge duplicates] [+ Add student]  |
|            | [Search______] [All branches v] [All statuses v]      |
| Dashboard  | Student        USN/Branch   CGPA  Skills  Status  [..]|
| Students   | Ananya Rao     1RV23CS101   9.1   Java    Placed  [eligible][review][edit][delete]|
| Companies  | ...                                                   |
| Drives     |                                                       |
| Applications                                                       |
| Live Jobs  |                                                       |
+------------+-------------------------------------------------------+
```

### Admin: dashboard
```
+------------+-------------------------------------------------------+
| PlaceHub   | Dashboard                                             |
|            | [Students 8] [Placement rate 38%] [Highest 32 LPA] [Drives 5]|
|            | +--------------------------+ +----------------------+ |
|            | | Application pipeline     | | Upcoming drives      | |
|            | | Applied     ==========  5| | Infosys  6.5 LPA     | |
|            | | Offered     ======      3| | Bosch    9 LPA       | |
|            | +--------------------------+ +----------------------+ |
|            | Branch-wise placements            [Run $merge]        |
|            | Company-wise results              [Run $merge]        |
+------------+-------------------------------------------------------+
```
