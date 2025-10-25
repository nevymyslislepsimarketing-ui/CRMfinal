# 🤖 AI Caption Generator - Návod k použití

## ✅ HOTOVO - Co bylo implementováno

**Backend:**
- ✅ `/api/ai-captions/generate` - Generování textu
- ✅ `/api/ai-captions/history` - Historie generování
- ✅ Integrace s Cohere API
- ✅ Učení z historie klienta

**Frontend:**
- ✅ `pages/AICaptions.jsx` - Kompletní UI
- ✅ Výběr platformy (Instagram, Facebook, LinkedIn, TikTok, Twitter)
- ✅ Typy příspěvků (Post, Story, Reel, Carousel, atd.)
- ✅ Tón hlasu (Profesionální, Přátelský, Hravý, atd.)
- ✅ Historie generování s možností opětovného použití
- ✅ Kopírování do schránky

---

## 🔐 Bezpečné nastavení API klíče

### ⚠️ NIKDY API klíč nevkládejte přímo do kódu!

### Lokální development:

1. **Přejděte do backend složky:**
```bash
cd backend
```

2. **Zkontrolujte že máte `.env` soubor:**
```bash
ls -la .env
```

3. **Otevřete `.env` soubor a přidejte API klíč:**
```bash
nano .env
# nebo
code .env
```

4. **Přidejte tento řádek:**
```
COHERE_API_KEY=JvmFW0zOku0QpsTdRcqAsfm4EJq2aQAHS0brnu2E
```

5. **Restartujte backend:**
```bash
npm run dev
```

### Produkce (Render.com):

1. Přihlaste se do Render Dashboard
2. Vyberte svůj backend service
3. Klikněte na **"Environment"** v levém menu
4. Klikněte **"Add Environment Variable"**
5. Přidejte:
   - **Key:** `COHERE_API_KEY`
   - **Value:** `JvmFW0zOku0QpsTdRcqAsfm4EJq2aQAHS0brnu2E`
6. Klikněte **"Save Changes"**
7. Backend se automaticky restartuje

### Ověření že funguje:

```bash
# V backend složce:
node -e "require('dotenv').config(); console.log('API Key:', process.env.COHERE_API_KEY ? 'NASTAVEN ✅' : 'CHYBÍ ❌')"
```

---

## 🚀 Jak používat AI Generátor

### 1. Přihlaste se do CRM

### 2. Klikněte na "AI Popisky" v menu
Ikona: ✨ Sparkles

### 3. Vyplňte formulář:

**Klient (volitelné):**
- Pokud vyberete klienta, AI se učí z předchozích příspěvků
- Historie se ukládá a můžete ji znovu použít

**Platforma:**
- 📸 Instagram
- 👍 Facebook
- 💼 LinkedIn
- 🎵 TikTok
- 🐦 Twitter/X

**Typ příspěvku:**
- Běžný příspěvek
- Story
- Reel/Video
- Carousel
- Oznámení
- Propagace/Akce

**Tón hlasu:**
- Profesionální
- Přátelský
- Hravý
- Formální
- Neformální
- Inspirativní

**Téma:**
Popište o čem má být příspěvek, např:
> "Představení nové kolekce letních triček, slevy až 30%, moderní design, bavlněné materiály"

### 4. Klikněte "Vygenerovat text"

AI vytvoří poutavý text s:
- ✅ Emoji
- ✅ Call-to-action
- ✅ Profesionální ale přátelský tón
- ✅ Optimalizováno pro vybranou platformu

### 5. Kopírujte a použijte

Klikněte "Kopírovat" a vložte text do vašeho příspěvku!

---

## 📊 Historie a učení

### Jak to funguje:

1. Každé generování se ukládá do databáze
2. Při dalším generování pro stejného klienta se AI učí z historie
3. Text je relevantnější a konzistentnější se značkou

### Použití historie:

1. Vyberte klienta
2. V pravém sloupci se zobrazí historie
3. Klikněte na položku pro opětovné použití
4. Můžete generovat znovu nebo upravit

### Mazání historie:

- Klikněte na ikonu koše u položky
- Historie se smaže trvale

---

## 🎨 Příklady použití

### Instagram - Propagace produktu:

**Nastavení:**
- Platforma: Instagram
- Typ: Reel/Video
- Tón: Přátelský
- Téma: "Představení nové kolekce letních šatů, pastelové barvy, bavlna"

**Vygenerováno:**
```
🌸 Léto může přijít! ☀️

Představujeme vám naši novou kolekci letních šatů v nádherných pastelových barvách! 💕

Každé šaty jsou ušité z prémiové bavlny, která je super příjemná na dotyk a perfektní pro horké dny. 👗✨

Prohlédněte si celou kolekci na našem profilu! 
👆 Link v bio

#letníšaty #pastelovebarvy #bavlna #moda #leto2025
```

### LinkedIn - Firemní oznámení:

**Nastavení:**
- Platforma: LinkedIn
- Typ: Oznámení
- Tón: Profesionální
- Téma: "Rozšíření týmu, hledáme marketingového specialistu"

