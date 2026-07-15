require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('📂 Leyendo archivo Excel...');

  const workbook = XLSX.readFile(path.join(__dirname, 'Detalle_Articulos.xlsx'));
  const sheet = workbook.Sheets['productos'];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log(`📊 Total de filas encontradas: ${rows.length}`);

  // 1️⃣ CARGANDO CATEGORÍAS
  console.log('\n1️⃣  Cargando categorías...');
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
  for (const cat of categoriasUnicas) {
    await prisma.categoria.upsert({
      where: { idcategoria: cat.codlin },
      update: { deslin: cat.deslin },
      create: { idcategoria: cat.codlin, codlin: cat.codlin.toString(), deslin: cat.deslin },
    });
  }
  console.log(`   ✅ ${categoriasUnicas.length} categorías procesadas/cargadas`);

  // 2️⃣ CARGANDO MEDIDAS (Aquí aseguramos la coincidencia exacta)
  console.log('\n2️⃣  Cargando medidas...');
  const medidasUnicas = [];
  const medidasVistas = new Set();
  for (const row of rows) {
    const codmed = parseInt(row.codmed);
    const desmed = row.desmed?.toString().trim();
    if (codmed && desmed && !medidasVistas.has(codmed)) {
      medidasVistas.add(codmed);
      medidasUnicas.push({ idmedida: codmed, codmed: codmed.toString(), desmed });
    }
  }
  for (const med of medidasUnicas) {
    await prisma.medidas.upsert({
      where: { idmedida: med.idmedida },
      update: { desmed: med.desmed, codmed: med.codmed }, // Aseguramos que actualice ambos campos
      create: { idmedida: med.idmedida, codmed: med.codmed, desmed: med.desmed },
    });
  }
  console.log(`   ✅ ${medidasUnicas.length} unidades de medida procesadas/cargadas`);

  // 3️⃣ CARGANDO MARCAS
  console.log('\n3️⃣  Cargando marcas...');
  const marcasUnicas = [];
  const marcasVistas = new Set();
  for (const row of rows) {
    const descripcion = row.marca?.toString().trim();
    if (descripcion && !marcasVistas.has(descripcion)) {
      marcasVistas.add(descripcion);
      marcasUnicas.push({ descripcion });
    }
  }
  const mapaMarcas = {};
  for (const mar of marcasUnicas) {
    const existing = await prisma.marca.findFirst({ where: { descripcion: mar.descripcion } });
    if (existing) {
      mapaMarcas[mar.descripcion] = existing.idmarca;
    } else {
      const nueva = await prisma.marca.create({ data: { descripcion: mar.descripcion } });
      mapaMarcas[mar.descripcion] = nueva.idmarca;
    }
  }
  console.log(`   ✅ ${marcasUnicas.length} marcas procesadas/cargadas`);

  // 4️⃣ LIMPIAR PRODUCTOS VIEJOS (Evita errores de claves duplicadas de ejecuciones previas)
  console.log('\n4️⃣  Limpiando productos anteriores...');
  await prisma.producto.deleteMany({});
  console.log('   ✅ Productos anteriores eliminados');

  // 5️⃣ CARGAR PRODUCTOS Y ASOCIAR LLAVES FORÁNEAS
  console.log('\n5️⃣  Cargando productos...');
  let cargados = 0;
  let errores = 0;

  for (const row of rows) {
    try {
      const codlin = parseInt(row.codlin);
      const codmed = parseInt(row.codmed);
      const marcaNombre = row.marca?.toString().trim();
      
      const idcategoria = codlin;
      const idUnidadMedida = codmed; // Este ID coincide exactamente con el "idmedida" insertado arriba
      const idMarca = mapaMarcas[marcaNombre] || null;

      if (!idcategoria || !idUnidadMedida) { 
        errores++; 
        continue; 
      }

      const fecha = row.fecreg instanceof Date ? row.fecreg : new Date();

      await prisma.producto.create({
        data: {
          idproducto:     parseInt(row.num_art),
          nomart:         row.nomart?.toString().trim(),
          nroart:         parseInt(row.nroart) || 0,
          codbar:         row.codbar?.toString().trim() || null,
          preven:         parseFloat(row.preven) || 0,
          valcom:         parseFloat(row.valcom) || 0,
          precom:         parseFloat(row.precom) || 0,
          stock:          parseInt(row.stock) || 0,
          stockMinimo:    10,
          activo:         row.activo === true || row.activo === 1,
          idcategoria,
          idUnidadMedida, // Conexión directa a la relación foránea
          idMarca,
          fereg:          fecha,
        },
      });
      cargados++;
    } catch (error) {
      console.log(`   ❌ Error en fila del artículo (num_art) ${row.num_art}: ${error.message}`);
      errores++;
    }
  }

  console.log(`\n   ✅ ${cargados} productos guardados exitosamente.`);
  if (errores > 0) console.log(`   ⚠️  ${errores} filas fueron omitidas por errores de datos.`);
  console.log('\n🎉 ¡Proceso de migración completado con éxito!');
}

main()
  .catch(e => { console.error('❌ Error crítico en la ejecución:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });