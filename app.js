// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const expressLayouts = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;

// Importowanie kontrolerów
const projectController = require('./controllers/projectController');
const userController = require('./controllers/userController');

// Konfiguracja middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));

// Konfiguracja sesji
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Konfiguracja silnika widoków
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware do sprawdzania autoryzacji
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Middleware do przekazywania danych użytkownika do widoków
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId ? {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail
    } : null;
    next();
});

// Routing - strona główna
app.get('/', requireAuth, projectController.getAllProjects);

// Routing - projekty
app.get('/projects', requireAuth, projectController.getAllProjects);
app.get('/projects/new', requireAuth, projectController.showCreateForm);
app.post('/projects', requireAuth, projectController.createProject);
app.get('/projects/:id', requireAuth, projectController.getProjectDetails);
app.get('/projects/:id/edit', requireAuth, projectController.showEditForm);
app.post('/projects/:id', requireAuth, projectController.updateProject);
app.post('/projects/:id/delete', requireAuth, projectController.deleteProject);
app.post('/projects/:id/invite', requireAuth, projectController.inviteParticipant);
app.post('/projects/:id/progress', requireAuth, projectController.addProgress);

// Routing - użytkownicy
app.get('/login', userController.showLoginForm);
app.post('/login', userController.login);
app.get('/register', userController.showRegisterForm);
app.post('/register', userController.register);
app.post('/logout', userController.logout);

// Obsługa błędów 404
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Strona nie została znaleziona',
        error: { status: 404 }
    });
});

// Obsługa błędów
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Wystąpił błąd serwera',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer uruchomiony na porcie ${PORT}`);
    console.log(`Otwórz http://localhost:${PORT} w przeglądarce`);
});