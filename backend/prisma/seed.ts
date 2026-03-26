import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.agentLocation.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.task.deleteMany();
  await prisma.routePoint.deleteMany();
  await prisma.route.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('R@shad123', 12);

  // ===== USERS =====
  const admin = await prisma.user.create({
    data: { name: 'Əhməd Məmmədov', email: 'admin@mtm.az', password: hash, role: 'SUPER_ADMIN', status: 'ACTIVE', phone: '+994501234567', region: 'Bakı' },
  });

  const manager = await prisma.user.create({
    data: { name: 'Leyla Qasımova', email: 'leyla@mtm.az', password: hash, role: 'MANAGER', status: 'ACTIVE', phone: '+994502234567', region: 'Xətai' },
  });

  const agents = await Promise.all([
    prisma.user.create({ data: { name: 'Farid Hüseynov', email: 'farid@mtm.az', password: hash, role: 'AGENT', status: 'ACTIVE', phone: '+994503234567', region: 'Binəqədi', deviceModel: 'Samsung Galaxy A34', deviceOS: 'Android 13', appVersion: 'v2.4.1' } }),
    prisma.user.create({ data: { name: 'Rəfail Əliyev', email: 'refail@mtm.az', password: hash, role: 'AGENT', status: 'ACTIVE', phone: '+994504234567', region: 'Nəsimi', deviceModel: 'iPhone 14', deviceOS: 'iOS 17.2', appVersion: 'v2.4.0' } }),
    prisma.user.create({ data: { name: 'Sərxan Yusifov', email: 'serxan@mtm.az', password: hash, role: 'AGENT', status: 'INACTIVE', phone: '+994505234567', region: 'Yasamal', deviceModel: 'Xiaomi Redmi Note 12', deviceOS: 'Android 14', appVersion: 'v2.3.5' } }),
    prisma.user.create({ data: { name: 'Nigar Hüseyinova', email: 'nigar@mtm.az', password: hash, role: 'AGENT', status: 'ACTIVE', phone: '+994506234567', region: 'Səbail', deviceModel: 'Samsung Galaxy S23', deviceOS: 'Android 14', appVersion: 'v2.4.1' } }),
    prisma.user.create({ data: { name: 'Kamran İsmayılov', email: 'kamran@mtm.az', password: hash, role: 'AGENT', status: 'ACTIVE', phone: '+994507234567', region: 'Xətai', deviceModel: 'iPhone 13', deviceOS: 'iOS 16.5', appVersion: 'v2.4.0' } }),
    prisma.user.create({ data: { name: 'Günel Əhmədova', email: 'gunel@mtm.az', password: hash, role: 'AGENT', status: 'ACTIVE', phone: '+994508234567', region: 'Nərimanov', deviceModel: 'Samsung Galaxy A54', deviceOS: 'Android 13', appVersion: 'v2.4.1' } }),
  ]);

  console.log(`✅ Created ${2 + agents.length} users`);

  // ===== CUSTOMERS =====
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Bakı Supermarket MMC', contactPerson: 'Nərimən Əlizadə', phone: '+994501234567', email: 'info@bakisupermarket.az', address: 'Bakı, Nəsimi rayon', category: 'RETAIL', status: 'ACTIVE', lat: 40.3732, lng: 49.8822 } }),
    prisma.customer.create({ data: { name: 'Azərsun Holdinq', contactPerson: 'Tahir Mammadov', phone: '+994502234567', email: 'sales@azersun.az', address: 'Bakı, Səbail rayon', category: 'WHOLESALE', status: 'ACTIVE', lat: 40.3891, lng: 49.8671 } }),
    prisma.customer.create({ data: { name: 'Bravo Supermarket', contactPerson: 'Gülnarə Kərimova', phone: '+994503234567', email: 'contact@bravo.az', address: 'Bakı, Yasamal rayon', category: 'RETAIL', status: 'ACTIVE', lat: 40.3825, lng: 49.8564 } }),
    prisma.customer.create({ data: { name: 'Neptun Mağazalar', contactPerson: 'Rəfail Hüseyinov', phone: '+994504234567', email: 'neptun@mail.az', address: 'Bakı, Xətai rayon', category: 'RETAIL', status: 'ACTIVE', lat: 40.3656, lng: 49.8899 } }),
    prisma.customer.create({ data: { name: 'Gilan Holdinq', contactPerson: 'Əhməd Sədətov', phone: '+994505234567', email: 'sales@gilan.az', address: 'Qazax şəhəri', category: 'DISTRIBUTOR', status: 'ACTIVE', lat: 40.6431, lng: 48.6564 } }),
    prisma.customer.create({ data: { name: 'Araz Market', contactPerson: 'Sərxan Cəfərov', phone: '+994508234567', email: 'araz@supermarket.az', address: 'Bakı, Səbail rayon', category: 'RETAIL', status: 'ACTIVE', lat: 40.3945, lng: 49.8632 } }),
    prisma.customer.create({ data: { name: 'Star Distribütor MMC', contactPerson: 'Kamran Əbilzadə', phone: '+994511234567', email: 'star@distributor.az', address: 'Sumqayıt şəhəri', category: 'DISTRIBUTOR', status: 'ACTIVE', lat: 40.5932, lng: 49.6818 } }),
    prisma.customer.create({ data: { name: 'MediPlus Əczaxanası', contactPerson: 'Aygün Rzayeva', phone: '+994512234567', email: 'info@mediplus.az', address: 'Bakı, Nəsimi rayon', category: 'RETAIL', status: 'ACTIVE', lat: 40.3920, lng: 49.8170 } }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // ===== ROUTES =====
  const route1 = await prisma.route.create({
    data: {
      name: 'Nəsimi Günlük',
      agentId: agents[0].id,
      date: new Date(),
      status: 'ACTIVE',
      totalPoints: 4,
      completedPoints: 2,
      points: {
        create: [
          { customerId: customers[0].id, orderIndex: 1, plannedTime: '09:00', status: 'COMPLETED', lat: customers[0].lat!, lng: customers[0].lng!, actualTime: '09:05', duration: 25 },
          { customerId: customers[2].id, orderIndex: 2, plannedTime: '10:00', status: 'COMPLETED', lat: customers[2].lat!, lng: customers[2].lng!, actualTime: '10:10', duration: 20 },
          { customerId: customers[7].id, orderIndex: 3, plannedTime: '11:30', status: 'IN_PROGRESS', lat: customers[7].lat!, lng: customers[7].lng! },
          { customerId: customers[3].id, orderIndex: 4, plannedTime: '13:00', status: 'PENDING', lat: customers[3].lat!, lng: customers[3].lng! },
        ],
      },
    },
  });

  const route2 = await prisma.route.create({
    data: {
      name: 'Xətai Həftəlik',
      agentId: agents[1].id,
      date: new Date(),
      status: 'ACTIVE',
      totalPoints: 3,
      completedPoints: 1,
      points: {
        create: [
          { customerId: customers[1].id, orderIndex: 1, plannedTime: '08:30', status: 'COMPLETED', lat: customers[1].lat!, lng: customers[1].lng!, actualTime: '08:35', duration: 30 },
          { customerId: customers[5].id, orderIndex: 2, plannedTime: '10:00', status: 'PENDING', lat: customers[5].lat!, lng: customers[5].lng! },
          { customerId: customers[4].id, orderIndex: 3, plannedTime: '14:00', status: 'PENDING', lat: customers[4].lat!, lng: customers[4].lng! },
        ],
      },
    },
  });

  console.log(`✅ Created 2 routes with points`);

  // ===== TASKS =====
  await Promise.all([
    prisma.task.create({ data: { title: 'Neptun mağazasına yeni məhsul təqdimatı', description: 'Yeni məhsul xətti təqdimatı yapılmalıdır', assigneeId: agents[0].id, createdById: admin.id, status: 'TODO', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000) } }),
    prisma.task.create({ data: { title: 'Bravo ilə müqavilə yeniləməsi', description: 'Satış müqaviləsini yeniləmək', assigneeId: agents[1].id, createdById: manager.id, status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: new Date(Date.now() + 172800000) } }),
    prisma.task.create({ data: { title: 'Gilan distribütor hesabatı', description: 'Aylıq satış hesabatı hazırlanmalıdır', assigneeId: agents[0].id, createdById: admin.id, status: 'TODO', priority: 'LOW', dueDate: new Date(Date.now() + 345600000) } }),
    prisma.task.create({ data: { title: 'Araz Market stok yoxlaması', description: 'Stok vəziyyəti yoxlanmalıdır', assigneeId: agents[2].id, createdById: manager.id, status: 'DONE', priority: 'MEDIUM' } }),
  ]);

  console.log(`✅ Created 4 tasks`);

  // ===== ALERTS =====
  await Promise.all([
    prisma.alert.create({ data: { type: 'CRITICAL', category: 'GPS', title: 'GPS Siqnalı Qopdu', description: 'Agent GPS siqnalı 15 dəqiqə əvvəl qopdu', agentId: agents[0].id } }),
    prisma.alert.create({ data: { type: 'WARNING', category: 'BATTERY', title: 'Zəif Batareya', description: 'Cihaz batareyası 15% səviyyəsindədir', agentId: agents[1].id } }),
    prisma.alert.create({ data: { type: 'WARNING', category: 'ROUTE', title: 'Marşrutdan Sapma', description: 'Agent planlaşdırılan marşrutdan sapıb', agentId: agents[3].id } }),
    prisma.alert.create({ data: { type: 'INFO', category: 'SYSTEM', title: 'Sistem Yeniləməsi', description: 'Sistem güncelləmesi tamamlandı — v2.4.1', isRead: true, isResolved: true } }),
  ]);

  console.log(`✅ Created 4 alerts`);

  // ===== SETTINGS =====
  await prisma.setting.createMany({
    data: [
      { key: 'company_name', value: JSON.stringify('MTM Şirkəti') },
      { key: 'primary_color', value: JSON.stringify('#6C63FF') },
      { key: 'geofence_radius', value: JSON.stringify(500) },
      { key: 'gps_interval', value: JSON.stringify(30) },
      { key: 'battery_threshold', value: JSON.stringify(20) },
      { key: 'photo_quality', value: JSON.stringify('high') },
    ],
  });

  console.log(`✅ Created settings`);
  console.log('🎉 Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
