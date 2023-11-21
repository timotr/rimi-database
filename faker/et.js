import { base, en, en_US, Faker } from '@faker-js/faker';
import streetNames from './et-street-names.json' assert { type: "json" };

export const et = {
  title: 'My custom locale',
  internet: {
    //domainSuffix: ['test'],
  },
  location: {
    country: ['Estonia'],
    city_pattern: ["Tallinn","Tartu","Narva","Pärnu","Kohtla-Järve","Viljandi","Maardu","Rakvere","Kuressaare","Sillamäe","Valga","Võru","Jõhvi","Keila","Haapsalu","Paide","Saue","Elva","Tapa","Põlva","Türi","Rapla","Jõgeva","Kiviõli","Põltsamaa","Sindi","Paldiski","Kärdla","Kunda","Tõrva","Narva-Jõesuu","Kehra","Loksa","Otepää","Räpina","Tamsalu","Kilingi-Nõmme","Karksi-Nuia","Võhma","Antsla","Lihula","Mustvee","Suure-Jaani","Abja-Paluoja","Püssi","Mõisaküla","Kallaste"],
    county: ["Harju maakond","Hiiu maakond","Ida-Viru maakond","Jõgeva maakond","Järva maakond","Lääne maakond","Lääne-Viru maakond","Põlva maakond","Pärnu maakond","Rapla maakond","Saare maakond","Tartu maakond","Valga maakond","Viljandi maakond","Võru maakond"],
    building_number: ["###","##","#"],
    street_name: streetNames,
    street_pattern: ["{{location.street_name}}"],
    street_address: {normal: "{{location.streetName}}", full: "{{location.streetName}} {{location.buildingNumber}}"},
    secondary_address: ["","","","#","##"],
    postcode: ['#####'],
  },
};

export const fakerET = new Faker({
  locale: [et, en, en_US, base],
});