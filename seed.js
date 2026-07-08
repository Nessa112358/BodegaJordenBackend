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

  // PASO 1: Categorías
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
      create: { idcategoria: cat.codlin, codlin: cat.codlin, deslin: cat.deslin },
    });
  }
  console.log(`   ✅ ${categoriasUnicas.length} categorías cargadas`);

  // PASO 2: Medidas
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
      update: { desmed: med.desmed },
      create: { idmedida: med.idmedida, codmed: med.codmed, desmed: med.desmed },
    });
  }
  console.log(`   ✅ ${medidasUnicas.length} medidas cargadas`);

  // PASO 3: Marcas
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
  console.log(`   ✅ ${marcasUnicas.length} marcas cargadas`);

  // PASO 4: Limpiar productos viejos
  console.log('\n4️⃣  Limpiando productos anteriores...');
  await prisma.producto.deleteMany({});
  console.log('   ✅ Productos anteriores eliminados');

  // PASO 5: Cargar productos
  console.log('\n5️⃣  Cargando productos...');
  let cargados = 0;
  let errores = 0;

  for (const row of rows) {
    try {
      const codlin = parseInt(row.codlin);
      const codmed = parseInt(row.codmed);
      const marcaNombre = row.marca?.toString().trim();
      const idcategoria = codlin;
      const idUnidadMedida = codmed;
      const idMarca = mapaMarcas[marcaNombre] || null;

      if (!idcategoria || !idUnidadMedida) { errores++; continue; }

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
          idUnidadMedida,
          idMarca,
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
  .catch(e => { console.error('❌ Error general:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
