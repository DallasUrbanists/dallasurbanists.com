/**
 * RSS-based Substack embed (client-side)
 * - Finds elements matching `.substack-feed-embed` or `#substack-feed-embed`
 * - Pulls configuration from data-* attributes with sensible defaults
 * - Fetches the Substack RSS (via rss2json) and renders simple cards
 *
 * Optional global defaults:
 *   window.SubstackFeedWidget = { substackUrl: '', posts: 3, showImages: true, showDates: true };
 */
(function () {
  const globalDefaults = (window.SubstackFeedWidget || {});
  const defaults = {
    substackUrl: '',
    posts: 3,
    showImages: true,
    showDates: true,
    ...globalDefaults
  };

  const containers = document.querySelectorAll('.substack-feed-embed, #substack-feed-embed');
  if (!containers.length) return;

  const fmtDate = (iso) => {
    try {
      // Use reader’s locale; tweak if you want a fixed one
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso));
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
    a.className = 'substack-card';
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = post.link;

    const wrap = document.createElement('div');
    wrap.className = 'substack-post';

    if (opts.showImages) {
      const imgUrl = extractFirstImg(post.content);
      if (imgUrl) {
        const img = document.createElement('img');
        img.className = 'substack-thumbnail';
        img.loading = 'lazy';
        img.sizes = '568px';
        img.alt = post.title || 'Substack post image';
        img.src = imgUrl;
        wrap.appendChild(img);
      }
    }

    const body = document.createElement('div');

    const h3 = document.createElement('h3');
    h3.className = 'substack-title';
    h3.textContent = decodeHTMLEntities(post.title) || 'Untitled';
    body.appendChild(h3);

    if (opts.showDates && post.pubDate) {
      const pDate = document.createElement('p');
      pDate.className = 'substack-date';
      pDate.textContent = `${fmtDate(post.pubDate)} by ${post.author || 'Dallas Urbanists'}`;
      body.appendChild(pDate);
    }

    const pDesc = document.createElement('p');
    pDesc.className = 'substack-desc';
    // Use description (plaintext-ish from rss2json) and truncate
    pDesc.textContent = truncate(decodeHTMLEntities(post.description), 160);
    body.appendChild(pDesc);

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
      substackUrl: container.getAttribute('data-substack-url') || defaults.substackUrl,
      posts: parseInt(container.getAttribute('data-posts'), 10) || defaults.posts,
      showImages: (container.getAttribute('data-show-images') || `${defaults.showImages}`) !== 'false',
      showDates: (container.getAttribute('data-show-dates') || `${defaults.showDates}`) !== 'false'
    };

    if (!cfg.substackUrl) {
      container.innerHTML = '<p class="substack-error">Error: No Substack URL specified.</p>';
      return;
    }

    const feedBase = normalizeUrl(cfg.substackUrl);
    const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`${feedBase}/feed`)}`;

    // Minimal skeleton while loading (optional)
    container.innerHTML = '<div class="substack-skeleton">Loading…</div>';

    try {
      const res = await fetchWithTimeout(rssUrl, 12000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.status !== 'ok' || !Array.isArray(data.items)) {
        throw new Error(data.message || 'Failed to parse feed');
      }

      const posts = data.items.slice(0, Math.max(1, cfg.posts));
      if (!posts.length) {
        container.innerHTML = '<p class="substack-empty">No posts available.</p>';
        return;
      }

      console.log(posts);

      // Clear and render
      container.innerHTML = '';
      posts.forEach((post) => {
        container.appendChild(buildCard(post, cfg));
      });
    } catch (err) {
      console.error('Substack feed error:', err);
      container.innerHTML = '<p class="substack-error">Could not load posts. Please try again later.</p>';
    }
  });
})();

function decodeHTMLEntities(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return doc.documentElement.textContent;
}