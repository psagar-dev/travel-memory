const express = require('express')
const cors = require('cors')
const { connectDB } = require('./db/conn')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001
app.use(express.json())
app.use(cors())

const tripRoutes = require('./routes/tripRoutes')
app.use('/api/trips', tripRoutes)

app.get('/hello', (req,res)=>{
    res.send('Hello World!')
})

// Only start the server if this file is run directly
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, ()=>{
            console.log(`Server started at http://localhost:${PORT}`)
        })
    }).catch(err => {
        console.error('Failed to connect to database:', err)
        process.exit(1)
    })
}

module.exports = app