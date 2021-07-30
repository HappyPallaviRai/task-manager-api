const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const account = require('../emails/account')


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        const token = await user.generateAuthToken()
        await user.save()
        account.welcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
    // user.save().then(() => {
    //     res.send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {        
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        console.log('here', req.user.tokens)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => { 
        res.send(req.user)
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user)
        //     return res.status(404).send()
        await req.user.remove()
        account.leavingEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        return res.status(500).send(e)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update)=>allowedUpdate.includes(update))
    
    if (!isValidOperation)
        return res.status(400).send({error: 'Invalid Updates!'})
    
    try {
        const user = req.user

        updates.forEach((update) => user[update] = req.body[update])
        
        await user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
        
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

const upload = multer({
    //dest: 'src/avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Pls Upload an image'))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    
    //req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send('Avatar Deleted') 
    } catch (e) {
        res.status(500).send(e)
    }
   
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user && !user.avatar) {
        throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router