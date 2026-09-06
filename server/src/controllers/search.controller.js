import { searchService } from '../services/search.service.js';
import { successResponse } from '../utils/response.js';

export const searchController = {
  async search(req, res, next) {
    try {
      const q = req.query.q || req.query.query || '';
      const limit = req.query.limit || 10;
      
      const data = await searchService.search(req.user, q, limit);
      return successResponse(res, data, 'Search results retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};
