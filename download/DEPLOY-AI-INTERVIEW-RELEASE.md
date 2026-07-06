# Deploy AI Interview + Certificate + Resume Studio (June 2026 release)

This note covers pushing **commit `bfaee51`** (the AI video interview + graphical certificate + resume studio release) to GitHub and deploying it to Vercel.

---

## What's in this release

| Feature | Where to find it |
|---------|------------------|
| AI Video Interview | Candidate dashboard → "AI Interview" quick action → "Start" button on any enrolled course |
| Interview Report | Candidate dropdown → "Interview Reports" (list + single report view with per-question breakdown) |
| Graphical Certificate (PNG download) | My Certificates → "View" on any approved certificate |
| Super Admin Certificate Approval | Admin Portal → "Cert Approvals" tab → review pending certs, drill into interview report, approve/reject |
| Candidate Profile Photo | Settings → "Profile Photo" card (auto-resized to 400×400 JPEG, stored in localStorage) |
| Resume Studio (4 templates) | Candidate dropdown → "Resume Studio" → upload/paste resume → pick template → "Reform with AI" → download .txt/.pdf |

**Issuer on every certificate:** Marq AI Tech Pvt Ltd (logo at `public/marq-ai-logo.png`).

**Approval flow:** AI interview (pass ≥ 60%) → certificate queued as `pending` → super admin approves in "Cert Approvals" tab → candidate can download PNG anytime from My Certificates.

---

## Step 1 — Push to GitHub

The repo is `https://github.com/pmkshar/marqaitrainers.git` and the commit is ready locally as `bfaee51` on `main`.

### Option A — Push from this sandbox (you provide a PAT)

Share a GitHub Personal Access Token with **repo** scope:
<https://github.com/settings/tokens/new?scopes=repo&description=marqaitrainers-push-june2026>

Then I'll run:
```bash
cd /home/z/my-project
git remote set-url origin https://<PAT>@github.com/pmkshar/marqaitrainers.git
git push -u origin main
git remote set-url origin https://github.com/pmkshar/marqaitrainers.git  # strip PAT
```

Delete the PAT immediately after at <https://github.com/settings/tokens>.

### Option B — Push from your own machine

```bash
# 1. Download the tarball from this sandbox:
#    /home/z/my-project/download/marq-ai-software-tutor.tar.gz

# 2. Extract on your machine:
tar xzf marq-ai-software-tutor.tar.gz -C marq-ai-tutor
cd marq-ai-tutor

# 3. Set up git remote (if not already):
git remote add origin https://github.com/pmkshar/marqaitrainers.git

# 4. Push:
git push -u origin main
```

---

## Step 2 — Deploy to Vercel

### Option A — Auto-deploy from GitHub (recommended)

If your Vercel project is already linked to the `pmkshar/marqaitrainers` GitHub repo, the push above will auto-trigger a deploy. Check the deployments tab at:
<https://vercel.com/dashboard/deployments>

Build time: ~60 seconds. No env vars required for the deterministic fallbacks (interview question bank + keyword evaluator + template reformer all work without keys).

### Option B — Manual deploy via Vercel CLI

Share a Vercel token: <https://vercel.com/account/tokens>

Then I'll run:
```bash
cd /home/z/my-project
npx vercel --prod --token <VERCEL_TOKEN> --yes
```

### Option C — One-click deploy via dashboard

Visit:
<https://vercel.com/new/clone?repository-url=https://github.com/pmkshar/marqaitrainers>

Sign in with GitHub, accept the defaults, click "Deploy". ~60 seconds.

---

## Step 3 — (Optional) Enable the full AI backend

The platform works out-of-the-box with deterministic fallbacks, but for richer AI responses set these env vars on Vercel (Project → Settings → Environment Variables):

| Var | Purpose | Where to get it |
|-----|---------|-----------------|
| `ZAI_API_KEY` | LLM + TTS for AI tutor, interview Q generation, interview evaluation, resume reform | Z.ai console |
| `ZAI_BASE_URL` | ZAI API endpoint (e.g. `https://api.z.ai/api/paas/v4`) | Z.ai console |
| `NEXTAUTH_SECRET` | Signs NextAuth JWTs | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Google OAuth login | Google Cloud Console |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | Real Stripe checkout | Stripe Dashboard |

After setting env vars, trigger a redeploy.

---

## Verification checklist (post-deploy)

1. **Home page** loads at <https://marqaitrainers.vercel.app/>
2. **Sign in** as the demo candidate (quick login "Candidate" → Priya Nair, or Daniel Wu)
3. **Dashboard** shows the new "AI Interview" quick action + AI Interview CTA panel with enrolled courses
4. **Click "Start"** on the Python course → AI interview loads → webcam + mic permissions requested → first question spoken aloud → answer transcribed → submit → next question
5. **After 5 questions** → interview report appears with per-question scores + summary
6. If passed (≥ 60%) → "Certificate queued for Super Admin approval" banner
7. **Sign in as Super Admin** → Admin Portal → "Cert Approvals" tab → pending certificate visible → click "Review interview report" → back to tab → "Approve"
8. **Sign back in as candidate** → My Certificates → certificate now "Approved" → click "View" → graphical certificate renders with logo + photo + training details → click "Download PNG" → high-res image downloads
9. **Settings** → "Profile Photo" card → upload a photo → it appears on future certificates
10. **Resume Studio** → paste resume text → pick "Tech" template → "Reform with AI" → preview shows reformed resume → download as .txt or .pdf

---

## Rollback

If anything breaks, revert the commit:
```bash
git revert bfaee51
git push origin main
```
Vercel will auto-redeploy.
