// Teamup API details
const teamupAPIToken = 'fa68b6f0d704a55141e7ba70b0497ddec7852b815ce24df37d8c19482f308f01';
const teamupAPIBaseURL = 'https://api.teamup.com/ksmwn2f7yyqnumzf3r/';

// Cache keys based on current date and time to avoid hitting API more than once per minute
const upcomingCacheKey = 'upcoming' + cacheKey();
const pastCacheKey = 'past' + cacheKey();
function cacheKey() {
    const d = new Date();
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const D = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${Y}${M}${D}${h}${m}`;
}

// Determine mode from URL parameter
let mode = 'upcoming';
const setMode = (newMode) => mode = newMode;
const urlParams = new URLSearchParams(window.location.search || '');
if ((urlParams.get('mode') || '').toLowerCase() === 'past') {
    mode = 'past';
}

let foundEvents = [];
const fetchedEvent = document.createEvent('HTMLEvents');
fetchedEvent.initEvent('fetchedEvents', true, true);

function findEvents() {
    let storedEvents = localStorage.getItem(mode === 'upcoming' ? upcomingCacheKey : pastCacheKey);
    if (storedEvents) {
        console.log(`Using cached ${mode} events (${mode === 'upcoming' ? upcomingCacheKey : pastCacheKey})`);
        foundEvents = JSON.parse(storedEvents);
        console.log(foundEvents);
        document.dispatchEvent(fetchedEvent);
    } else {
        console.log(`Using fresh ${mode} events`);
        fetchEvents(mode).then((results) => {
            const useKey = mode === 'upcoming' ? upcomingCacheKey : pastCacheKey;
            foundEvents = results;
            // Clear out old cache entries
            Object.keys(localStorage).forEach(key => {
                if (typeof key === 'string' && key.startsWith(mode)) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.setItem(useKey, JSON.stringify(foundEvents));
            console.log(foundEvents);
            document.dispatchEvent(fetchedEvent);
        });
    }
}

async function fetchEvents(mode) {
    let startDate = new Date();
    let endDate = new Date(startDate);
    let sortFunction;
    const format = (date) => date.toISOString().split('T')[0];
    if (mode === 'upcoming') {
        endDate.setMonth(endDate.getMonth() + 6);
        sortFunction = (a, b) => new Date(a.start_dt) - new Date(b.start_dt);
    } else {
        startDate.setMonth(startDate.getMonth() - 6);
        endDate.setDate(endDate.getDate() - 1);
        sortFunction = (a, b) => new Date(b.start_dt) - new Date(a.start_dt);
    }
    const params = new URLSearchParams({ 'startDate': format(startDate), 'endDate': format(endDate) });
    try {
        const response = await fetch(
            `${teamupAPIBaseURL}events?${params}`,
            {
                method: "GET", headers: { "Teamup-Token": teamupAPIToken }
            });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        const found = result.events;
        found.sort(sortFunction);

        console.log(found);

        // limit to the first 100 items
        return found.slice(0, 100);
    } catch (error) {
        console.error(error.message);
    }
    return [];
}

findEvents();
