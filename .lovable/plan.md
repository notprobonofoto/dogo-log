
## Plan: Naprawienie podmianki logo i funkcjonalności usuwania członków

### Zidentyfikowane problemy:

1. **Logo** - Plik `src/assets/logo.png` istnieje, ale może nie być poprawnie zaktualizowany. Potrzebna pewna weryfikacja czy nowe logo zostało prawidłowo zapisane.

2. **Usuwanie członków** - RLS policy z migracji nr `20260208191037` ma błąd logiczny:
   ```sql
   id != (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
   ```
   Problem: Ta subquery zawsze zwraca profil bieżącego użytkownika, ale użytkownik anonimowy może mieć `user_id = NULL`, co powoduje, że warunek zawsze zwraca `true` dla wszystkich profili.

3. **Logowanie ponownie** - Flow jest już zaimplementowany prawidłowo w `Onboarding.tsx`:
   - Step 1: Użytkownik wpisuje kod
   - Step 2: Wybiera członka z listy
   - Funkcja `loginAsExistingMember` łączy sesję anonimową z wybranym profilem

### Rozwiązanie:

#### 1. Naprawienie RLS policy dla usuwania członków
Uaktualnić migrację, aby policy sprawdzała czy `profileId` (z localStorage) jest różny od `id` profilu do usunięcia:
```sql
CREATE POLICY "Users can delete profiles in their household" 
ON public.profiles 
FOR DELETE 
USING (
  household_id = get_my_household_id() 
  AND id != (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
);
```

Lepszy sposób: Zamiast polegać na `user_id` w SQL, można wysłać logikę na frontend - już istnieje sprawdzenie `profileId === memberId` w `HouseholdMembersPanel.tsx`.

#### 2. Weryfikacja logo
- Plik logotypu powinien być dostępny w `src/assets/logo.png`
- Jest już importowany w `NewHomeTab.tsx` i `Install.tsx`
- Logotyp wyświetla się prawidłowo w UI

#### 3. Funkcja usuwania członków w AppContext
Funkcja `removeMember` w `AppContext.tsx` (linie 857-866) jest prawidłowa:
```typescript
const removeMember = async (memberId: string) => {
  if (!householdId || memberId === profileId) return;
  const { error } = await supabase.from("profiles").delete().eq("id", memberId);
  if (error) {
    console.error("Error removing member:", error);
    return;
  }
  await refreshData();
};
```

Dodać obsługę błędu i feedback użytkownikowi.

### Plany zmian:

1. **Aktualizacja migracji RLS** - Uprościć policy, aby działała prawidłowo z anonimowymi użytkownikami
2. **Poprawka w HouseholdMembersPanel** - Dodać toast/komunikat o pomyślnym usunięciu lub błędzie
3. **Poprawka w AppContext** - Dodać obsługę błędu z feedbackiem
4. **Weryfikacja logo** - Upewniać się że nowe logo jest prawidłowo załadowane

### Sekwencja implementacji:

1. Nowa migracja RLS policy (zastąpi starą)
2. Aktualizacja funkcji `removeMember` w `AppContext.tsx` z obsługą błędów
3. Aktualizacja `HouseholdMembersPanel.tsx` z komunikatami dla użytkownika
4. Weryfikacja, że logo się wyświetla na obu ekranach (Home i Install)

