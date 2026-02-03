const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

// MEMORIA RAM: Questa variabile mantiene i messaggi finché il server è acceso
let chatMemory = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: 'postit-ultra-secret',
    resave: false,
    saveUninitialized: true
}));

const getData = (file) => {
    try { return JSON.parse(fs.readFileSync(file)); } 
    catch (e) { return []; }
};
const saveData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Rotte
app.get('/', (req, res) => {
    const posts = getData('posts.json');
    res.render('home', { posts, user: req.session.user });
});

app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    let users = getData('users.json');
    if (users.find(u => u.username === username)) return res.send("Username occupato!");
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    saveData('users.json', users);
    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = getData('users.json').find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { username: user.username };
        res.redirect('/');
    } else { res.send("Dati errati!"); }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.post('/addPost', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    let posts = getData('posts.json');
    posts.push({
        id: Date.now(),
        username: req.session.user.username,
        content: req.body.content,
        date: new Date().toISOString()
    });
    saveData('posts.json', posts);
    res.redirect('/');
});

app.post('/deletePost/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    let posts = getData('posts.json');
    posts = posts.filter(p => !(p.id == req.params.id && p.username === req.session.user.username));
    saveData('posts.json', posts);
    res.redirect('/');
});

// LOGICA SOCKET.IO CON PERSISTENZA IN RAM
io.on('connection', (socket) => {
    // Appena l'utente si connette (o fa refresh), gli mandiamo tutti i messaggi in RAM
    socket.emit('load history', chatMemory);

    socket.on('chat message', (msgData) => {
        // Aggiungiamo il messaggio alla RAM
        chatMemory.push(msgData);
        
        // Opzionale: teniamo solo gli ultimi 100 messaggi per non intasare la RAM
        if (chatMemory.length > 100) chatMemory.shift();

        // Inviamo il messaggio a tutti gli utenti collegati
        io.emit('chat message', msgData);
    });
});

server.listen(port, () => console.log(`Postit Pro attivo su http://localhost:${port}`));