# �� Nevymyslíš CRM - Kompletní implementace

## ✅ CO JE HOTOVO

### 🎨 Design
- ✅ Nevymyslíš brand barvy aplikovány (pastelová fialová #C8B6FF a oranžová #FFD6BA)
- ✅ Gradient navbar s vlnovým efektem
- ✅ Moderní UI s Poppins fontem
- ✅ Responzivní design pro mobil i desktop

### 💾 Databáze
Rozšířeno o nové tabulky:
- ✅ **pipeline** - leady a potenciální klienti s fázemi prodeje
- ✅ **task_types** - 8 typů aktivit (schůzka, natáčení, grafika, web, reklamy, content, konzultace, fotografie)
- ✅ **recurring_tasks** - pravidelné úkoly (denně, týdně, měsíčně)
- ✅ **users** - rozšířeno o position, avatar_url, is_active
- ✅ **tasks** - rozšířeno o task_type_id, start_time, end_time, is_recurring

### 🔧 Backend API
- ✅ `/api/pipeline` - CRUD pro leady + konverze na klienta
- ✅ `/api/task-types` - získání typů úkolů
- ✅ Role middleware pro ověření oprávnění
- ✅ Rozšířená registrace s pozicí a rolí

### 🖥️ Frontend
#### Nové stránky:
- ✅ **Pipeline** - Kanban board pro správu leadů
- ✅ **Kalendář** - vizuální zobrazení úkolů podle termínů
- ✅ **Admin Panel** - správa uživatelů a přehled týmu (pouze pro manažery)

#### Funkce:
- ✅ Role-based access control (manager vs. employee)
- ✅ Faktury a Admin viditelné pouze pro manažery
- ✅ Konverze leadu na klienta jedním kliknutím
- ✅ Barevné odlišení typů úkolů v kalendáři
- ✅ Přehled výkonu zaměstnanců pro manažery

## 🚀 JAK SPUSTIT

### 1. Reinicializace databáze (DŮLEŽITÉ!)
```bash
cd backend
npm run init-db
```

Toto vytvoří:
- 3 demo uživatele (všichni heslo: admin123):
  - admin@nevymyslis.cz (manažer)
  - lucie@nevymyslis.cz (manažer)
  - roman@nevymyslis.cz (manažer)
- 8 typů úkolů s ikonami a barvami
- 3 demo klienty

### 2. Spusťte backend
```bash
cd backend
npm start
```
Backend běží na http://localhost:5001

### 3. Spusťte frontend (nový terminál)
```bash
cd frontend
npm run dev
```
Frontend běží na http://localhost:5173

### 4. Přihlášení
```
Email: admin@nevymyslis.cz
Heslo: admin123
```

## 📊 ROLE SYSTÉM

### Manager (admin, lucie, roman)
Má přístup k:
- ✅ Dashboard
- ✅ Pipeline
- ✅ Klienti
- ✅ Úkoly
- ✅ Kalendář
- ✅ **Faktury** (pouze manager)
- ✅ **Admin Panel** (pouze manager)

### Employee (běžný pracovník)
Má přístup k:
- ✅ Dashboard
- ✅ Pipeline
- ✅ Klienti
- ✅ Úkoly (vidí pouze své)
- ✅ Kalendář
- ❌ Faktury (skryto)
- ❌ Admin Panel (skryto)

## 🎯 NOVÉ FUNKCE

### Pipeline
- Kanban board se 7 fázemi (Lead → Kvalifikovaný → Schůzka → Nabídka → Vyjednávání → Získáno/Ztraceno)
- Drag & drop mezi fázemi
- Hodnota obchodu a pravděpodobnost úspěchu
- Konverze na klienta jedním kliknutím
- Přiřazení uživateli
- Zdroj leadu a další akce

### Kalendář
- Měsíční zobrazení
- Barevné odlišení typů úkolů
- Zvýraznění dnešního dne
- Legenda s typy aktivit
- Počet úkolů na den

### Admin Panel
- Vytváření nových uživatelů (pouze manažeři)
- Přehled všech zaměstnanců
- Statistiky úkolů pro každého
- Progress bar dokončených úkolů
- Role a pozice zaměstnanců

## 🎨 TYPY ÚKOLŮ

| Typ | Ikona | Barva |
|-----|-------|-------|
| Obchodní schůzka | 🤝 | Fialová |
| Natáčení | 🎥 | Oranžová |
| Tvorba grafiky | 🎨 | Růžová |
| Tvorba webu | 💻 | Tyrkysová |
| Správa reklam | 📊 | Žlutá |
| Vydávání contentu | 📱 | Zelená |
| Konzultace | 💬 | Světle zelená |
| Fotografie | 📸 | Lososová |

## 🔄 CO ZBÝVÁ (VOLITELNÉ)

Pokud budete chtít v budoucnu:
- [ ] Pravidelné úkoly - UI pro vytváření recurring tasks
- [ ] Export faktur do PDF
- [ ] Email notifikace
- [ ] Dashboard grafy (Chart.js)
- [ ] Integrace s Google Calendar
- [ ] Nahrávání souborů/dokumentů

## 📝 TESTOVÁNÍ

1. **Přihlaste se jako manager** (admin@nevymyslis.cz)
2. **Vytvořte nového zaměstnance** v Admin panelu
3. **Přidejte lead** v Pipeline
4. **Konvertujte lead** na klienta
5. **Vytvořte úkol** s různými typy
6. **Zkontrolujte kalendář** - úkoly by měly být viditelné
7. **Odhlaste se a přihlaste jako employee** - měly by chybět Faktury a Admin

## �� HOTOVO!

Váš CRM systém je plně funkční s:
- ✅ Nevymyslíš designem
- ✅ Pipeline pro leady
- ✅ Kalendářem
- ✅ Admin panelem
- ✅ Role-based přístupem
- ✅ 8 typy aktivit

**Enjoy! 🚀**
