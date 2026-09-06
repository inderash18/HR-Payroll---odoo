import { api } from '../api/client';

export const searchService = {
  /**
   * Search across Odoo with RBAC and multi-tenancy
   * @param {string} query - Search term
   * @param {number} limit - Max results per group
   * @returns {Promise<{query: string, groups: Array}>}
   */
  async globalSearch(query, limit = 10) {
    if (!query || query.trim().length === 0) {
      return { query: '', groups: [] };
    }
    const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
    return res.data?.data || res.data || { query, groups: [] };
  },
};
