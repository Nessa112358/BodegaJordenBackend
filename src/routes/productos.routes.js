const { Router } = require('express');
const {
  getProductos,
  getProductoById,
  getProductosByCategoria,
  createProducto,
  getCategorias,
  getProductosByMarca,  // ← agregar esto
} = require('../controllers/productos.controller');

const router = Router();

router.get('/categorias', getCategorias);
router.get('/categoria/:id', getProductosByCategoria);
router.get('/marca/:id', getProductosByMarca);        // ← mover ANTES de /:id
router.get('/:id', getProductoById);
router.get('/', getProductos);
router.post('/', createProducto);

module.exports = router;