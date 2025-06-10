const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
require('dotenv').config();

async function initializeDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management');
        console.log('✓ Połączono z bazą danych');
        console.log('\n🎉 Baza danych została zainicjalizowana!');

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