const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        user : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User' // Refers to the 'User' Model
        },
        title: {
            type: String,
            required: [true, 'Please add a text value'],
        },
        description: {
            type: String,
        },
        // KANBAN STATUS (The Columns)
        status: {
            type: String,
            enum: ['todo', 'inprogress', 'done'],
            default: 'todo',
        },
        // PRIORITY
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);