const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth.json');
const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post('/register', async (req, res) => {
  const { email } = req.body;
  const { cpf } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.send({ error: 'Email ja registrado' });
    if (await User.findOne({ cpf }))
      return res.send({ error: 'CPF ja registrado' });
    req.body.password = await bcrypt.hashSync(req.body.password, 10);
    const user = await User.create(req.body);
    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    console.log('Erro aqui deu: ', err);
    return res.send({ error: 'Registration failed' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const { usuario: usuário } = req.body;
    var user = await User.findOne({ email: usuário }).select('+password');
    if (!user) {
      user = await User.findOne({ cpf: usuário }).select('+password');
      if (!user) {
        console.log('Usuario nao encontrado ', user);
        return res.send({ error: 'Usuário não encontrado' });
      }
    }
    if (!(await bcrypt.compare(password, user.password))) {
      console.log(password);
      console.log(user);
      console.log('Senha invalida');
      return res.send({ error: 'Senha Inválida' });
    }
    if (user.level === 0) {
      console.log('Usuario Desativado');
      return res.send({ error: 'Esse usuário foi desativado' });
    }
    console.log(user);
    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (e) {
    console.log(`Deu ruim no login: ${e}`);
    return res.send({ error: 'Login deu ruim' });
  }
});
module.exports = (app) => app.use('/auth', router);
