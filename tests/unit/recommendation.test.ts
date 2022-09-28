import { recommendationService } from '../../src/services/recommendationsService'
import { recommendationRepository } from '../../src/repositories/recommendationRepository'
import * as recommendationFactory from '../factory/recommendationFactory'
import { conflictError, notFoundError } from '../../src/utils/errorUtils'

beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
})

describe('Testing POST /recommendations', () => {
    it('should create recommendation', async () => {
        const recommendation = recommendationFactory.createRecommendation()

        jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any => {})
        jest.spyOn(recommendationRepository, 'create').mockImplementationOnce(():any => {})

        await recommendationService.insert(recommendation)

        expect(recommendationRepository.findByName).toHaveBeenCalledWith(recommendation.name)
        expect(recommendationRepository.create).toBeCalled()
    })

    it('should find the recommendation by its name and not create it', async () => {
        const recommendation = recommendationFactory.createRecommendation()

        jest.spyOn(recommendationRepository, 'findByName').mockResolvedValueOnce(recommendation)
        jest.spyOn(recommendationRepository, 'create').mockResolvedValueOnce()

        await expect(recommendationService.insert({
            name: recommendation.name,
            youtubeLink: recommendation.youtubeLink
        })).rejects.toEqual(conflictError('Recommendations names must be unique'))

        expect(recommendationRepository.findByName).toHaveBeenCalledWith(recommendation.name)
        expect(recommendationRepository.create).not.toBeCalled()
    })
})

describe('Testing POST /recommendations/:id/upvote', () => {
    it('should increase one to recommendation score', async () => {
        const recommendation = recommendationFactory.createRecommendation()
        const EXPECTED_SCORE = 1

        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation)
        jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(recommendation)

        await expect(recommendationService.upvote(recommendation.id)).resolves.not.toThrow()

        expect(recommendationRepository.find).toHaveBeenCalledWith(recommendation.id)
        expect(recommendationRepository.updateScore).toHaveBeenCalledWith(recommendation.id, 'increment')
        expect(recommendation.score).toBeLessThan(EXPECTED_SCORE)
    })

    it('should return not found by recommendation id', async () => {
        const id = -1;
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null)

        await expect(recommendationService.upvote(id)).rejects.toEqual(notFoundError())

        expect(recommendationRepository.find).toHaveBeenCalledWith(id)
        expect(recommendationRepository.updateScore).not.toHaveBeenCalled()
    })
})

describe('Testing POST /recommendations/:id/downvote', () => {
    it('should decrease one to recommendation score', async () => {
        const recommendation = recommendationFactory.createRecommendation()
        const EXPECTED_SCORE = -1

        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation)
        jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(recommendation)

        await expect(recommendationService.downvote(recommendation.id)).resolves.not.toThrow()

        expect(recommendationRepository.find).toHaveBeenCalledWith(recommendation.id)
        expect(recommendationRepository.updateScore).toHaveBeenCalledWith(recommendation.id, 'decrement')
        expect(recommendation.score).toBeGreaterThan(EXPECTED_SCORE)
    })

    it('should not find recommendation id', async () => {
        let id = -1;
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null)

        await expect(recommendationService.downvote(id)).rejects.toEqual(notFoundError())

        expect(recommendationRepository.find).toHaveBeenCalledWith(id)
        expect(recommendationRepository.updateScore).not.toHaveBeenCalled()
    })

    it('should delete a recommendation with score less than -5', async () => {
        const recommendation = recommendationFactory.createRecommendation()
        const EXPECTED_SCORE = -5
        recommendation.score = -6

        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation)
        jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(recommendation)
        jest.spyOn(recommendationRepository, 'remove').mockResolvedValueOnce()

        await expect(recommendationService.downvote(recommendation.id)).resolves.not.toThrow()

        expect(recommendationRepository.find).toHaveBeenCalledWith(recommendation.id)
        expect(recommendationRepository.updateScore).toHaveBeenCalledWith(recommendation.id, 'decrement')
        expect(recommendation.score).toBeLessThan(EXPECTED_SCORE)
        expect(recommendationRepository.remove).toHaveBeenCalledWith(recommendation.id)
    })
})

describe('Testing GET /recommendations/:id', () => {
    it('should found an id and return recommendation correctly', async () => {
        const recommendation = recommendationFactory.createRecommendation()

        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation)

        const findRecommendation = await recommendationService.getById(recommendation.id)

        expect(findRecommendation).toEqual(recommendation)
        expect(recommendationRepository.find).toHaveBeenCalledWith(recommendation.id)
     
    })

    it('should not found id and throw not found error', async () => {
        const recommendation = recommendationFactory.createRecommendation()

        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null)

        await expect(recommendationService.getById(recommendation.id)).rejects.toEqual(notFoundError())
        expect(recommendationRepository.find).toHaveBeenCalledWith(recommendation.id)
    })
})

describe('Testing GET /recommendations', () => {
    it('should get recommendation correctly', async () => {
        const recommendation = recommendationFactory.tenRecommendations()

        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendation)

        const findAll = await recommendationService.get()

        expect(findAll).toBeInstanceOf(Array)
        expect(findAll.length).toBe(10)
        expect(findAll).toBe(recommendation)
        expect(recommendationRepository.findAll).toHaveBeenCalled()
     
    })
})

describe('Testing GET /recommendations/top/:amount', () => {
    it('should get many recommendation ordered by score', async () => {
        const recommendations = recommendationFactory.orderedTenRecommendations()
        const amount = 10

        jest.spyOn(recommendationRepository, 'getAmountByScore').mockResolvedValueOnce(recommendations)

        const topRecommendations = await recommendationService.getTop(amount)

        expect(topRecommendations).toBeInstanceOf(Array)
        expect(topRecommendations.length).toBe(amount)
        expect(topRecommendations).toBe(recommendations)
        expect(recommendationRepository.getAmountByScore).toHaveBeenCalledWith(amount)
     
    })
})


describe('Testing GET /recommendations/random', () => {
    it('Should return 200 given a random recommendation with score less than or equal 10', async () => {
        const recommendations = recommendationFactory.tenRecommendations()

        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations)
        jest.spyOn(Math, 'random').mockReturnValue(0.7)

        const randomRecommendation = await recommendationService.getRandom()

        expect(randomRecommendation).toBeInstanceOf(Object)
        expect(recommendations).toContain(randomRecommendation)
        expect(Math.random).toHaveBeenCalled()
        expect(recommendationRepository.findAll).toHaveBeenCalled()
    })

    it('Should return 200 given a random recommendation with score greater than or equal', async () => {
        const recommendations = recommendationFactory.tenRecommendations()

        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations)
        jest.spyOn(Math, 'random').mockReturnValue(0.6)

        const randomRecommendation = await recommendationService.getRandom()

        expect(randomRecommendation).toBeInstanceOf(Object)
        expect(recommendations).toContain(randomRecommendation)
        expect(Math.random).toHaveBeenCalled()
        expect(recommendationRepository.findAll).toHaveBeenCalled()
    })

    it('should return not found (404) if not found any recommendation', async () => {
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce([])
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce([])

        await expect(recommendationService.getRandom).rejects.toEqual(notFoundError())

        expect(recommendationRepository.findAll).toHaveBeenCalled()
    })
})

