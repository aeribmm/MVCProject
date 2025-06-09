// models/User.js
const { v4: uuidv4 } = require('uuid');

class User {
    constructor(name, email, password) {
        this.id = uuidv4();
        this.name = name;
        this.email = email;
        this.password = password; // W prawdziwej aplikacji hasło powinno być zahashowane
        this.createdAt = new Date();
    }
}

// Symulacja bazy danych
const users = new Map();

// Przykładowy użytkownik
const demoUser = new User('Jan Kowalski', 'jan@example.com', 'haslo123');
demoUser.id = 'demo-user';
users.set(demoUser.id, demoUser);

module.exports = {
    User,
    users
};