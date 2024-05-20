const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
// ... outras importações
const unidecode = require('unidecode');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const filename = unidecode(Date.now() + '-' + file.originalname);
        cb(null, filename);
    },
    encoding: 'utf-8'
});

const upload = multer({ storage: storage });

// Configuração de sessão
app.use(session({
    secret: 'seu_segredo',
    resave: false,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'iftm',
    database: 'iftm'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados');
});

// Rota para cadastrar usuário
app.post('/cadastrar', upload.single('foto_perfil'), (req, res) => {
    const { nome, email, senha, userType, ra } = req.body;
    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

    // Hash da senha
    bcrypt.hash(senha, 10, (err, hash) => {
        if (err) {
            console.error('Erro ao gerar hash da senha:', err);
            return res.status(500).send('Erro interno no servidor.');
        }

        try {
            if (userType === 'aluno') {
                const sql = 'INSERT INTO alunos (nome, email, senha, foto_perfil) VALUES (?, ?, ?, ?)';
                db.query(sql, [nome, email, hash, fotoPerfil], (err, result) => {
                    if (err) {
                        console.error('Erro ao cadastrar aluno:', err);
                        return res.status(500).send('Erro ao cadastrar aluno.');
                    }
                    // Inicie a sessão do aluno
                    req.session.userId = result.insertId;
                    req.session.userType = 'aluno';
                    res.redirect('/student');
                });
            } else if (userType === 'professor') {
                const sql = 'INSERT INTO professores (nome, email, senha, ra, foto_perfil) VALUES (?, ?, ?, ?, ?)';
                db.query(sql, [nome, email, hash, ra, fotoPerfil], (err, result) => {
                    if (err) {
                        console.error('Erro ao cadastrar professor:', err);
                        return res.status(500).send('Erro ao cadastrar professor.');
                    }
                    // Inicie a sessão do professor
                    req.session.userId = result.insertId;
                    req.session.userType = 'professor';
                    res.redirect('/teacher');
                });
            } else {
                res.status(400).send('Tipo de usuário inválido.');
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            res.status(500).send('Erro interno no servidor.');
        }
    });
});

// Rotas para buscar dados do usuário
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

app.get('/api/professor', (req, res) => {
    if (req.session.userId && req.session.userType === 'professor') {
        const sql = 'SELECT * FROM professores WHERE id = ?';
        db.query(sql, [req.session.userId], (err, result) => {
            if (err) throw err;
            res.json(result[0]); // Retorna os dados do professor
        });
    } else {
        res.status(401).send('Não autorizado'); // Usuário não logado ou não é professor
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
    res.render('login');  // O nome do arquivo EJS na pasta de visualizações
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

// Rotas para renderizar as páginas (student e teacher)
app.get('/student', (req, res) => {
    if (req.session.userId && req.session.userType === 'aluno') {
        res.render('student');
    } else {
        res.redirect('/'); // Redireciona para o login se não estiver logado como aluno
    }
});

app.get('/teacher', (req, res) => {
    if (req.session.userId && req.session.userType === 'professor') {
        res.render('teacher');
    } else {
        res.redirect('/'); // Redireciona para o login se não estiver logado como professor
    }
});

app.get('/index', (req, res) => {
    res.render('index');
});

// Rota para a página de edição de perfil
app.get('/editar', (req, res) => {
    if (req.session.userId) {
        const tabela = req.session.userType === 'aluno' ? 'alunos' : 'professores';
        const sql = `SELECT * FROM ${tabela} WHERE id = ?`;
        db.query(sql, [req.session.userId], (err, result) => {
            if (err) {
                console.error('Erro ao buscar dados do usuário:', err);
                return res.status(500).send('Erro interno no servidor');
            }
            // Verifica se o usuário foi encontrado
            if (result.length === 0) {
                return res.status(404).send('Usuário não encontrado');
            }

            res.render('editar', { usuario: result[0] }); // Passa o usuário para o template
        });
    } else {
        res.redirect('/'); // Redireciona para o login se não estiver logado
    }
});

// Rota para editar perfil do usuário
// ... (outras configurações)

// Rota para editar perfil do usuário
app.post('/editar', upload.single('foto_perfil'), (req, res) => {
    const { nome, email, senha } = req.body;
    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

    const tabela = req.session.userType === 'aluno' ? 'alunos' : 'professores';
    const id = req.session.userId;

    // Declara formData fora do escopo da função atualizarUsuario
    let formData = { nome, email };

    if (fotoPerfil) {
        formData.foto_perfil = fotoPerfil;
    }

    // Hash da senha (se fornecida)
    if (senha) {
        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) throw err;
            formData.senha = hash; // Adiciona a senha hasheada ao formData
            atualizarUsuario(formData);
        });
    } else {
        atualizarUsuario(formData); // Chama a função mesmo sem nova senha
    }

    function atualizarUsuario(formData) {
        const sql = `UPDATE ${tabela} SET ? WHERE id = ?`;
        db.query(sql, [formData, id], (err, result) => {
            if (err) throw err;
            res.redirect('/'); // Redireciona para o login após a edição
        });
    }
});

// Rota de login
app.post('/login', (req, res) => {
    const { email, senha, userType } = req.body;
    const ra = userType === 'professor' ? req.body.ra : null;

    const tabela = userType === 'professor' ? 'professores' : 'alunos';
    const campoId = userType === 'professor' ? 'ra' : 'email';

    const sql = `SELECT * FROM ${tabela} WHERE ${campoId} = ?`;
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).send('Erro interno no servidor.');
        }

        if (results.length === 0) {
            return res.status(401).send('Credenciais inválidas.');
        }

        const usuario = results[0];

        bcrypt.compare(senha, usuario.senha, (err, result) => {
            if (err) {
                console.error('Erro ao comparar senhas:', err);
                return res.status(500).send('Erro interno no servidor.');
            }

            if (result) {
                req.session.userId = usuario.id;
                req.session.userType = userType;
                res.redirect(`/${userType}`);
            } else {
                res.status(401).send('Credenciais inválidas.');
            }
        });
    });
});

// Rota de logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            res.status(500).send('Erro interno no servidor.');
        } else {
            res.redirect('/'); // Redireciona para a página de login após o logout
        }
    });
});
