const { User, users } = require('../models/User');

const userController = {
    // Wyświetlanie formularza logowania
    showLoginForm: (req, res) => {
        if (req.session.userId) {
            return res.redirect('/');
        }
        res.render('login', { error: null });
    },

    // Logowanie
    login: (req, res) => {
        const { email, password } = req.body;

        const user = Array.from(users.values()).find(u =>
            u.email === email && u.password === password
        );

        if (!user) {
            return res.render('login', {
                error: 'Nieprawidłowy email lub hasło'
            });
        }

        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        res.redirect('/');
    },

    // Wyświetlanie formularza rejestracji
    showRegisterForm: (req, res) => {
        if (req.session.userId) {
            return res.redirect('/');
        }
        res.render('register', { error: null });
    },

    // Rejestracja
    register: (req, res) => {
        const { name, email, password } = req.body;

        // Sprawdzanie czy email już istnieje
        const existingUser = Array.from(users.values()).find(u => u.email === email);

        if (existingUser) {
            return res.render('register', {
                error: 'Użytkownik z tym adresem email już istnieje'
            });
        }

        const user = new User(name, email, password);
        users.set(user.id, user);

        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        res.redirect('/');
    },

    // Wylogowanie
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Błąd podczas wylogowywania:', err);
            }
            res.redirect('/login');
        });
    }
};

module.exports = userController;