const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=5
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    match = {}
    sort = {}
    
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')        
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1
    }
    
    try {

       // const tasks = await Task.find({owner: req.user._id})
        await req.user.populate({
            path: 'userTask',
            match,
            options: {
                limit: parseInt(req.query.limit) ,
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.userTask)
    } catch (e) {
        res.status(500).send(e) 
    }
})

router.get('/tasks/:id', auth, async (req, res) => {    
    try {
        console.log(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send('No Task Found')
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e) 
    }
})

router.post('/task', auth, async (req, res) => {
    const task = new Task({...req.body, owner: req.user._id})
    console.log(task)
    try {
         await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e) 
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Update'})
    }
    try {
        const task = await Task.findOne({ _id: req.params.id , owner: req.user._id})
        //const task = await Task.findById(req.params.id)
        if (!task)
            return res.status(404).send('No Task found')
        
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task)
            return res.status(404).send()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router