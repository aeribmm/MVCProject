// scripts/initDb.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
require('dotenv').config();

async function initializeDatabase() {
    try {
        // Подключение к базе данных
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management');
        console.log('✓ Połączono z bazą danych');

        // Очистка коллекций (только для разработки)
        if (process.env.NODE_ENV === 'development') {
            await User.deleteMany({});
            await Project.deleteMany({});
            console.log('✓ Wyczyszczono kolekcje');
        }

        // Создание демо-пользователя
        const demoUser = new User({
            name: 'Jan Kowalski',
            email: 'jan@example.com',
            password: 'haslo123'
        });

        await demoUser.save();
        console.log('✓ Utworzono użytkownika demo');

        // Создание демо-проекта
        const demoProject = new Project({
            name: 'System zarządzania zadaniami',
            description: 'Aplikacja do zarządzania zadaniami dla zespołu programistycznego',
            deadline: new Date('2024-12-31'),
            createdBy: demoUser._id,
            participants: [demoUser._id],
            status: 'W trakcie'
        });

        await demoProject.save();
        console.log('✓ Utworzono projekt demo');

        // Dodание прогресса к демо-проекту
        await demoProject.addProgress('Rozpoczęto prace nad projektem', demoUser._id);
        await demoProject.addProgress('Ukończono podstawową strukturę aplikacji', demoUser._id);
        console.log('✓ Dodano postępy do projektu demo');

        console.log('\n🎉 Baza danych została zainicjalizowana!');
        console.log('\nDane logowania:');
        console.log('Email: jan@example.com');
        console.log('Hasło: haslo123');

    } catch (error) {
        console.error('❌ Błąd podczas inicjalizacji bazy danych:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✓ Zamknięto połączenie z bazą danych');
    }
}

// Uruchomienie skryptu
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;