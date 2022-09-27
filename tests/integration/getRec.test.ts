import { prisma } from "../../src/database"
import app from '../../src/app'
import supertest from 'supertest'

beforeEach( async() => {
    await prisma.$executeRaw`TRUNCATE TABLE "recommendations" CASCADE;`
});

describe("GET / recommendations", ()=> {
    
    it(" it have to show the last 10 recommendations ", async () => {

    }); 

})

describe("GET / recommendations/:id ", ()=> {
    
    it("It should add a point on that recommendation", async () => {
       
    });

})

describe("GET / recommendations/random ", ()=> {
    
    it("It should remove a point on recommendation", async () => {
     
    });
    it("It should remove the recommendation if its lower than -5", async () => {
     
    });

})

describe("GET / recommendations/top/:amount ", ()=> {
    
    it("It should remove a point on recommendation", async () => {
     
    });
    it("It should remove the recommendation if its lower than -5", async () => {
     
    });

})
afterAll( async () => {
    await prisma.$disconnect();
})