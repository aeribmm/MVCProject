const { Project, projects } = require('../models/Project');
const { users } = require('../models/User');
const Progress = require('../models/Progress');

const projectController = {
    // Pobieranie wszystkich projektów
    getAllProjects: (req, res) => {
        const userProjects = Array.from(projects.values()).filter(project =>
            project.participants.includes(req.session.userId)
        );

        // Filtrowanie po statusie
        const statusFilter = req.query.status;
        const filteredProjects = statusFilter && statusFilter !== 'all'
            ? userProjects.filter(p => p.status === statusFilter)
            : userProjects;

        res.render('index', {
            projects: filteredProjects,
            statusFilter: statusFilter || 'all'
        });
    },

    // Wyświetlanie formularza tworzenia projektu
    showCreateForm: (req, res) => {
        res.render('create-project');
    },

    // Tworzenie nowego projektu
    createProject: (req, res) => {
        const { name, description, deadline } = req.body;

        if (!name || !description || !deadline) {
            return res.render('create-project', {
                error: 'Wszystkie pola są wymagane'
            });
        }

        const project = new Project(name, description, deadline, req.session.userId);
        projects.set(project.id, project);

        res.redirect(`/projects/${project.id}`);
    },

    // Szczegóły projektu
    getProjectDetails: (req, res) => {
        const project = projects.get(req.params.id);

        if (!project) {
            return res.status(404).render('error', {
                message: 'Projekt nie został znaleziony',
                error: { status: 404 }
            });
        }

        // Sprawdzanie uprawnień
        if (!project.participants.includes(req.session.userId)) {
            return res.status(403).render('error', {
                message: 'Nie masz uprawnień do wyświetlenia tego projektu',
                error: { status: 403 }
            });
        }

        // Pobieranie danych uczestników
        const participantsData = project.participants.map(userId => {
            const user = users.get(userId);
            return user ? { id: user.id, name: user.name, email: user.email } : null;
        }).filter(u => u !== null);

        res.render('project-details', {
            project,
            participants: participantsData,
            isOwner: project.createdBy === req.session.userId
        });
    },

    // Wyświetlanie formularza edycji
    showEditForm: (req, res) => {
        const project = projects.get(req.params.id);

        if (!project) {
            return res.status(404).render('error', {
                message: 'Projekt nie został znaleziony',
                error: { status: 404 }
            });
        }

        // Tylko właściciel może edytować
        if (project.createdBy !== req.session.userId) {
            return res.status(403).render('error', {
                message: 'Nie masz uprawnień do edycji tego projektu',
                error: { status: 403 }
            });
        }

        res.render('edit-project', { project });
    },

    // Aktualizacja projektu
    updateProject: (req, res) => {
        const project = projects.get(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Projekt nie został znaleziony' });
        }

        if (project.createdBy !== req.session.userId) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        project.update(req.body);
        res.redirect(`/projects/${project.id}`);
    },

    // Usuwanie projektu
    deleteProject: (req, res) => {
        const project = projects.get(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Projekt nie został znaleziony' });
        }

        if (project.createdBy !== req.session.userId) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        projects.delete(req.params.id);
        res.redirect('/');
    },

    // Zapraszanie uczestnika
    inviteParticipant: (req, res) => {
        const project = projects.get(req.params.id);
        const { email } = req.body;

        if (!project) {
            return res.status(404).json({ error: 'Projekt nie został znaleziony' });
        }

        // Znajdowanie użytkownika po emailu
        const user = Array.from(users.values()).find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ error: 'Użytkownik nie został znaleziony' });
        }

        project.addParticipant(user.id);
        res.redirect(`/projects/${project.id}`);
    },

    // Dodawanie postępu
    addProgress: (req, res) => {
        const project = projects.get(req.params.id);
        const { description } = req.body;

        if (!project) {
            return res.status(404).json({ error: 'Projekt nie został znaleziony' });
        }

        if (!project.participants.includes(req.session.userId)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        const progress = new Progress(description, req.session.userId);
        project.addProgress(progress);

        res.redirect(`/projects/${project.id}`);
    }
};

module.exports = projectController;