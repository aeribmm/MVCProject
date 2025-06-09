// public/js/main.js

// Automatyczne ukrywanie alertów po 5 sekundach
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
});

// Walidacja formularzy
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert('Proszę wypełnić wszystkie wymagane pola');
        }
    });
});

// Potwierdzenie usunięcia
const deleteButtons = document.querySelectorAll('.btn-danger');
deleteButtons.forEach(button => {
    if (button.closest('form') && !button.closest('form').onsubmit) {
        button.addEventListener('click', function(e) {
            if (!confirm('Czy na pewno chcesz wykonać tę akcję?')) {
                e.preventDefault();
            }
        });
    }
});

// Aktualizacja daty w czasie rzeczywistym
const deadlineInputs = document.querySelectorAll('input[type="date"]');
deadlineInputs.forEach(input => {
    // Ustaw minimalną datę na dziś
    const today = new Date().toISOString().split('T')[0];
    input.setAttribute('min', today);
});

// Dodanie klasy active do aktualnej strony w menu
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll('.navbar-item');
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});

// Funkcja do formatowania dat
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pl-PL', options);
}

// Licznik znaków dla textarea
const textareas = document.querySelectorAll('textarea');
textareas.forEach(textarea => {
    const maxLength = 500;
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.textContent = '0 / ' + maxLength;
    textarea.parentNode.appendChild(counter);
    
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        counter.textContent = length + ' / ' + maxLength;
        
        if (length > maxLength * 0.9) {
            counter.style.color = '#e74c3c';
        } else if (length > maxLength * 0.7) {
            counter.style.color = '#f39c12';
        } else {
            counter.style.color = '#7f8c8d';
        }
    });
});