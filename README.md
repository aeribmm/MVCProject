# System Zarządzania Projektami Grupowymi

Aplikacja internetowa do zarządzania projektami grupowymi, umożliwiająca użytkownikom tworzenie, edytowanie i monitorowanie postępów w projektach zespołowych.

## Opis projektu

System zarządzania projektami grupowymi to aplikacja webowa stworzona w architekturze MVC z wykorzystaniem Node.js i Express.js. Projekt powstał w celu ułatwienia organizacji pracy zespołowej poprzez centralne zarządzanie projektami, zapraszanie uczestników oraz śledzenie postępów w realizacji zadań.

Aplikacja wykorzystuje Server-Side Rendering (SSR) z silnikiem szablonów EJS oraz bazę danych MongoDB do przechowywania informacji o projektach i użytkownikach.

## Funkcjonalności

### Zarządzanie użytkownikami
- **Rejestracja użytkowników** - tworzenie nowych kont z walidacją danych
- **Logowanie/wylogowywanie** - bezpieczna autoryzacja z sesjami
- **Zarządzanie sesjami** - automatyczne utrzymywanie sesji użytkownika

### Zarządzanie projektami
- **Tworzenie projektów** - dodawanie nowych projektów z nazwą, opisem i terminem
- **Edytowanie projektów** - modyfikacja istniejących projektów (tylko dla właścicieli)
- **Usuwanie projektów** - usuwanie projektów (tylko dla właścicieli)
- **Przeglądanie projektów** - lista wszystkich projektów użytkownika
- **Filtrowanie projektów** - sortowanie według statusu (wszystkie, planowane, zakończone)

### Zarządzanie uczestnikami
- **Zapraszanie uczestników** - dodawanie użytkowników do projektów przez email
- **Przeglądanie uczestników** - lista wszystkich członków projektu
- **Rozróżnianie ról** - oznaczanie właściciela projektu

### Śledzenie postępów
- **Dodawanie aktualizacji** - wszyscy uczestnicy mogą dodawać informacje o postępach
- **Historia postępów** - chronologiczny widok wszystkich aktualizacji
- **Oznaczanie jako zakończone** - zmiana statusu projektu na "Zakończony"

### Statusy projektów
- **Planowany** - projekt w fazie planowania
- **W trakcie** - projekt aktywnie realizowany
- **Zakończony** - projekt ukończony
- **Wstrzymany** - projekt czasowo wstrzymany

## Instrukcja uruchomienia

### Wymagania systemowe
- **Node.js** w wersji 16.20.1 lub nowszej
- **MongoDB** (lokalnie lub MongoDB Atlas)
- **npm** lub **yarn** do zarządzania pakietami

### Instalacja

1. **Sklonuj repozytorium:**
```bash
git clone https://github.com/aeribmm/MVCProject
cd MVCProject
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Skonfiguruj zmienne środowiskowe:**
   Utwórz plik `.env` w głównym katalogu projektu:
```env
# Konfiguracja bazy danych
# Dla MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# Alternatywnie dla lokalnej MongoDB:
# MONGODB_URI=mongodb://localhost:27017/project_management
# Klucz sesji (zmień na bezpieczny w produkcji)
SESSION_SECRET=your-super-secret-session-key

# Port aplikacji (opcjonalnie)
PORT=3000

# Środowisko (development/production)
NODE_ENV=development
```

4. **Uruchom MongoDB:**
- Lokalnie: upewnij się, że serwis MongoDB jest uruchomiony
- MongoDB Atlas: użyj connection string w MONGODB_URI

5. **Zainicjalizuj bazę danych (opcjonalnie):**
```bash
npm run init-db
```
To utworzy przykładowego użytkownika i projekt demonstracyjny.

6. **Uruchom aplikację:**

**Tryb developerski (z automatycznym restartowaniem):**
```bash
npm run dev
```

**Tryb produkcyjny:**
```bash
npm start
```

7. **Otwórz aplikację:**
   Przejdź do `http://localhost:3000` w przeglądarce

### Sprawdzenie stanu aplikacji
Endpoint zdrowia aplikacji: `http://localhost:3000/health`

## Wykorzystane biblioteki zewnętrzne

