require('dotenv').config(); //carichiamo le variabili d'ambiente
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'build')));

const publicDir = path.join(__dirname, '...', 'frontend', 'public');
app.use(express.static(publicDir));

//importo rotte
app.use('/apiProduct', productRoutes);

// Route di test
app.get('/', (req, res) => {
    res.send("Hello World!");
});

app.use((err, req, res, next) => {
    console.error('errore: ', err);
    res.status(500).send('Internal Server Error');
});

mongoose.connect(process.env.MONGO_URI)
mongoose.connection.once('open', () => server.listen( process.env.PORT, () => console.log(`Connesso al db sulla porta ${process.env.PORT}`) ));
