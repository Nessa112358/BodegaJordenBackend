const prisma = require('../lib/prisma');

// GET /api/promociones — todas las promociones activas
const getPromociones = async (req, res) => {
  try {
    const ahora = new Date();
    const promociones = await prisma.promocampana.findMany({
      where: {
        fincio: { lte: ahora },  // ya empezó
        ffin:   { gte: ahora },  // aún no termina
      }
    });
    res.json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las promociones" });
  }
};

// GET /api/promociones/banners — solo promociones con imagen (para el carrusel)
const getBanners = async (req, res) => {
  try {
    const ahora = new Date();
    const banners = await prisma.promocampana.findMany({
      where: {
        fincio:    { lte: ahora },
        ffin:      { gte: ahora },
        imagenurl: { not: null },
      },
      select: {
        idpromo:     true,
        descripcion: true,
        imagenurl:   true,
        desctporcen: true,
        codigourl:   true,
      }
    });
    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los banners" });
  }
};

// POST /api/promociones — crear una promoción nueva
const createPromocion = async (req, res) => {
  try {
    const { descripcion, codigourl, desctporcen, fincio, ffin, imagenurl } = req.body;

    if (!descripcion || !codigourl || !desctporcen || !fincio || !ffin) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const promo = await prisma.promocampana.create({
      data: {
        descripcion,
        codigourl,
        desctporcen,
        fincio:    new Date(fincio),
        ffin:      new Date(ffin),
        imagenurl: imagenurl || null,
      }
    });

    res.status(201).json(promo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la promoción" });
  }
};

module.exports = { getPromociones, getBanners, createPromocion };