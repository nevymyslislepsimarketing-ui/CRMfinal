# 🔐 Google Drive - Nastavení Credentials

## ⚠️ DŮLEŽITÉ BEZPEČNOSTNÍ UPOZORNĚNÍ

**NIKDY** tyto credentials nekopírujte do:
- ❌ Kódu
- ❌ Commitů do Gitu
- ❌ Veřejné dokumentace
- ✅ POUZE do `.env` souboru

---

## 🚀 Rychlé nastavení (2 minuty)

### KROK 1: Backend .env

```bash
cd backend
nano .env
```

**Přidejte tyto řádky:**

```bash
# Google Drive API
GOOGLE_CLIENT_ID=<your_google_client_id_from_secure_storage>
GOOGLE_CLIENT_SECRET=<your_google_client_secret_from_secure_storage>
GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback
```

**Uložte (Ctrl+X, Y, Enter)**

### KROK 2: Restartujte backend

```bash
npm run dev
```

Měli byste vidět:
```
✅ Google Drive API připraveno
```

### KROK 3: Test

1. Otevřete: http://localhost:5173
2. Přihlaste se
3. Klikněte na **"Google Drive"** v menu
4. Klikněte **"Připojit Google Drive"**
5. Přihlaste se Google účtem
6. Povolte přístup
7. Hotovo! 🎉

---

## 🌐 Produkce (Render.com)

### Nastavení na Render:

1. Přihlaste se do Render Dashboard
2. Vyberte backend service
3. **Environment** → **Add Environment Variable**

**Přidejte 3 proměnné:**

```
GOOGLE_CLIENT_ID=<see_secure_storage>
```

```
GOOGLE_CLIENT_SECRET=<see_secure_storage>
```

```
GOOGLE_REDIRECT_URI=https://vase-domena.com/google-callback
```

⚠️ **DŮLEŽITÉ:** Změňte `GOOGLE_REDIRECT_URI` na vaši produkční doménu!

4. **Save Changes**
5. Backend se automaticky restartuje

### Aktualizovat Google Cloud Console:

1. Přejděte na: https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. Klikněte na vaše OAuth 2.0 Client ID
4. **Authorized redirect URIs** → **Add URI**
5. Přidejte: `https://vase-domena.com/google-callback`
6. **Save**

---

## ✅ Ověření že funguje

### Test připojení:

```bash
# V backend složce:
node -e "
require('dotenv').config();
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ NASTAVEN' : '❌ CHYBÍ');
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✅ NASTAVEN' : '❌ CHYBÍ');
console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);
"
```

**Měli byste vidět:**
```
Google Client ID: ✅ NASTAVEN
Google Client Secret: ✅ NASTAVEN
Redirect URI: http://localhost:5173/google-callback
```

---

## 🐛 Troubleshooting

### "Invalid credentials"
**Řešení:**
- Zkontrolujte že credentials jsou správně zkopírovány
- Žádné extra mezery na začátku/konci
- Restartujte backend

### "Redirect URI mismatch"
**Řešení:**
1. V Google Cloud Console zkontrolujte **Authorized redirect URIs**
2. Musí přesně odpovídat `GOOGLE_REDIRECT_URI` v .env
3. Včetně http/https a portu!

**Lokálně musí být:**
```
http://localhost:5173/google-callback
```

**Na produkci:**
```
https://vase-domena.com/google-callback
```

### "Access denied"
**Řešení:**
- Zkontrolujte že jste povolili přístup při první autorizaci
- Zkuste znovu: Odpojit → Připojit znovu

---

## 🔒 Bezpečnost

### Co je v .env (NIKDY v Gitu):
- ✅ Client ID
- ✅ Client Secret
- ✅ Redirect URI

### Co je v kódu (OK pro Git):
- ✅ API volání
- ✅ Frontend komponenty
- ✅ Backend routes
- ✅ Dokumentace

### .gitignore by měl obsahovat:
```
.env
.env.local
.env.*.local
```

---

## 🎉 Hotovo!

Google Drive je nyní plně funkční!

**Můžete:**
- 📁 Procházet soubory
- 📤 Nahrávat soubory
- 📥 Stahovat soubory
- 🔍 Vyhledávat
- 📂 Vytvářet složky
- 🖼️ Náhled obrázků

**Vše přímo v CRM, bez opuštění aplikace!** 🚀

---

**Datum nastavení:** 25. října 2025, 22:27 UTC+2  
**Status:** ✅ CREDENTIALS NASTAVENY  
**Ready to test:** ✅ ANO
