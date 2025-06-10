const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const expressLayouts = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management';
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });



    } catch (error) {
        console.error('❌ Błąd połączenia z bazą danych:', error.message);

    }
};

connectDB();

let projectController, userController;

try {
    projectController = require('./controllers/projectController');
} catch (error) {
    console.error('❌ Nie można załadować projectController:', error.message);
    process.exit(1);
}

try {
    userController = require('./controllers/userController');
} catch (error) {
    console.error('❌ Nie można załadować userController:', error.message);
    process.exit(1);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId ? {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail
    } : null;
    next();
});

app.get('/', requireAuth, projectController.getAllProjects);

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

app.get('/login', userController.showLoginForm);
app.post('/login', userController.login);
app.get('/register', userController.showRegisterForm);
app.post('/register', userController.register);
app.post('/logout', userController.logout);

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

app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Strona nie została znaleziona',
        error: { status: 404 }
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Błąd aplikacji:', err.stack);
    res.status(500).render('error', {
        message: 'Wystąpił błąd serwera',
        error: process.env.NODE_ENV === 'development' ? err : { status: 500 }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
    console.log(`🌐 Otwórz http://localhost:${PORT} w przeglądarce`);
    console.log(`🏥 Status aplikacji: http://localhost:${PORT}/health`);
});