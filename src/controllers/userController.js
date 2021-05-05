const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.use(authMiddleware);

router.get('/usuarios', async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    if (admin.level != 999) {
      return res.status(401).send({ error: 'Usuário não autorizado' });
    }
    const users = await User.find({
      $or: [
        {
          level: 0,
        },
        {
          level: 1,
        },
      ],
    });

    return res.send({ users });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: 'Erro ao listar usuários' });
  }
});
router.get('/:idUser', async function (req, res) {
  try {
    const usuario = await User.findById(req.params.idUser);
    return res.send({ usuario });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: 'Erro ao listar usuário' });
  }
});
router.put('/update/:idUser', async function (req, res) {
  try {
    const newData = req.body;
    //atualizando e retornando usuario atualizado
    if (newData.password)
      newData.password = await bcrypt.hashSync(req.body.password, 10);
    const usuario = await User.findByIdAndUpdate(req.params.idUser, newData, {
      new: true,
    });

    await usuario.save();
    return res.send({ usuario });
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Erro ao atualizar usuário!' });
  }
});

router.put('/update/DesativarUsuario/:idUser', async function (req, res) {
  try {
    const newData = req.body;
    //atualizando e retornando usuario atualizado
    if (newData.password)
      newData.password = await bcrypt.hashSync(req.body.password, 10);
    const usuario = await User.findByIdAndUpdate(req.params.idUser, {
      level: 0,
    });
    await usuario.save();
    return res.send({ usuario });
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Erro ao atualizar usuário!' });
  }
});
router.put('/update/AtivarUsuario/:idUser', async function (req, res) {
  try {
    const newData = req.body;
    //atualizando e retornando usuario atualizado
    if (newData.password)
      newData.password = await bcrypt.hashSync(req.body.password, 10);
    const usuario = await User.findByIdAndUpdate(req.params.idUser, {
      level: 1,
    });
    await usuario.save();
    return res.send({ usuario });
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Erro ao atualizar usuário!' });
  }
});

router.delete('/:userId', async function (req, res) {
  try {
    const admin = await User.findById(req.userId);
    if (admin.level !== 999) {
      return res.send({ error: 'Sem autorização de exclusão' });
    }
    await User.findByIdAndDelete(req.params.userId);
    return res.send();
  } catch (err) {
    return res.send({ error: 'Erro ao deletar usuário!' });
  }
});

module.exports = (app) => app.use('/user', router);
