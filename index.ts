import express from 'express'

const app = express()

app.use('/', (req, res) => {
    return res.json('Hello from the backend side')
})

app.listen(8000, () => {
    console.log('App is running at 8000')
})