import  { prisma } from "../../src/database"
import app from '../../src/app'
import supertest from 'supertest'

beforeEach( async() => {
    await prisma.$executeRaw`TRUNCATE TABLE "recommendations" CASCADE;`
});

describe("POST / recommendations", ()=> {
    
    it("given both valid name and YouTubeLink it should return 201", async () => {
        const name = "teste teste"
        const youtubeLink = "https://www.youtube.com/watch?v=4xA5JePvCJc"

        const body = {
            name: name, 
            youtubeLink: youtubeLink
        }
       
        const result = await supertest(app).post("/").send(body);
          
        expect(result.status).toEqual(201);

        const createdRecommendation = await prisma.recommendation.findUnique({
            where: { name: body.name }
        });

        expect(createdRecommendation).not.toBeNull();
    }); 

})

describe("POST / recommendations/:id/upvote ", ()=> {
    
    it("It should add a point on that recommendation", async () => {
       
    });

})

describe("POST / recommendations/:id/downvote ", ()=> {
    
    it("It should remove a point on recommendation", async () => {
     
    });
    it("It should remove the recommendation if its lower than -5", async () => {
     
    });

})

afterAll( async () => {
    await prisma.$disconnect();
})