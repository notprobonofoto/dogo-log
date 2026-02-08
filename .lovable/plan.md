

## Plan aktualizacji DogoLog - UI/UX i Web Push

### 1. GÓRNY PASEK - Usunięcie Logo

**Obecny stan:**
- Logo w centrum
- Powiadomienia + Ustawienia po lewej  
- Hamburger po prawej

**Zmiany:**
- Usunięcie logo z TopBar
- Układ: `[Powiadomienia] [Ustawienia] ........... [Hamburger]`
- Większa przestrzeń, czystszy wygląd mobilny

**Plik:** `src/components/TopBar.tsx`

---

### 2. MENU HAMBURGER - Wyraźne Tło

**Obecny stan:**
- Menu wysuwa się z prawej strony
- Tło: `bg-card` z overlay `bg-black/50`
- Krzyżyk (X) już istnieje

**Zmiany:**
- Wzmocnienie tła menu: `bg-card` → pełne, nieprzezroczyste
- Lepsza separacja wizualna elementów menu
- Krzyżyk pozostaje bez zmian

**Plik:** `src/components/HamburgerMenu.tsx`

---

### 3. PRZYCISKI WYBORU PSA - Dynamiczna Szerokość

**Problem:**
- Przyciski mają stałą szerokość (`grid-cols-2`)
- Długie imiona mogą być ucięte
- Zdjęcia mogą wychodzić poza przycisk

**Rozwiązanie:**

```text
Logika:
┌─────────────────────────────────────────┐
│ Czy wszystkie imiona < 8 znaków?        │
│ I liczba psów <= 4?                     │
├───────────────────┬─────────────────────┤
│ TAK → 2 kolumny   │ NIE → 1 kolumna     │
└───────────────────┴─────────────────────┘
```

- **Dynamiczny układ**: 2 kolumny dla krótkich imion, 1 kolumna dla długich
- **Zdjęcie psa**: `flex-shrink-0` + stały rozmiar, bez zniekształceń
- **Imię**: `truncate` usunięty, pełna widoczność

**Pliki:**
- `src/components/tabs/NewWalksTab.tsx`
- `src/components/tabs/NewFoodTab.tsx`  
- `src/components/tabs/NewHealthTab.tsx`

---

### 4. IKONY - Jeden Spójny Styl (Lucide)

**Obecny stan (mieszane):**
- Emoji: 💧, 💩, 🍖, 🍲, 🦴
- Lucide: `Droplet`, `Circle`, `Stethoscope`

**Zmiany - wszystko Lucide:**

| Kategoria | Ikona obecna | Ikona nowa (Lucide) |
|-----------|--------------|---------------------|
| Siku | 💧 / Droplet | `Droplet` |
| Kupa | 💩 / Circle | `Circle` (filled) |
| Suche | 🥣 emoji | `UtensilsCrossed` |
| Mokre | 🥫 emoji | `Soup` lub `Utensils` |
| Mieszane | 🍽️ emoji | `UtensilsCrossed` + wariant |
| Smaczek | 🦴 emoji | `Bone` |
| Inne | 🍖 emoji | `MoreHorizontal` |
| Weterynarz | ✅ `Stethoscope` | ✅ bez zmian |
| Szczepienie | ✅ `Syringe` | ✅ bez zmian |
| Groomer | ✅ `Scissors` | ✅ bez zmian |
| Waga | ✅ `Scale` | ✅ bez zmian |
| Cieczka | ✅ `Flower2` | ✅ bez zmian |

**Stany:**
- Aktywna: ikona z kolorem akcentu + obrys
- Nieaktywna: ikona neutralna bez wypełnienia

**Pliki:**
- `src/components/tabs/NewWalksTab.tsx`
- `src/components/tabs/NewFoodTab.tsx`

---

### 5. WEB PUSH NOTIFICATIONS - Pełna Implementacja

#### 5.1 Migracja Bazy Danych

Rozszerzenie tabeli `push_subscriptions`:

```sql
ALTER TABLE push_subscriptions 
ADD COLUMN device_id TEXT,
ADD COLUMN enabled BOOLEAN DEFAULT true,
ADD COLUMN last_seen_at TIMESTAMPTZ;

-- Dodanie indeksu dla household_code (przez profile)
CREATE INDEX idx_push_profile_enabled ON push_subscriptions(profile_id, enabled);
```

#### 5.2 VAPID Keys - Sekrety

Wymagane sekrety w Supabase:

| Nazwa | Lokalizacja | Opis |
|-------|-------------|------|
| `VAPID_PUBLIC_KEY` | Frontend (env) | Klucz publiczny do subskrypcji |
| `VAPID_PRIVATE_KEY` | Backend ONLY | Klucz prywatny do wysyłania |
| `VAPID_SUBJECT` | Backend | mailto: lub URL |

**KRYTYCZNE:** `VAPID_PRIVATE_KEY` NIGDY nie trafia do frontendu!

#### 5.3 Service Worker (Root)

**Plik:** `public/service-worker.js`