### Główne zależności
- **express** (4.21.2) - framework webowy dla Node.js
- **mongoose** (8.15.1) - ODM dla MongoDB
- **ejs** (3.1.10) - silnik szablonów
- **express-ejs-layouts** (2.5.1) - wsparcie dla layoutów w EJS
- **express-session** (1.18.1) - zarządzanie sesjami użytkowników
- **bcryptjs** (2.4.3) - hashowanie haseł
- **dotenv** (16.5.0) - zarządzanie zmiennymi środowiskowymi
- **mongodb** (6.17.0) - driver MongoDB
- **uuid** (9.0.1) - generowanie unikalnych identyfikatorów

### Zależności deweloperskie
- **nodemon** (3.1.10) - automatyczny restart serwera podczas rozwoju

### Dodatkowe biblioteki
- **connect-mongo** (5.1.0) - przechowywanie sesji w MongoDB

## Struktura aplikacji

```
project-management-system/
├── app.js                 # Główny plik aplikacji
├── package.json           # Konfiguracja projektu i zależności
├── .env                   # Zmienne środowiskowe (nie w repo)
├── .gitignore            # Pliki ignorowane przez Git
│
├── controllers/          # Kontrolery MVC
│   ├── projectController.js  # Logika obsługi projektów
│   └── userController.js     # Logika obsługi użytkowników
│
├── models/               # Modele danych (MongoDB/Mongoose)
│   ├── Project.js            # Model projektu
│   ├── User.js               # Model użytkownika
│   └── progress.js           # Model postępu (pomocniczy)
│
├── views/                # Widoki (szablony EJS)
│   ├── layout.ejs            # Główny layout aplikacji
│   ├── index.ejs             # Strona główna (lista projektów)
│   ├── project-details.ejs   # Szczegóły projektu
│   ├── create-project.ejs    # Formularz tworzenia projektu
│   ├── edit-project.ejs      # Formularz edycji projektu
│   ├── login.ejs             # Formularz logowania
│   ├── register.ejs          # Formularz rejestracji
│   └── error.ejs             # Strona błędu
│
├── public/               # Pliki statyczne
│   ├── css/
│   │   └── style.css         # Arkusze stylów
│   └── js/
│       └── main.js           # Skrypty JavaScript
│
└── scripts/              # Skrypty pomocnicze
    └── initDb.js             # Inicjalizacja bazy danych
```

### Opis komponentów MVC

#### Modele (Models)
- **User.js** - zarządza danymi użytkowników, hashowanie haseł, walidacja
- **Project.js** - zarządza projektami, uczestnikami, postępami, uprawnienia
- **progress.js** - pomocniczy model dla elementów postępu

#### Kontrolery (Controllers)
- **userController.js** - obsługuje logowanie, rejestrację, zarządzanie sesjami
- **projectController.js** - zarządza CRUD projektów, uczestnikami, postępami

#### Widoki (Views)
- **layout.ejs** - główny szablon z nawigacją i stopką
- **index.ejs** - lista projektów z filtrowaniem
- **project-details.ejs** - szczegółowy widok projektu
- **create-project.ejs** / **edit-project.ejs** - formularze zarządzania projektami
- **login.ejs** / **register.ejs** - formularze autoryzacji
- **error.ejs** - obsługa błędów

## Przykładowe dane wejściowe

### Dane logowania (po wykonaniu `npm run init-db`)
```
Email: jan@example.com
Hasło: haslo123
```

### Przykład tworzenia projektu
```
Nazwa: "Aplikacja e-commerce"
Opis: "System sprzedaży online z košzykiem i płatnościami"
Termin: 2024-12-31
Status: Planowany (domyślnie)
```

### Przykład zapraszania uczestnika
```
Email uczestnika: anna@example.com
(użytkownik musi być wcześniej zarejestrowany)
```

### Przykład aktualizacji postępu
```
Opis: "Ukończono implementację košzyka zakupowego"
Autor: automatycznie przypisywany na podstawie sesji
Data: automatycznie ustawiana
```

## Autor

Projekt wykonany zgodnie z wymaganiami zaliczenia kursu MVC w Node.js.

## Licencja

ISC