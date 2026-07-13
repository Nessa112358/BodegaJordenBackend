const prisma = require('../lib/prisma');

// GET /api/promociones — todas las promociones activas
const getPromociones = async (req, res) => {
  try {
    const ahora = new Date();
    const promociones = await prisma.promocampana.findMany({
      where: {
        fincio: { lte: ahora },
        ffin:   { gte: ahora },
      }
    });
    res.json(promociones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las promociones" });
  }
};

// GET /api/promociones/banners — promociones + combos para el carrusel
const getBanners = async (req, res) => {
  try {
    const ahora = new Date();

    const promociones = await prisma.promocampana.findMany({
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

    const combos = await prisma.producto.findMany({
      where: {
        activo:    true,
        imagenurl: { not: null },
        marca:     { descripcion: 'COMBO' }
      },
      select: {
        idproducto: true,
        nomart:     true,
        imagenurl:  true,
        preven:     true,
      },
      take: 10
    });

    const combosFormateados = combos.map(c => ({
      idpromo:     `combo-${c.idproducto}`,
      // descripcion: c.nomart,
      imagenurl:   c.imagenurl,
      desctporcen: null,
      codigourl:   null,
      precio:      Number(c.preven).toFixed(2),
      tipo:        'combo'
    }));

    const banners = [
      ...promociones.map(p => ({ ...p, tipo: 'promo' })),
      ...combosFormateados
    ];

    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los banners" });
  }
};

// POST /api/promociones — crear promoción
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