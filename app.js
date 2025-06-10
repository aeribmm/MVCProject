const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const expressLayouts = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;

// Конфигурация подключения к MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management';

        console.log('🔄 Łączenie z bazą danych...');

        const conn = await mongoose.connect(mongoURI, {
            // Убираем устаревшие опции
            serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера 5s
            socketTimeoutMS: 45000, // Таймаут сокета 45s
            maxPoolSize: 10, // Максимум 10 соединений в пуле
            retryWrites: true,
            w: 'majority'
        });

        console.log(`✅ Połączono z MongoDB: ${conn.connection.host}`);

        // Обработка событий подключения
        mongoose.connection.on('connected', () => {
            console.log('📡 Mongoose połączony z MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Błąd połączenia z MongoDB:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📴 Mongoose rozłączony z MongoDB');
        });

    } catch (error) {
        console.error('❌ Błąd połączenia z bazą danych:', error.message);

        if (error.message.includes('IP')) {
            console.log('💡 Problemy z MongoDB Atlas:');
            console.log('   1. Sprawdź czy twój IP jest na whitelist w MongoDB Atlas');
            console.log('   2. W Atlas > Network Access > Add IP Address > Allow Access from Anywhere');
            console.log('   3. Sprawdź czy username i password są poprawne w connection string');
        }

        console.log('💡 Inne sprawdzenia:');
        console.log('   - Czy MONGODB_URI jest poprawnie ustawione w pliku .env');
        console.log('   - Czy masz dostęp do internetu');
        console.log('⚠️  Aplikacja uruchomi się bez połączenia z bazą danych');
    }
};

// Подключение к базе данных
connectDB();

// Проверяем контроллеры
let projectController, userController;

try {
    projectController = require('./controllers/projectController');
    console.log('✅ Załadowano projectController');
} catch (error) {
    console.error('❌ Nie można załadować projectController:', error.message);
    process.exit(1);
}

try {
    userController = require('./controllers/userController');
    console.log('✅ Załadowano userController');
} catch (error) {
    console.error('❌ Nie można załadować userController:', error.message);
    process.exit(1);
}

// Konfiguracja middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));

// Konfiguracja sesji
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 дней
        httpOnly: true
    }
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
app.post('/projects/:id/complete', requireAuth, projectController.markAsCompleted);

// Routing - użytkownicy
app.get('/login', userController.showLoginForm);
app.post('/login', userController.login);
app.get('/register', userController.showRegisterForm);
app.post('/register', userController.register);
app.post('/logout', userController.logout);

// Endpoint dla sprawdzenia statusu
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        status: 'OK',
        database: statusMap[dbStatus] || 'unknown',
        timestamp: new Date().toISOString()
    });
});

// Obsługa błędów 404
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Strona nie została znaleziona',
        error: { status: 404 }
    });
});

// Obsługa błędów
app.use((err, req, res, next) => {
    console.error('❌ Błąd aplikacji:', err.stack);
    res.status(500).render('error', {
        message: 'Wystąpił błąd serwera',
        error: process.env.NODE_ENV === 'development' ? err : { status: 500 }
    });
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
    console.log(`🌐 Otwórz http://localhost:${PORT} w przeglądarce`);
    console.log(`🏥 Status aplikacji: http://localhost:${PORT}/health`);
});