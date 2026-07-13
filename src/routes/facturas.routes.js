const { Router } = require('express');
const { createFactura } = require('../controllers/facturas.controller');

const router = Router();

router.post('/', createFactura);

module.exports = router;