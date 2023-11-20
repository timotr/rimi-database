import { lv, fakerLV, Faker } from '@faker-js/faker';

export const faker = new Faker({
  locale: [fakerLV, lv],
});

faker.seed(123);