const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser');

app.use(express.static('views'));
app.engine('html',ejs.renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

nunjucks.configure('views',{
    express:app,
    noCache:true
});

const loginRoute = require('./routes/login');
app.use('/',loginRoute);
const register = require('./routes/register');
app.use('/register',register);
const tarefasRoute = require('./routes/homework');
app.use('/tarefas',tarefasRoute);
const subjects = require('./routes/subjects');
app.use('/materias',subjects);
const videos = require('./routes/videos');
app.use('/videos',videos);
const notes = require('./routes/notes');
app.use('/conceitos',notes);
const database = require('./routes/database');
app.use('/database',database);

app.listen(3000, () => {
    console.log("> Server running on port 3000");
});