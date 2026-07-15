const supabase = require('../lib/supabase');

const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Error al verificar token' });
  }
};

const soloAdmin = async (req, res, next) => {
  await verificarToken(req, res, async () => {
    // Verificar si es trabajador
    const prisma = require('../lib/prisma');
    const trabajador = await prisma.trabajador.findFirst({
      where: { username: req.user.email }
    });

    if (!trabajador) {
      return res.status(403).json({ error: 'Acceso denegado — solo administradores' });
    }

    req.trabajador = trabajador;
    next();
  });
};

module.exports = { verificarToken, soloAdmin };