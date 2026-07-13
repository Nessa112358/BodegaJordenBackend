const { Router } = require('express');
const { getClienteByCelular, upsertCliente } = require('../controllers/clientes.controller');

const router = Router();

router.get('/:celular', getClienteByCelular);
router.post('/', upsertCliente);

module.exports = router;