/**
 * Detects when an article is 25%, 50%, and 100% complete based on scroll position.
 * The read status of an article is saved in local storage to avoid sending multiple read events to Google Analytics within a single browser session.
 * Note that in order for this to work, the Google Analytics JS code snippet needs to already be imported. Otherwise, the `gtag()` function will be undefined
 * 
 * @param string articleSelector    The DOM article element
 * @param string articleTitle       The title of the article
 */
function detectReadComplete(articleSelector, articleTitle) {
    // Generate a hash based on the article title to be used for uniquely organizing article progress in local storage
    const titleHash = (function(str) {
        let hashString = 0;
        for (let character of str) {
           let charCode = character.charCodeAt(0);
           hashString = hashString << 5 - hashString;
           hashString += charCode;
           hashString |= hashString;
        }
        return hashString;
    })(articleTitle);

    // Helper methods for storing and retreiving values about article from local storage
    const getStoredValue = (key) => localStorage.getItem(titleHash + '-' + key) === 'true';
    const setStoredValue = (key, value) => localStorage.setItem(titleHash + '-' + key, value ?? false);
    
    // Helper method for sending events to Google Analytics
    const sendReadCompleteEvent = (readStatus) => gtag('send', 'event', 'READ', readStatus, articleTitle);

    // Get the read completion status for this article from local storage
    let isQuarterComplete = getStoredValue('isQuarterComplete');
    let isHalfComplete = getStoredValue('isHalfComplete');
    let isFullyComplete = getStoredValue('isFullyComplete');

    // This is the DOM element represneting the entire article
    let articleElement = document.querySelector(articleSelector);

    // This is appended to the end of the article. We'll use this to detect when the article is complete
    let endOfArticle = document.createElement('div');
    endOfArticle.id = 'end-of-article';
    articleElement.appendChild(endOfArticle);

    // Every time page scrolls, check how much of article has been viewed
    document.addEventListener('scroll', (event) => {
        // These are the viewport width and height
        let viewportWidth = (window.innerWidth || document.documentElement.clientWidth);
        let viewportHeight = (window.innerHeight || document.documentElement.clientHeight);

        // This has the x,y coordinates of the article element relative to the viewport
        let articlePosition = articleElement.getBoundingClientRect();

        // This is what articlePosition.top would be less than or equal to
        // when 25% the article has moved passed the top of the viewport
        let quarterPoint = (articleElement.offsetHeight - viewportHeight) / 4 * -1;

        // This is what articlePosition.top would be less than or equal to
        // when the halfway point of the article has been reached
        let halfwayPoint = (articleElement.offsetHeight - viewportHeight) / 2 * -1;

        // This has the x,y coordinates of the end of the article relative to the viewport
        let endPosition = endOfArticle.getBoundingClientRect();

        // Check if we've reached the end of the article
        if (!isFullyComplete && endPosition.top >= 0 && endPosition.bottom <= viewportHeight) {
            console.log('Read complete article');
            sendReadCompleteEvent('Read complete article');
            isFullyComplete = true;

        // Check if we've reached the quarter point of the article
        } else if (!isQuarterComplete && articlePosition.top <= quarterPoint) {
            console.log('Read 25% of article');
            sendReadCompleteEvent('Read 25% of article');
            isQuarterComplete = true;

        // Check if we've reached the halfway point of the article
        } else if (!isHalfComplete && articlePosition.top <= halfwayPoint) {
            console.log('Read 50% of article');
            sendReadCompleteEvent('Read 50% article');
            isHalfComplete = true;
        }

        // Remember any changes to the article's read status 
        setStoredValue('isQuarterComplete', isQuarterComplete);
        setStoredValue('isHalfComplete', isHalfComplete);
        setStoredValue('isFullyComplete', isFullyComplete);
    });
}