require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Imagen genérica por categoría
const IMAGEN_POR_CATEGORIA = {
  1:  'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', // LICORES
  2:  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', // BEBIDAS
  6:  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', // LACTEOS
  34: 'https://images.unsplash.com/photo-1582058091597-35b4b7e7f26b?w=400', // GOLOSINAS
  52: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', // SNACKS
};

async function main() {
  console.log('🖼️  Asignando imágenes genéricas por categoría...\n');

  // Resetear todas las imágenes primero
  await prisma.producto.updateMany({
    data: { imagenurl: null }
  });
  console.log('🔄 Imágenes anteriores limpiadas\n');

  let total = 0;

  for (const [idcategoria, imagenurl] of Object.entries(IMAGEN_POR_CATEGORIA)) {
    const resultado = await prisma.producto.updateMany({
      where: { idcategoria: parseInt(idcategoria) },
      data: { imagenurl }
    });
    console.log(`✅ ${resultado.count} productos actualizados → categoría ${idcategoria}`);
    total += resultado.count;
  }

  console.log(`\n🎉 ¡Listo! ${total} productos con imagen asignada.`);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
