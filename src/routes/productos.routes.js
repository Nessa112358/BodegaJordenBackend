const { Router } = require('express');
const {
  getProductos,
  getProductoById,
  getProductosByCategoria,
  createProducto,
  getCategorias,
  getProductosByMarca,  // ← agregar esto
  getCombos
} = require('../controllers/productos.controller');

const router = Router();

router.get('/combos', getCombos);  // ← antes de /:id
router.get('/categorias', getCategorias);
router.get('/categoria/:id', getProductosByCategoria);
router.get('/marca/:id', getProductosByMarca);        // ← mover ANTES de /:id
router.get('/:id', getProductoById);
router.get('/', getProductos);
router.post('/', createProducto);

module.exports = router;