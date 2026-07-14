async function SyncWithTeamupCalendar(mode = 'upcoming') {
    // Teamup API details
    const teamupAPIToken = 'fa68b6f0d704a55141e7ba70b0497ddec7852b815ce24df37d8c19482f308f01';
    const teamupAPIBaseURL = 'https://api.teamup.com/ksmwn2f7yyqnumzf3r/';

    // Cache keys based on current date and time to avoid hitting API more than once per minute
    const d = new Date();
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const D = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const cacheKey = `${mode}${Y}${M}${D}${h}${m}`;

    const fetchEvents = async (mode) => {
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
            const response = await fetch(`${teamupAPIBaseURL}events?${params}`, {
                method: "GET", headers: { "Teamup-Token": teamupAPIToken }
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const result = await response.json();
            const found = result.events;
            found.sort(sortFunction);
            // limit to the first 100 items
            return found.slice(0, 100);
        } catch (error) {
            console.error(error.message);
        }
        return [];
    };

    let storedEvents = localStorage.getItem(cacheKey);
    if (storedEvents) {
        window.syncedEvents = JSON.parse(storedEvents);
        window.dispatchEvent(new CustomEvent('TeamupSynced', { detail: { syncedEvents: window.syncedEvents }}));
    } else {
        fetchEvents(mode).then((results) => {
            window.syncedEvents = results;
            window.dispatchEvent(new CustomEvent('TeamupSynced', { detail: { syncedEvents: window.syncedEvents }}));

            // Clear out old cache entries
            Object.keys(localStorage).forEach(key => {
                if (typeof key === 'string' && key.startsWith(mode)) {
                    localStorage.removeItem(key);
                }
            });
            // Add new cache entry
            localStorage.setItem(cacheKey, JSON.stringify(syncedEvents));
        });
    }
}