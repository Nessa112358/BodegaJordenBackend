const prisma = require('../lib/prisma');

const getFacturas = async (req, res) => {
  try {
    const facturas = await prisma.factura.findMany();
    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las facturas" });
  }
};

module.exports = {
  getFacturas
};
