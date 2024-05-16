const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'iftm',
  password: 'iftm',
  database: 'iftm',
  connectTimeout: 30000 // 30 segundos
});

app.post('/register', (req, res) => {
  const { nome, email, senha, userType } = req.body;

  connection.query(
    'INSERT INTO users (nome, email, senha, userType) VALUES (?, ?, ?, ?)',
    [nome, email, senha, userType],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send('Erro ao registrar o usuário');
      } else {
        res.status(200).send('Usuário registrado com sucesso!');
      }
    }
  );
});

// Crie uma rota de teste
app.get('/test', (req, res) => {
  // Tente fazer uma consulta ao banco de dados
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      // Se houver um erro, envie-o como resposta
      res.send('Erro ao conectar ao banco de dados: ' + err);
    } else {
      // Se a consulta for bem-sucedida, envie o resultado como resposta
      res.send('Resultado da consulta: ' + JSON.stringify(results));
    }
  });
});

app.listen(3000, () => {
  console.log('API rodando na porta 3306');
});





