const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// POST /api/clientes/sync-google
const syncGoogleCliente = async (req, res) => {
  try {
    const { email, nombre } = req.body;

    if (!email) return res.status(400).json({ error: 'Email requerido' });

    // Buscar si ya existe en tu BD
    const cliente = await prisma.cliente.findUnique({ where: { email } });

    if (!cliente) {
      // No existe → no permitir ingreso
      return res.status(404).json({ 
        error: 'No tienes una cuenta registrada. Por favor regístrate primero.' 
      });
    }

    // Existe → devolver datos
    const { password: _, ...clienteSinPassword } = cliente;
    res.json(clienteSinPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar cliente' });
  }
};

// Verificar cliente por celular (para checkout)
const getClienteByCelular = async (req, res) => {
  try {
    const { celular } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { celular }
    });

    if (!cliente) return res.status(404).json({ existe: false });
    res.json({ existe: true, cliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar cliente" });
  }
};

// Registro de cliente
const registerCliente = async (req, res) => {
  try {
    const { nombre, apellido, celular, email, password, direccion } = req.body;

    // Validaciones
    if (!nombre || !celular || !email || !password) {
      return res.status(400).json({ error: "Nombre, celular, email y contraseña son obligatorios" });
    }

    // Validar que sea Gmail
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: "Solo se aceptan correos Gmail (@gmail.com)" });
    }

    // Validar contraseña fuerte
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!regexPassword.test(password)) {
      return res.status(400).json({ 
        error: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo" 
      });
    }

    if (celular.length !== 9) {
      return res.status(400).json({ error: "El celular debe tener 9 dígitos" });
    }

    // Verificar si ya existe
    const existeEmail = await prisma.cliente.findUnique({ where: { email } });
    if (existeEmail) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const existeCelular = await prisma.cliente.findUnique({ where: { celular } });
    if (existeCelular) {
      return res.status(400).json({ error: "El celular ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        apellido: apellido || '',
        celular,
        email,
        password: hashedPassword,
        direccion: direccion || null,
      }
    });

    // No devolver la contraseña
    const { password: _, ...clienteSinPassword } = cliente;
    res.status(201).json(clienteSinPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar cliente" });
  }
};



// Login de cliente
const loginCliente = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    const cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    if (!cliente.password) {
      return res.status(401).json({ error: "Esta cuenta no tiene contraseña configurada" });
    }

    const passwordValida = await bcrypt.compare(password, cliente.password);
    if (!passwordValida) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // No devolver la contraseña
    const { password: _, ...clienteSinPassword } = cliente;
    res.json({ mensaje: "Login exitoso", cliente: clienteSinPassword });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// Crear o actualizar cliente (para checkout sin cuenta)
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

module.exports = { getClienteByCelular, registerCliente, loginCliente, upsertCliente, syncGoogleCliente   };