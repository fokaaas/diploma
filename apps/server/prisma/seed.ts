import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Role,
  UserStatus,
  InvitationStatus,
  CounterpartyType,
  LegalForm,
  CommunicationChannel,
  Priority,
  RequestStatus,
  ContributionForm,
  ProcurementStatus,
  MovementType,
  ReportKind,
  ReportFormat,
  FileKind,
} from '../src/generated/prisma/client';

// Дані демонстраційного фонду цілком українською. Повторний запуск `npm run seed`
// видаляє фонд за цим ЄДРПОУ (каскадно — разом з усіма пов'язаними сутностями)
// і створює його заново.
const DEMO_EDRPOU = '43210987';
const DEMO_PASSWORD = 'demo1234';

const year = 2026;
const pad = (n: number): string => String(n).padStart(4, '0');

async function seedDemoFoundation(prisma: PrismaClient): Promise<void> {
  // Чисте перестворення демо-фонду. Каскад фонду блокують RESTRICT-зв'язки між
  // сутностями (StockMovement->Item, Request->Counterparty тощо), тож видаляємо
  // у явному порядку залежностей: спершу транзакційні документи, потім довідники.
  const existing = await prisma.foundation.findFirst({
    where: { edrpou: DEMO_EDRPOU },
    select: { id: true },
  });
  if (existing) {
    const fId = existing.id;
    await prisma.$transaction([
      prisma.stockMovement.deleteMany({ where: { foundationId: fId } }),
      prisma.issuance.deleteMany({ where: { foundationId: fId } }),
      prisma.goodsReceipt.deleteMany({ where: { foundationId: fId } }),
      prisma.procurement.deleteMany({ where: { foundationId: fId } }),
      prisma.contribution.deleteMany({ where: { foundationId: fId } }),
      prisma.request.deleteMany({ where: { foundationId: fId } }),
      prisma.file.deleteMany({ where: { foundationId: fId } }),
      prisma.report.deleteMany({ where: { foundationId: fId } }),
      prisma.auditLog.deleteMany({ where: { foundationId: fId } }),
      prisma.invitation.deleteMany({ where: { foundationId: fId } }),
      prisma.item.deleteMany({ where: { foundationId: fId } }),
      prisma.category.deleteMany({ where: { foundationId: fId } }),
      prisma.warehouse.deleteMany({ where: { foundationId: fId } }),
      prisma.counterparty.deleteMany({ where: { foundationId: fId } }),
      prisma.user.deleteMany({ where: { foundationId: fId } }),
      prisma.foundation.delete({ where: { id: fId } }),
    ]);
  }

  // 1. Фонд (орендар) ------------------------------------------------------
  const foundation = await prisma.foundation.create({
    data: {
      name: 'Благодійний фонд «Допомога разом»',
      shortName: 'БФ «Допомога разом»',
      legalName: 'БЛАГОДІЙНА ОРГАНІЗАЦІЯ «БЛАГОДІЙНИЙ ФОНД «ДОПОМОГА РАЗОМ»',
      edrpou: DEMO_EDRPOU,
      taxId: '432109876543',
      address: 'м. Київ, вул. Хрещатик, 22, оф. 14',
      website: 'https://dopomoga-razom.example',
    },
  });
  const foundationId = foundation.id;

  // 2. Користувачі (усі ролі, активні, спільний пароль) --------------------
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const mkUser = (fullName: string, email: string, role: Role) =>
    prisma.user.create({
      data: {
        foundationId,
        fullName,
        email,
        passwordHash: demoHash,
        role,
        status: UserStatus.ACTIVE,
        lastSeenAt: new Date('2026-05-30T09:15:00Z'),
      },
    });

  const admin = await mkUser(
    'Олена Коваленко',
    'admin@dopomoga.example',
    Role.ADMIN,
  );
  const coordinator = await mkUser(
    'Андрій Мельник',
    'coordinator@dopomoga.example',
    Role.COORDINATOR,
  );
  const accountant = await mkUser(
    'Ірина Шевченко',
    'accountant@dopomoga.example',
    Role.ACCOUNTANT,
  );
  await mkUser('Петро Бондаренко', 'auditor@dopomoga.example', Role.AUDITOR);

  // 3. Запрошення (демонстрація флоу запрошень) ----------------------------
  await prisma.invitation.create({
    data: {
      foundationId,
      email: 'volonter@dopomoga.example',
      role: Role.COORDINATOR,
      token: 'demo-invitation-token-0001',
      status: InvitationStatus.PENDING,
      message: 'Запрошуємо приєднатися до команди фонду як координатор.',
      invitedById: admin.id,
      expiresAt: new Date('2026-07-01T00:00:00Z'),
    },
  });

  // 4. Контрагенти (підрозділи / донори / постачальники) -------------------
  const mkCp = (
    code: string,
    type: CounterpartyType,
    name: string,
    legalForm: LegalForm,
    extra: {
      contactPerson?: string;
      phone?: string;
      email?: string;
      channel?: CommunicationChannel;
      note?: string;
    } = {},
  ) =>
    prisma.counterparty.create({
      data: {
        foundationId,
        code,
        type,
        name,
        legalForm,
        firstContactAt: new Date('2026-01-20T10:00:00Z'),
        ...extra,
      },
    });

  const unit72 = await mkCp(
    'CP-101',
    CounterpartyType.UNIT,
    '72 окрема механізована бригада',
    LegalForm.NON_LEGAL,
    {
      contactPerson: 'ст. лейтенант Іваненко О.М.',
      phone: '+380671112233',
      channel: CommunicationChannel.SIGNAL,
      note: 'Пріоритетний підрозділ.',
    },
  );
  const unitA2730 = await mkCp(
    'CP-102',
    CounterpartyType.UNIT,
    'Військова частина А2730',
    LegalForm.NON_LEGAL,
    {
      contactPerson: 'капітан Гриценко В.С.',
      phone: '+380672223344',
      channel: CommunicationChannel.TELEGRAM,
    },
  );

  const donorAgro = await mkCp(
    'CP-201',
    CounterpartyType.DONOR,
    'ТОВ «Київ Агро Трейд»',
    LegalForm.LEGAL_ENTITY,
    {
      contactPerson: 'Левченко Дмитро Олександрович',
      phone: '+380443334455',
      email: 'charity@kyivagro.example',
      channel: CommunicationChannel.EMAIL,
      note: 'Постійний корпоративний донор.',
    },
  );
  const donorSydorenko = await mkCp(
    'CP-202',
    CounterpartyType.DONOR,
    'Сидоренко Василь Петрович',
    LegalForm.INDIVIDUAL,
    {
      phone: '+380501234567',
      channel: CommunicationChannel.PHONE,
    },
  );
  const donorTkachenko = await mkCp(
    'CP-203',
    CounterpartyType.DONOR,
    'ФОП Ткаченко Марія Іванівна',
    LegalForm.SOLE_PROPRIETOR,
    {
      contactPerson: 'Ткаченко Марія Іванівна',
      phone: '+380939876543',
      channel: CommunicationChannel.TELEGRAM,
    },
  );

  const supplierMed = await mkCp(
    'CP-301',
    CounterpartyType.SUPPLIER,
    'ТОВ «МедТехПостач»',
    LegalForm.LEGAL_ENTITY,
    {
      contactPerson: 'Романюк Світлана Вікторівна',
      phone: '+380445556677',
      email: 'sales@medtech.example',
      channel: CommunicationChannel.EMAIL,
    },
  );
  const supplierGrygorenko = await mkCp(
    'CP-302',
    CounterpartyType.SUPPLIER,
    'ФОП Григоренко Олег Миколайович',
    LegalForm.SOLE_PROPRIETOR,
    {
      contactPerson: 'Григоренко Олег Миколайович',
      phone: '+380677778899',
      channel: CommunicationChannel.PHONE,
    },
  );

  // 5. Категорії -----------------------------------------------------------
  const catNames = [
    'Медикаменти',
    'Екіпірування',
    'Продукти харчування',
    'Паливо',
    'Електроніка та РЕБ',
  ];
  const categories: Record<string, string> = {};
  for (const name of catNames) {
    const c = await prisma.category.create({ data: { foundationId, name } });
    categories[name] = c.id;
  }

  // 6. Номенклатура (товари) ----------------------------------------------
  const mkItem = (
    categoryName: string,
    sku: string,
    name: string,
    unit: string,
    minStock: number,
    lastPrice: number,
  ) =>
    prisma.item.create({
      data: {
        foundationId,
        categoryId: categories[categoryName],
        sku,
        name,
        unit,
        minStock,
        lastPrice,
      },
    });

  const itemAptechka = await mkItem(
    'Медикаменти',
    'MED-001',
    'Аптечка індивідуальна (IFAK)',
    'компл',
    20,
    1850,
  );
  const itemTurniquet = await mkItem(
    'Медикаменти',
    'MED-002',
    'Турнікет CAT',
    'шт',
    30,
    650,
  );
  const itemArmor = await mkItem(
    'Екіпірування',
    'EQP-001',
    'Бронежилет 4 клас захисту',
    'шт',
    5,
    12500,
  );
  const itemHelmet = await mkItem(
    'Екіпірування',
    'EQP-002',
    'Тактичний шолом',
    'шт',
    10,
    8900,
  );
  const itemBoots = await mkItem(
    'Екіпірування',
    'EQP-003',
    'Берці тактичні',
    'пара',
    15,
    3200,
  );
  const itemRation = await mkItem(
    'Продукти харчування',
    'FOOD-001',
    'Сухий пайок (ІРП)',
    'компл',
    50,
    420,
  );
  const itemWater = await mkItem(
    'Продукти харчування',
    'FOOD-002',
    'Вода питна 5 л',
    'шт',
    100,
    45,
  );
  await mkItem('Паливо', 'FUEL-001', 'Дизельне паливо', 'л', 200, 54);
  const itemRadio = await mkItem(
    'Електроніка та РЕБ',
    'ELEC-001',
    'Портативна рація',
    'шт',
    8,
    5400,
  );
  const itemPowerbank = await mkItem(
    'Електроніка та РЕБ',
    'ELEC-002',
    'Павербанк 20000 mAh',
    'шт',
    25,
    1200,
  );

  // 7. Склади --------------------------------------------------------------
  const whKyiv = await prisma.warehouse.create({
    data: { foundationId, name: 'Головний склад (Київ)' },
  });
  const whLviv = await prisma.warehouse.create({
    data: { foundationId, name: 'Регіональний склад (Львів)' },
  });

  // 8. Благодійні внески ---------------------------------------------------
  const contrib1 = await prisma.contribution.create({
    data: {
      foundationId,
      number: `CN-${year}-${pad(1)}`,
      donorId: donorAgro.id,
      form: ContributionForm.MONETARY,
      amount: 500000,
      currency: 'UAH',
      purpose: 'Закупівля медичного обладнання та екіпірування',
      baseDocumentLabel: 'Договір про благодійний внесок №12/2026',
      occurredAt: new Date('2026-02-10'),
      registeredById: accountant.id,
    },
  });
  await prisma.contribution.create({
    data: {
      foundationId,
      number: `CN-${year}-${pad(2)}`,
      donorId: donorSydorenko.id,
      form: ContributionForm.MONETARY,
      amount: 75000,
      currency: 'UAH',
      purpose: 'Загальний фонд',
      occurredAt: new Date('2026-03-05'),
      registeredById: accountant.id,
    },
  });
  await prisma.contribution.create({
    data: {
      foundationId,
      number: `CN-${year}-${pad(3)}`,
      donorId: donorTkachenko.id,
      form: ContributionForm.IN_KIND,
      amount: 96000,
      currency: 'UAH',
      purpose: 'Передача екіпірування (берці тактичні)',
      baseDocumentLabel: 'Акт приймання-передачі №3/2026',
      itemName: 'Берці тактичні',
      itemQuantity: 30,
      occurredAt: new Date('2026-03-20'),
      registeredById: coordinator.id,
    },
  });
  const contrib4 = await prisma.contribution.create({
    data: {
      foundationId,
      number: `CN-${year}-${pad(4)}`,
      donorId: donorAgro.id,
      form: ContributionForm.MONETARY,
      amount: 250000,
      currency: 'UAH',
      purpose: "Закупівля засобів зв'язку",
      baseDocumentLabel: 'Договір про благодійний внесок №18/2026',
      occurredAt: new Date('2026-04-15'),
      registeredById: accountant.id,
    },
  });

  // 9. Заявки з позиціями --------------------------------------------------
  const req1 = await prisma.request.create({
    data: {
      foundationId,
      number: `R-${year}-${pad(1)}`,
      unitId: unit72.id,
      unitContactName: 'ст. лейтенант Іваненко О.М.',
      priority: Priority.HIGH,
      status: RequestStatus.FULFILLED,
      deadline: new Date('2026-03-01'),
      channel: CommunicationChannel.SIGNAL,
      registeredById: coordinator.id,
      assigneeId: coordinator.id,
      lines: {
        create: [
          {
            itemId: itemTurniquet.id,
            name: 'Турнікет CAT',
            sku: 'MED-002',
            quantity: 50,
            unit: 'шт',
            receivedQuantity: 50,
          },
          {
            itemId: itemAptechka.id,
            name: 'Аптечка індивідуальна (IFAK)',
            sku: 'MED-001',
            quantity: 20,
            unit: 'компл',
            receivedQuantity: 20,
          },
        ],
      },
    },
  });
  const req2 = await prisma.request.create({
    data: {
      foundationId,
      number: `R-${year}-${pad(2)}`,
      unitId: unitA2730.id,
      unitContactName: 'капітан Гриценко В.С.',
      priority: Priority.MEDIUM,
      status: RequestStatus.PARTIALLY_FULFILLED,
      deadline: new Date('2026-04-01'),
      channel: CommunicationChannel.TELEGRAM,
      registeredById: coordinator.id,
      assigneeId: admin.id,
      lines: {
        create: [
          {
            itemId: itemArmor.id,
            name: 'Бронежилет 4 клас захисту',
            sku: 'EQP-001',
            quantity: 10,
            unit: 'шт',
            receivedQuantity: 6,
            techSpec: 'Клас захисту 4 за ДСТУ, з бічними пластинами.',
          },
          {
            itemId: itemHelmet.id,
            name: 'Тактичний шолом',
            sku: 'EQP-002',
            quantity: 10,
            unit: 'шт',
            receivedQuantity: 10,
          },
        ],
      },
    },
  });
  const req3 = await prisma.request.create({
    data: {
      foundationId,
      number: `R-${year}-${pad(3)}`,
      unitId: unit72.id,
      unitContactName: 'ст. лейтенант Іваненко О.М.',
      priority: Priority.HIGH,
      status: RequestStatus.IN_PROGRESS,
      channel: CommunicationChannel.SIGNAL,
      registeredById: coordinator.id,
      assigneeId: coordinator.id,
      lines: {
        create: [
          {
            itemId: itemRadio.id,
            name: 'Портативна рація',
            sku: 'ELEC-001',
            quantity: 12,
            unit: 'шт',
          },
          {
            itemId: itemPowerbank.id,
            name: 'Павербанк 20000 mAh',
            sku: 'ELEC-002',
            quantity: 30,
            unit: 'шт',
          },
        ],
      },
    },
  });
  await prisma.request.create({
    data: {
      foundationId,
      number: `R-${year}-${pad(4)}`,
      unitId: unitA2730.id,
      unitContactName: 'капітан Гриценко В.С.',
      priority: Priority.LOW,
      status: RequestStatus.NEW,
      registeredById: coordinator.id,
      lines: {
        create: [
          {
            itemId: itemRation.id,
            name: 'Сухий пайок (ІРП)',
            sku: 'FOOD-001',
            quantity: 100,
            unit: 'компл',
          },
          {
            itemId: itemWater.id,
            name: 'Вода питна 5 л',
            sku: 'FOOD-002',
            quantity: 200,
            unit: 'шт',
          },
        ],
      },
    },
  });

  // 10. Закупівлі з позиціями та фінансуванням -----------------------------
  const proc1Total = 60 * 650 + 25 * 1850; // 85250
  const proc1 = await prisma.procurement.create({
    data: {
      foundationId,
      number: `PR-${year}-${pad(1)}`,
      supplierId: supplierMed.id,
      requestId: req1.id,
      status: ProcurementStatus.RECEIVED,
      totalAmount: proc1Total,
      orderedAt: new Date('2026-02-15'),
      createdById: coordinator.id,
      lines: {
        create: [
          {
            itemId: itemTurniquet.id,
            name: 'Турнікет CAT',
            sku: 'MED-002',
            quantity: 60,
            unitPrice: 650,
            lineTotal: 39000,
          },
          {
            itemId: itemAptechka.id,
            name: 'Аптечка індивідуальна (IFAK)',
            sku: 'MED-001',
            quantity: 25,
            unitPrice: 1850,
            lineTotal: 46250,
          },
        ],
      },
      funding: {
        create: [{ contributionId: contrib1.id, allocatedAmount: proc1Total }],
      },
    },
  });

  const proc2Total = 8 * 12500 + 12 * 8900; // 206800
  const proc2 = await prisma.procurement.create({
    data: {
      foundationId,
      number: `PR-${year}-${pad(2)}`,
      supplierId: supplierGrygorenko.id,
      requestId: req2.id,
      status: ProcurementStatus.RECEIVED,
      totalAmount: proc2Total,
      orderedAt: new Date('2026-03-10'),
      createdById: admin.id,
      lines: {
        create: [
          {
            itemId: itemArmor.id,
            name: 'Бронежилет 4 клас захисту',
            sku: 'EQP-001',
            quantity: 8,
            unitPrice: 12500,
            lineTotal: 100000,
          },
          {
            itemId: itemHelmet.id,
            name: 'Тактичний шолом',
            sku: 'EQP-002',
            quantity: 12,
            unitPrice: 8900,
            lineTotal: 106800,
          },
        ],
      },
      funding: {
        create: [{ contributionId: contrib1.id, allocatedAmount: proc2Total }],
      },
    },
  });

  const proc3Total = 12 * 5400 + 30 * 1200; // 100800
  await prisma.procurement.create({
    data: {
      foundationId,
      number: `PR-${year}-${pad(3)}`,
      supplierId: supplierMed.id,
      requestId: req3.id,
      status: ProcurementStatus.ORDERED,
      totalAmount: proc3Total,
      orderedAt: new Date('2026-04-20'),
      createdById: coordinator.id,
      lines: {
        create: [
          {
            itemId: itemRadio.id,
            name: 'Портативна рація',
            sku: 'ELEC-001',
            quantity: 12,
            unitPrice: 5400,
            lineTotal: 64800,
          },
          {
            itemId: itemPowerbank.id,
            name: 'Павербанк 20000 mAh',
            sku: 'ELEC-002',
            quantity: 30,
            unitPrice: 1200,
            lineTotal: 36000,
          },
        ],
      },
      funding: {
        create: [{ contributionId: contrib4.id, allocatedAmount: proc3Total }],
      },
    },
  });

  // Облік залишків ведемо в пам'яті: IN додає, OUT віднімає.
  const stock = new Map<string, number>();
  const stockKey = (itemId: string, warehouseId: string) =>
    `${itemId}__${warehouseId}`;
  let movementSeq = 0;
  const nextMovementNumber = () => `M-${pad(++movementSeq)}`;

  const moveIn = async (
    itemId: string,
    warehouseId: string,
    quantity: number,
    performedById: string,
    occurredAt: Date,
    link: { goodsReceiptId?: string } = {},
  ) => {
    await prisma.stockMovement.create({
      data: {
        foundationId,
        number: nextMovementNumber(),
        type: MovementType.IN,
        itemId,
        warehouseId,
        quantity,
        occurredAt,
        performedById,
        ...link,
      },
    });
    const key = stockKey(itemId, warehouseId);
    stock.set(key, (stock.get(key) ?? 0) + quantity);
  };

  const moveOut = async (
    itemId: string,
    warehouseId: string,
    quantity: number,
    performedById: string,
    occurredAt: Date,
    link: { issuanceId?: string } = {},
  ) => {
    await prisma.stockMovement.create({
      data: {
        foundationId,
        number: nextMovementNumber(),
        type: MovementType.OUT,
        itemId,
        warehouseId,
        quantity,
        occurredAt,
        performedById,
        ...link,
      },
    });
    const key = stockKey(itemId, warehouseId);
    stock.set(key, (stock.get(key) ?? 0) - quantity);
  };

  // 11. Приймання закупівель на склад (надходження -> рух IN) --------------
  const receipt1 = await prisma.goodsReceipt.create({
    data: {
      foundationId,
      procurementId: proc1.id,
      warehouseId: whKyiv.id,
      receivedById: admin.id,
      receivedAt: new Date('2026-02-20T11:00:00Z'),
      note: 'Прийнято повністю, без зауважень.',
      lines: {
        create: [
          { itemId: itemTurniquet.id, quantity: 60 },
          { itemId: itemAptechka.id, quantity: 25 },
        ],
      },
    },
  });
  await moveIn(
    itemTurniquet.id,
    whKyiv.id,
    60,
    admin.id,
    new Date('2026-02-20T11:00:00Z'),
    { goodsReceiptId: receipt1.id },
  );
  await moveIn(
    itemAptechka.id,
    whKyiv.id,
    25,
    admin.id,
    new Date('2026-02-20T11:00:00Z'),
    { goodsReceiptId: receipt1.id },
  );

  const receipt2 = await prisma.goodsReceipt.create({
    data: {
      foundationId,
      procurementId: proc2.id,
      warehouseId: whKyiv.id,
      receivedById: admin.id,
      receivedAt: new Date('2026-03-15T13:30:00Z'),
      lines: {
        create: [
          { itemId: itemArmor.id, quantity: 8 },
          { itemId: itemHelmet.id, quantity: 12 },
        ],
      },
    },
  });
  await moveIn(
    itemArmor.id,
    whKyiv.id,
    8,
    admin.id,
    new Date('2026-03-15T13:30:00Z'),
    { goodsReceiptId: receipt2.id },
  );
  await moveIn(
    itemHelmet.id,
    whKyiv.id,
    12,
    admin.id,
    new Date('2026-03-15T13:30:00Z'),
    { goodsReceiptId: receipt2.id },
  );

  // Натуральний внесок (берці) — ручне оприбуткування на склад.
  await moveIn(
    itemBoots.id,
    whKyiv.id,
    30,
    accountant.id,
    new Date('2026-03-21T10:00:00Z'),
  );
  // Поповнення регіонального складу (Львів) продуктами.
  await moveIn(
    itemWater.id,
    whLviv.id,
    150,
    accountant.id,
    new Date('2026-04-02T09:00:00Z'),
  );
  await moveIn(
    itemRation.id,
    whLviv.id,
    80,
    accountant.id,
    new Date('2026-04-02T09:00:00Z'),
  );

  // 12. Видачі підрозділам (рух OUT) ---------------------------------------
  const issuance1 = await prisma.issuance.create({
    data: {
      foundationId,
      requestId: req1.id,
      recipientName: '72 окрема механізована бригада',
      deliveryMethod: 'Волонтерський транспорт',
      issuedById: coordinator.id,
      issuedAt: new Date('2026-02-25T15:00:00Z'),
      lines: {
        create: [
          { itemId: itemTurniquet.id, warehouseId: whKyiv.id, quantity: 50 },
          { itemId: itemAptechka.id, warehouseId: whKyiv.id, quantity: 20 },
        ],
      },
    },
  });
  await moveOut(
    itemTurniquet.id,
    whKyiv.id,
    50,
    coordinator.id,
    new Date('2026-02-25T15:00:00Z'),
    { issuanceId: issuance1.id },
  );
  await moveOut(
    itemAptechka.id,
    whKyiv.id,
    20,
    coordinator.id,
    new Date('2026-02-25T15:00:00Z'),
    { issuanceId: issuance1.id },
  );

  const issuance2 = await prisma.issuance.create({
    data: {
      foundationId,
      requestId: req2.id,
      recipientName: 'Військова частина А2730',
      deliveryMethod: 'Нова Пошта',
      issuedById: admin.id,
      issuedAt: new Date('2026-03-20T16:00:00Z'),
      lines: {
        create: [
          { itemId: itemArmor.id, warehouseId: whKyiv.id, quantity: 6 },
          { itemId: itemHelmet.id, warehouseId: whKyiv.id, quantity: 10 },
        ],
      },
    },
  });
  await moveOut(
    itemArmor.id,
    whKyiv.id,
    6,
    admin.id,
    new Date('2026-03-20T16:00:00Z'),
    { issuanceId: issuance2.id },
  );
  await moveOut(
    itemHelmet.id,
    whKyiv.id,
    10,
    admin.id,
    new Date('2026-03-20T16:00:00Z'),
    { issuanceId: issuance2.id },
  );

  // 13. Залишки на складах (з накопиченого в пам'яті обліку) ----------------
  for (const [key, quantity] of stock) {
    const [itemId, warehouseId] = key.split('__');
    await prisma.stockLevel.create({ data: { itemId, warehouseId, quantity } });
  }

  // 14. Файли (метадані; фізичні файли — заглушки) -------------------------
  await prisma.file.createMany({
    data: [
      {
        foundationId,
        originalName: 'Рахунок-фактура_PR-2026-0001.pdf',
        storagePath: 'uploads/demo/invoice-pr-2026-0001.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 184320,
        kind: FileKind.INVOICE,
        uploadedById: accountant.id,
        procurementId: proc1.id,
      },
      {
        foundationId,
        originalName: 'Договір_про_благодійний_внесок_12-2026.pdf',
        storagePath: 'uploads/demo/donation-agreement-12-2026.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 256000,
        kind: FileKind.DONATION_AGREEMENT,
        uploadedById: accountant.id,
        contributionId: contrib1.id,
      },
      {
        foundationId,
        originalName: 'Накладна_видачі_R-2026-0001.pdf',
        storagePath: 'uploads/demo/waybill-r-2026-0001.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 98304,
        kind: FileKind.WAYBILL,
        uploadedById: coordinator.id,
        requestId: req1.id,
      },
    ],
  });

  // 15. Звіти --------------------------------------------------------------
  await prisma.report.create({
    data: {
      foundationId,
      title: 'Внутрішній звіт за лютий 2026',
      kind: ReportKind.INTERNAL,
      format: ReportFormat.XLSX,
      periodStart: new Date('2026-02-01'),
      periodEnd: new Date('2026-02-29'),
      generatedById: accountant.id,
      isPublished: false,
    },
  });
  await prisma.report.create({
    data: {
      foundationId,
      title: 'Публічний звіт за I квартал 2026',
      kind: ReportKind.PUBLIC,
      format: ReportFormat.PDF,
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-03-31'),
      generatedById: admin.id,
      isPublished: true,
      publishedAt: new Date('2026-04-05T12:00:00Z'),
      publicSlug: 'zvit-q1-2026',
      snapshot: {
        надходження: 575000,
        витрати: 292050,
        кількістьЗаявок: 2,
        кількістьВидач: 2,
        валюта: 'UAH',
      },
    },
  });

  // 16. Журнал аудиту ------------------------------------------------------
  await prisma.auditLog.createMany({
    data: [
      {
        foundationId,
        actorId: accountant.id,
        action: 'CONTRIBUTION_CREATED',
        targetType: 'Contribution',
        targetId: contrib1.id,
        summary:
          'Зареєстровано благодійний внесок CN-2026-0001 на суму 500 000 грн',
      },
      {
        foundationId,
        actorId: coordinator.id,
        action: 'REQUEST_CREATED',
        targetType: 'Request',
        targetId: req1.id,
        summary:
          'Створено заявку R-2026-0001 від 72 окремої механізованої бригади',
      },
      {
        foundationId,
        actorId: admin.id,
        action: 'PROCUREMENT_RECEIVED',
        targetType: 'Procurement',
        targetId: proc1.id,
        summary:
          'Отримано закупівлю PR-2026-0001 на склад «Головний склад (Київ)»',
      },
      {
        foundationId,
        actorId: coordinator.id,
        action: 'ISSUANCE_CREATED',
        targetType: 'Issuance',
        targetId: issuance1.id,
        summary: 'Видано товари за заявкою R-2026-0001 (72 ОМБр)',
      },
    ],
  });

  console.log('Демо-фонд створено:', foundation.name);
  console.log('  Користувачі (пароль для всіх — demo1234):');
  console.log('    ADMIN       admin@dopomoga.example       — Олена Коваленко');
  console.log('    COORDINATOR coordinator@dopomoga.example — Андрій Мельник');
  console.log('    ACCOUNTANT  accountant@dopomoga.example  — Ірина Шевченко');
  console.log(
    '    AUDITOR     auditor@dopomoga.example     — Петро Бондаренко',
  );
  console.log('  Контрагенти: 2 підрозділи, 3 донори, 2 постачальники');
  console.log('  Номенклатура: 5 категорій, 10 товарів, 2 склади');
  console.log(
    '  Документообіг: 4 внески, 4 заявки, 3 закупівлі, 2 надходження, 2 видачі',
  );
  console.log(
    `  Рухи по складу: ${movementSeq}; позицій залишків: ${stock.size}`,
  );
  console.log(
    '  Звіти: 2 (1 опубліковано), файли-заглушки: 3, записи аудиту: 4',
  );
}

async function main(): Promise<void> {
  const name = process.env.PLATFORM_ADMIN_NAME;
  const email = process.env.PLATFORM_ADMIN_EMAIL;
  const password = process.env.PLATFORM_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'PLATFORM_ADMIN_NAME, PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD must be set.',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    }),
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.platformAdmin.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { name, email, passwordHash },
    });
    console.log(`Seeded platform admin: ${email}`);

    await seedDemoFoundation(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
