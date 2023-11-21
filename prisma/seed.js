import { en_US, en, base, Faker } from '@faker-js/faker';
import { et } from '../faker/et.js';
import cityStateMap from '../faker/city-state-map.json' assert { type: "json" };
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export const faker = new Faker({
  locale: [et, en_US, en, base],
});

faker.seed(1111);

async function createAddress({coordinates=false}={}) {
  let city = faker.location.city();
  let address = {
    street_line_1: faker.location.streetAddress({useFullAddress: true}),
    street_line_2: faker.location.secondaryAddress(),
    city,
    state: cityStateMap[city],
    zip: faker.location.zipCode(),
    country: 'Estonia',
  };
  if (coordinates) {
    address.latitude = faker.location.latitude({min: 57.5, max: 59.7}).toString();
    address.longitude = faker.location.longitude({min: 22, max: 28}).toString();
  }
  let result = await prisma.address.create({data: address});
  return result;
}

//console.log(createAddress())

async function createUser(email) {
  let person = {
    email: email,
    password: faker.internet.password(),
  };
  let result = await prisma.user.create({data: person});
  return result;
}

async function createEmployee() {
  let address = await createAddress({coordinates: false});
  let person = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: {connect: {id: address.id}},
  };
  let user = await createUser(person.email);
  person.user = {connect: {id: user.id}};
  let result = await prisma.employee.create({data: person});
  return result;
}

async function createStore() {
  let address = await createAddress({coordinates: true});
  let employee = await createEmployee();
  let store = {
    name: address.street_line_1,
    //type: faker.helpers.arrayElement(["retail", "warehouse"]),
    type: "retail",
    address: {connect: {id: address.id}},
    manager: {connect: {id: employee.id}},
  };
  let result = await prisma.store.create({data: store});
  return result;
}


createStore()