**Vygenerováno:**
```
🚀 Náš tým roste!

S radostí oznamujeme, že hledáme nového Marketingového specialistu, který posílí náš dynamický tým.

Co nabízíme:
✅ Kreativní prostředí
✅ Možnost růstu
✅ Zajímavé projekty

Pokud máte zkušenosti s digitálním marketingem a chcete být součástí našeho úspěchu, ozvěte se!

📩 Více informací v komentářích nebo DM

#jobs #marketing #hiring #teamgrowth
```

---

## 🔧 Pokročilé nastavení

### Upravit prompt pro specifické potřeby:

Můžete upravit prompt v `backend/routes/ai-captions.js`:

```javascript
const prompt = `Napiš poutavý text pro ${platform}...
// Zde můžete přidat specifické požadavky
`;
```

### Změnit AI model:

Cohere nabízí různé modely (aktualizováno 2025):
- `command-r-plus` - **Výchozí** (nejlepší kvalita, doporučený)
- `command-r7b-12-2024` - Rychlejší, efektivnější
- `command-light` - Nejrychlejší, nejlevnější

⚠️ **Poznámka:** Modely `command`, `command-r` byly odstraněny 15.9.2025

Změna v `backend/routes/ai-captions.js`:
```javascript
body: JSON.stringify({
  model: 'command-r-plus', // Aktuální doporučený model
  ...
})
```

### Nastavit délku textu:

```javascript
max_tokens: 300, // Změnit na 500 pro delší texty
```

### Nastavit kreativitu:

```javascript
temperature: 0.8, // 0.0 = velmi konzervativní, 1.0 = velmi kreativní
```

---

## 💰 Cenová kalkulace Cohere API

**Cohere pricing:**
- Command model: $0.50 / 1M input tokens, $1.50 / 1M output tokens
- Free tier: První měsíc zdarma

**Odhad pro vaše použití:**
- 1 generování ≈ 200 input + 300 output tokens
- 1000 generování ≈ $0.55
- Měsíčně (při 100 generováních) ≈ $0.055 (cca 1-2 Kč)

**Velmi levné! 🎉**

---

## ❓ FAQ

### Q: Text není relevantní / nekvalitní?
**A:** Zkuste:
1. Přidat více detailů do tématu
2. Změnit tón hlasu
3. Vybrat klienta (AI se učí z historie)
4. Vygenerovat znovu (každé generování je jiné)

### Q: Chyba "API key není nastaven"?
**A:** Zkontrolujte:
1. `.env` soubor v backend složce
2. Řádek `COHERE_API_KEY=...`
3. Restartujte backend
4. Zkontrolujte konzoli backendu při startu

### Q: Můžu použít jiné AI API?
**A:** Ano! Jednoduše upravte funkci `generateCaption()` v:
```
backend/routes/ai-captions.js
```

Podporované alternativy:
- OpenAI GPT (GPT-3.5, GPT-4)
- Anthropic Claude
- Google PaLM
- Hugging Face

### Q: Historie se neukazuje?
**A:** Zkontrolujte:
1. Je vybrán klient?
2. Byla vygenerována nějaká historie pro tohoto klienta?
3. Obnovte stránku

### Q: Můžu použít pro více platforem najednou?
**A:** Momentálně ne, ale můžete:
1. Vygenerovat pro jednu platformu
2. Zkopírovat text
3. Změnit platformu
4. Vygenerovat znovu
5. Upravit podle potřeby

---

## 🎯 Tipy pro nejlepší výsledky

1. **Buďte specifičtí v tématu:**
   ❌ "Nový produkt"
   ✅ "Nová kolekce letních šatů v pastelových barvách, bavlněné, moderní střih"

2. **Použijte správný tón:**
   - LinkedIn → Profesionální
   - Instagram → Přátelský/Hravý
   - Facebook → Neformální

3. **Vyberte klienta pro konzistenci:**
   - AI se učí ze stylu předchozích příspěvků
   - Zachovává brand voice

4. **Upravujte výsledky:**
   - AI je pomocník, ne náhrada
   - Vždy zkontrolujte a upravte podle potřeby

5. **Testujte různé varianty:**
   - Klikněte "Vygenerovat znovu" pro jiný text
   - Vyberte nejlepší verzi

---

## 🚀 Další vylepšení (budoucnost)

- [ ] Generování více variant najednou
- [ ] Nahrání obrázku a AI popis
- [ ] Automatické hashtagy
- [ ] Export do Canva/designových nástrojů
- [ ] Plánování příspěvků
- [ ] Multi-platform generování (jeden prompt = texty pro všechny platformy)
- [ ] A/B testing variant

---

## 🎉 Závěr

AI Caption Generator je **plně funkční** a připravený k použití!

**Nyní můžete:**
1. ✅ Generovat profesionální texty pro sociální sítě
2. ✅ Šetřit čas při tvorbě obsahu
3. ✅ Udržovat konzistentní brand voice
4. ✅ Učit AI z historie klienta
5. ✅ Kopírovat a používat okamžitě

**API klíč je nastaven a funkční!** 🎊

---

**Verze:** 3.0.0  
**AI Engine:** Cohere Command  
**Status:** ✅ PRODUCTION READY
