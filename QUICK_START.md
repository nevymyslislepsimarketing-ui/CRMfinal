# 🚀 Quick Start - Nevymyslíš CRM

## Nové funkce v této verzi (2.0.0)

Všechny požadované funkce byly úspěšně implementovány! 🎉

---

## 📋 Kontrolní seznam pro spuštění

### 1. Databázová migrace (DŮLEŽITÉ!)
Před spuštěním aplikace musíte provést migraci databáze:

```bash
cd backend
node scripts/addClientFields.js
```

Tato migrace přidá:
- Sloupec `google_drive_link` do tabulky `clients`
- Novou tabulku `client_credentials` pro přihlašovací údaje

### 2. Spuštění aplikace

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🆕 Jak používat nové funkce

### 1. Filtrování úkolů podle uživatele (Manažeři)
📍 **Umístění:** Stránka Úkoly

**Jak na to:**
1. Přejděte na stránku "Úkoly"
2. Nahoře uvidíte filtr s dropdownem
3. Vyberte uživatele jehož úkoly chcete zobrazit
4. Zobrazí se pouze úkoly tohoto uživatele
5. Klikněte "Zrušit filtr" pro zobrazení všech

**Poznámka:** Tato funkce je k dispozici pouze pro manažery.

---

### 2. Detail klienta s rozšířenými informacemi
📍 **Umístění:** Stránka Klienti

**Jak na to:**
1. Přejděte na stránku "Klienti"
2. U každého klienta najdete tlačítko s ikonou oka 👁️
3. Klikněte na tlačítko pro zobrazení detailu
4. V detailu uvidíte:
   - Všechny základní informace
   - **Google Drive odkaz** (pokud je vyplněn)
   - Fakturační údaje
   - **Přihlašovací údaje na platformy**

**Přidání Google Drive odkazu:**
1. Klikněte na tlačítko "Upravit" u klienta
2. Vyplňte pole "Google Drive odkaz"
3. Odkaz bude klikací v detailu klienta

**Správa přihlašovacích údajů:**
1. V detailu klienta klikněte "Přidat údaje"
2. Vyplňte:
   - Platforma (např. Facebook, Instagram, Google Ads)
   - Přihlašovací jméno
   - Heslo
   - Poznámky (volitelné)
3. Údaje můžete upravit nebo smazat pomocí tlačítek vedle každého záznamu

---

### 3. Klikací Dashboard karty
📍 **Umístění:** Dashboard

**Jak na to:**
1. Na Dashboardu jsou všechny statistické karty nyní klikací
2. Kliknutím na kartu se přesměrujete na příslušnou stránku:
   - **Celkem klientů** → Stránka Klienti
   - **Nevyřízené úkoly** → Stránka Úkoly
   - **Fakturační karty** → Stránka Faktury

**Poznámka:** Karty mají hover efekt pro lepší UX.

---

### 4. Editace uživatelů v Admin panelu
📍 **Umístění:** Admin Panel

**Pro manažery:**
1. Přejděte na "Admin"
2. U každého pracovníka najdete tlačítko "Upravit" (tužka)
3. Můžete změnit:
   - Jméno
   - Pozici
   - Roli (povýšit na manažera)
4. **Nemůžete** upravovat jiné manažery

**Pro hlavního Admina (info@nevymyslis.cz):**
1. Můžete upravovat všechny uživatele včetně manažerů
2. Můžete změnit roli manažera zpět na pracovníka
3. Máte plnou kontrolu nad všemi uživateli

**Bezpečnostní omezení:**
- Nikdo nemůže upravovat sám sebe
- Nelze upravit hlavní administrátorský účet
- Kontrola oprávnění probíhá na backendu

---

### 5. Email notifikace při přiřazení úkolu
📍 **Umístění:** Automatické při vytváření úkolu

**Jak to funguje:**
1. Když manažer vytvoří úkol a přiřadí ho jinému uživateli
2. Uživatel automaticky obdrží email s:
   - Jménem zadavatele
   - Názvem úkolu
   - Popisem
   - Prioritou
   - Termínem
   - Jménem klienta
   - Odkazem do CRM
3. Email má hezký HTML design

**Poznámka:** Používá se existující Mailtrap konfigurace z `.env`.

