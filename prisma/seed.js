import { et, fakerET, Faker } from '@faker-js/faker';

export const faker = new Faker({
  locale: [fakerET, et],
});

faker.seed(123);