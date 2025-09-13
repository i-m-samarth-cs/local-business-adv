class BusinessAdvisorApp {
    constructor() {
        this.cs = new ContentstackService();
        this.searchEngine = new SimpleSearchEngine(this.cs);
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.initialize();
    }

    async initialize() {
        this.showLoading(true);
        await this.searchEngine.initialize();
        this.showLoading(false);
        
        // Show all businesses initially
        this.performSearch();
    }

    initializeEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const locationFilter = document.getElementById('locationFilter');
        const priceFilter = document.getElementById('priceFilter');

        searchBtn.addEventListener('click', () => this.performSearch());
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Filter changes
        [categoryFilter, locationFilter, priceFilter].forEach(filter => {
            filter.addEventListener('change', () => this.performSearch());
        });
    }

    async performSearch() {
        if (this.isLoading) return;

        const query = document.getElementById('searchInput').value.trim();
        const filters = {
            category: document.getElementById('categoryFilter').value,
            location: document.getElementById('locationFilter').value,
            priceRange: document.getElementById('priceFilter').value
        };

        this.showLoading(true);
        
        try {
            const results = this.searchEngine.smartSearch(query, filters);
            this.displayResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            this.displayError('Sorry, something went wrong. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(results, query) {
        const resultsContainer = document.getElementById('results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No businesses found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                </div>
            `;
            return;
        }

        const resultsHTML = `
            <div class="results-header">
                <h2>Found ${results.length} businesses${query ? ` for "${query}"` : ''}</h2>
            </div>
            <div class="business-grid">
                ${results.map(result => this.createBusinessCard(result)).join('')}
            </div>
        `;

        resultsContainer.innerHTML = resultsHTML;
    }

    createBusinessCard(result) {
        const business = result.business;
        const reviews = result.reviews || [];
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
            : 'N/A';

        const services = Array.isArray(business.services) 
            ? business.services.slice(0, 3).join(', ')
            : (business.services || 'Services not listed');

        const tags = Array.isArray(business.tags)
            ? business.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        return `
            <div class="business-card">
                <div class="business-header">
                    <h3>${business.business_name || 'Business Name Not Available'}</h3>
                    <div class="business-meta">
                        <span class="category">${business.category || 'Uncategorized'}</span>
                        <span class="location">📍 ${business.location || 'Location not specified'}</span>
                    </div>
                </div>

                <div class="business-info">
                    <p class="description">${business.description || 'No description available'}</p>
                    
                    <div class="business-details">
                        <div class="detail-row">
                            <strong>Services:</strong> ${services}
                        </div>
                        
                        ${business.price_range ? `
                            <div class="detail-row">
                                <strong>Price Range:</strong> ${business.price_range}
                            </div>
                        ` : ''}
                        
                        ${business.operating_hours ? `
                            <div class="detail-row">
                                <strong>Hours:</strong> ${business.operating_hours}
                            </div>
                        ` : ''}
                        
                        ${business.phone ? `
                            <div class="detail-row">
                                <strong>Phone:</strong> ${business.phone}
                            </div>
                        ` : ''}
                    </div>

                    ${tags ? `<div class="tags">${tags}</div>` : ''}
                </div>

                <div class="business-footer">
                    <div class="rating">
                        <span class="stars">${this.generateStars(parseFloat(avgRating))}</span>
                        <span class="rating-text">${avgRating} (${reviews.length} reviews)</span>
                    </div>
                    
                    ${result.score ? `
                        <div class="match-score">
                            <span class="score-label">Match:</span>
                            <span class="score-value">${Math.min(100, Math.round(result.score * 10))}%</span>
                        </div>
                    ` : ''}
                </div>

                ${reviews.length > 0 ? `
                    <div class="recent-review">
                        <h4>Recent Review:</h4>
                        <p>"${reviews[0].review_text}"</p>
                        <small>- ${reviews[0].reviewer_name}</small>
                    </div>
                ` : ''}
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        if (hasHalfStar) {
            stars += '☆';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        
        return stars || '☆☆☆☆☆';
    }

    showLoading(show) {
        this.isLoading = show;
        const loading = document.getElementById('loading');
        const searchBtn = document.getElementById('searchBtn');
        
        if (show) {
            loading.classList.remove('hidden');
            searchBtn.textContent = 'Searching...';
            searchBtn.disabled = true;
        } else {
            loading.classList.add('hidden');
            searchBtn.textContent = 'Search';
            searchBtn.disabled = false;
        }
    }

    displayError(message) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
            <div class="error">
                <h3>Oops!</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BusinessAdvisorApp();
});