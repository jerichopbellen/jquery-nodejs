const express = require('express');
const app = express();
const cors = require('cors')

const items = require('./routes/item');
const users = require('./routes/user');
const orders = require('./routes/order');
const dashboard = require('./routes/dashboard')
const brands = require('./routes/brand');
const categories = require('./routes/category');

// app.get('/', (req, res) => {
//     res.send('Hello from nodejs!')
// })
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json())

app.use('/api/v1', items);
app.use('/api/v1', users);
app.use('/api/v1', orders);
app.use('/api/v1', dashboard);
app.use('/api/v1', brands);
app.use('/api/v1', categories);

const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app