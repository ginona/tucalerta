import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const localities = [
  // Gran San Miguel de Tucumán
  { name: 'San Miguel de Tucumán', latitude: -26.8083, longitude: -65.2176, province: 'tucuman' },
  { name: 'Yerba Buena', latitude: -26.8167, longitude: -65.3167, province: 'tucuman' },
  { name: 'Tafí Viejo', latitude: -26.7333, longitude: -65.2667, province: 'tucuman' },
  { name: 'Banda del Río Salí', latitude: -26.8333, longitude: -65.1833, province: 'tucuman' },
  { name: 'Las Talitas', latitude: -26.7667, longitude: -65.2, province: 'tucuman' },
  { name: 'Alderetes', latitude: -26.8167, longitude: -65.1333, province: 'tucuman' },
  { name: 'El Manantial', latitude: -26.838, longitude: -65.305, province: 'tucuman' },
  { name: 'San Pablo', latitude: -26.875, longitude: -65.3, province: 'tucuman' },
  { name: 'Cevil Redondo', latitude: -26.85, longitude: -65.1667, province: 'tucuman' },
  { name: 'Lastenia', latitude: -26.8333, longitude: -65.15, province: 'tucuman' },
  { name: 'Delfín Gallo', latitude: -26.8, longitude: -65.15, province: 'tucuman' },
  { name: 'Colombres', latitude: -26.7833, longitude: -65.1167, province: 'tucuman' },
  { name: 'Los Pocitos', latitude: -26.75, longitude: -65.2333, province: 'tucuman' },
  { name: 'Villa Carmela', latitude: -26.75, longitude: -65.25, province: 'tucuman' },
  { name: 'El Cadillal', latitude: -26.6333, longitude: -65.2, province: 'tucuman' },
  { name: 'San Javier', latitude: -26.7833, longitude: -65.3667, province: 'tucuman' },
  { name: 'Villa Nougués', latitude: -26.85, longitude: -65.3667, province: 'tucuman' },
  // Lules y alrededores
  { name: 'Lules', latitude: -26.9333, longitude: -65.3333, province: 'tucuman' },
  { name: 'San Isidro de Lules', latitude: -26.9167, longitude: -65.3, province: 'tucuman' },
  { name: 'La Reducción', latitude: -26.95, longitude: -65.3167, province: 'tucuman' },
  // Sur de Tucumán
  { name: 'Famaillá', latitude: -27.05, longitude: -65.4, province: 'tucuman' },
  { name: 'Monteros', latitude: -27.1667, longitude: -65.5, province: 'tucuman' },
  { name: 'Concepción', latitude: -27.3439, longitude: -65.5897, province: 'tucuman' },
  { name: 'Aguilares', latitude: -27.4333, longitude: -65.6167, province: 'tucuman' },
  { name: 'Simoca', latitude: -27.2667, longitude: -65.35, province: 'tucuman' },
  { name: 'Juan Bautista Alberdi', latitude: -27.5833, longitude: -65.6167, province: 'tucuman' },
  { name: 'La Cocha', latitude: -27.7667, longitude: -65.5833, province: 'tucuman' },
  { name: 'Bella Vista', latitude: -27.0333, longitude: -65.3, province: 'tucuman' },
  // Norte y Oeste
  { name: 'Tafí del Valle', latitude: -26.85, longitude: -65.7167, province: 'tucuman' },
  { name: 'Raco', latitude: -26.6667, longitude: -65.3833, province: 'tucuman' },
  { name: 'Trancas', latitude: -26.2333, longitude: -65.2833, province: 'tucuman' },
  { name: 'San Pedro de Colalao', latitude: -26.2333, longitude: -65.4833, province: 'tucuman' },
  { name: 'Burruyacú', latitude: -26.5, longitude: -64.75, province: 'tucuman' },
];

export async function main() {
  console.log('🌱 Iniciando seed de localidades de Tucumán...\n');

  for (const locality of localities) {
    const created = await prisma.locality.upsert({
      where: { name: locality.name },
      update: {
        latitude: locality.latitude,
        longitude: locality.longitude,
      },
      create: locality,
    });
    console.log(`  ✓ ${created.name} (${created.latitude}, ${created.longitude})`);
  }

  console.log(`\n✅ Seed completado: ${localities.length} localidades creadas/actualizadas`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
