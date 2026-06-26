require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('📂 Leyendo archivo Excel...');

  // Leer el archivo Excel
  const workbook = XLSX.readFile(path.join(__dirname, 'Detalle_de_Articulos_act.xlsx'));
  const sheet = workbook.Sheets['datos_act'];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log(`📊 Total de filas encontradas: ${rows.length}`);

  // ═══════════════════════════════════════
  // PASO 1: Cargar CATEGORÍAS únicas
  // ═══════════════════════════════════════
  console.log('\n1️⃣  Cargando categorías...');

  // Extraer categorías únicas del Excel
  const categoriasUnicas = [];
  const categoriasVistas = new Set();

  for (const row of rows) {
    const codlin = parseInt(row.codlin);
    const deslin = row.deslin?.toString().trim();

    if (codlin && deslin && !categoriasVistas.has(codlin)) {
      categoriasVistas.add(codlin);
      categoriasUnicas.push({ codlin, deslin });
    }
  }

  // Insertar categorías (si ya existen, las omite)
  for (const cat of categoriasUnicas) {
    await prisma.categoria.upsert({
      where: { idcategoria: cat.codlin },
      update: {},
      create: {
        idcategoria: cat.codlin,
        codlin: cat.codlin,
        deslin: cat.deslin,
      },
    });
  }
  console.log(`   ✅ ${categoriasUnicas.length} categorías cargadas`);

  // ═══════════════════════════════════════
  // PASO 2: Cargar MEDIDAS únicas
  // ═══════════════════════════════════════
  console.log('\n2️⃣  Cargando medidas...');

  const medidasUnicas = [];
  const medidasVistas = new Set();
  let idMedida = 1;

  for (const row of rows) {
    const codmed = row.codmed?.toString().trim();
    const desmed = row.desmed?.toString().trim();

    if (codmed && desmed && !medidasVistas.has(codmed)) {
      medidasVistas.add(codmed);
      medidasUnicas.push({ idmedida: idMedida++, codmed, desmed });
    }
  }

  for (const med of medidasUnicas) {
    await prisma.medidas.upsert({
      where: { idmedida: med.idmedida },
      update: {},
      create: {
        idmedida: med.idmedida,
        codmed: med.codmed,
        desmed: med.desmed,
      },
    });
  }
  console.log(`   ✅ ${medidasUnicas.length} medidas cargadas`);

  // ═══════════════════════════════════════
  // PASO 3: Cargar PRODUCTOS
  // ═══════════════════════════════════════
  console.log('\n3️⃣  Cargando productos...');

  // Mapa de codmed → idmedida para buscar rápido
  const mapaMedidas = {};
  for (const med of medidasUnicas) {
    mapaMedidas[med.codmed] = med.idmedida;
  }

  // Mapa de codlin → idcategoria
  const mapaCategorias = {};
  for (const cat of categoriasUnicas) {
    mapaCategorias[cat.codlin] = cat.codlin;
  }

  let cargados = 0;
  let errores = 0;

  for (const row of rows) {
    try {
      const codlin = parseInt(row.codlin);
      const codmed = row.codmed?.toString().trim();
      const idcategoria = mapaCategorias[codlin];
      const idUnidadMedida = mapaMedidas[codmed];

      if (!idcategoria || !idUnidadMedida) {
        console.log(`   ⚠️  Fila omitida (sin categoría o medida): ${row.nomart}`);
        errores++;
        continue;
      }

      // Convertir fecha Excel (número) a Date
      const fechaExcel = row.fecreg;
      const fecha = typeof fechaExcel === 'number'
        ? new Date(Math.round((fechaExcel - 25569) * 86400 * 1000))
        : new Date();

      await prisma.producto.upsert({
        where: { idproducto: parseInt(row.num_art) },
        update: {},
        create: {
          idproducto:     parseInt(row.num_art),
          nomart:         row.nomart?.toString().trim(),
          nroart:         parseInt(row.nroart) || 0,
          codbar:         row.codbar?.toString().trim() || null,
          preven:         parseFloat(row.prevta) || 0,
          valcom:         parseFloat(row.valcom) || 0,
          precom:         parseFloat(row.precom) || 0,
          stock:          parseInt(row.stock) || 0,
          stockMinimo:    10,
          activo:         true,
          idcategoria,
          idUnidadMedida,
          fereg:          fecha,
        },
      });
      cargados++;
    } catch (error) {
      console.log(`   ❌ Error en fila ${row.num_art}: ${error.message}`);
      errores++;
    }
  }

  console.log(`   ✅ ${cargados} productos cargados`);
  if (errores > 0) console.log(`   ⚠️  ${errores} filas con errores`);

  console.log('\n🎉 ¡Carga completada!');
}

main()
  .catch((e) => {
    console.error('❌ Error general:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