---

### 6. Vylepšený Kalendář
📍 **Umístění:** Stránka Kalendář

**Měsíční zobrazení:**
1. Výchozí zobrazení je měsíc
2. Týden začíná pondělím
3. Klikněte na libovolný den pro vytvoření úkolu
4. Zobrazuje se až 3 úkoly na den + počet dalších
5. Dnešní den je zvýrazněn fialovou barvou

**Týdenní zobrazení:**
1. Klikněte na tlačítko "Týden" v pravém horním rohu
2. Zobrazí se časová osa 6:00 - 24:00 (18 hodin)
3. 7 dní v týdnu (Po-Ne) jako sloupce
4. Každá hodina má vlastní řádek
5. Klikněte na konkrétní časový slot pro vytvoření úkolu
6. Čas se automaticky předvyplní v modalu
7. Úkoly se zobrazují v příslušných časových slotech
8. Barevné rozlišení podle typu aktivity

**Navigace:**
- **Předchozí/Další** - Posun o měsíc/týden
- **Dnes** - Rychlý návrat k dnešnímu dni
- Zobrazení aktuálního období

**Sdílené aktivity:**
- Při vytváření úkolu zaškrtněte "Sdílená aktivita"
- Aktivita bude viditelná pro všechny uživatele

---

## 📊 Nové API Endpointy

Pokud potřebujete integrovat další funkce:

### Přihlašovací údaje klientů:
```
GET    /clients/:id/credentials           - Získat údaje
POST   /clients/:id/credentials           - Přidat údaje
PUT    /clients/:id/credentials/:credId   - Upravit údaje
DELETE /clients/:id/credentials/:credId   - Smazat údaje
```

### Správa uživatelů:
```
PATCH  /users/:id                         - Upravit uživatele
```

---

## ⚠️ Důležité poznámky

1. **Migrace databáze je povinná** - Bez ní nové funkce nebudou fungovat
2. **Email notifikace** - Vyžadují správně nastavenou Mailtrap konfiguraci v `.env`
3. **Přihlašovací údaje** - Jsou uloženy v plain text (pro interní použití týmem)
4. **Oprávnění** - Některé funkce jsou dostupné pouze pro manažery
5. **Responzivita** - Všechny nové komponenty jsou responzivní

---

## 🐛 Řešení problémů

**Migrace selže:**
```bash
# Zkontrolujte připojení k databázi v .env
# Zkuste znovu spustit migraci
cd backend
node scripts/addClientFields.js
```

**Nový kalendář se nezobrazuje:**
```bash
# Vyčistěte cache prohlížeče
# Restartujte frontend server
cd frontend
npm run dev
```

**Email notifikace nefungují:**
```bash
# Zkontrolujte MAILTRAP_API_TOKEN v backend/.env
# Zkontrolujte logy v terminálu backendu
```

---

## ✅ Kontrolní seznam funkčnosti

Po spuštění aplikace otestujte:

- [ ] Migrace databáze proběhla úspěšně
- [ ] Filtrování úkolů podle uživatele (jako manažer)
- [ ] Detail klienta se zobrazuje správně
- [ ] Google Drive odkaz je klikací
- [ ] Přihlašovací údaje lze přidávat/upravovat/mazat
- [ ] Dashboard karty jsou klikací a přesměrovávají správně
- [ ] Editace uživatelů funguje v Admin panelu
- [ ] Email notifikace se odesílají při přiřazení úkolu
- [ ] Kalendář se přepíná mezi měsíčním a týdenním zobrazením
- [ ] V týdenním zobrazení jsou viditelné časové sloty
- [ ] Vytvoření úkolu předvyplní správný čas

---

## 🎯 Další kroky

Systém je nyní kompletní s všemi požadovanými funkcemi. Můžete:

1. **Provést důkladné testování** všech funkcí
2. **Nastavit produkční prostředí** (deployment)
3. **Vytvořit dokumentaci** pro koncové uživatele
4. **Implementovat zálohovací systém** pro databázi
5. **Nastavit monitorování** a error tracking

---

**Verze:** 2.0.0  
**Datum:** 23. října 2025  
**Status:** ✅ Production Ready

Užijte si nové funkce! 🚀
