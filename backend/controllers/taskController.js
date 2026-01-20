const User = require('../models/User');
const Task = require('../models/Task');
const sendEmail = require('../utils/sendEmail')

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
const createTask = async (req, res) => {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Please add a title' });
    }

    try {
        const task = await Task.create({
            title,
            description,
            status: status || "todo",
            priority: priority || "medium",
            dueDate,
            user: req.user.id
        });

        // 🛠️ FIX 3: Safety check using toLowerCase()
        if (priority && priority.toLowerCase() === "high") {
            const userEmail = req.user.email;
            const userName = req.user.name;

            const deadLineText = task.dueDate ? new Date(task.dueDate).toLocaleString('en-US', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) : 'No Deadline Set';

            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px;">
                    <h2 style="color: #d32f2f; margin-top: 0;">🔥 High Priority Task Created</h2>
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>A new critical task has been assigned to you.</p>
                    <div style="background-color: #fff5f5; padding: 15px; border-left: 5px solid #d32f2f; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">${task.title}</h3>
                        <p style="margin: 0; color: #666; font-size: 14px;">${task.description || 'No description provided'}</p>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ffcdd2;">
                            <p style="margin: 0; font-weight: bold; color: #b71c1c;">⏳ DEADLINE: ${deadLineText}</p>
                        </div>
                    </div>
                    <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Task Board</a>
                </div>
            `;

            sendEmail(userEmail, `🔥 Critical: ${task.title}`, message)
                .catch(err => console.error("Email Failed:", err.message));
        }

        res.status(201).json(task);
    } catch (error) { // 🛠️ FIX 2: Correct variable name
        console.error("Create Task Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task (e.g., move column)
// @route   PUT /api/tasks/:id
// @access  Private

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task Not Found !' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const oldPriority = task.priority;

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        // 🛠️ FIX 3: Robust Case Sensitivity Check
        // Check if New is High AND Old was NOT High
        const isNewHigh = updatedTask.priority && updatedTask.priority.toLowerCase() === 'high';
        const wasOldHigh = oldPriority && oldPriority.toLowerCase() === 'high';

        if (isNewHigh && !wasOldHigh) {
            
            const userEmail = req.user.email;
            const userName = req.user.name;

            const deadlineText = updatedTask.dueDate 
                ? new Date(updatedTask.dueDate).toLocaleString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  }) 
                : 'No Deadline Set';

            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px;">
                    <h2 style="color: #d32f2f; margin-top: 0;">🔥 Task Escalated to High Priority</h2>
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>The following task has been updated to <strong>High Priority</strong>.</p>
                    <div style="background-color: #fff5f5; padding: 15px; border-left: 5px solid #d32f2f; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">${updatedTask.title}</h3>
                        <p style="margin: 0; color: #666; font-size: 14px;">${updatedTask.description || 'No description provided'}</p>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ffcdd2;">
                            <p style="margin: 0; font-weight: bold; color: #b71c1c;">⏳ DEADLINE: ${deadlineText}</p>
                        </div>
                    </div>
                    <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Task Board</a>
                </div>
            `;

            sendEmail(userEmail, `🔥 Escalation: ${updatedTask.title}`, message)
                .catch(err => console.error("Update Email Failed:", err.message));
        }
        res.status(200).json(updatedTask); // Note: removed curly braces around updatedTask to match standard JSON format
    } catch (error) { // 🛠️ FIX 2: Correct variable name
        console.error("Update Task Error:", error);
        res.status(500).json({ message: error.message });
    }
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