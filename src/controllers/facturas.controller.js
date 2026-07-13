const prisma = require('../lib/prisma');

const createFactura = async (req, res) => {
  try {
    const { idcliente, productos, idpago, idpromocion } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    const resultado = await prisma.$transaction(async (tx) => {

      // Validar stock y calcular total
      let total = 0;
      const detalles = [];

      for (const item of productos) {
        const producto = await tx.producto.findUnique({
          where: { idproducto: item.idproducto }
        });

        if (!producto) throw new Error(`Producto ID ${item.idproducto} no existe`);
        if (!producto.activo) throw new Error(`"${producto.nomart}" no está disponible`);
        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para "${producto.nomart}". Disponible: ${producto.stock}`);
        }

        const subtotal = Number(producto.preven) * item.cantidad;
        total += subtotal;
        detalles.push({
          idproducto:     producto.idproducto,
          cantidad:       item.cantidad,
          preciounitario: producto.preven,
        });
      }

      // Crear factura
      const factura = await tx.factura.create({
        data: {
          total,
          estadopago:  'pendiente',
          idcliente,
          idpago:      idpago || 1,
          idpromocion: idpromocion || null,
        }
      });

      // Crear detalles y descontar stock
      for (const detalle of detalles) {
        await tx.detallefactura.create({
          data: {
            idfactura:      factura.idfactura,
            idproducto:     detalle.idproducto,
            cantidad:       detalle.cantidad,
            preciounitario: detalle.preciounitario,
          }
        });

        await tx.producto.update({
          where: { idproducto: detalle.idproducto },
          data:  { stock: { decrement: detalle.cantidad } }
        });
      }

      return factura;
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Error al crear la factura" });
  }
};

module.exports = { createFactura };