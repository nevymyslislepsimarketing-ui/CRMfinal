# ⚡ Quick Commands Reference

## 🚀 Production Update - Copy & Paste

### 1️⃣ Pre-deployment Check

```bash
./deploy-check.sh
```

### 2️⃣ Git Push

```bash
git add .
git commit -m "Update to v3.0.0 - Projects, AI, Google Drive, Finance, CRON"
git push origin main
```

### 3️⃣ Update Render Environment Variables

```bash
./update-render-env.sh
```

**Nebo přímo v Render Dashboard přidat:**

```
COHERE_API_KEY=<see_secure_storage>
GOOGLE_CLIENT_ID=<see_secure_storage>
GOOGLE_CLIENT_SECRET=<see_secure_storage>
GOOGLE_REDIRECT_URI=https://VASE-DOMENA.pages.dev/google-callback
```

### 4️⃣ Database Migration

**Získat DATABASE_URL z Render Dashboard → Database → Connect (Internal URL)**

```bash
export DATABASE_URL="postgresql://user:pass@host/db"
./update-render-db.sh
```

**Nebo v Render Shell:**

```bash
cd backend
npm run migrate:v3
npm run seed:pricing
```

### 5️⃣ Verification

```bash
curl https://vase-backend.onrender.com/api/health
```

---

## 🔍 Quick Checks

### Backend Health:

```bash
curl https://vase-backend.onrender.com/api/health
```

### Database Tables:

```bash
psql $DATABASE_URL -c "\dt"
```

### Environment Variables:

```bash
# V Render Shell:
printenv | grep -E "COHERE|GOOGLE"
```

---

## 🛠️ Development Commands

### Local Setup:

```bash
# Backend
cd backend
npm install
npm run migrate:v3
npm run seed:pricing
npm run dev

# Frontend (nový terminál)
cd frontend
npm install
npm run dev
```

### Local Environment:

```bash
# Automatický Google Drive setup
./setup-google-drive.sh

# Nebo manuálně přidat do backend/.env:
COHERE_API_KEY=<see_secure_storage>
GOOGLE_CLIENT_ID=<see_secure_storage>
GOOGLE_CLIENT_SECRET=<see_secure_storage>
GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback
```

---

## 📊 Monitoring

### Render Logs:

```bash
# V Render Dashboard:
Dashboard → Service → Logs (real-time)
```

### Database Backup:

```bash
# V Render Dashboard:
Dashboard → Database → Backups → Create Backup
```

### Health Check Loop:

```bash
watch -n 5 'curl -s https://vase-backend.onrender.com/api/health | jq'
```

---

## 🔄 Rollback Commands

### Render Rollback:

```bash
# Dashboard → Service → Events → Rollback to previous version
```

### Cloudflare Rollback:

```bash
# Dashboard → Deployments → Rollback to previous deployment
```

### Database Restore:

```bash
# Dashboard → Database → Backups → Restore from backup
```

---

## 🧪 Testing

### Test All Endpoints:

```bash
BASE_URL="https://vase-backend.onrender.com/api"

# Health
curl $BASE_URL/health

# Projects
curl $BASE_URL/projects -H "Authorization: Bearer YOUR_TOKEN"

# Pricing
curl $BASE_URL/pricing/services -H "Authorization: Bearer YOUR_TOKEN"

# AI Captions
curl $BASE_URL/ai-captions/history -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend Pages:

```
https://vase-domena.pages.dev/projects
https://vase-domena.pages.dev/pricing
https://vase-domena.pages.dev/ai-captions
https://vase-domena.pages.dev/google-drive
```

---

## 📝 Common Tasks

### Add New Environment Variable:

```bash
# Render Dashboard:
Environment → Add Environment Variable
KEY=VALUE
```

### View Logs:

```bash
# Render Dashboard:
Logs → Filter by level (ERROR, WARN, INFO)
```

### Manual Deploy Trigger:

```bash
# Render Dashboard:
Manual Deploy → Deploy latest commit
```

### Clear Cache:

```bash
# Cloudflare Dashboard:
Caching → Purge Everything
```

---

## 🔐 Security

### Rotate JWT Secret:

```bash
# Generate new secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update in Render:
JWT_SECRET=<new_secret>
# Service will restart
```

### View API Keys:

```bash
# NIKDY v kódu!
# Pouze v Render Dashboard → Environment
```

---

## 📦 Package Updates

### Update Dependencies:

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix

# Commit and push
git add package*.json
git commit -m "Update dependencies"
git push
```

---

## 💾 Database Management

### Database Info:

```bash
psql $DATABASE_URL -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Count Records:

```bash
psql $DATABASE_URL -c "
SELECT 
  'projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'service_pricing', COUNT(*) FROM service_pricing
UNION ALL
SELECT 'client_quotes', COUNT(*) FROM client_quotes
UNION ALL
SELECT 'ai_post_history', COUNT(*) FROM ai_post_history;
"
```

---

## 🎯 Quick Reference

### All Scripts:

```bash
./deploy-check.sh           # Pre-deployment kontrola
./update-render-db.sh       # Database migrace
./update-render-env.sh      # Env vars reference
./setup-google-drive.sh     # Google Drive local setup
```

### Documentation:

```bash
PRODUCTION_UPDATE_GUIDE.md  # Hlavní guide
QUICK_COMMANDS.md           # Tento soubor
API_KEYS_REFERENCE.md       # Všechny API klíče
DEPLOYMENT_GUIDE.md         # Detailní deployment
```

### Support:

```bash
# Render: https://dashboard.render.com/support
# Cloudflare: https://dash.cloudflare.com/support
# Docs: V root složce *.md soubory
```

---

## ✅ Update Checklist

```bash
[ ] ./deploy-check.sh
[ ] git push origin main
[ ] Render env vars updated
[ ] Database migration done
[ ] Google Cloud Console updated
[ ] Health check OK
[ ] Frontend test OK
[ ] All features working
[ ] No errors in logs
[ ] CRON jobs running (next day)
```

---

**Tip:** Bookmark tuto stránku pro rychlý přístup k příkazům! 📌
