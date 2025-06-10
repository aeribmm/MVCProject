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

projectSchema.index({ createdBy: 1 });
projectSchema.index({ participants: 1 });
projectSchema.index({ status: 1 });

projectSchema.methods.addParticipant = function(userId) {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ?
        new mongoose.Types.ObjectId(userId) : userId;

    const alreadyParticipant = this.participants.some(p =>
        p.toString() === userObjectId.toString()
    );

    if (!alreadyParticipant) {
        this.participants.push(userObjectId);
    }
    return this.save();
};

projectSchema.methods.addProgress = function(description, authorId) {
    const authorObjectId = mongoose.Types.ObjectId.isValid(authorId) ?
        new mongoose.Types.ObjectId(authorId) : authorId;

    this.progress.push({
        description,
        author: authorObjectId
    });
    return this.save();
};

projectSchema.methods.markAsCompleted = function(userId) {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ?
        new mongoose.Types.ObjectId(userId) : userId;

    this.status = 'Zakończony';
    this.completedBy = userObjectId;
    this.completedAt = new Date();
    return this.save();
};

projectSchema.methods.canEdit = function(userId) {
    if (!userId || !this.createdBy) return false;

    const createdById = this.createdBy._id ? this.createdBy._id.toString() : this.createdBy.toString();
    const userIdStr = userId.toString();

    console.log('canEdit check:', { userIdStr, createdById, result: userIdStr === createdById });

    return userIdStr === createdById;
};

projectSchema.methods.canView = function(userId) {
    if (!userId) return false;

    const userIdStr = userId.toString();

    if (this.createdBy) {
        const createdById = this.createdBy._id ? this.createdBy._id.toString() : this.createdBy.toString();
        if (createdById === userIdStr) {
            console.log('canView: user is creator');
            return true;
        }
    }

    const isParticipant = this.participants.some(participant => {
        let participantId;

        if (participant._id) {
            participantId = participant._id.toString();
        }
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

projectSchema.pre('save', function(next) {
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