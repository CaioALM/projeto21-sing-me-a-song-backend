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

