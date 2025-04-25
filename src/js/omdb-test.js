import { 
    getMovieDetailsByTitle, 
    searchOMDB, 
    getEnhancedMovieDetails,
    getTVShowDetailsByTitle
} from './api.js';

// Test function to verify OMDB API is working
async function testOMDBAPI() {
    console.log('Testing OMDB API...');
    
    try {
        // Test 1: Get movie details by title
        console.log('Test 1: Getting movie details for "The Matrix"');
        const matrixDetails = await getMovieDetailsByTitle('The Matrix');
        console.log('Matrix details:', matrixDetails);
        
        // Test 2: Search for movies
        console.log('Test 2: Searching for "Avengers"');
        const searchResults = await searchOMDB('Avengers', 'movie');
        console.log('Search results:', searchResults);
        
        // Test 3: Get TV show details
        console.log('Test 3: Getting TV show details for "Breaking Bad"');
        const breakingBadDetails = await getTVShowDetailsByTitle('Breaking Bad');
        console.log('Breaking Bad details:', breakingBadDetails);
        
        // Display results on page
        displayResults([
            { name: 'Movie Details (The Matrix)', data: matrixDetails },
            { name: 'Search Results (Avengers)', data: searchResults },
            { name: 'TV Show Details (Breaking Bad)', data: breakingBadDetails }
        ]);
        
    } catch (error) {
        console.error('Error testing OMDB API:', error);
        displayError(error);
    }
}

// Display test results on the page
function displayResults(results) {
    // Create container for results
    const container = document.createElement('div');
    container.className = 'omdb-test-results';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.left = '20px';
    container.style.right = '20px';
    container.style.bottom = '20px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    container.style.color = 'white';
    container.style.padding = '20px';
    container.style.overflow = 'auto';
    container.style.zIndex = '10000';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '14px';
    
    // Add header
    const header = document.createElement('h2');
    header.textContent = 'OMDB API Test Results';
    header.style.color = '#f5c518';
    container.appendChild(header);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#f5c518';
    closeButton.style.color = 'black';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(container);
    });
    container.appendChild(closeButton);
    
    // Add results
    results.forEach(result => {
        const resultSection = document.createElement('div');
        resultSection.style.marginBottom = '20px';
        resultSection.style.borderBottom = '1px solid #333';
        resultSection.style.paddingBottom = '20px';
        
        const resultName = document.createElement('h3');
        resultName.textContent = result.name;
        resultName.style.color = '#f5c518';
        resultSection.appendChild(resultName);
        
        const resultData = document.createElement('pre');
        resultData.textContent = JSON.stringify(result.data, null, 2);
        resultData.style.backgroundColor = '#1a1a1a';
        resultData.style.padding = '10px';
        resultData.style.borderRadius = '4px';
        resultData.style.overflow = 'auto';
        resultData.style.maxHeight = '300px';
        resultSection.appendChild(resultData);
        
        container.appendChild(resultSection);
    });
    
    // Add to body
    document.body.appendChild(container);
}

// Display error on the page
function displayError(error) {
    const container = document.createElement('div');
    container.className = 'omdb-test-error';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.left = '20px';
    container.style.right = '20px';
    container.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
    container.style.color = 'white';
    container.style.padding = '20px';
    container.style.zIndex = '10000';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '14px';
    
    const header = document.createElement('h2');
    header.textContent = 'OMDB API Test Error';
    container.appendChild(header);
    
    const errorMessage = document.createElement('p');
    errorMessage.textContent = error.message || 'Unknown error';
    container.appendChild(errorMessage);
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = 'white';
    closeButton.style.color = 'black';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(container);
    });
    container.appendChild(closeButton);
    
    document.body.appendChild(container);
}

// Run the test when the page loads
document.addEventListener('DOMContentLoaded', testOMDBAPI);