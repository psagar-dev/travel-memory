const express = require('express')
const { httpRequestDurationMicroseconds, httpRequestsTotal, httpErrorsTotal, register } = require('./metrics');
const cors = require('cors')
const { connectDB } = require('./db/conn')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    if (req.path === '/metrics') return next(); // Skip tracking for metrics
    
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        let route = req.route?.path || req.path;
        
        // Normalize dynamic routes: e.g., "/user/123" -> "/user/:id"
        if (req.params && Object.keys(req.params).length > 0) {
            Object.keys(req.params).forEach(param => {
                route = route.replace(req.params[param], `:${param}`);
            });
        }
        
        // Record metrics
        httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
        httpRequestDurationMicroseconds
            .labels(req.method, route, res.statusCode)
            .observe(duration);
        
        // Track errors (4xx and 5xx status codes)
        if (res.statusCode >= 400) {
            httpErrorsTotal.labels(req.method, route, res.statusCode).inc();
        }
    });
    
    next();
});


const tripRoutes = require('./routes/tripRoutes')
app.use('/api/trips', tripRoutes)

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/hello', (req,res)=>{
    res.send('Hello World!')
})

app.get('/api/500', (req, res) => {
    res.status(500).send('Internal Server Error');
});

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        console.error('Error generating metrics:', error);
        res.status(500).send('Error generating metrics');
    }
});

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