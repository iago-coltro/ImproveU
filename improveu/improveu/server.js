const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'iftm',
    database: 'iftm' // Adicione o nome do banco de dados aqui
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados');
});


// Rota para cadastrar usuário
app.post('/cadastrar', (req, res) => {
    const { nome, email, senha, userType } = req.body;
    console.log(req.body);
    const sql = 'INSERT INTO usuarios (nome, email, senha, userType) VALUES (?, ?, ?, ?)';
    db.query(sql, [nome, email, senha, userType], (err, result) => {
        if (err) throw err;
        res.redirect('./student');
    });
});

// CRUD -------------------------------------------------------------------

// Rota para buscar todos os usuários
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Rota para buscar um usuário específico pelo ID
app.get('/usuarios/:id', (req, res) => {
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Rota para atualizar um usuário
app.put('/usuarios/:id', (req, res) => {
    const { nome, email, senha, userType } = req.body;
    const sql = 'UPDATE usuarios SET nome = ?, email = ?, senha = ?, userType = ? WHERE id = ?';
    db.query(sql, [nome, email, senha, userType, req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Usuário atualizado com sucesso!' });
    });
});

// Rota para deletar um usuário
app.delete('/usuarios/:id', (req, res) => {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Usuário deletado com sucesso!' });
    });
});


// Teste Conexão Database

app.get('/iftm', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, results, fields) => {
        if (err) throw err;
        res.send(`Database connection test successful: ${results[0].solution}`);
    });
});

// Teste Conexão Node Express

app.get('/test', (req, res) => {
    res.send('Teste de conexão bem-sucedido!');
});

app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});


//Rotas EJS -------------------------------------------------------------------------------------------

// Definindo EJS como mecanismo de visualização
app.set('view engine', 'ejs');

// Definindo o diretório de visualizações
app.set('views', path.join(__dirname, 'public', 'views'));

// Definindo o diretório público para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('login');  // O nome do arquivo EJS na pasta de visualizações
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

app.get('/cadastroprofessor', (req, res) => {
    res.render('cadastroprofessor');
});

app.get('/redefinirsenha', (req, res) => {
    res.render('redefinirsenha');
});

app.get('/student', (req, res) => {
    res.render('student');
});

app.get('/teacher', (req, res) => {
    res.render('teacher');
});

app.get('/index', (req, res) => {
    res.render('index');
});

// CRUD Professores ------------------------------------------------------------------------

// Rota para cadastrar professor
app.post('/cadastrarprofessor', (req, res) => {
    const { nome, email, senha, ra } = req.body;
    const sql = 'INSERT INTO professores (nome, email, senha, ra) VALUES (?, ?, ?, ?)';
    db.query(sql, [nome, email, senha, ra], (err, result) => {
        if (err) throw err;
        res.redirect('./teacher');
    });
});

// Rota para buscar todos os professores
app.get('/professores', (req, res) => {
    const sql = 'SELECT * FROM professores';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Rota para buscar um professor específico pelo ID
app.get('/professores/:id', (req, res) => {
    const sql = 'SELECT * FROM professores WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Rota para atualizar um professor
app.put('/professores/:id', (req, res) => {
    const { nome, email, senha, ra } = req.body;
    const sql = 'UPDATE professores SET nome = ?, email = ?, senha = ?, ra = ? WHERE id = ?';
    db.query(sql, [nome, email, senha, ra, req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Professor atualizado com sucesso!' });
    });
});

// Rota para deletar um professor
app.delete('/professores/:id', (req, res) => {
    const sql = 'DELETE FROM professores WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Professor deletado com sucesso!' });
    });
});

// Rota Cadastro de Professores

app.post('/cadastrarprofessor', (req, res) => {
    const { nome, email, senha, ra } = req.body;
    console.log(req.body);
    const sql = 'INSERT INTO professores (nome, email, senha, ra) VALUES (?, ?, ?, ?)';
    db.query(sql, [nome, email, senha, ra], (err, result) => {
        if (err) throw err;
        res.redirect('./teacher');
    });
});


