const prisma = require('../lib/prisma');

// Buscar cliente por celular
const getClienteByCelular = async (req, res) => {
  try {
    const { celular } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { celular }
    });

    if (!cliente) {
      return res.status(404).json({ existe: false });
    }

    res.json({ existe: true, cliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar cliente" });
  }
};

// Crear o actualizar cliente
const upsertCliente = async (req, res) => {
  try {
    const { nombre, apellido, celular, direccion } = req.body;

    if (!nombre || !celular) {
      return res.status(400).json({ error: "Nombre y celular son obligatorios" });
    }

    const cliente = await prisma.cliente.upsert({
      where: { celular },
      update: { nombre, apellido, direccion },
      create: { nombre, apellido: apellido || '', celular, direccion },
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar cliente" });
  }
};

module.exports = { getClienteByCelular, upsertCliente };