

# DogoLog - Login Without Email (Household Code Model)

## Current State Analysis

The application currently has **two parallel authentication systems**:

1. **Old localStorage-based system** (`AppContext.tsx`, `Onboarding.tsx`) - simple code-based access
2. **New Supabase Auth system** (`AuthContext.tsx`, `Auth.tsx`) - requires email/password + household code

The new Supabase system uses email authentication with RLS policies tied to `auth.uid()`. This is fundamentally incompatible with the requested "code-only" model.

## The Challenge

Supabase RLS policies require authentication to work. The current policies use `get_user_household_id()` which relies on `auth.uid()`. Without email authentication, RLS cannot identify users.

## Solution: Anonymous Authentication + Household Code

We will use **Supabase Anonymous Sign-In** combined with household codes. This approach:
- Keeps the cloud database benefits (sync across devices)
- Removes email/password requirements
- Uses household code as the data access key
- Stores user name locally on each device

### How It Works

```text
+-------------------+     +------------------+     +------------------+
|   First Launch    | --> | Anonymous SignIn | --> | Create/Join      |
|                   |     | (automatic)      |     | Household        |
+-------------------+     +------------------+     +------------------+
                                 |                        |
                                 v                        v
                         +------------------+     +------------------+
                         | User enters name |     | Validate code    |
                         | (stored locally) |     | (cloud check)    |
                         +------------------+     +------------------+
```

## Implementation Plan

### Phase 1: Database Changes

1. **Update `profiles` table** - Make `user_id` optional (nullable) to support name-only profiles
2. **Add RLS function** to get household ID by anonymous user session
3. **Keep existing RLS policies** - They will work with anonymous auth

### Phase 2: New AppContext (Code-Based Auth)

Replace the current dual-system with a unified approach:

**New `AppContext.tsx`**:
- On app start: Auto sign-in anonymously to Supabase
- Store `userName` and `householdCode` in localStorage
- Use cloud database for all data (dogs, walks, meals, health, etc.)
- Validate household codes against cloud database
- No email, no password, no accounts

**State Management**:
```text
localStorage:
  - userName: "Anna"
  - householdCode: "483921"

Supabase (cloud):
  - households (with codes)
  - profiles (linked to household, with names)
  - dogs, walks, meals, health_events, etc.
```

### Phase 3: New Onboarding Flow

**Step 1 - Name Input**:
- User enters their name (stored locally)
- Friendly placeholder: "Imie wlasciciela psa"

**Step 2 - Household Choice**:
- "Create new household" -> Generate unique 6-digit code in cloud
- "Join household" -> Validate code exists, then join
- "Log back in" -> Validate saved code, restore access

**Code Validation Logic**:
```text
User enters code "483921"
    |
    v
Call supabase.rpc("household_code_exists", { code: "483921" })
    |
    +-- TRUE  --> Join household, load all data
    |
    +-- FALSE --> Show "Invalid household code" error
                  DO NOT create new household
                  DO NOT save any data
```

### Phase 4: Update Data Operations

**Remove AuthContext dependencies**:
- Data operations will use `householdId` from localStorage/state
- Anonymous Supabase session handles RLS authentication

**Keep DataContext pattern** but modify to work with code-based auth:
- Fetch data by household_id
- Save data with household_id
- Profile names stored with each action for attribution

### Phase 5: Update UI Components

**Files to modify**:
- `src/App.tsx` - Use new unified AppContext
- `src/contexts/AppContext.tsx` - Complete rewrite for code-based cloud auth
- `src/components/Onboarding.tsx` - Update for new flow
- `src/pages/Dashboard.tsx` - Use new context
- All tab components - Use new data context

**Remove**:
- `src/contexts/AuthContext.tsx` - No longer needed
- `src/pages/Auth.tsx` - No longer needed (replaced by Onboarding)

## Data Flow Diagram

```text
+------------------+
|   User Device    |
+------------------+
| localStorage:    |
| - userName       |
| - householdCode  |
+------------------+
        |
        | Anonymous Auth Session
        v
+------------------+
|  Supabase Cloud  |
+------------------+
| households       |  <-- Validated by code
| profiles         |  <-- Name stored here too for sharing
| dogs             |
| walks            |
| meals            |
| health_events    |
| home_accidents   |
| notifications    |
+------------------+
```

## Security Considerations

1. **Household codes** are the only access control - anyone with the code can access the household data
2. **Anonymous sessions** are device-specific - changing devices requires re-entering the code
3. **RLS policies** still protect data - users can only access their household's data
4. **No sensitive data** (emails, passwords) is stored or required

## Translation Updates

Add/update translations for:
- "Invalid household code" error message
- Updated onboarding flow texts
- Simplified login terminology

---

## Technical Details

### Database Migration Required

```sql
-- Enable anonymous sign-ins (requires Supabase auth config)
-- Update profiles table to allow user_id = NULL for local-only users
ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add policy for profiles with null user_id (local users in same household)
```

### Key Functions

1. **`createHousehold(name)`**: 
   - Generate unique code via `supabase.rpc("generate_unique_household_code")`
   - Create household record
   - Create profile with name
   - Save code to localStorage

2. **`joinHousehold(code, name)`**:
   - Validate code via `supabase.rpc("household_code_exists", { code })`
   - If invalid: show error, return
   - If valid: get household_id, create profile, save code

3. **`loginWithCode(code, name)`**:
   - Same as join but for returning users
   - Validates code exists before granting access

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/AppContext.tsx` | Rewrite | Unified code-based auth + cloud data |
| `src/components/Onboarding.tsx` | Update | New onboarding flow |
| `src/App.tsx` | Simplify | Remove AuthContext, use AppContext |
| `src/pages/Dashboard.tsx` | Update | Use new context |
| `src/contexts/AuthContext.tsx` | Delete | No longer needed |
| `src/pages/Auth.tsx` | Delete | Replaced by Onboarding |
| `src/contexts/LanguageContext.tsx` | Update | Add error translations |

