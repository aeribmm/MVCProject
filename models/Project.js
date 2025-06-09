// models/Project.js
const { v4: uuidv4 } = require('uuid');

class Project {
    constructor(name, description, deadline, createdBy) {
        this.id = uuidv4();
        this.name = name;
        this.description = description;
        this.status = 'Planowany';
        this.deadline = deadline;
        this.createdBy = createdBy;
        this.participants = [createdBy];
        this.progress = [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    addParticipant(userId) {
        if (!this.participants.includes(userId)) {
            this.participants.push(userId);
            this.updatedAt = new Date();
        }
    }

    removeParticipant(userId) {
        this.participants = this.participants.filter(p => p !== userId);
        this.updatedAt = new Date();
    }

    updateStatus(status) {
        const validStatuses = ['Planowany', 'W trakcie', 'Zakończony', 'Wstrzymany'];
        if (validStatuses.includes(status)) {
            this.status = status;
            this.updatedAt = new Date();
        }
    }

    addProgress(progress) {
        this.progress.push(progress);
        this.updatedAt = new Date();
    }

    update(data) {
        if (data.name) this.name = data.name;
        if (data.description) this.description = data.description;
        if (data.deadline) this.deadline = data.deadline;
        if (data.status) this.updateStatus(data.status);
        this.updatedAt = new Date();
    }
}

// Symulacja bazy danych
const projects = new Map();

// Przykładowe dane
const demoProject = new Project(
    'System zarządzania zadaniami',
    'Aplikacja do zarządzania zadaniami dla zespołu programistycznego',
    '2024-12-31',
    'demo-user'
);
demoProject.updateStatus('W trakcie');
projects.set(demoProject.id, demoProject);

module.exports = {
    Project,
    projects
};