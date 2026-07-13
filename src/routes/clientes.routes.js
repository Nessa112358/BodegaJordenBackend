const { Router } = require('express');
const { getClienteByCelular, registerCliente, loginCliente, upsertCliente } = require('../controllers/clientes.controller');

const router = Router();

router.post('/login', loginCliente);
router.post('/register', registerCliente);
router.post('/', upsertCliente);
router.get('/:celular', getClienteByCelular);

module.exports = router;