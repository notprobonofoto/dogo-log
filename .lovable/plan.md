

# Plan: Nowy wygląd boksu "Szczęście psów" - Karty z gradientem brązowym

## Opis rozwiązania

Nowy boks szczęścia psów w stylu "Emoji Mood Cards" bez emotek buźek, z:
- **Gradient brązowy** (od jasnego beżu do ciemnego brązu w zależności od szczęścia)
- **Procent pod paskiem** postępu
- **Rozwijane szczegóły** z 4 mini-paskami (spacery, posiłki, regularność, zdarzenia domowe)
- **Subtelne animacje** przejść

---

## Wizualizacja końcowa

### Stan zamknięty (kompaktowy)
```text
+------------------------------------------+
|            Szczęście psów                |
+------------------------------------------+
|  +---------------+    +---------------+  |
|  |    Burek      |    |     Luna      |  |
|  | ▓▓▓▓▓▓▓▓▓░░░  |    | ▓▓▓▓▓▓░░░░░  |  |
|  |     85%       |    |     65%       |  |
|  +---------------+    +---------------+  |
+------------------------------------------+
```

### Stan rozwinięty (po kliknięciu)
```text
+------------------------------------------+
|  Burek                              85%  |
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  |
+------------------------------------------+
|  🐾 Spacery      ▓▓▓▓▓▓▓▓▓░  +40 pkt    |
|  🍖 Posiłki      ▓▓▓▓▓▓▓▓▓▓  +20 pkt    |
|  ⏰ Regularność  ▓▓▓▓▓▓░░░░  +15 pkt    |
|  🏠 Dom          ▓▓▓▓▓▓▓▓▓▓   +0 pkt    |
+------------------------------------------+
```

---

## Paleta kolorów gradientu

Gradient brązowy od smutnego (jasny) do szczęśliwego (ciemny):
- **0-30%**: Jasny beż `hsl(35, 40%, 85%)` - smutny
- **30-50%**: Piaskowy `hsl(30, 45%, 70%)` - neutralny
- **50-80%**: Karmelowy `hsl(25, 55%, 55%)` - zadowolony
- **80-100%**: Ciemny brąz `hsl(20, 60%, 40%)` - szczęśliwy

---

## Zmiany w plikach

### 1. Nowy hook `useHappinessDetails`

**Plik**: `src/hooks/useHappinessDetails.ts` (nowy)

Rozszerzony hook zwracający szczegółowy breakdown punktów dla każdego psa:

```typescript
interface HappinessDetails {
  dogId: string;
  dogName: string;
  totalScore: number;
  breakdown: {
    walks: { points: number; max: number; count: number };
    meals: { points: number; max: number; count: number };
    regularity: { points: number; max: number };
    accidents: { points: number; min: number; hasPee: boolean; hasPoop: boolean };
  };
  gradientColor: string; // kolor dla gradientu brązowego
}
```

### 2. Aktualizacja `HappinessCard.tsx`

**Plik**: `src/components/HappinessCard.tsx`

Zmiany:
- Usunięcie `DogAvatar` - brak zdjęć psów
- Dodanie `Collapsible` z `@radix-ui/react-collapsible`
- Grid layout dla wielu psów
- Gradient brązowy obliczany dynamicznie
- 4 mini-paski w rozwinięciu z ikonami

### 3. Aktualizacja `index.css`

**Plik**: `src/index.css`

Dodanie zmiennych CSS dla gradientu szczęścia:
```css
--happiness-sad: 35 40% 85%;
--happiness-neutral: 30 45% 70%;
--happiness-happy: 25 55% 55%;
--happiness-ecstatic: 20 60% 40%;
```

---

## Szczegóły techniczne

### Algorytm koloru gradientu

```typescript
const getGradientColor = (score: number): string => {
  if (score >= 80) return "hsl(20, 60%, 40%)";  // ciemny brąz
  if (score >= 50) return "hsl(25, 55%, 55%)";  // karmel
  if (score >= 30) return "hsl(30, 45%, 70%)";  // piaskowy
  return "hsl(35, 40%, 85%)";                    // jasny beż
};
```

### Ikony kategorii

- Spacery: `PawPrint` (lucide-react)
- Posiłki: `Utensils` (lucide-react)
- Regularność: `Clock` (lucide-react)
- Zdarzenia domowe: `Home` (lucide-react)

### Animacje

- Rozwijanie: `animate-accordion-down` (już istnieje)
- Pasek postępu: `transition-all duration-700 ease-out`
- Karty: `animate-fade-in-up`

---

## Kolejność implementacji

1. Utworzyć nowy hook `useHappinessDetails.ts` z rozszerzonym API
2. Dodać zmienne CSS dla gradientu brązowego w `index.css`
3. Przepisać `HappinessCard.tsx`:
   - Nowy layout grid
   - Collapsible dla każdego psa
   - Gradient brązowy
   - Mini-paski w szczegółach
4. Przetestować na różnej liczbie psów (1, 2, 3+)

---

## Responsywność

- **1 pies**: Pełna szerokość karty
- **2 psy**: Grid 2 kolumny
- **3+ psy**: Grid 2 kolumny z wrap, lub przewijanie poziome dla 4+

---

## Tłumaczenia

Potrzebne nowe klucze w `LanguageContext`:
- `walksCategory`: "Spacery"
- `mealsCategory`: "Posiłki"
- `regularityCategory`: "Regularność"
- `accidentsCategory`: "Zdarzenia domowe"
- `points`: "pkt"

