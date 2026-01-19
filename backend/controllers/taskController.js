const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private

const getTasks = async (req, res)=>{
    const tasks = await Task.find({ user : req.user.id });
    res.status(200).json(tasks);
}

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private

const getTask = async(req, res)=>{
    const task = await Task.findById(req.params.id);
    if(!task){
        return res.status(404).json({message : 'Task not found'});
    }

    if(task.user.toString() != req.user.id){
        return res.status(401).json({message : 'User not authorized'})
    }

    res.status(200).json(task);
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res)=>{
    if (!req.body.title) {
        return res.status(400).json({ message: 'Please add a text field' });
    }
    const task = await Task.create({
        title : req.body.title,
        description : req.body.description,
        status : req.body.status,
        priority : req.body.priority,
        user : req.user.id
    });
    res.status(200).json(task);
}

// @desc    Update a task (e.g., move column)
// @route   PUT /api/tasks/:id
// @access  Private

const updateTask = async (req, res)=>{
    const task = await Task.findById(req.params.id);

    if(!task){
        return res.status(404).json({message : 'Task Not Found !'});
    }

    //check OwnerShip
    if(task.user.toString() !== req.user.id){
        return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
    })

    res.status(200).json({updatedTask})
}

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private

const deleteTask = async (req, res)=>{
    const task = await Task.findById(req.params.id)
    if(!task){
        return res.status(404).json({message : 'Task Not Found !'});
    }

    //check OwnerShip
    if(task.user.toString() !== req.user.id){
        return res.status(401).json({ message: 'User not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
}

module.exports = {
    getTasks, createTask, updateTask, deleteTask, getTask
}