const { Router } = require('express');
const { getPromociones, getBanners, createPromocion } = require('../controllers/promociones.controller');

const router = Router();

router.get('/banners', getBanners);
router.get('/', getPromociones);
router.post('/', createPromocion);

module.exports = router;