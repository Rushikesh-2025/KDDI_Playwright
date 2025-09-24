import { faker } from "@faker-js/faker";

export class RandomDataUtil {

    // for Add user Managements
    static getEmail(): string {
        return faker.internet.email();
    }

    static getName(length: number = 8): string {
        return faker.person.fullName();
    }  
    
    static getFuriganaName(): string {
        return faker.person.fullName();
    }

    static getCorporationName(): string {
        return faker.company.name();
    }

    static getLastName(): string {
        return faker.person.lastName();
    }

    static getFirstName(): string {
        return faker.person.firstName();
    }


}