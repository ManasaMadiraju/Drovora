import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const locations = await Promise.all([
    prisma.returnLocation.upsert({ where: { id: 'loc_wf_1' }, update: {}, create: { id: 'loc_wf_1', name: 'Whole Foods Market - Downtown', type: 'whole_foods', address: '375 7th St', city: 'San Francisco', state: 'CA', zip: '94103', lat: 37.7749, lng: -122.4194, hours: 'Mon-Sun 7am-10pm' } }),
    prisma.returnLocation.upsert({ where: { id: 'loc_ups_1' }, update: {}, create: { id: 'loc_ups_1', name: 'UPS Store #4521', type: 'ups', address: '101 Market St', city: 'San Francisco', state: 'CA', zip: '94105', lat: 37.7936, lng: -122.3966, hours: 'Mon-Fri 8am-7pm, Sat 9am-5pm' } }),
    prisma.returnLocation.upsert({ where: { id: 'loc_kohl_1' }, update: {}, create: { id: 'loc_kohl_1', name: "Kohl's - Mission District", type: 'kohls', address: '2675 Geary Blvd', city: 'San Francisco', state: 'CA', zip: '94118', lat: 37.7819, lng: -122.4532, hours: 'Mon-Sat 9am-9pm, Sun 10am-8pm' } }),
    prisma.returnLocation.upsert({ where: { id: 'loc_ups_2' }, update: {}, create: { id: 'loc_ups_2', name: 'UPS Store #2210', type: 'ups', address: '3251 20th Ave', city: 'San Francisco', state: 'CA', zip: '94132', lat: 37.7283, lng: -122.4741, hours: 'Mon-Fri 8am-6:30pm, Sat 9am-4pm' } }),
    prisma.returnLocation.upsert({ where: { id: 'loc_wf_2' }, update: {}, create: { id: 'loc_wf_2', name: 'Whole Foods Market - Haight', type: 'whole_foods', address: '1765 California St', city: 'San Francisco', state: 'CA', zip: '94109', lat: 37.7908, lng: -122.4221, hours: 'Mon-Sun 7am-10pm' } }),
    prisma.returnLocation.upsert({ where: { id: 'loc_hub_1' }, update: {}, create: { id: 'loc_hub_1', name: 'Amazon Hub Counter', type: 'amazon_hub', address: '850 Market St', city: 'San Francisco', state: 'CA', zip: '94102', lat: 37.7837, lng: -122.4075, hours: 'Mon-Sun 8am-9pm' } }),
  ]);
  console.log(`Created ${locations.length} return locations`);

  const hash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({ where: { email: 'admin@drovora.com' }, update: {}, create: { name: 'Admin User', email: 'admin@drovora.com', password: hash, role: 'admin', phone: '415-555-0100' } });
  const customer = await prisma.user.upsert({ where: { email: 'customer@drovora.com' }, update: {}, create: { name: 'Jane Smith', email: 'customer@drovora.com', password: hash, role: 'customer', phone: '415-555-0101', address: '123 Main St, San Francisco, CA 94102' } });
  const driver = await prisma.user.upsert({ where: { email: 'driver@drovora.com' }, update: {}, create: { name: 'Mike Johnson', email: 'driver@drovora.com', password: hash, role: 'driver', phone: '415-555-0102' } });

  await prisma.driverLocation.upsert({ where: { driverId: driver.id }, update: {}, create: { driverId: driver.id, lat: 37.7849, lng: -122.4094, isOnline: true } });

  await prisma.pickupRequest.upsert({
    where: { id: 'req_sample_1' }, update: {},
    create: { id: 'req_sample_1', customerId: customer.id, driverId: driver.id, returnLocationId: 'loc_wf_1', pickupAddress: '123 Main St, San Francisco, CA 94102', pickupLat: 37.7749, pickupLng: -122.4194, packageCount: 2, packageDetails: JSON.stringify([{ orderId: '113-4567890-1234567', description: 'Bluetooth headphones' }, { orderId: '113-9876543-7654321', description: 'Running shoes size 10' }]), status: 'completed', paymentStatus: 'paid', baseFee: 5.99, serviceFee: 1.99, totalAmount: 7.98, pickedUpAt: new Date(Date.now() - 3600000), deliveredAt: new Date(Date.now() - 1800000), completedAt: new Date(Date.now() - 1800000) },
  });

  await prisma.pickupRequest.upsert({
    where: { id: 'req_sample_2' }, update: {},
    create: { id: 'req_sample_2', customerId: customer.id, returnLocationId: 'loc_ups_1', pickupAddress: '456 Oak Ave, San Francisco, CA 94117', packageCount: 1, packageDetails: JSON.stringify([{ orderId: '113-1111111-2222222', description: 'Kitchen blender' }]), status: 'pending', paymentStatus: 'pending', isScheduled: true, scheduledTime: new Date(Date.now() + 7200000), baseFee: 5.99, serviceFee: 1.99, totalAmount: 7.98 },
  });

  if (!await prisma.earning.findUnique({ where: { pickupRequestId: 'req_sample_1' } })) {
    await prisma.earning.create({ data: { driverId: driver.id, pickupRequestId: 'req_sample_1', amount: 5.59, status: 'paid' } });
  }
  if (!await prisma.rating.findUnique({ where: { pickupRequestId: 'req_sample_1' } })) {
    await prisma.rating.create({ data: { pickupRequestId: 'req_sample_1', fromUserId: customer.id, toUserId: driver.id, rating: 5, comment: 'Very prompt and professional!' } });
  }

  console.log('\nDemo accounts:');
  console.log('  Admin:    admin@drovora.com / password123');
  console.log('  Customer: customer@drovora.com / password123');
  console.log('  Driver:   driver@drovora.com / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
