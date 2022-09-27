import { recommendationService } from '../../src/services/recommendationsService'
import { recommendationRepository } from '../../src/repositories/recommendationRepository'
import * as recommendationFactory from '../factory/recommendationFactory'
import { conflictError, notFoundError } from '../../src/utils/errorUtils'

beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
})

describe('POST /recommendations', () => {
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

describe('POST /recommendations/:id/upvote', () => {
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

