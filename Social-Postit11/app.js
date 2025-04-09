const express = require('express');
const ejs = require('ejs');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Sessione per tenere traccia dell'utente
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Caricamento posts
const loadPosts = () => {
    try {
        return JSON.parse(fs.readFileSync('posts.json'));
    } catch (err) {
        return [];
    }
};

// Salvataggio posts
const savePosts = (posts) => {
    fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
};

// Home
app.get('/', (req, res) => {
    const posts = loadPosts();
    res.render('home', { posts, user: req.session.user });
});

// Login
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    let users = loadPosts();
    const user = users.find(u => u.username === username);

    if (user && user.password === password) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// Registrazione
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    let users = loadPosts();
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        return res.send("Username already exists.");
    }

    const newUser = { username, password };
    users.push(newUser);
    savePosts(users);
    res.redirect('/login');
});

// Aggiungi un post
app.post('/addPost', (req, res) => {
    const { content } = req.body;
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const posts = loadPosts();
    const newPost = {
        username: req.session.user.username,
        content: content,
        date: new Date().toISOString()
    };
    posts.push(newPost);
    savePosts(posts);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});