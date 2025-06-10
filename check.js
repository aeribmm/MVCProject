// check-files.js - Проверка наличия всех необходимых файлов
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'package.json',
    'app.js',
    '.env',
    'controllers/projectController.js',
    'controllers/userController.js',
    'models/User.js',
    'models/Project.js',
    'views/layout.ejs',
    'views/login.ejs',
    'views/register.ejs',
    'views/index.ejs',
    'views/project-details.ejs',
    'views/create-project.ejs',
    'views/edit-project.ejs',
    'views/error.ejs',
    'public/css/style.css',
    'public/js/main.js'
];

console.log('🔍 Sprawdzanie wymaganych plików...\n');

let missingFiles = [];
let existingFiles = [];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
        existingFiles.push(file);
    } else {
        console.log(`❌ ${file} - BRAK`);
        missingFiles.push(file);
    }
});

console.log(`\n📊 Podsumowanie:`);
console.log(`   ✅ Istniejące pliki: ${existingFiles.length}`);
console.log(`   ❌ Brakujące pliki: ${missingFiles.length}`);

if (missingFiles.length > 0) {
    console.log(`\n🚨 Brakujące pliki:`);
    missingFiles.forEach(file => {
        console.log(`   - ${file}`);
    });
    console.log(`\n💡 Stwórz brakujące pliki aby aplikacja działała poprawnie.`);
} else {
    console.log(`\n🎉 Wszystkie wymagane pliki są obecne!`);
}