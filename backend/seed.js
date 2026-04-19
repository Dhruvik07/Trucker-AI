import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Clearing old data...");
    await prisma.trucker.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.alert.deleteMany({});

    console.log("Generating 100 mock drivers near Tempe...");
    const baseLat = 33.4255;
    const baseLng = -111.9400;

    for (let i = 1; i <= 100; i++) {
        const isAvailable = Math.random() > 0.3;
        const hasVehicle = Math.random() > 0.05;

        const latOffset = (Math.random() - 0.5) * 0.8;
        const lngOffset = (Math.random() - 0.5) * 0.8;

        const names = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const randomName = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

        const isOldDriver = Math.random() > 0.8;
        const maxDistance = isOldDriver ? Math.floor(Math.random() * 50 + 20) : Math.floor(Math.random() * 2000 + 300);

        const vehicleId = hasVehicle ? `TRK-${String(i).padStart(3, '0')}` : null;

        if (vehicleId) {
            await prisma.vehicle.create({
                data: { id: vehicleId }
            });
        }

        await prisma.trucker.create({
            data: {
                id: `D-${String(i).padStart(3, '0')}`,
                name: randomName,
                hosRemaining: Number((Math.random() * 11 + 1).toFixed(1)),
                status: isAvailable ? 'AVAILABLE' : 'ON_SHIFT',
                specialties: ['LONG_HAUL', 'LOCAL_ONLY', 'HAZMAT', 'FLATBED', 'REFRIGERATED'].sort(() => 0.5 - Math.random()).slice(0, 2).join(','),
                rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
                maxDistancePreference: maxDistance,
                isVeteran: isOldDriver,
                currentLat: hasVehicle ? baseLat + latOffset : null,
                currentLng: hasVehicle ? baseLng + lngOffset : null,
                vehicleId: vehicleId
            }
        });
    }

    console.log("Seeding Alerts...");
    await prisma.alert.createMany({
        data: [
            { id: 'ALT-101', type: 'IDLE_TIME', severity: 'WARNING', message: 'TRK-012 stationary for > 15 minutes. Dispatcher check required.', driver: 'Mary Johnson' },
            { id: 'ALT-102', type: 'SOS_STOLEN', severity: 'CRITICAL', message: 'APP ALERT: TRK-044 flagged STOLEN by Driver. Location live linked to authorities.', driver: 'David Smith' },
            { id: 'ALT-103', type: 'SPEED_DROP', severity: 'CRITICAL', message: 'TRK-078 speed dropped aggressively from 65mph to 0mph. Potential Accident.', driver: 'Jessica Davis' }
        ]
    });

    console.log("Database seeded successfully!");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
