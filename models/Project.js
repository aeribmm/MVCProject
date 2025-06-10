// models/Project.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Planowany', 'W trakcie', 'Zakończony', 'Wstrzymany'],
        default: 'Planowany'
    },
    deadline: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    progress: [progressSchema],
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Индексы для оптимизации поиска
projectSchema.index({ createdBy: 1 });
projectSchema.index({ participants: 1 });
projectSchema.index({ status: 1 });

// Метод для добавления участника
projectSchema.methods.addParticipant = function(userId) {
    // Конвертируем в ObjectId если это строка
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ?
        new mongoose.Types.ObjectId(userId) : userId;

    // Проверяем, есть ли уже такой участник
    const alreadyParticipant = this.participants.some(p =>
        p.toString() === userObjectId.toString()
    );

    if (!alreadyParticipant) {
        this.participants.push(userObjectId);
    }
    return this.save();
};

// Метод для добавления прогресса
projectSchema.methods.addProgress = function(description, authorId) {
    const authorObjectId = mongoose.Types.ObjectId.isValid(authorId) ?
        new mongoose.Types.ObjectId(authorId) : authorId;

    this.progress.push({
        description,
        author: authorObjectId
    });
    return this.save();
};

// Метод для отметки как завершенный
projectSchema.methods.markAsCompleted = function(userId) {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ?
        new mongoose.Types.ObjectId(userId) : userId;

    this.status = 'Zakończony';
    this.completedBy = userObjectId;
    this.completedAt = new Date();
    return this.save();
};

// ИСПРАВЛЕННЫЙ метод для проверки прав на редактирование
projectSchema.methods.canEdit = function(userId) {
    if (!userId || !this.createdBy) return false;

    // Получаем ID создателя (может быть объект или строка)
    const createdById = this.createdBy._id ? this.createdBy._id.toString() : this.createdBy.toString();
    const userIdStr = userId.toString();

    console.log('canEdit check:', { userIdStr, createdById, result: userIdStr === createdById });

    return userIdStr === createdById;
};

// ИСПРАВЛЕННЫЙ метод для проверки прав на просмотр
projectSchema.methods.canView = function(userId) {
    if (!userId) return false;

    // Конвертируем userId в строку
    const userIdStr = userId.toString();

    // Проверяем, является ли пользователь создателем
    if (this.createdBy) {
        const createdById = this.createdBy._id ? this.createdBy._id.toString() : this.createdBy.toString();
        if (createdById === userIdStr) {
            console.log('canView: user is creator');
            return true;
        }
    }

    // Проверяем, является ли пользователь участником
    // Учитываем, что participants может быть заполнен (populated) или нет
    const isParticipant = this.participants.some(participant => {
        let participantId;

        // Если participant - это объект (после populate)
        if (participant._id) {
            participantId = participant._id.toString();
        }
        // Если participant - это просто ObjectId
        else {
            participantId = participant.toString();
        }

        return participantId === userIdStr;
    });

    console.log('canView check:', {
        userIdStr,
        participantIds: this.participants.map(p => p._id ? p._id.toString() : p.toString()),
        isParticipant
    });

    return isParticipant;
};

// Middleware для автоматического добавления создателя в участники
projectSchema.pre('save', function(next) {
    // Если это новый проект и создатель не в списке участников
    if (this.isNew && this.createdBy) {
        const createdByStr = this.createdBy.toString();
        const alreadyParticipant = this.participants.some(p =>
            p.toString() === createdByStr
        );

        if (!alreadyParticipant) {
            this.participants.push(this.createdBy);
            console.log('Added creator to participants automatically');
        }
    }
    next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;