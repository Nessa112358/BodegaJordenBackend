const { Router } = require('express');
const { getClientes } = require('../controllers/clientes.controller');

const router = Router();

router.get('/', getClientes);

module.exports = router;
