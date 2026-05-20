# 📚 Exam Results API

A fully-featured NestJS backend for managing student exam results, with rich analytics, rankings, and charting-ready data APIs.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Run
```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build && npm run start:prod
```

Server: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api/docs`

---

## 🗄️ Database

Set `synchronize: false` is already the default — the app connects to your **existing** schema without touching it.

---

## 📡 API Reference

All routes are prefixed with `/api/v1`.

---

### 👤 Students — `/api/v1/students`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all students (filter by `course`, `name`, `enrollment_no`) |
| GET | `/count` | Total student count |
| GET | `/courses` | All distinct courses |
| GET | `/enrollment/:enrollmentNo` | Find by enrollment number |
| GET | `/:id` | Student detail with all exam sessions |
| GET | `/:id/performance` | Full academic performance summary (CGPA, sem-wise, subjects) |
| POST | `/` | Create student |
| PUT | `/:id` | Update student |
| DELETE | `/:id` | Delete student |

**Performance response includes:**
- CGPA, highest/lowest SGPA
- Pass/fail count
- Per-semester breakdown with subject-wise marks

---

### 📖 Subjects — `/api/v1/subjects`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all subjects (optional `?search=`) |
| GET | `/:id` | Get subject by ID |
| POST | `/` | Create subject |
| PUT | `/:id` | Update subject |
| DELETE | `/:id` | Delete subject |

---

### 📋 Exam Sessions — `/api/v1/exam-sessions`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | All sessions (filter: `semester`, `exam_session`, `result`) |
| GET | `/semesters` | All distinct semesters |
| GET | `/exam-session-names` | All distinct exam session names |
| GET | `/student/:studentId` | All sessions for a student |
| GET | `/:id` | Session detail with subject results |
| POST | `/` | Create session |
| PUT | `/:id` | Update session |
| DELETE | `/:id` | Delete session |

---

### 📝 Subject Results — `/api/v1/subject-results`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | All results (filter: `exam_session_id`, `subject_id`) |
| GET | `/:id` | Single result |
| POST | `/` | Create one result |
| POST | `/bulk` | Bulk insert `{ results: [...] }` |
| PUT | `/:id` | Update result |
| DELETE | `/:id` | Delete result |

---

### 📊 Analytics — `/api/v1/analytics`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/overview` | Global totals, pass/fail, SGPA stats, course distribution |
| GET | `/semester/:semester` | Pass/fail %, SGPA range, grade freq for a semester |
| GET | `/subject/:subjectId` | Avg/max/min/median marks, grade dist, student list |
| GET | `/subject/:subjectId/histogram` | Marks histogram (configurable bins) |
| GET | `/grade-distribution` | Grade frequency (optionally filtered) |
| GET | `/sgpa-distribution` | SGPA buckets: 9-10, 8-9, 7-8, etc. |
| GET | `/top-performers` | Top N by SGPA (filter: semester, course) |
| GET | `/compare-students?ids=1,2,3` | Side-by-side student comparison (CGPA, sem data) |
| GET | `/compare-exam-sessions?session1=X&session2=Y` | Two exam session comparison |
| GET | `/student/:studentId/trend` | SGPA/marks trend across semesters |
| GET | `/course/:course` | Aggregated course analytics |

---

### 🏆 Rankings — `/api/v1/rankings`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/semester/:semester` | Ranked list by SGPA for a semester |
| GET | `/subject/:subjectId` | Ranked list by marks for a subject |
| GET | `/course/:course` | Ranked list within a course |
| GET | `/overall` | All-time CGPA ranking (optionally by course) |
| GET | `/student/:studentId/rank` | A student's rank in a semester |
| GET | `/student/:studentId/percentile` | Student percentile in a semester |

---

## 🧩 Example: Frontend Usage

```javascript
// Semester ranking for a chart
const res = await fetch('/api/v1/rankings/semester/3rd?exam_session=Even+2024');
const ranks = await res.json();
// ranks = [{ rank: 1, name: "Rahul", sgpa: 9.8, ... }, ...]

// SGPA distribution for a pie/bar chart
const dist = await fetch('/api/v1/analytics/sgpa-distribution?semester=3rd');
// dist = { distribution: [{ range: "9-10", count: 12, percentage: 24.0 }, ...] }

// Compare two students
const compare = await fetch('/api/v1/analytics/compare-students?ids=1,2,5');

// Subject-wise marks histogram
const hist = await fetch('/api/v1/analytics/subject/3/histogram?bins=8');
```

---

## 📁 Project Structure

```
src/
├── students/          # Student CRUD + performance
├── subjects/          # Subject catalogue
├── exam-sessions/     # Per-semester session records
├── subject-results/   # Per-subject marks
├── analytics/         # Stats, distributions, comparisons
├── rankings/          # Rank lists, percentiles, CGPA ranking
├── config/            # DB config
└── main.ts            # Bootstrap + Swagger
```

---

## 🛠️ Tech Stack

- **NestJS** — framework
- **TypeORM** — ORM
- **PostgreSQL** — database
- **Swagger** — auto-generated API docs (`/api/docs`)
- **class-validator** — DTO validation
