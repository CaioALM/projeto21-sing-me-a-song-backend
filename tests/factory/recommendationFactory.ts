import { faker } from "@faker-js/faker";
import Recommendation from '@prisma/client'
import { CreateRecommendationData } from "../../src/services/recommendationsService";

export function createRecommendationData():CreateRecommendationData {
    return {
            name: faker.lorem.word(2),
            youtubeLink: "https://www.youtube.com/watch?v=SigIbCVMTzU"
}
}

export function createRecommendation() {
    return {
        id: 1,
        name: faker.lorem.words(2),
        youtubeLink: "https://www.youtube.com/watch?v=SigIbCVMTzU",
        score: 0
}
}

export function tenRecommendations() {
    const recommendations: any = [];

    for (let i = 0; i < 10; i++) {
        const recommendation = {
          id: i + 1,
          name: faker.lorem.words(2),
          youtubeLink: `https://www.youtube.com/watch?v=4xA5JePvCJc`,
          score: faker.datatype.number(3),
        };
        recommendations.push(recommendation);
    }
    return recommendations;
}

export function orderedTenRecommendations() {
    const array = tenRecommendations();
    const orderedRecommendation = array.sort((a: any, b: any) => b.score - a.score)
    return orderedRecommendation
}

