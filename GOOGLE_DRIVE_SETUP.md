# 📁 Google Drive Integrace - Kompletní návod

## 🎯 Co to udělá

**Možnosti:**
- 📂 Zobrazení souborů z Google Drive přímo v CRM
- 📥 Upload souborů do Drive
- 📤 Download souborů
- 🔗 Sdílení odkazů
- 📁 Procházení složek
- 🔍 Vyhledávání souborů
- **Bez opuštění CRM!**

---

## 🔧 KROK 1: Google Cloud Console Setup (10 minut)

### 1.1 Vytvořit projekt

1. Přejděte na: https://console.cloud.google.com
2. Klikněte **"Select a project"** → **"New Project"**
3. Zadejte název: `Nevymyslis CRM`
4. Klikněte **"Create"**

### 1.2 Aktivovat Google Drive API

1. V levém menu: **"APIs & Services"** → **"Library"**
2. Vyhledejte: `Google Drive API`
3. Klikněte na ni
4. Klikněte **"Enable"**

### 1.3 Vytvořit OAuth 2.0 Credentials

1. V levém menu: **"APIs & Services"** → **"Credentials"**
2. Klikněte **"Create Credentials"** → **"OAuth client ID"**
3. Pokud se zobrazí "Configure consent screen":
   - Klikněte **"Configure Consent Screen"**
   - Vyberte **"External"** → **"Create"**
   - Vyplňte:
     - **App name:** Nevymyslíš CRM
     - **User support email:** váš email
     - **Developer contact:** váš email
   - Klikněte **"Save and Continue"**
   - **Scopes:** Přidejte:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/drive.readonly`
   - Klikněte **"Save and Continue"**
   - **Test users:** Přidejte vaše emaily
   - Klikněte **"Save and Continue"**

4. Zpět na **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
5. **Application type:** Web application
6. **Name:** Nevymyslis CRM Web
7. **Authorized JavaScript origins:**
   - `http://localhost:5173` (development)
   - `https://vase-domena.com` (production)
8. **Authorized redirect URIs:**
   - `http://localhost:5173/google-callback`
   - `https://vase-domena.com/google-callback`
9. Klikněte **"Create"**

### 1.4 Uložit credentials

**Objeví se modal s:**
- **Client ID:** něco jako `123456789-abc.apps.googleusercontent.com`
- **Client Secret:** něco jako `GOCSPX-abc123`

**DŮLEŽITÉ: Zkopírujte si obojí!**

---

## 🔧 KROK 2: Backend implementace

### 2.1 Instalace dependencies

```bash
cd backend
npm install googleapis
```

### 2.2 Environment variables

Přidejte do `backend/.env`:

```bash
# Google Drive API
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback
```

### 2.3 Google Drive Service

Soubor již vytvořen: `backend/services/googleDriveService.js`

### 2.4 Google Drive Routes

Soubor již vytvořen: `backend/routes/google-drive.js`

### 2.5 Aktualizovat server.js

Již přidáno do `backend/server.js`

---

## 🔧 KROK 3: Frontend implementace

### 3.1 Google Drive komponenta

Soubor již vytvořen: `frontend/src/pages/GoogleDrive.jsx`

### 3.2 Callback komponenta

Soubor již vytvořen: `frontend/src/components/GoogleCallback.jsx`

### 3.3 Routes

Již přidáno do `frontend/src/App.jsx`

---

## 🚀 KROK 4: Jak používat

### 4.1 První připojení

1. V CRM klikněte na **"Google Drive"** v menu
2. Klikněte **"Připojit Google Drive"**
3. Budete přesměrováni na Google
4. Přihlaste se Google účtem
5. Povolte přístup
6. Budete přesměrováni zpět do CRM
7. Vaše soubory se zobrazí!

### 4.2 Procházení souborů

- **Složky:** Klikněte na složku pro otevření
- **Soubory:** Klikněte na soubor pro náhled/download
- **Breadcrumbs:** Nahoře vidíte cestu, klikněte pro návrat

### 4.3 Upload souboru

1. Klikněte **"Nahrát soubor"**
2. Vyberte soubor z počítače
3. Soubor se nahraje do aktuální složky
4. Zobrazí se v seznamu

### 4.4 Vytvoření složky

1. Klikněte **"Nová složka"**
2. Zadejte název
3. Složka se vytvoří v aktuální složce

### 4.5 Odpojení

- Klikněte **"Odpojit"** pro odhlášení
- Token se smaže z localStorage

---

## 🔐 Bezpečnost

### Co je uloženo:

**V localStorage:**
- `google_access_token` - Přístupový token (platnost 1 hodina)
- `google_refresh_token` - Refresh token (platnost neomezená)

**Co to znamená:**
- Tokens jsou uloženy pouze v prohlížeči uživatele
- Server je NIKDY neuloží
- Každý uživatel má vlastní připojení
- Token se automaticky obnoví po vypršení

### Oprávnění:

**Požadovaná oprávnění:**
- `drive.file` - Přístup k souborům vytvořeným aplikací
- `drive.readonly` - Čtení všech souborů

**Co to znamená:**
- Můžete číst všechny soubory
- Můžete nahrávat nové soubory
- Můžete mazat pouze soubory vytvořené CRM
- NEMŮŽETE mazat existující soubory uživatele

---

## 🎨 UX Features

### Implementované:

