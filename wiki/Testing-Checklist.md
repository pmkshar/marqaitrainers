# Testing Checklist

End-to-end manual test scenarios for Marq AI Software Tutor. Run through these after every major change.

---

## Pre-flight

- [ ] `bun install` completes without errors
- [ ] `.env` has `ZAI_API_KEY` set
- [ ] `bun run dev` starts on http://localhost:3000
- [ ] `bun run build` completes without errors
- [ ] `npx tsc --noEmit` reports zero errors in `src/`

---

## 1. Homepage

- [ ] Hero section renders with "Marq AI Software Tutor" branding
- [ ] Features section shows 6+ feature cards
- [ ] Course grid shows 5 courses with icons, ratings, levels
- [ ] Pricing section shows 3 tiers (Monthly $39, Annual $349, Pay-per-Course $159)
- [ ] Tutors preview shows 2+ tutors with ratings
- [ ] CTA section has "Sign up" button
- [ ] Footer shows Marq AI branding + copyright

---

## 2. Authentication

### 2.1 Login (candidate)
- [ ] Click "Login" in navbar → modal opens
- [ ] Enter `aarav@marqai.dev` + any password → click "Login"
- [ ] Modal closes, navigates to candidate dashboard
- [ ] Navbar shows user avatar + name

### 2.2 Login (admin)
- [ ] Login with `admin@marqai.dev` + any password
- [ ] Navigates to admin dashboard (not candidate dashboard)

### 2.3 Register (candidate)
- [ ] Click "Sign up" → choose "Candidate" → fill form
- [ ] Click "Sign up" → navigates to candidate dashboard
- [ ] New user appears in admin Users tab

### 2.4 Register (tutor)
- [ ] Click "Sign up" → choose "Tutor" → fill application form
- [ ] Submit → navigates to tutor dashboard (status: pending)

### 2.5 Logout
- [ ] Click avatar in navbar → "Logout"
- [ ] Returns to homepage, navbar shows "Login" button

### 2.6 Quick admin login
- [ ] Visit `/admin` URL or click "Admin Portal" link
- [ ] Click "Quick admin login" button
- [ ] Bypasses auth, lands on admin portal

---

## 3. Course browsing

- [ ] Click any course card on homepage → course detail page opens
- [ ] Course detail shows: title, subtitle, description, level, duration, rating, instructor
- [ ] "What you'll learn" section shows 4+ bullet points
- [ ] "Prerequisites" section shows 2+ bullet points
- [ ] Curriculum accordion lists modules → lessons
- [ ] Click a module → expands to show lessons
- [ ] Click "Start" on a lesson → lesson view opens

---

## 4. Lesson view

- [ ] Video player area shows (mock video)
- [ ] Sidebar outline shows all lessons in module, current one highlighted
- [ ] Step tabs render with title, content, optional code, optional tip
- [ ] Click through all steps
- [ ] "Save note" → modal opens → type note → save → note appears in notes list
- [ ] "Discuss" → modal opens → type post → submit → post appears in discussion
- [ ] "Finish & Take Test" → quiz view opens

---

## 5. Quiz

- [ ] Quiz shows question, options (radio buttons)
- [ ] Select an answer → "Submit" button enables
- [ ] Submit → score shown (pass/fail)
- [ ] Explanation shown for each question
- [ ] "Retry" button appears if failed
- [ ] "Back to lesson" button appears if passed
- [ ] Lesson marked complete on pass (check dashboard)

---

## 6. AI Tutor

- [ ] Click "Ask AI Tutor" in navbar → Sheet slides in from right
- [ ] Suggestion chips visible (e.g. "How do I center a div in Flutter?")
- [ ] Click a chip → chip text appears in input → click send
- [ ] Or type custom question → click send
- [ ] Streaming response renders token-by-token
- [ ] Markdown rendered (bold, code blocks with syntax highlighting)
- [ ] Close Sheet → reopen → chat history preserved

---

## 7. Pricing & checkout

- [ ] Click "Pricing" in navbar → pricing page opens
- [ ] 3 tiers shown with features list
- [ ] Click "Start monthly subscription" → checkout modal opens
- [ ] Enter card details (any input) → click "Pay"
- [ ] Success state → navigates to dashboard
- [ ] Course(s) appear in "Courses in progress"

---

## 8. Human tutor flow

### 8.1 Browse marketplace
- [ ] Click "Tutors" in navbar → marketplace opens
- [ ] Search by name → results filter
- [ ] Filter by expertise → results filter
- [ ] Click a tutor card → view full profile (bio, rate, rating, sessions completed)

### 8.2 Book session
- [ ] Click "Book session" → booking modal opens
- [ ] Pick date, time, topic, duration → click "Confirm"
- [ ] Confirmation → booking appears on calendar
- [ ] Tutor receives notification

