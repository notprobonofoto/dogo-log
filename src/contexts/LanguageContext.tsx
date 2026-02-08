import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Language = "pl" | "en";

const translations = {
  pl: {
    // Common
    cancel: "Anuluj",
    save: "Zapisz",
    delete: "Usuń",
    today: "Dziś",
    none: "Brak",
    copy: "Kopiuj",
    send: "Wyślij",
    
    // Auth
    register: "Zarejestruj się",
    password: "Hasło",
    checkEmail: "Sprawdź email",
    verifyEmailMessage: "Wysłaliśmy link weryfikacyjny na Twój adres email. Kliknij go, aby aktywować konto.",
    redirecting: "Przekierowuję",
    
    // Onboarding
    welcomeTitle: "Witaj w DogoLog! 🐾",
    ownerNamePlaceholder: "Imię właściciela psa",
    next: "Dalej →",
    hello: "Cześć",
    whatToDo: "Co chcesz zrobić?",
    createHousehold: "Stwórz nowe gospodarstwo",
    joinHousehold: "Dołącz do czyjegoś gospodarstwa",
    loginAgain: "Zaloguj się ponownie",
    yourHouseholdCode: "Twój kod gospodarstwa",
    shareCode: "Udostępnij go domownikom, żeby mogli dołączyć",
    letsStart: "Zacznijmy! 🐶",
    joinHouseholdTitle: "Dołącz do gospodarstwa",
    enterCode: "Wpisz 6-cyfrowy kod od domownika",
    join: "Dołącz! 🐾",
    back: "Wróć",
    welcomeBack: "Witaj ponownie! 🐶",
    enterSavedCode: "Wpisz swój zapisany kod gospodarstwa",
    login: "Zaloguj się",
    invalidCode: "Błędny kod gospodarstwa",
    selectMember: "Wybierz swój profil",
    selectMemberDesc: "Kto z domowników korzysta z tej aplikacji?",
    continueAs: "Kontynuuj jako",
    noMembersFound: "Brak członków w tym gospodarstwie",
    
    // Home Tab
    greeting: "Cześć",
    walks: "Spacery",
    meals: "Posiłki",
    health: "Zdrowie",
    dogs: "Pieski",
    householdCode: "Kod gospodarstwa",
    householdMembers: "Członkowie gospodarstwa",
    install: "Instaluj",
    logout: "Wyloguj",
    dogHappiness: "Szczęście psów",
    walksCategory: "Spacery",
    mealsCategory: "Posiłki",
    regularityCategory: "Regularność",
    you: "Ty",
    removeMember: "Usuń osobę",
    removeMemberConfirm: "Czy na pewno chcesz usunąć osobę",
    accidentsCategory: "Zdarzenia domowe",
    points: "pkt",
    
    // Walks Tab
    walksTitle: "Spacery",
    newWalk: "Nowy spacer",
    atHome: "W domu",
    homeEvent: "🏠 Zdarzenie w domu",
    addDogFirst: "Najpierw dodaj pieska",
    whoWent: "Kto szedł?",
    whatDidTheyDo: "Co zrobił?",
    duration: "Długość",
    min: "min",
    walkSaved: "Spacer zapisany! 🐾",
    noWalks: "Brak spacerów",
    noWalksToday: "Brak spacerów dzisiaj",
    pee: "Siku",
    poop: "Kupa",
    both: "Oba",
    nothing: "Nic",
    noBusiness: "Nic",
    addWalk: "Dodaj spacer",
    addHomeEvent: "Dodaj zdarzenie",
    poopNotePlaceholder: "np. nieprawidłowa kupa",
    business: "Co zrobił?",
    
    // Food Tab
    foodTitle: "Jedzenie",
    addMeal: "Dodaj posiłek",
    whoEats: "Kto jada?",
    type: "Typ",
    saved: "Zapisano! ❤️",
    noMeals: "Brak posiłków",
    noMealsToday: "Brak posiłków dzisiaj",
    dry: "Suche",
    wet: "Mokre",
    mixed: "Mieszane",
    treat: "Smaczek",
    other: "Inne",
    otherFoodPlaceholder: "Co to było za jedzenie?",
    dryFood: "Suche",
    wetFood: "Mokre",
    mixedFood: "Mieszane",
    mealType: "Rodzaj posiłku",
    
    // User stats
    userStats: "Aktywność domowników",
    thisWeek: "W tym tygodniu",
    
    // Health Tab
    healthTitle: "Zdrowie",
    newEvent: "Nowe zdarzenie",
    dog: "Piesek",
    eventType: "Rodzaj",
    weight: "Waga",
    date: "Data",
    time: "Godzina",
    noteOptional: "Notatka (opcjonalnie)",
    optionalNote: "Notatka (opcjonalnie)",
    note: "Notatka",
    nextVisit: "Następna wizyta",
    healthSaved: "Zapisano! 💚",
    upcoming: "Nadchodzące",
    history: "Historia",
    noEvents: "Brak zdarzeń",
    noHealthEvents: "Brak zdarzeń zdrowotnych",
    vet: "Weterynarz",
    groomer: "Groomer",
    vaccination: "Szczepienie",
    heatStart: "Cieczka ▶",
    heatEnd: "Cieczka ■",
    otherEvent: "Inne",
    addEvent: "Dodaj zdarzenie",
    
    // Calendar
    calendarTitle: "Kalendarz",
    calendar: "Kalendarz",
    noEventsForDay: "Brak zdarzeń w tym dniu",
    
    // Dogs
    dogsTitle: "Pieski",
    myDogs: "Moje pieski",
    addDog: "Dodaj pieska",
    addFirstDog: "Dodaj pierwszego pieska",
    noDogs: "Brak piesków",
    dogName: "Imię pieska",
    name: "Imię",
    birthDate: "Data urodzenia",
    sex: "Płeć",
    male: "Samiec",
    female: "Samica",
    breed: "Rasa",
    breedOptional: "opcjonalnie",
    mixedBreed: "Mieszaniec",
    
    // Dialogs
    deleteWalk: "Usuń spacer?",
    deleteWalkConfirm: "Czy na pewno chcesz usunąć ten spacer?",
    deleteEvent: "Usuń zdarzenie?",
    deleteEventConfirm: "Czy na pewno chcesz usunąć to zdarzenie?",
    deleteMeal: "Usuń posiłek?",
    deleteMealConfirm: "Czy na pewno chcesz usunąć ten posiłek?",
    deleteHealthEvent: "Usuń zdarzenie?",
    deleteHealthConfirm: "Czy na pewno chcesz usunąć to zdarzenie zdrowotne?",
    deleteDog: "Usuń pieska?",
    deleteDogConfirm: "Czy na pewno chcesz usunąć tego pieska i wszystkie jego dane?",
    deletePhoto: "Usuń zdjęcie?",
    deletePhotoConfirm: "Czy na pewno chcesz usunąć to zdjęcie?",
    
    // Logout
    logoutTitle: "Wylogowanie",
    saveCodeWarning: "⚠️ Zapisz kod gospodarstwa!",
    needCodeToLogin: "Będziesz go potrzebować do ponownego zalogowania:",
    copyCode: "Skopiuj kod",
    copied: "Skopiowano!",
    loseAccessWarning: "Po wylogowaniu utracisz dostęp do danych, chyba że podasz ten kod ponownie.",
    
    // Reminders
    tomorrow: "Jutro!",
    inTwoDays: "Za 2 dni",
    walkReminder: "Z reguły wychodzisz o tej godzinie z psem — może warto się zbierać?",
    
    // Settings
    language: "Język",
    settings: "Ustawienia",
    
    // Notifications
    notifications: "Powiadomienia",
    sendRequest: "Wyślij prośbę",
    walkRequest: "Prośba o spacer",
    feedRequest: "Prośba o karmienie",
    noNotifications: "Brak powiadomień",
    youSent: "Wysłałeś:",
  },
  en: {
    // Common
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    today: "Today",
    none: "None",
    copy: "Copy",
    send: "Send",
    
    // Auth
    register: "Sign up",
    password: "Password",
    checkEmail: "Check your email",
    verifyEmailMessage: "We've sent a verification link to your email address. Click it to activate your account.",
    redirecting: "Redirecting",
    
    // Onboarding
    welcomeTitle: "Welcome to DogoLog! 🐾",
    ownerNamePlaceholder: "Dog owner's name",
    next: "Next →",
    hello: "Hello",
    whatToDo: "What would you like to do?",
    createHousehold: "Create new household",
    joinHousehold: "Join someone's household",
    loginAgain: "Log in again",
    yourHouseholdCode: "Your household code",
    shareCode: "Share it with family members so they can join",
    letsStart: "Let's start! 🐶",
    joinHouseholdTitle: "Join household",
    enterCode: "Enter the 6-digit code from a family member",
    join: "Join! 🐾",
    back: "Back",
    welcomeBack: "Welcome back! 🐶",
    enterSavedCode: "Enter your saved household code",
    login: "Log in",
    invalidCode: "Invalid household code",
    selectMember: "Select your profile",
    selectMemberDesc: "Who in the household is using this app?",
    continueAs: "Continue as",
    noMembersFound: "No members found in this household",
    
    // Home Tab
    greeting: "Hello",
    walks: "Walks",
    meals: "Meals",
    health: "Health",
    dogs: "Dogs",
    householdCode: "Household code",
    householdMembers: "Household members",
    install: "Install",
    logout: "Logout",
    dogHappiness: "Dog Happiness",
    walksCategory: "Walks",
    mealsCategory: "Meals",
    regularityCategory: "Regularity",
    accidentsCategory: "Home accidents",
    you: "You",
    removeMember: "Remove member",
    removeMemberConfirm: "Are you sure you want to remove",
    points: "pts",
    
    // Walks Tab
    walksTitle: "Walks",
    newWalk: "New walk",
    atHome: "At home",
    homeEvent: "🏠 Home event",
    addDogFirst: "Add a dog first",
    whoWent: "Who went?",
    whatDidTheyDo: "What did they do?",
    duration: "Duration",
    min: "min",
    walkSaved: "Walk saved! 🐾",
    noWalks: "No walks",
    noWalksToday: "No walks today",
    pee: "Pee",
    poop: "Poop",
    both: "Both",
    nothing: "None",
    noBusiness: "None",
    addWalk: "Add walk",
    addHomeEvent: "Add event",
    poopNotePlaceholder: "e.g. abnormal stool",
    business: "What did they do?",
    
    // Food Tab
    foodTitle: "Food",
    addMeal: "Add meal",
    whoEats: "Who's eating?",
    type: "Type",
    saved: "Saved! ❤️",
    noMeals: "No meals",
    noMealsToday: "No meals today",
    dry: "Dry",
    wet: "Wet",
    mixed: "Mixed",
    treat: "Treat",
    other: "Other",
    otherFoodPlaceholder: "What was the food?",
    dryFood: "Dry food",
    wetFood: "Wet food",
    mixedFood: "Mixed food",
    mealType: "Meal type",
    
    // User stats
    userStats: "Member activity",
    thisWeek: "This week",
    
    // Health Tab
    healthTitle: "Health",
    newEvent: "New event",
    dog: "Dog",
    eventType: "Type",
    weight: "Weight",
    date: "Date",
    time: "Time",
    noteOptional: "Note (optional)",
    optionalNote: "Note (optional)",
    note: "Note",
    nextVisit: "Next visit",
    healthSaved: "Saved! 💚",
    upcoming: "Upcoming",
    history: "History",
    noEvents: "No events",
    noHealthEvents: "No health events",
    vet: "Vet",
    groomer: "Groomer",
    vaccination: "Vaccination",
    heatStart: "Heat ▶",
    heatEnd: "Heat ■",
    otherEvent: "Other",
    addEvent: "Add event",
    
    // Calendar
    calendarTitle: "Calendar",
    calendar: "Calendar",
    noEventsForDay: "No events for this day",
    
    // Dogs
    dogsTitle: "Dogs",
    myDogs: "My dogs",
    addDog: "Add dog",
    addFirstDog: "Add your first dog",
    noDogs: "No dogs yet",
    dogName: "Dog's name",
    name: "Name",
    birthDate: "Birth date",
    sex: "Sex",
    male: "Male",
    female: "Female",
    breed: "Breed",
    breedOptional: "optional",
    mixedBreed: "Mixed breed",
    
    // Dialogs
    deleteWalk: "Delete walk?",
    deleteWalkConfirm: "Are you sure you want to delete this walk?",
    deleteEvent: "Delete event?",
    deleteEventConfirm: "Are you sure you want to delete this event?",
    deleteMeal: "Delete meal?",
    deleteMealConfirm: "Are you sure you want to delete this meal?",
    deleteHealthEvent: "Delete event?",
    deleteHealthConfirm: "Are you sure you want to delete this health event?",
    deleteDog: "Delete dog?",
    deleteDogConfirm: "Are you sure you want to delete this dog and all their data?",
    deletePhoto: "Delete photo?",
    deletePhotoConfirm: "Are you sure you want to delete this photo?",
    
    // Logout
    logoutTitle: "Logout",
    saveCodeWarning: "⚠️ Save your household code!",
    needCodeToLogin: "You'll need it to log in again:",
    copyCode: "Copy code",
    copied: "Copied!",
    loseAccessWarning: "After logging out, you'll lose access to data unless you enter this code again.",
    
    // Reminders
    tomorrow: "Tomorrow!",
    inTwoDays: "In 2 days",
    walkReminder: "You usually go out at this time — maybe it's time to get ready?",
    
    // Settings
    language: "Language",
    settings: "Settings",
    
    // Notifications
    notifications: "Notifications",
    sendRequest: "Send request",
    walkRequest: "Walk request",
    feedRequest: "Feed request",
    noNotifications: "No notifications",
    youSent: "You sent:",
  },
} as const;

export type TranslationKey = keyof typeof translations.pl;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANGUAGE_KEY = "dogolog_language";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return (saved === "en" || saved === "pl") ? saved : "pl";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.pl[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be within LanguageProvider");
  return ctx;
};
