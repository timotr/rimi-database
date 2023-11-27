import { en_US, en, base, Faker } from '@faker-js/faker';
import { et } from '../faker/et.js';
import cityStateMap from '../faker/city-state-map.json' assert { type: "json" };
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

export const faker = new Faker({
  locale: [et, en_US, en, base],
});

// truncate all tables
const transactions = []
transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`)

const tablenames = await prisma.$queryRaw`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'rimi-database';`

for (const { TABLE_NAME } of tablenames) {
  if (TABLE_NAME !== '_prisma_migrations') {
    try {
      console.log(`TRUNCATE \`${TABLE_NAME}\`;`)
      transactions.push(prisma.$executeRawUnsafe(`TRUNCATE \`${TABLE_NAME}\`;`))
    } catch (error) {
      console.log({ error })
    }
  }
}

transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`)



try {
  await prisma.$transaction(transactions)
} catch (error) {
  console.log({ error })
}

// raw query to START TRANSACTION;
prisma.$executeRaw`SET autocommit = 0;`
prisma.$executeRaw`START TRANSACTION;`

faker.seed(1111);

async function createAddress({ coordinates = false } = {}) {
  let city = faker.location.city();
  let address = {
    street_line_1: faker.location.streetAddress({ useFullAddress: true }),
    street_line_2: faker.location.secondaryAddress(),
    city,
    state: cityStateMap[city],
    zip: faker.location.zipCode(),
    country: 'Estonia',
  };
  if (coordinates) {
    address.latitude = faker.location.latitude({ min: 57.5, max: 59.7 }).toString();
    address.longitude = faker.location.longitude({ min: 22, max: 28 }).toString();
  }
  let result = await prisma.address.create({ data: address });
  return result;
}

//console.log(createAddress())

async function createUser(email) {
  try {
    let person = {
      email: email,
      password: bcrypt.hashSync(faker.internet.password(), 1),
    };
    let result = await prisma.user.create({ data: person });
    return result;
  } catch (error) {
    console.log({ error })
    return null;
  }
}

async function createEmployee() {
  let address = await createAddress({ coordinates: false });
  let firstName = faker.person.firstName();
  let lastName = faker.person.lastName();
  let person = {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    phone: "+372" + faker.string.numeric({ length: { min: 6, max: 8 }, allowLeadingZeros: false }),
    address: { connect: { id: address.id } },
  };
  let user = await createUser(person.email);
  if (user)
    person.user = { connect: { id: user.id } };
  let result = await prisma.employee.create({ data: person });
  return result;
}

async function createStore() {
  let address = await createAddress({ coordinates: true });
  let employee = await createEmployee();
  let store = {
    name: address.street_line_1,
    //type: faker.helpers.arrayElement(["retail", "warehouse"]),
    type: "retail",
    address: { connect: { id: address.id } },
    manager: { connect: { id: employee.id } },
  };
  let result = await prisma.store.create({ data: store });
  return result;
}

const customerSpeedTraits = [{ min: 4, max: 18 }, { min: 2, max: 15 }, { min: 0, max: 8 }];
async function createCustomer() {
  let address = await createAddress({ coordinates: false });
  let firstName = faker.person.firstName();
  let lastName = faker.person.lastName();
  let person = {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    phone: "+372" + faker.string.numeric({ length: { min: 6, max: 8 }, allowLeadingZeros: false }),
    type: 0,
    pin: faker.string.numeric({ length: 11, allowLeadingZeros: false }),
    contactAddress: { connect: { id: address.id } },
  };
  let shouldHaveAccount = faker.datatype.boolean();
  if (shouldHaveAccount) {
    let user = await createUser(person.email);
    if (user)
      person.user = { connect: { id: user.id } };
  }
  let result = await prisma.customer.create({ data: person });
  result.speedTrait = faker.helpers.arrayElement(customerSpeedTraits);
  return result;
}

const paidStatuses = ["paid", "delivered"];
const allTypes = ["self-service", "full-service", "pickup", "delivery"];
const inStoreTypes = ["self-service", "full-service"];
const onlineOrderTypes = ["pickup", "delivery"];

async function createOrder(store, customer) {
  let order_date = faker.date.between({ from: "2019-01-01T00:00:00.000Z", to: "2023-12-31T00:00:00.000Z" });
  let status = faker.helpers.arrayElement(["paid", "paid", "paid", "placed", "paid", "paid", "paid", "cancelled", "paid", "paid", "paid", "delivered", "paid", "paid", "paid", "paid"]);
  let type = "";
  let canBeCash = false;
  switch (status) {
    case "delivered": type = faker.helpers.arrayElement(onlineOrderTypes); break;
    case "placed": type = faker.helpers.arrayElement(onlineOrderTypes); break;
    case "cancelled": type = faker.helpers.arrayElement(allTypes); break;
    default: {
      type = faker.helpers.arrayElement(inStoreTypes);
      canBeCash = true;
    }
  }
  let order = {
    store: { connect: { id: store.id } },
    createdAt: order_date,
    status: status,
    type,
    paymentMethod: canBeCash ? faker.helpers.arrayElement(["card", "card", "cash", "card", "card"]) : "card",
    paidAt: null,
  };

  if (paidStatuses.includes(status)) {
    let paidAt = new Date(order_date.getTime());
    paidAt.setMinutes(paidAt.getMinutes() + faker.number.int(customer?.speedTrait ?? { min: 0, max: 18 }))
    paidAt.setSeconds(paidAt.getSeconds() + faker.number.int({ min: 0, max: 59 }))
    order.paidAt = paidAt;
  }

  if (customer) {
    if (customer.id === undefined)
      console.log(customer)
    order.customer = { connect: { id: customer.id } };
  }

  let result = await prisma.order.create({ data: order });
  return result;
}

async function createOrders() {
  let stores = [];
  for (let i = 0; i < 82; i++) {
    stores.push(await createStore())
  }

  for (let i = 0; i < 2041; i++) {
    let customer = await createCustomer();

    // take two stores randomly from the list of stores
    let mainStores = faker.helpers.shuffle(stores).slice(0, 2);
    // take randomly 1-6 stores from the list of stores
    let otherStores = faker.helpers.shuffle(stores).slice(0, faker.number.int({ min: 1, max: 6 }));

    // for each customer create 1-220 orders, place them in into mainStores
    for (let j = 0; j < faker.number.int({ min: 1, max: 220 }); j++) {
      createOrder(faker.helpers.arrayElement(mainStores), customer);
    }

    // and for other stores create 1-20 orders
    for (let j = 0; j < faker.number.int({ min: 1, max: 20 }); j++) {
      createOrder(faker.helpers.arrayElement(otherStores), customer);
    }
  }

  // create orders for unknown customers
  for (let i = 0; i < 12345; i++) {
    let store = faker.helpers.arrayElement(stores);
    createOrder(store, null);
  }
}

createOrders()

prisma.$executeRaw`COMMIT;`
prisma.$executeRaw`SET autocommit = 1;`