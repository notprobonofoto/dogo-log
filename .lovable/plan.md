
## Plan aktualizacji DogoLog

### 1. WIELE PSÓW W POSIŁKACH

#### Zmiany w bazie danych
Utworzę nową tabelę `meal_dogs` (analogicznie do `walk_dogs`):

```sql
CREATE TABLE meal_dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE
);

-- RLS policies analogiczne do walk_dogs
```

Zmienię kolumnę `dog_id` w tabeli `meals` na nullable (dla kompatybilności wstecznej).

#### Zmiany w kodzie
- **AppContext.tsx**: Zmienię `addMeal` aby przyjmować `dogIds: string[]` zamiast `dog_id`
- **NewFoodTab.tsx**: Zmienię UI z radio buttons na checkboxy (identycznie jak w NewWalksTab)
- **NewCalendarTab.tsx**: Zaktualizuję wyświetlanie posiłków z wieloma psami

---

### 2. KALENDARZ = CENTRALNA PRAWDA

Kalendarz już wyświetla spacery, posiłki i zdrowie. Dodam:

- **Powiadomienia** w widoku dnia
- **Format czasu Europe/Warsaw** z polską lokalizacją
- Upewnię się że wszystkie dane są widoczne

---

### 3. RESPONSYWNOŚĆ MOBILE FIRST

Przejrzę wszystkie formularze i poprawię:
- Inputy date/time na pełną szerokość
- Przyciski zawsze widoczne bez scrollowania
- Użyję bottom sheets gdzie potrzeba

---

### 4. IKONA APLIKACJI PWA

Zaktualizuję:
- `public/icon-192.png` i `public/icon-512.png` na podstawie `dogolog-logo.png`
- `index.html` - apple-touch-icon
- `vite.config.ts` - manifest PWA

---

### 5. POWIADOMIENIA PUSH (Web Push API)

#### Nowe komponenty
- **PushNotificationManager.tsx** - komponent do żądania uprawnień i rejestracji subskrypcji
- **sw-push.js** - Service Worker do obsługi push notifications

#### Edge Function
- **send-push-notification** - funkcja do wysyłania powiadomień przez Web Push API

#### Schemat bazy danych
Nowa tabela `push_subscriptions`:
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Przepływ
1. Użytkownik włącza powiadomienia → przeglądarka pyta o zgodę
2. Subskrypcja zapisywana w bazie
3. Przy wysyłaniu prośby (spacer/karmienie) → Edge Function wysyła push do innych członków gospodarstwa
4. Dźwięk powiadomienia ustawiony na niestandardowy (jak SMS)

---

### 6. IKONY - JEDEN STYL (Lucide React)

Upewnię się że wszystkie zakładki używają ikon Lucide:
- Spacery: `PawPrint`
- Posiłki: `Utensils` 
- Zdrowie: `Heart`
- Powiadomienia: `Bell`
- Podróże: `Plane`

---

### 7. NOWA ZAKŁADKA: PODRÓŻE

#### Nowy komponent
**NewTravelTab.tsx**:
- Lista krajów (dropdown lub wyszukiwarka)
- Po wyborze kraju → wywołanie AI (Gemini)
- AI generuje informacje o:
  - Wymaganych dokumentach
  - Szczepieniach
  - Paszporcie/chipie
  - Kwarantannie
  - Zakazach/nakazach
  - Zaleceniach praktycznych

#### Edge Function
**travel-info** - funkcja wywołująca Lovable AI (Gemini) z promptem:

```
"Podaj aktualne wymagania dotyczące podróży z psem do kraju: {country}.
Uwzględnij: dokumenty, szczepienia, paszport/chip, kwarantanna, zakazy, zalecenia.
Odpowiedz po polsku, zwięźle i praktycznie."
```

#### Ważne ostrzeżenie
Dane generowane przez AI mogą być **nieaktualne**. Dodam disclaimer:

```
⚠️ Informacje są generowane przez AI i mogą być nieaktualne.
Zawsze sprawdź oficjalne źródła przed podróżą.
```

---

### 8. NAWIGACJA - MENU HAMBURGER

Ponieważ dolny pasek ma już 6 zakładek, dodam:
- **Menu hamburger** w prawym górnym rogu (lub w miejsce jednej z obecnych zakładek)
- W menu: Podróże + przyszłe zakładki

Alternatywnie: Zamienię "Kalendarz" na ikonę w górnym pasku (jest mniej używany) i dam miejsce na Podróże.

---

### Pliki do utworzenia/modyfikacji

| Plik | Akcja |
|------|-------|
| `supabase/migrations/...` | Nowe tabele: `meal_dogs`, `push_subscriptions` |
| `supabase/functions/send-push-notification/index.ts` | Edge Function dla push |
| `supabase/functions/travel-info/index.ts` | Edge Function dla AI |
| `src/components/tabs/NewTravelTab.tsx` | Nowa zakładka podróży |
| `src/components/tabs/NewFoodTab.tsx` | Multi-dog selection |
| `src/components/tabs/NewCalendarTab.tsx` | Dodanie powiadomień |
| `src/components/PushNotificationManager.tsx` | Zarządzanie push |
| `src/components/BottomNav.tsx` | Dodanie menu/podróży |
| `src/contexts/AppContext.tsx` | Obsługa meal_dogs, push |
| `src/contexts/LanguageContext.tsx` | Nowe tłumaczenia |
| `public/icon-192.png`, `public/icon-512.png` | Nowe ikony PWA |
| `vite.config.ts` | Aktualizacja manifestu |
| `public/sw-push.js` | Service Worker |

---

### Sekcja techniczna

#### Web Push API - Wymagania
1. VAPID keys (wygeneruję i zapiszę jako sekrety Supabase)
2. Service Worker do odbierania push
3. Edge Function z biblioteką web-push
4. Subskrypcje przechowywane w bazie

#### Struktura meal_dogs
```sql
CREATE TABLE meal_dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  UNIQUE(meal_id, dog_id)
);

-- RLS
CREATE POLICY "Users can view meal_dogs in their household"
ON meal_dogs FOR SELECT
USING (
  meal_id IN (SELECT id FROM meals WHERE household_id = get_user_household_id())
);

CREATE POLICY "Users can insert meal_dogs in their household"
ON meal_dogs FOR INSERT
WITH CHECK (
  meal_id IN (SELECT id FROM meals WHERE household_id = get_user_household_id())
);

CREATE POLICY "Users can delete meal_dogs in their household"
ON meal_dogs FOR DELETE
USING (
  meal_id IN (SELECT id FROM meals WHERE household_id = get_user_household_id())
);
```

#### Edge Function travel-info
```typescript
// Używa Lovable AI (google/gemini-3-flash-preview)
// Prompt zawiera kraj wybrany przez użytkownika
// Zwraca sformatowane informacje w języku polskim
```

---

### Kolejność implementacji
1. Migracja bazy (meal_dogs, push_subscriptions)
2. Aktualizacja AppContext (obsługa meal_dogs)
3. Aktualizacja NewFoodTab (multi-dog UI)
4. Edge Function travel-info
5. NewTravelTab component
6. Aktualizacja nawigacji (BottomNav/hamburger)
7. Push notifications (Edge Function + Service Worker)
8. Ikony PWA
9. Responsywność i poprawki UI
10. Tłumaczenia
