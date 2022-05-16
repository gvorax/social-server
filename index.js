const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require("body-parser");
const users = require('./routes/api/users');
require('dotenv').config();

const app = express();


const PORT = process.env.PORT || 5000;
connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.send('Api is running...');
});

app.use('/api/users',users);
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
