const { Router } = require('express');
const { getFacturas } = require('../controllers/facturas.controller');

const router = Router();

router.get('/', getFacturas);

module.exports = router;