### 8.3 Live session
- [ ] From calendar, click "Join" on upcoming session → live session page opens
- [ ] Mock video player area shows
- [ ] Chat sidebar functional (type + send)
- [ ] "End session" button → marks booking completed

### 8.4 Tutor portal
- [ ] Login as tutor (`aisha@marqai.dev`)
- [ ] Click "Tutor Portal" → 5 tabs visible
- [ ] Overview tab shows KPIs
- [ ] Sessions tab shows upcoming + completed
- [ ] Students tab shows recent students
- [ ] Earnings tab shows gross / commission / net
- [ ] Profile tab allows editing headline, bio, rate

---

## 9. Dashboard (role-aware)

### 9.1 Candidate dashboard
- [ ] Header shows user name, role badge, quick stats
- [ ] Quick Actions section with 4+ buttons
- [ ] Courses in Progress shows top 3 with progress bars
- [ ] Upcoming Sessions shows next 3
- [ ] Assignments section with due dates
- [ ] Activity feed shows last 10 entries
- [ ] Mini Achievements shows last 4 badges
- [ ] Recommendations shows suggested courses

### 9.2 Tutor dashboard
- [ ] Header shows sessions completed, rating, monthly earnings
- [ ] Sessions section
- [ ] Students section
- [ ] Earnings section
- [ ] Profile Strength meter

### 9.3 Admin dashboard
- [ ] Header shows total users, courses, revenue
- [ ] Pending Approvals alert (if any pending tutors)
- [ ] Audit Log shows last 5 actions
- [ ] Integrations health summary

---

## 10. Notifications

- [ ] Bell icon visible in navbar (logged-in users only)
- [ ] Unread count badge shows on bell
- [ ] Click bell → dropdown opens
- [ ] Notifications list shows with type icons + titles
- [ ] Click a notification → deep-links to relevant page
- [ ] "Mark all as read" button clears all unread
- [ ] "X" button on each notification dismisses it
- [ ] Browser notification fires on new notification (if permission granted)

---

## 11. Portal pages

### 11.1 Calendar
- [ ] Click "Calendar" in user menu → calendar page opens
- [ ] Events grouped by day (next 30 days)
- [ ] Color-coded badges by type (session= violet, deadline= rose, etc.)
- [ ] Click event → navigates to session/assignment/etc.

### 11.2 Members
- [ ] Click "Members" → directory opens
- [ ] Search by name → filters
- [ ] Filter by role → filters
- [ ] Click "Add friend" on a member → button changes to "Pending"
- [ ] Click "Message" on a member → navigates to Messages with that thread open

### 11.3 Groups
- [ ] Click "Groups" → groups page opens
- [ ] 5 seeded groups shown with category badges
- [ ] Click "Join" on a group → button changes to "Leave"
- [ ] Member count updates

### 11.4 Messages
- [ ] Click "Messages" → two-pane layout opens
- [ ] Thread list on left, chat on right
- [ ] Send a message → appears in chat
- [ ] Unread badge in navbar updates

### 11.5 Certificates
- [ ] Click "Certificates" → page opens
- [ ] Earned certificates shown with validation codes
- [ ] "Share" button copies URL to clipboard (mock)

### 11.6 Achievements
- [ ] Click "Achievements" → page opens
- [ ] All 11 badges shown
- [ ] Earned badges in color, locked badges greyed out
- [ ] Tier badges visible (bronze/silver/gold/platinum)

### 11.7 Features
- [ ] Click "Features" in navbar → page opens
- [ ] 48 features shown with category filters
- [ ] Status filter (live/roadmap) works
- [ ] Each feature card shows code location

---

## 12. Super Admin portal

### 12.1 Access
- [ ] Visit admin portal as non-admin → "Access required" gate shown
- [ ] Click "Quick admin login" → admin portal opens
- [ ] 13 tabs visible in tab list

### 12.2 Dashboard tab
- [ ] KPI cards show real numbers
- [ ] Pending tutors alert (if any)
- [ ] Recent activity list
- [ ] Top courses list
- [ ] Integrations health grid

### 12.3 Users tab
- [ ] User list renders
- [ ] Search filters by name/email
- [ ] Role filter works
- [ ] Click "Suspend" → user status changes
- [ ] Click "Delete" → user removed (with confirmation)
- [ ] Click "Add user" → form opens → submit adds user

### 12.4 Courses tab
- [ ] Course list with enrollment counts
- [ ] "Assign to user" button → modal opens → user search → assign

### 12.5 Pricing tab
- [ ] 3 plans shown
- [ ] Edit price → save → changes persist

