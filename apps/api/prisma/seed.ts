import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const localities = [
  {
    name: 'San Miguel de Tucumán',
    latitude: -26.8083,
    longitude: -65.2176,
    province: 'tucuman',
  },
  {
    name: 'Yerba Buena',
    latitude: -26.8167,
    longitude: -65.3167,
    province: 'tucuman',
  },
  {
    name: 'Tafí Viejo',
    latitude: -26.7333,
    longitude: -65.2667,
    province: 'tucuman',
  },
  {
    name: 'Banda del Río Salí',
    latitude: -26.8333,
    longitude: -65.1833,
    province: 'tucuman',
  },
  {
    name: 'Las Talitas',
    latitude: -26.7667,
    longitude: -65.2,
    province: 'tucuman',
  },
  {
    name: 'Alderetes',
    latitude: -26.8167,
    longitude: -65.1333,
    province: 'tucuman',
  },
  {
    name: 'Concepción',
    latitude: -27.3439,
    longitude: -65.5897,
    province: 'tucuman',
  },
  {
    name: 'Monteros',
    latitude: -27.1667,
    longitude: -65.5,
    province: 'tucuman',
  },
  {
    name: 'Famaillá',
    latitude: -27.05,
    longitude: -65.4,
    province: 'tucuman',
  },
  {
    name: 'Aguilares',
    latitude: -27.4333,
    longitude: -65.6167,
    province: 'tucuman',
  },
  {
    name: 'Lules',
    latitude: -26.9333,
    longitude: -65.3333,
    province: 'tucuman',
  },
  {
    name: 'Simoca',
    latitude: -27.2667,
    longitude: -65.35,
    province: 'tucuman',
  },
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
