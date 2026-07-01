const prisma = require('../lib/prisma');

const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
};

module.exports = {
  getClientes
};
