class SimpleSearchEngine {
    constructor(contentstackService) {
        this.cs = contentstackService;
        this.allBusinesses = [];
        this.allReviews = [];
    }

    async initialize() {
        // Load all data once
        this.allBusinesses = await this.cs.getAllBusinesses();
        this.allReviews = await this.cs.getAllReviews();
        console.log(`Loaded ${this.allBusinesses.length} businesses and ${this.allReviews.length} reviews`);
    }

    smartSearch(query, filters = {}) {
        if (!query) return this.filterBusinesses(this.allBusinesses, filters);

        const queryWords = query.toLowerCase().split(' ');
        const results = [];

        this.allBusinesses.forEach(business => {
            let score = 0;
            const searchText = this.createSearchableText(business).toLowerCase();

            // Simple keyword matching with scoring
            queryWords.forEach(word => {
                const wordCount = (searchText.match(new RegExp(word, 'g')) || []).length;
                score += wordCount;

                // Boost score for exact matches in important fields
                if (business.business_name && business.business_name.toLowerCase().includes(word)) {
                    score += 5;
                }
                if (business.category && business.category.toLowerCase().includes(word)) {
                    score += 3;
                }
                if (business.tags && business.tags.some(tag => tag.toLowerCase().includes(word))) {
                    score += 2;
                }
            });

            if (score > 0) {
                results.push({
                    business,
                    score,
                    reviews: this.getBusinessReviews(business.uid)
                });
            }
        });

        // Sort by score
        results.sort((a, b) => b.score - a.score);

        // Apply filters
        const filteredResults = this.filterBusinesses(results.map(r => r.business), filters);
        
        return results.filter(r => filteredResults.includes(r.business));
    }

    createSearchableText(business) {
        const reviews = this.getBusinessReviews(business.uid);
        const reviewTexts = reviews.map(r => r.review_text || '').join(' ');
        const services = Array.isArray(business.services) ? business.services.join(' ') : (business.services || '');
        const tags = Array.isArray(business.tags) ? business.tags.join(' ') : (business.tags || '');

        return `${business.business_name || ''} ${business.description || ''} ${business.category || ''} ${services} ${tags} ${reviewTexts}`;
    }

    getBusinessReviews(businessUid) {
        return this.allReviews.filter(review => 
            review.business_ref && review.business_ref.uid === businessUid
        );
    }

    filterBusinesses(businesses, filters) {
        let filtered = [...businesses];

        if (filters.category) {
            filtered = filtered.filter(b => 
                b.category && b.category.toLowerCase().includes(filters.category.toLowerCase())
            );
        }

        if (filters.location) {
            filtered = filtered.filter(b => 
                b.location && b.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        if (filters.priceRange) {
            filtered = filtered.filter(b => b.price_range === filters.priceRange);
        }

        return filtered;
    }
}