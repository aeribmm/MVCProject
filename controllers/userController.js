
const User = require('../models/User');

const userController = {
    showLoginForm: (req, res) => {
        if (req.session.userId) {
            return res.redirect('/');
        }
        res.render('login', { error: null });
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.render('login', {
                    error: 'Nieprawidłowy email lub hasło'
                });
            }

            const isValidPassword = await user.comparePassword(password);

            if (!isValidPassword) {
                return res.render('login', {
                    error: 'Nieprawidłowy email lub hasło'
                });
            }

            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.userEmail = user.email;

            res.redirect('/');
        } catch (error) {
            console.error('Błąd podczas logowania:', error);
            res.render('login', {
                error: 'Wystąpił błąd podczas logowania. Spróbuj ponownie.'
            });
        }
    },

    showRegisterForm: (req, res) => {
        if (req.session.userId) {
            return res.redirect('/');
        }
        res.render('register', { error: null });
    },

    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.render('register', {
                    error: 'Użytkownik z tym adresem email już istnieje'
                });
            }

            if (!name || !email || !password) {
                return res.render('register', {
                    error: 'Wszystkie pola są wymagane'
                });
            }

            if (password.length < 6) {
                return res.render('register', {
                    error: 'Hasło musi mieć co najmniej 6 znaków'
                });
            }

            const user = new User({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password
            });

            await user.save();

            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.userEmail = user.email;

            res.redirect('/');
        } catch (error) {
            console.error('Błąd podczas rejestracji:', error);

            if (error.code === 11000) {
                return res.render('register', {
                    error: 'Użytkownik z tym adresem email już istnieje'
                });
            }

            res.render('register', {
                error: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.'
            });
        }
    },

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