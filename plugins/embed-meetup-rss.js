/**
 * RSS-based Meetup embed (client-side)
 */
(function () {
  const globalDefaults = (window.MeetupFeedWidget || {});
  const defaults = {
    meetupUrl: '',
    posts: 3,
    showImages: true,
    showDates: true,
    ...globalDefaults
  };

  // Cache keys based on current date and time to avoid hitting API more than once per minute
  function cacheKey() {
      const d = new Date();
      const Y = d.getFullYear();
      const M = String(d.getMonth() + 1).padStart(2, '0');
      const D = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const nearestTenMinutes = Math.floor(d.getMinutes() / 10) * 10; // Round down to nearest 10 minutes
      const m = String(nearestTenMinutes).padStart(2, '0');
      return `meetup_${Y}${M}${D}${h}${m}`;
  }

  const containers = document.querySelectorAll('.meetup-feed-embed, #meetup-feed-embed');
  if (!containers.length) return;

  const fmtDate = (iso) => {
    try {
      // Use reader’s locale; tweak if you want a fixed one
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", hour12: true,
  minute: "numeric" };
      return new Intl.DateTimeFormat(undefined, options).format(new Date(iso));
    } catch {
      return '';
    }
  };

  const normalizeUrl = (u) => {
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  };

  const extractFirstImg = (html) => {
    if (!html) return null;
    const m = html.match(/<img[^>]+src="([^"]+)"/i);
    return m ? m[1] : null;
  };

  const truncate = (str, max = 150) => (str && str.length > max ? `${str.slice(0, max)}…` : (str || ''));

  const buildCard = (post, opts) => {
    const a = document.createElement('a');
    a.className = 'meetup-card';
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = post.link;

    const wrap = document.createElement('div');
    wrap.className = 'meetup-post';

    if (opts.showImages) {
      const imgUrl = 'assets/hyperlocals/cedars.jpg';
      if (imgUrl) {
        const img = document.createElement('img');
        img.className = 'meetup-thumbnail';
        img.loading = 'lazy';
        img.sizes = '568px';
        img.alt = post.title || 'Meetup post image';
        img.src = imgUrl;
        wrap.appendChild(img);
      }
    }

    const body = document.createElement('div');

    const h3 = document.createElement('h3');
    const postTitle = (decodeHTMLEntities(post.title) || 'Untitled')
      .replace('Hyperlocal Conversation', "<span class='text-muted'>Hyperlocal Conversation</span>");
    h3.className = 'meetup-title';
    h3.innerHTML = postTitle;
    body.appendChild(h3);

    if (opts.showDates && post.pubDate) {
      const pDate = document.createElement('p');
      const formattedDate = fmtDate(post.start_dt).replace(', 2026 at', ' at');
      pDate.className = 'meetup-date';
      pDate.innerHTML = `Next meeting ${formattedDate}`;
      body.appendChild(pDate);
    }

    // const pDesc = document.createElement('p');
    // pDesc.className = 'meetup-desc';
    // // Use description (plaintext-ish from rss2json) and truncate
    // pDesc.textContent = truncate(decodeHTMLEntities(post.description), 160);
    // body.appendChild(pDesc);

    wrap.appendChild(body);
    a.appendChild(wrap);
    return a;
  };

  const fetchWithTimeout = (url, ms = 10000) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal }).finally(() => clearTimeout(t));
  };

  containers.forEach(async (container) => {
    const cfg = {
      meetupUrl: container.getAttribute('data-meetup-url') || defaults.meetupUrl,
      posts: parseInt(container.getAttribute('data-posts'), 10) || defaults.posts,
      showImages: (container.getAttribute('data-show-images') || `${defaults.showImages}`) !== 'false',
      showDates: (container.getAttribute('data-show-dates') || `${defaults.showDates}`) !== 'false',
      filter: (container.getAttribute('data-filter') || '').toLowerCase().trim() || null,
      skipDuplicates: (container.getAttribute('data-skip-duplicates') || 'false') === 'true'
    };

    if (!cfg.meetupUrl) {
      container.innerHTML = '<p class="meetup-error">Error: No Meetup URL specified.</p>';
      return;
    }

    const feedBase = normalizeUrl(cfg.meetupUrl);
    const encodedFeedUrl = encodeURIComponent(`${feedBase}/events/rss`);
    const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedFeedUrl}`;

    // Minimal skeleton while loading (optional)
    container.innerHTML = '<div class="meetup-skeleton">Loading…</div>';

    document.addEventListener('fetchedEvents', async () => {
      console.log('event detected');
      try {
        let items;

        // Determine if we have a cached version of the events
        const cachedEvents = localStorage.getItem(cacheKey());

        if (cachedEvents) {
          console.log('Using cached meetup events');
          items = JSON.parse(cachedEvents);
        } else {
          console.log('Fetching fresh meetup events');
          const res = await fetchWithTimeout(rssUrl, 12000);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          if (data.status !== 'ok' || !Array.isArray(data.items)) {
            throw new Error(data.message || 'Failed to parse feed');
          }
          items = data.items;
          localStorage.setItem(cacheKey(), JSON.stringify(items));
        }

        const posts = items
          .map(item => {
            const meetupEventId = item.guid.split('/').filter(g => g !== '').pop(); // Extract the event ID from the guid
            const matchingEvent = foundEvents.find(event =>
              event.remote_id &&
              event.remote_id.includes(`event_${meetupEventId}@meetup.com`)
            );
            if (matchingEvent) {
              return {
                ...item,
                ...matchingEvent
              };
            }
            return null;
          })
          .filter(item => {
            if (cfg.filter) {
              return item !== null && item.title.toLowerCase().includes(cfg.filter);
            }
            return item !== null;
          })
          .toSorted((a, b) => new Date(a.start_dt) - new Date(b.start_dt));

        if (!posts.length) {
          container.innerHTML = '<p class="meetup-empty">No posts available.</p>';
          return;
        }

        console.log(posts.map(
          p => ({ title: p.title, date: p.start_dt, ...p })
        ));

        // Clear and render
        const renderedTitles = [];
        container.innerHTML = '';
        posts.forEach((post) => {
          if (cfg.skipDuplicates && renderedTitles.includes(post.title)) {
            return;
          }
          renderedTitles.push(post.title);
          container.appendChild(buildCard(post, cfg));
        });
      } catch (err) {
        console.error('Meetup feed error:', err);
        container.innerHTML = '<p class="meetup-error">Could not load posts. Please try again later.</p>';
      }
    });
  });
})();

function decodeHTMLEntities(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return doc.documentElement.textContent;
}