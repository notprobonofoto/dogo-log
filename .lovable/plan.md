
## Plan Zmiany Ikon Jedzenia — FoodTab & CalendarTab

### Analiza Obecnego Stanu
Obecne ikony jedzenia:
- 🟤 (Suche)
- 🟠 (Mokre)
- 🟤🟠 (Mieszane)
- 🦴 (Smaczek)
- ➕ (Inne)

Są używane w:
1. `FoodTab.tsx` — formularz wyboru typu (grid 5 kolumn)
2. `FoodTab.tsx` — lista posiłków z dzisiaj
3. `CalendarTab.tsx` — zdarzenia na wybranym dniu

### Nowe Ikony — Bardziej Oczywiste
Zamiast emoji, użyjmy Lucide icons które będą bardziej profesjonalne i czytelne:
- **Suche** → 🍖 (Apple Food, lub ikon piłki do jedzenia suchego) **Lucide: `Beef`** lub własny emoji `🥙`
- **Mokre** → 🥫 lub `🍲` (miska z jedzeniem) — **Lucide: `Droplets`** + custom emoji
- **Mieszane** → 🥣 (miska z jedzeniem) — **Lucide: `UtensilsCrossed`** 
- **Smaczek** → 🦴 (pozostaw, jest intuicyjne) lub `🍖`
- **Inne** → ➕ (możemy zmienić na `⭐` lub `❓`)

### Propozycja Finalna (jasne i oczywiste)
- **Suche**: `🍖` (mięso/suche jedzenie)
- **Mokre**: `🍲` (miska z zupą/mokre jedzenie)
- **Mieszane**: `🥣` (miska mieszana)
- **Smaczek**: `🦴` (kość — zostaje)
- **Inne**: `⭐` (gwiazdka)

### Opisy (jeśli się zmieszczą)
W formularzu (grid 5 kolumn) jest mało miejsca, ale można dodać labels poniżej każdej kolumny bardzo małą czcionką (text-xs).

W liście posiłków oraz kalendarzu opisy są zbędne — ikona wystarczy.

### Implementacja
1. **FoodTab.tsx**:
   - Zmień `MEAL_TYPES` array — updatej ikony na nowe emoji
   - Dodaj opcjonalnie małe labels poniżej ikon w formularzu (jeśli layout pozwoli)
   - Zaktualizuj fallback icon w `getMealIcon`

2. **CalendarTab.tsx**:
   - Zmień `MEAL_ICONS` object — updatej ikony na nowe
   - Pozostaw istniejące logiki wyświetlania

### Lokalny Fallback
- Jeśli któraś ikona nie wyświetli się poprawnie, fallback `🍽️` (talerz)

### Wizualna Spójność
- Ikony emoji są już w style aplikacji
- Nie dodajemy Lucide icons — używamy tylko emoji (które już są dostępne)
- Wszystkie ikony jedzenia pozostają emoji w jednym stylu

### Testy
- Sprawdzić aby ikony wyświetliały się poprawnie na mobilnym ekranie
- Upewnić się że grid 5 kolumn wciąż wygląda dobrze z nowymi ikonami
- Sprawdzić czy opisy (jeśli dodane) się nie przewijają na małym ekranie

