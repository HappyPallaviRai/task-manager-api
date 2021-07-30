const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value))
              throw new Error('Email is invalid')
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
                throw new Error('age must be positive number')
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error('Password length should be greater than 6')
            }
            if (value.toLowerCase().includes('password'))
                throw new Error('Password should not containg the word \'Password\'')
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true            
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('userTask', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

// these are accessible on instances of model
userSchema.methods.toJSON = function () {
    const user = this
    const UserObject = user.toObject()

    delete UserObject.password
    delete UserObject.tokens
    delete UserObject.avatar

    return UserObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    
    const token = await jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '2 days'})
    
    user.tokens =  user.tokens.concat({ token })
    await user.save()
    return token
}

// these are accessible on models
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcryptjs.compare(password, user.password)
    console.log(isMatch)
    if (!isMatch)
        throw new Error('Unable to login')
    
    return user
} 

// Delte the user task associated with them
userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({owner: user._id})

    next()
})

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User