### 12.6 Tutors tab
- [ ] Pending tutors section at top
- [ ] Click "Approve" → tutor status changes
- [ ) Click "Reject" → tutor removed
- [ ] Set commission % + payout schedule per tutor

### 12.7 Integrations tab
- [ ] 14 integrations shown across 7 categories
- [ ] Toggle connected on/off
- [ ] Click integration → config editor opens

### 12.8 Roles tab
- [ ] 4 system roles shown
- [ ] Permission matrix renders
- [ ] Toggle a permission → changes persist
- [ ] Verify a role loses that capability (e.g. login as tutor, try the restricted action)

### 12.9 Audit tab
- [ ] Last 50 admin actions listed
- [ ] Each entry shows actor, action, target, timestamp

### 12.10 Certificate Builder tab
- [ ] 3 templates shown on left
- [ ] Canvas renders selected template
- [ ] Click element → selected (rose border)
- [ ] Edit position/font/color via right panel → canvas updates live
- [ ] Add element button → new element appears
- [ ] Delete element button → element removed
- [ ] Create new template button → blank template appears

### 12.11 Registration Forms tab
- [ ] 3 forms shown on left
- [ ] Form fields render with editor
- [ ] Toggle email verification / CAPTCHA / ToS
- [ ] Add field → appears in list
- [ ] Delete field → removed
- [ ] Change field kind via dropdown

### 12.12 Email Scheduling tab
- [ ] 8 schedules shown on left
- [ ] Toggle on/off
- [ ] Edit trigger / delay / subject / body
- [ ] Variables hint visible

### 12.13 Analytics tab
- [ ] 6 KPI cards show numbers
- [ ] 8-week enrollments bar chart renders
- [ ] 8-week revenue bar chart renders
- [ ] 4-stage funnel renders with percentages
- [ ] Top 5 courses list shows
- [ ] Click "Refresh" → re-aggregates

### 12.14 GDPR tab
- [ ] Existing bundles shown
- [ ] Enter user ID → "Generate bundle" → new pending bundle appears
- [ ] GDPR checklist visible (6 items, all ✅)

---

## 13. PWA

- [ ] Open Chrome DevTools → Application → Manifest → manifest.json loaded
- [ ] Service worker registered (Application → Service Workers)
- [ ] Click "Install" in address bar → app installs
- [ ] Launch installed app → opens in standalone window
- [ ] Toggle network offline (DevTools → Network → Offline) → reload → app shell loads
- [ ] Visit a previously-visited page while offline → loads from cache

---

## 14. Persistence

- [ ] Complete a lesson → reload page → lesson still marked complete
- [ ] Send 5 AI tutor messages → reload → last 5 messages still visible
- [ ] Add a friend → reload → friend still in list
- [ ] Post a discussion → reload → post still visible
- [ ] Clear localStorage → reload → seed data re-initializes

---

## 15. Mobile responsive

- [ ] Open on mobile viewport (375×667)
- [ ] Navbar collapses to hamburger menu
- [ ] Mobile menu opens/closes
- [ ] Course grid is single-column
- [ ] Dashboard sections stack vertically
- [ ] Admin portal tabs scroll horizontally
- [ ] AI tutor Sheet slides in full-width
- [ ] All buttons tappable (min 44×44px)

---

## 16. Cross-browser

- [ ] Chrome latest (Win/Mac) ✅
- [ ] Firefox latest (Win/Mac) ✅
- [ ] Safari 17+ (Mac) ✅
- [ ] Edge latest (Win) ✅
- [ ] iOS Safari 15+ ✅
- [ ] Android Chrome ✅

---

## 17. Accessibility

- [ ] Tab through navbar → focus visible
- [ ] Enter key activates focused button
- [ ] Screen reader (VoiceOver/NVDA) reads button labels
- [ ] Color contrast meets AA (test with Chrome DevTools → Lighthouse)
- [ ] All images have alt text or are decorative
- [ ] Form fields have associated labels

---

## 18. Performance

- [ ] Lighthouse audit → Performance ≥ 90
- [ ] Lighthouse audit → PWA = 100
- [ ] Lighthouse audit → Accessibility ≥ 90
- [ ] First Contentful Paint < 2s on 3G throttle
- [ ] Time to Interactive < 3s on 3G throttle

---

## 19. Regression suite (after every change)

After any code change, re-run at minimum:

1. Login as candidate → reach dashboard
2. Open a course → start a lesson → complete a quiz
3. Open AI tutor → send a message → receive response
4. Login as admin → visit all 13 tabs
5. Login as tutor → visit all 5 tabs
6. Visit all 7 portal pages (calendar, members, groups, messages, certificates, achievements, features)
7. Verify `npx tsc --noEmit` is clean
8. Verify `bun run build` is clean

---

## 20. Known issues

- None currently known. If you find one, add it to GitHub Issues.