- ✅ **Breadcrumb navigace** - Vidíte cestu
- ✅ **Ikony podle typu** - PDF, DOC, IMG, atd.
- ✅ **Grid view** - Přehledný grid layout
- ✅ **Inline preview** - Náhled obrázků
- ✅ **Download tlačítko** - Stažení souboru
- ✅ **Upload progress** - Ukazatel nahrávání
- ✅ **Search** - Vyhledávání souborů
- ✅ **Loading states** - Ukazatele načítání
- ✅ **Error handling** - Chybové hlášky

### Možná vylepšení:

- [ ] Drag & drop upload
- [ ] Bulk upload (více souborů najednou)
- [ ] Přejmenování souborů
- [ ] Sdílení souborů
- [ ] Kopírování/přesouvání
- [ ] Filtry (typ souboru, datum)
- [ ] Třídění (název, datum, velikost)
- [ ] List view (alternativa k grid)

---

## 🔧 Propojení s klienty

### Možnost 1: Automatické ukládání podle klienta

Když nahrajete soubor v detailu klienta:
- Automaticky se vytvoří složka s názvem klienta
- Soubor se uloží do této složky
- V CRM vidíte pouze soubory tohoto klienta

### Možnost 2: Link v klientovi

V `clients` tabulce už máte sloupec `google_drive_link`:
- Uložte ID složky Google Drive
- Při otevření klienta automaticky otevřít tuto složku
- Rychlý přístup k souborům klienta

### Implementace:

```javascript
// V Clients.jsx detail
const openGoogleDrive = (folderId) => {
  navigate(`/google-drive?folder=${folderId}`);
};

// V GoogleDrive.jsx
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const folderId = params.get('folder');
  if (folderId) {
    fetchFiles(folderId);
  }
}, [location]);
```

---

## 📊 API Endpoints

**Backend routes:**

```
GET  /api/google-drive/auth-url          - URL pro autorizaci
POST /api/google-drive/callback          - Callback po autorizaci
GET  /api/google-drive/files             - Seznam souborů
GET  /api/google-drive/files/:id         - Detail souboru
POST /api/google-drive/upload            - Upload souboru
POST /api/google-drive/create-folder     - Vytvoření složky
GET  /api/google-drive/download/:id      - Download souboru
```

**Příklady použití:**

```javascript
// Získat soubory
const response = await api.get('/google-drive/files', {
  params: { folderId: 'root', accessToken }
});

// Upload
const formData = new FormData();
formData.append('file', file);
formData.append('folderId', currentFolder);
formData.append('accessToken', token);

await api.post('/google-drive/upload', formData);

// Vytvořit složku
await api.post('/google-drive/create-folder', {
  name: 'Nova slozka',
  parentId: currentFolder,
  accessToken: token
});
```

---

## 🐛 Troubleshooting

### "Access token expired"
**Řešení:**
- Token automaticky vyprší po 1 hodině
- Použijte refresh token pro získání nového
- Implementováno v `googleDriveService.js`

### "Invalid credentials"
**Řešení:**
- Zkontrolujte GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET v .env
- Zkontrolujte že jsou správně zkopírovány z Google Console
- Restartujte backend

### "Redirect URI mismatch"
**Řešení:**
- V Google Console zkontrolujte "Authorized redirect URIs"
- Musí přesně odpovídat URL v .env (včetně http/https)
- Přidejte: `http://localhost:5173/google-callback`

### "Access denied"
**Řešení:**
- Zkontrolujte že jste povolili přístup při první autorizaci
- Zkuste odhlásit a znovu autorizovat
- Zkontrolujte scope v Google Console

### Soubory se nezobrazují
**Řešení:**
- Otevřete Browser Console (F12)
- Zkontrolujte network tab
- Zkontrolujte že access token je platný
- Zkuste refresh stránky

---

## 💰 Ceny Google Drive API

**Zdarma:**
- 1 miliardy požadavků denně (!)
- Neomezeně uživatelů
- Bez kreditní karty

**Pro vaše použití:**
- Všechno bude ZDARMA
- Google Drive API je generózní s free tier
- Jen pokud byste měli >1000 uživatelů, začali byste platit

---

## 🎯 Next Steps po implementaci

1. **Testování:**
   - Připojte Google účet
   - Nahrajte testovací soubor
   - Vytvořte složku
   - Stáhněte soubor

2. **Propojení s klienty:**
   - Přidejte tlačítko "Google Drive" do detail klienta
   - Automaticky otevřít složku klienta

3. **UX vylepšení:**
   - Drag & drop upload
   - Bulk upload
   - Preview dokumentů

4. **Dokumentace:**
   - Vytvořte video návod pro uživatele
   - Screenshot guide

---

## 📋 Checklist implementace

- [x] Backend service vytvořen
- [x] Backend routes vytvořeny
- [x] Frontend komponenta vytvořena
- [x] Callback komponenta vytvořena
- [x] Routes přidány
- [x] Dokumentace vytvořena
- [ ] Google Cloud Console setup (TODO: Uživatel)
- [ ] Credentials přidány do .env (TODO: Uživatel)
- [ ] Testování (TODO: Po setupu)
- [ ] Propojení s klienty (TODO: Volitelné)

---

## 🎉 Závěr

Google Drive integrace je **připravena k použití**!

**Zbývá jen:**
1. ✅ Vytvořit projekt v Google Cloud Console (10 min)
2. ✅ Získat Client ID a Secret (5 min)
3. ✅ Přidat do .env (1 min)
4. ✅ Restartovat backend (1 min)
5. ✅ Testovat! (5 min)

**Celkem: ~20 minut**

---

**Status:** ✅ Implementace hotová, čeká na Google credentials  
**Dokumentace:** ✅ Kompletní  
**Testováno:** ⏳ Čeká na setup
