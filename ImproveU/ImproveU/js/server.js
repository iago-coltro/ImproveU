// Import
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// Config JSON
app.use(express.json())

// Models
const User = require('./models/User')


// Rota Publica
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Bem vindo a nossa API!' })
})


// Register User
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body

    // Validations
    if (!name) {
        return res.status(422).json({ msg: 'O nome é obrigatório!' })
        
    }
})


// Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS


// Conexão ao Banco
mongoose
    .connect(
        `mongodb+srv://${dbUser}:${dbPassword}@improveu.usih3g2.mongodb.net/?retryWrites=true&w=majority&appName=ImproveU`,
    )
    .then(() => {
        app.listen(3000)
        console.log('Conectou ao Banco!!')
    })
    .catch((err) => console.log(err))




