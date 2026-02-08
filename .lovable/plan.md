
## Plan: Zmiana nazwy pliku logo na unikalną

### Problem
Plik `src/assets/logo.png` jest prawdopodobnie cachowany przez przeglądarkę lub Vite. Mimo że plik został podmieniony, stara wersja jest nadal wyświetlana.

### Rozwiązanie
Zmienić nazwę pliku logo na nową, unikalną nazwę (np. `dogolog-logo.png`), aby wymusić załadowanie świeżej wersji obrazka.

### Kroki implementacji

1. **Skopiować nowe logo pod nową nazwą**
   - Plik: `user-uploads://DodoLog.png` → `src/assets/dogolog-logo.png`

2. **Zaktualizować importy we wszystkich plikach**
   
   **Onboarding.tsx** (linia 4):
   ```typescript
   // Zmienić z:
   import logo from "@/assets/logo.png";
   // Na:
   import logo from "@/assets/dogolog-logo.png";
   ```

   **Install.tsx** (linia 3):
   ```typescript
   // Zmienić z:
   import logo from "@/assets/logo.png";
   // Na:
   import logo from "@/assets/dogolog-logo.png";
   ```

   **NewHomeTab.tsx** (linia 3):
   ```typescript
   // Zmienić z:
   import logo from "@/assets/logo.png";
   // Na:
   import logo from "@/assets/dogolog-logo.png";
   ```

3. **Opcjonalnie: Usunąć stary plik `logo.png`** (po weryfikacji)

### Pliki do edycji
- `src/assets/dogolog-logo.png` (nowy plik - kopia logo użytkownika)
- `src/components/Onboarding.tsx`
- `src/pages/Install.tsx`
- `src/components/tabs/NewHomeTab.tsx`

### Efekt
Nowa nazwa pliku wymusi przeładowanie obrazka przez przeglądarkę i system buildowania, co zagwarantuje wyświetlenie prawidłowego logo.
