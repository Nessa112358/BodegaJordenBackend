const { Router } = require('express');
const { getClienteByCelular, registerCliente, loginCliente, upsertCliente, syncGoogleCliente  } = require('../controllers/clientes.controller');

const router = Router();

router.post('/login', loginCliente);
router.post('/register', registerCliente);
router.post('/sync-google', syncGoogleCliente);
router.post('/', upsertCliente);
router.get('/:celular', getClienteByCelular);
router.post('/sync-google', syncGoogleCliente);

module.exports = router;