```javascript
// Obsługa push event
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200], // Wzorzec wibracji
    tag: data.tag || 'notification',
    data: { url: data.url || '/' }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Obsługa kliknięcia w powiadomienie
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
```

#### 5.4 Hook do Push Notifications

**Nowy plik:** `src/hooks/usePushNotifications.ts`

Funkcjonalność:
- `registerPush()` - rejestracja SW + subskrypcja
- `unsubscribePush()` - wyłączenie dla tego urządzenia
- `status` - "enabled" | "disabled" | "denied" | "unsupported"
- `deviceId` - UUID urządzenia (localStorage)

#### 5.5 Edge Function - Wysyłanie Push

**Plik:** `supabase/functions/send-push-notification/index.ts`

Aktualizacja:
- Import `web-push` (npm)
- Użycie `VAPID_PRIVATE_KEY` z sekretów
- Obsługa błędów 410/404 → usunięcie subskrypcji
- Payload zgodny z wymaganiami

#### 5.6 UI w Ustawieniach

**Plik:** `src/components/SettingsPanel.tsx`

Dodanie sekcji:
- Status push: "Włączone" / "Wyłączone" / "Zablokowane"
- Przycisk: "Włącz powiadomienia"
- Przycisk: "Wyłącz powiadomienia"
- Przycisk debug: "Test push" (wysyła do siebie)
- Instrukcja dla "denied" → jak odblokować w przeglądarce

---

### 6. Integracja Push z Powiadomieniami

**Plik:** `src/components/NotificationPanel.tsx`

Zmiana w `sendNotification()`:
1. Zapis do tabeli `notifications`
2. Wywołanie Edge Function `send-push-notification`
3. Wysłanie do wszystkich członków gospodarstwa (oprócz nadawcy)

---

### Sekcja Techniczna

#### Struktura VAPID Keys

Generowanie kluczy (jednorazowo):
```bash
npx web-push generate-vapid-keys
```

Wynik:
```
Public Key: BN...
Private Key: xxx...
```

#### Service Worker a Vite PWA

Obecnie aplikacja używa `vite-plugin-pwa` z `workbox`. Service Worker dla push musi być ODDZIELNY od workbox, bo:
- Workbox generuje SW do cache'owania
- Push SW musi nasłuchiwać na `push` i `notificationclick`

Rozwiązanie: Dodanie osobnego `public/service-worker.js` i rejestracja go ręcznie.

#### Bezpieczeństwo

```text
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (PUBLICZNY)                      │
│  • VAPID_PUBLIC_KEY ✓                                        │
│  • endpoint, p256dh, auth (z PushSubscription) ✓            │
│  • NIE: VAPID_PRIVATE_KEY ✗                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND / EDGE FUNCTION                       │
│  • VAPID_PRIVATE_KEY ✓ (z Deno.env)                         │
│  • VAPID_PUBLIC_KEY ✓                                        │
│  • VAPID_SUBJECT ✓                                           │
│  • Wysyłanie Web Push z biblioteką web-push                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Kolejność Implementacji

1. **Migracja bazy** - rozszerzenie `push_subscriptions`
2. **Sekrety** - dodanie `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
3. **Service Worker** - `public/service-worker.js`
4. **Hook** - `src/hooks/usePushNotifications.ts`
5. **Edge Function** - aktualizacja z web-push
6. **SettingsPanel** - UI do zarządzania push
7. **NotificationPanel** - integracja z Edge Function
8. **TopBar** - usunięcie logo
9. **HamburgerMenu** - wzmocnienie tła
10. **Przyciski psów** - dynamiczna szerokość
11. **Ikony** - zamiana emoji na Lucide

---

### Pliki do Utworzenia/Modyfikacji

| Plik | Akcja |
|------|-------|
| `supabase/migrations/...` | Rozszerzenie push_subscriptions |
| `public/service-worker.js` | NOWY - obsługa push |
| `src/hooks/usePushNotifications.ts` | NOWY - hook |
| `supabase/functions/send-push-notification/index.ts` | Aktualizacja |
| `src/components/TopBar.tsx` | Usunięcie logo |
| `src/components/HamburgerMenu.tsx` | Wzmocnienie tła |
| `src/components/SettingsPanel.tsx` | Sekcja push |
| `src/components/NotificationPanel.tsx` | Integracja push |
| `src/components/tabs/NewWalksTab.tsx` | Ikony + przyciski psów |
| `src/components/tabs/NewFoodTab.tsx` | Ikony + przyciski psów |
| `src/components/tabs/NewHealthTab.tsx` | Przyciski psów |
| `src/contexts/LanguageContext.tsx` | Nowe tłumaczenia push |
| `vite.config.ts` | Rejestracja SW dla push |

---

### Pytanie przed implementacją

**Domyślny URL po kliknięciu w powiadomienie:**
- Powiadomienia typu "walk" → `/` (ekran główny)
- Powiadomienia typu "feed" → `/` (ekran główny)
- Wszystkie → `/notifications` ?

Zakładam: powiadomienie otwiera aplikację na ekranie głównym (`/`). Czy to poprawne?

