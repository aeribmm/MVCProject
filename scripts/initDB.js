const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
require('dotenv').config();

async function initializeDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management');
        console.log('✓ Połączono z bazą danych');
        if (process.env.NODE_ENV === 'development') {
            await User.deleteMany({});
            await Project.deleteMany({});
            console.log('✓ Wyczyszczono kolekcje');
        }

        const demoUser = new User({
            name: 'Jan Kowalski',
            email: 'jan@example.com',
            password: 'haslo123'
        });

        await demoUser.save();
        console.log('✓ Utworzono użytkownika demo');

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
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;