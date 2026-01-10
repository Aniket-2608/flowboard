const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const {protect} = require('../middleware/authMiddleware')

// chain routes that have the same path
// GET and POST both go to '/' (e.g. localhost:5001/api/tasks)
router.route('/').get(protect, getTasks).post(protect, createTask);

// PUT and DELETE both go to '/:id' (e.g. localhost:5001/api/tasks/123)
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;