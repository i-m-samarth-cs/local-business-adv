// Simple Contentstack API wrapper
class ContentstackService {
    constructor() {
        
        this.apiKey = 'bltaf83a8b6f9539df1';
        this.deliveryToken = 'cs27c622d275c0377875f60535';
        this.environment = 'production';
        this.baseURL = `https://api.contentstack.io/v3`;
    }

    async getAllBusinesses() {
        try {
            const url = `${this.baseURL}/content_types/business_listing/entries?environment=${this.environment}&include_reference=business_ref`;
            
            const response = await fetch(url, {
                headers: {
                    'api_key': this.apiKey,
                    'access_token': this.deliveryToken
                }
            });
            
            const data = await response.json();
            return data.entries || [];
        } catch (error) {
            console.error('Error fetching businesses:', error);
            return [];
        }
    }

    async getAllReviews() {
        try {
            const url = `${this.baseURL}/content_types/review/entries?environment=${this.environment}&include_reference=business_ref`;
            
            const response = await fetch(url, {
                headers: {
                    'api_key': this.apiKey,
                    'access_token': this.deliveryToken
                }
            });
            
            const data = await response.json();
            return data.entries || [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }

    async searchBusinesses(query, filters = {}) {
        try {
            let url = `${this.baseURL}/content_types/business_listing/entries?environment=${this.environment}&include_reference=business_ref`;
            
            // Add simple text search
            if (query) {
                url += `&query={"$or":[{"business_name":{"$regex":"${query}","$options":"i"}},{"description":{"$regex":"${query}","$options":"i"}},{"category":{"$regex":"${query}","$options":"i"}},{"tags":{"$regex":"${query}","$options":"i"}}]}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'api_key': this.apiKey,
                    'access_token': this.deliveryToken
                }
            });
            
            const data = await response.json();
            let results = data.entries || [];
            
            // Apply client-side filters
            if (filters.category) {
                results = results.filter(business => 
                    business.category && business.category.toLowerCase().includes(filters.category.toLowerCase())
                );
            }
            
            if (filters.location) {
                results = results.filter(business => 
                    business.location && business.location.toLowerCase().includes(filters.location.toLowerCase())
                );
            }
            
            if (filters.priceRange) {
                results = results.filter(business => 
                    business.price_range === filters.priceRange
                );
            }
            
            return results;
        } catch (error) {
            console.error('Error searching businesses:', error);
            return [];
        }
    }
}