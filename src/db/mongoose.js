const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewURLParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})







// const task = new Tasks({
//     description: 'eating'
// })

// task.save()
//     .then(() => { console.log(task) })
//     .catch((error) => { console.log('Error', error) })


    
// const me = new User({
//     name: 'MAx   ',
//     email: '  Rai@gmail.com   ',
//     password: 'PASSword'
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => { console.log('Error', error) })