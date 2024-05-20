const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const session = require('express-session'); // Adicione o express-session para gerenciar sessões


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Para lidar com dados de formulário

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
app.post('/cadastrar', upload.single('foto_perfil'), (req, res) => {
    const { nome, email, senha, userType, ra } = req.body;
    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null; // Caminho da foto de perfil (se houver)

    if (userType === 'aluno') {
        const sql = 'INSERT INTO alunos (nome, email, senha, foto_perfil) VALUES (?, ?, ?, ?)';
        db.query(sql, [nome, email, senha, fotoPerfil], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao cadastrar aluno.');
            }
            res.redirect('/student');
        });
    } else if (userType === 'professor') {
        const sql = 'INSERT INTO professores (nome, email, senha, ra, foto_perfil) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [nome, email, senha, ra, fotoPerfil], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao cadastrar professor.');
            }
            res.redirect('/teacher');
        });
    } else {
        res.status(400).send('Tipo de usuário inválido.');
    }
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

app.get('/student', (req, res) => {
    res.render('student');
});

app.get('/teacher', (req, res) => {
    res.render('teacher');
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.get('/editar', (req, res) => {
    res.render('editar');
});


// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Configuração de sessão
app.use(session({
    secret: 'seu_segredo', // Substitua por uma string segura
    resave: false,
    saveUninitialized: true
}));

// Rotas CRUD para Alunos
app.get('/alunos', (req, res) => {
    const sql = 'SELECT * FROM alunos';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/alunos/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM alunos WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) throw err;
        res.json(results[0]); // Retorna o primeiro resultado (o aluno)
    });
});

app.put('/alunos/:id', upload.single('foto_perfil'), (req, res) => {
    const id = req.params.id;
    const { nome, email, senha } = req.body;
    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

    // Hash da senha (se fornecida)
    const updateFields = { nome, email };
    if (senha) {
        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) throw err;
            updateFields.senha = hash;
            updateAluno(updateFields, fotoPerfil);
        });
    } else {
        updateAluno(updateFields, fotoPerfil);
    }

    function updateAluno(updateFields, fotoPerfil) {
        if (fotoPerfil) {
            updateFields.foto_perfil = fotoPerfil;
        }
        const sql = 'UPDATE alunos SET ? WHERE id = ?';
        db.query(sql, [updateFields, id], (err, result) => {
            if (err) throw err;
            res.json({ message: 'Aluno atualizado com sucesso!' });
        });
    }
});

app.delete('/alunos/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM alunos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Aluno deletado com sucesso!' });
    });
});

// Rotas CRUD para Professores (semelhantes às de alunos, adapte conforme necessário)
// ...

// ... (restante do código)

// Rota para buscar dados do aluno logado
app.get('/api/aluno', (req, res) => {
    if (req.session.userId && req.session.userType === 'aluno') {
        const sql = 'SELECT * FROM alunos WHERE id = ?';
        db.query(sql, [req.session.userId], (err, result) => {
            if (err) throw err;
            res.json(result[0]); // Retorna os dados do aluno
        });
    } else {
        res.status(401).send('Não autorizado'); // Usuário não logado ou não é aluno
    }
});



