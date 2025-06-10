const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');

const projectController = {
    getAllProjects: async (req, res) => {
        try {
            const statusFilter = req.query.status;
            const userId = req.session.userId;

            console.log('getAllProjects - userId from session:', userId);

            const userObjectId = mongoose.Types.ObjectId.isValid(userId) ?
                new mongoose.Types.ObjectId(userId) : userId;
            let query = {
                participants: userObjectId,
                $or: [
                    { status: 'Zakończony' },
                    { status: 'Planowany' }
                ]
            };

            if (statusFilter && statusFilter !== 'all') {
                query = {
                    participants: userObjectId,
                    status: statusFilter
                };

                if (statusFilter !== 'Zakończony' && statusFilter !== 'Planowany') {
                }
            }

            console.log('Query:', query);

            const projects = await Project.find(query)
                .populate('createdBy', 'name email')
                .populate('participants', 'name email')
                .sort({ updatedAt: -1 });

            console.log('Found projects:', projects.length);

            res.render('index', {
                projects,
                statusFilter: statusFilter || 'all'
            });
        } catch (error) {
            console.error('Błąd podczas pobierania projektów:', error);
            res.status(500).render('error', {
                message: 'Błąd podczas ładowania projektów',
                error: { status: 500 }
            });
        }
    },

    showCreateForm: (req, res) => {
        res.render('create-project');
    },

    createProject: async (req, res) => {
        try {
            const { name, description, deadline } = req.body;
            const userId = req.session.userId;

            console.log('Creating project for user:', userId);

            if (!name || !description || !deadline) {
                return res.render('create-project', {
                    error: 'Wszystkie pola są wymagane'
                });
            }

            const userObjectId = mongoose.Types.ObjectId.isValid(userId) ?
                new mongoose.Types.ObjectId(userId) : userId;

            const project = new Project({
                name: name.trim(),
                description: description.trim(),
                deadline: new Date(deadline),
                createdBy: userObjectId,
                participants: [userObjectId]
            });

            const savedProject = await project.save();
            console.log('Project created:', savedProject._id);
            console.log('Creator:', savedProject.createdBy);
            console.log('Participants:', savedProject.participants);

            res.redirect(`/projects/${savedProject._id}`);
        } catch (error) {
            console.error('Błąd podczas tworzenia projektu:', error);
            res.render('create-project', {
                error: 'Wystąpił błąd podczas tworzenia projektu'
            });
        }
    },

    getProjectDetails: async (req, res) => {
        try {
            const projectId = req.params.id;
            const userId = req.session.userId;

            console.log('=== getProjectDetails DEBUG ===');
            console.log('projectId:', projectId);
            console.log('userId from session:', userId);

            const projectForAuth = await Project.findById(projectId);

            if (!projectForAuth) {
                console.log('Project not found');
                return res.status(404).render('error', {
                    message: 'Projekt nie został znaleziony',
                    error: { status: 404 }
                });
            }

            console.log('Project found (raw):', {
                id: projectForAuth._id,
                createdBy: projectForAuth.createdBy,
                participants: projectForAuth.participants,
                userId: userId
            });

            const canView = projectForAuth.canView(userId);
            console.log('Can view result:', canView);

            if (!canView) {
                console.log('=== ACCESS DENIED ===');
                console.log('User ID:', userId);
                console.log('Creator ID:', projectForAuth.createdBy.toString());
                console.log('Participants (raw):', projectForAuth.participants.map(p => p.toString()));

                return res.status(403).render('error', {
                    message: 'Nie masz uprawnień do wyświetlenia tego projektu',
                    error: { status: 403 }
                });
            }
            const project = await Project.findById(projectId)
                .populate('createdBy', 'name email')
                .populate('participants', 'name email')
                .populate('progress.author', 'name')
                .populate('completedBy', 'name');

            const canEdit = projectForAuth.canEdit(userId);
            console.log('Can edit result:', canEdit);
            console.log('=== END DEBUG ===');

            let success = null;
            if (req.query.invited === 'success') {
                success = 'Uczestnik został pomyślnie zaproszony do projektu!';
            }

            res.render('project-details', {
                project,
                participants: project.participants,
                isOwner: canEdit,
                success: success
            });
        } catch (error) {
            console.error('Błąd podczas pobierania szczegółów projektu:', error);
            res.status(500).render('error', {
                message: 'Błąd podczas ładowania projektu',
                error: { status: 500 }
            });
        }
    },

    showEditForm: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).render('error', {
                    message: 'Projekt nie został znaleziony',
                    error: { status: 404 }
                });
            }

            if (!project.canEdit(req.session.userId)) {
                return res.status(403).render('error', {
                    message: 'Nie masz uprawnień do edycji tego projektu',
                    error: { status: 403 }
                });
            }

            res.render('edit-project', {
                project: {
                    ...project.toObject(),
                    deadline: project.deadline.toISOString().split('T')[0]
                }
            });
        } catch (error) {
            console.error('Błąd podczas ładowania formularza edycji:', error);
            res.status(500).render('error', {
                message: 'Błąd podczas ładowania formularza',
                error: { status: 500 }
            });
        }
    },

    updateProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).json({ error: 'Projekt nie został znaleziony' });
            }

            if (!project.canEdit(req.session.userId)) {
                return res.status(403).json({ error: 'Brak uprawnień' });
            }

            const { name, description, deadline, status } = req.body;

            project.name = name || project.name;
            project.description = description || project.description;
            project.deadline = deadline ? new Date(deadline) : project.deadline;
            project.status = status || project.status;

            await project.save();
            res.redirect(`/projects/${project._id}`);
        } catch (error) {
            console.error('Błąd podczas aktualizacji projektu:', error);
            res.status(500).json({ error: 'Błąd podczas aktualizacji projektu' });
        }
    },

    deleteProject: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).json({ error: 'Projekt nie został znaleziony' });
            }

            if (!project.canEdit(req.session.userId)) {
                return res.status(403).json({ error: 'Brak uprawnień' });
            }

            await Project.findByIdAndDelete(req.params.id);
            res.redirect('/');
        } catch (error) {
            console.error('Błąd podczas usuwania projektu:', error);
            res.status(500).json({ error: 'Błąd podczas usuwania projektu' });
        }
    },
    inviteParticipant: async (req, res) => {
        try {
            const projectId = req.params.id;
            const { email } = req.body;

            console.log('Inviting participant:', { projectId, email });

            const project = await Project.findById(projectId);

            if (!project) {
                console.log('Project not found for invite');
                return res.status(404).render('error', {
                    message: 'Projekt nie został znaleziony',
                    error: { status: 404 }
                });
            }

            if (!project.canEdit(req.session.userId)) {
                console.log('User cannot edit project for invite');
                return res.status(403).render('error', {
                    message: 'Nie masz uprawnień do zapraszania uczestników do tego projektu',
                    error: { status: 403 }
                });
            }

            if (!email || !email.trim()) {
                console.log('Empty email provided');
                const projectWithData = await Project.findById(projectId)
                    .populate('createdBy', 'name email')
                    .populate('participants', 'name email')
                    .populate('progress.author', 'name')
                    .populate('completedBy', 'name');

                return res.render('project-details', {
                    project: projectWithData,
                    participants: projectWithData.participants,
                    isOwner: true,
                    error: 'Proszę podać adres email'
                });
            }

            const user = await User.findOne({ email: email.toLowerCase().trim() });

            if (!user) {
                console.log('User not found:', email);
                const projectWithData = await Project.findById(projectId)
                    .populate('createdBy', 'name email')
                    .populate('participants', 'name email')
                    .populate('progress.author', 'name')
                    .populate('completedBy', 'name');

                return res.render('project-details', {
                    project: projectWithData,
                    participants: projectWithData.participants,
                    isOwner: true,
                    error: `Użytkownik z adresem ${email} nie został znaleziony. Upewnij się, że użytkownik jest zarejestrowany w systemie.`
                });
            }

            const isAlreadyParticipant = project.participants.some(p =>
                p.toString() === user._id.toString()
            );

            if (isAlreadyParticipant) {
                console.log('User is already a participant');
                const projectWithData = await Project.findById(projectId)
                    .populate('createdBy', 'name email')
                    .populate('participants', 'name email')
                    .populate('progress.author', 'name')
                    .populate('completedBy', 'name');

                return res.render('project-details', {
                    project: projectWithData,
                    participants: projectWithData.participants,
                    isOwner: true,
                    error: `Użytkownik ${user.name} (${email}) jest już uczestnikiem tego projektu.`
                });
            }

            await project.addParticipant(user._id);
            console.log('Participant added successfully:', user.email);

            res.redirect(`/projects/${project._id}?invited=success`);

        } catch (error) {
            console.error('Błąd podczas zapraszania uczestnika:', error);

            try {
                const projectWithData = await Project.findById(req.params.id)
                    .populate('createdBy', 'name email')
                    .populate('participants', 'name email')
                    .populate('progress.author', 'name')
                    .populate('completedBy', 'name');

                if (projectWithData) {
                    return res.render('project-details', {
                        project: projectWithData,
                        participants: projectWithData.participants,
                        isOwner: true,
                        error: 'Wystąpił błąd podczas zapraszania uczestnika. Spróbuj ponownie.'
                    });
                }
            } catch (nestedError) {
                console.error('Error loading project for error display:', nestedError);
            }

            res.status(500).render('error', {
                message: 'Wystąpił błąd podczas zapraszania uczestnika',
                error: { status: 500 }
            });
        }
    },

    addProgress: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            const { description } = req.body;

            if (!project) {
                return res.status(404).json({ error: 'Projekt nie został znaleziony' });
            }

            if (!project.canView(req.session.userId)) {
                return res.status(403).json({ error: 'Brak uprawnień' });
            }

            await project.addProgress(description, req.session.userId);
            res.redirect(`/projects/${project._id}`);
        } catch (error) {
            console.error('Błąd podczas dodawania postępu:', error);
            res.status(500).json({ error: 'Błąd podczas dodawania postępu' });
        }
    },

    markAsCompleted: async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).json({ error: 'Projekt nie został znaleziony' });
            }

            if (!project.canView(req.session.userId)) {
                return res.status(403).json({ error: 'Brak uprawnień' });
            }

            await project.markAsCompleted(req.session.userId);
            res.redirect(`/projects/${project._id}`);
        } catch (error) {
            console.error('Błąd podczas oznaczania projektu jako zakończony:', error);
            res.status(500).json({ error: 'Błąd podczas oznaczania projektu jako zakończony' });
        }
    }
};

module.exports = projectController;