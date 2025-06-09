// models/Progress.js
const { v4: uuidv4 } = require('uuid');

class Progress {
    constructor(description, author) {
        this.id = uuidv4();
        this.description = description;
        this.author = author;
        this.date = new Date();
    }
}

module.exports = Progress;