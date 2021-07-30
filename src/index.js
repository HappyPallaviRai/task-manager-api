const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()
const port = process.env.PORT

// app.use((req, res, next) => {
//     res.status(503).send('Under Maintenance')
// })
// app.use((req, res, next) => {
//     if (req.method == 'GET') {
//         res.send('Not allowed')
//     } else {
//         next()
//     }
// })

const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            cb(new Error('Please upload a pdf file'))
        }
        cb(undefined, true)
    }
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})





app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('server is up on port '+ port)
})


