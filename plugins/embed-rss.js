/**
 * Client-side embed of an RSS feed. Originally designed for Substack, but can be used for any kind of RSS feed
 * - Finds elements with a `data-rss-url` attribute
 * - Pulls configuration from data-* attributes with sensible defaults
 * - Fetches the RSS feed (via rss2json) and renders simple cards
 */
(function () {
  const defaults = {
    rssUrl: '',
    posts: 3,
    showThumbnails: true,
    showDates: false,
    showAuthors: false,
    showDescriptions: false,
    titleElement: 'h3',
    largePosts: 1,
    largeShowThumbnails: true,
    largeShowDates: true,
    largeShowAuthors: true,
    largeShowDescriptions: true,
    dateProp: 'pubDate', // default for Substack articles
    authorProp: 'author', // default for Substack articles
    descriptionProp: 'description', // default for Substack articles
    dateFormat: 'published', // 'published' = July 6, 2026  'event' = Sunday, July 12 
  };

  const publishedDateFormat = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const eventDateFormat = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: "numeric",
    hourCycle: "h12",
    minute: "numeric",
    hour12: true,
  }

  const containers = document.querySelectorAll('[data-rss-url]');
  if (!containers.length) return;

  const fmtDate = (iso, style='published') => {
    try {
      let fmtOptions;
      switch (style) {
        case 'event':
          fmtOptions = eventDateFormat;
          break
        case 'published':
        default:
          fmtOptions = publishedDateFormat;
          break;
      }
      // Use reader’s locale; tweak if you want a fixed one
      return new Intl.DateTimeFormat(undefined, fmtOptions ).format(new Date(iso));
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

  const buildCard = (post, opts, index=0) => {
    // Make card large if applicable
    const isLarge = index < opts.largePosts;
    const showDate = isLarge ? opts.largeShowDates : opts.showDates;
    const showAuthor = isLarge ? opts.largeShowAuthors : opts.showAuthors;
    const showDescription = isLarge ? opts.largeShowDescriptions : opts.showDescriptions;
    const showThumbnail = isLarge ? opts.largeShowThumbnails : opts.showThumbnails;
    const showSubtitle = showDate || showAuthor || showDescription;

    // The container for the entire card
    const card = document.createElement('a');
    card.className = isLarge ? 'large card' : 'card';
    card.target = '_blank';
    card.rel = 'noopener';
    card.href = post.link;

    console.log(post);

    // Render thumbnail, if enabled
    if (opts.showThumbnails) {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail';
      card.appendChild(thumbnail);

      // Use thumbnail property as image source, if provided
      if ('thumbnail' in post && typeof post.thumbnail === 'string' && post.thumbnail !== '') {
        thumbnail.style.backgroundImage = `url(${post.thumbnail})`;
        // console.log(`Try to use post.thumbnail: ${post.thumbnail}`);
      }
      // Otherwise, try to extract image from post content
      else {
        const imgUrl = extractFirstImg(post.content);
        // console.log(`Try to use url from extracted image: ${imgUrl}`);
        if (imgUrl) {
          thumbnail.style.backgroundImage = `url(${imgUrl})`;
        }
      }
    }

    const body = document.createElement('div');
    body.className = 'body';
    card.appendChild(body);

    const titleText = decodeHTMLEntities(post.title) || 'Untitled';
    const titleParts = titleText.split(':');
    const titleHTML = titleParts.length > 1 ? `<b>${titleParts[0]}:</b> ${titleParts.slice(1).join(':')}` : titleText;

    const title = document.createElement(opts.titleElement);
    title.className = 'title';
    title.innerHTML = titleHTML;
    body.appendChild(title);

    card.classList.add('title_only');
    if (showSubtitle) {
      let subtitleContent = '';
      let descriptionContent = '';
      const subtitle = document.createElement('p');
      subtitle.className = 'subtitle';
      const date = opts.dateProp in post ? fmtDate(post[opts.dateProp], opts.dateFormat) : null;
      const author = (opts.authorProp in post && typeof post[opts.authorProp] === 'string' && post[opts.authorProp].trim() !== '') ? post[opts.authorProp] : null;
      if (showDate && date && showAuthor && author) {
        subtitleContent = `${date} by ${author}`;
      } else if (showDate && date) {
        subtitleContent = date;
      } else if (showAuthor && author) {
        subtitleContent = author;
      }
      if (showDescription && opts.descriptionProp in post && typeof post[opts.descriptionProp] === 'string') {
        descriptionContent = truncate(decodeHTMLEntities(post[opts.descriptionProp]), 160);
      }
      if (subtitleContent !== '' && descriptionContent !== '') {
        subtitleContent += '—'+descriptionContent;
      } else if (descriptionContent !== '') {
        subtitleContent = descriptionContent;
      }
      if (subtitleContent !== '') {
        subtitle.innerHTML = subtitleContent;
        body.appendChild(subtitle);
        card.classList.remove('title_only');
      }
    }

    return card;
  };

  const fetchWithTimeout = (url, ms = 10000) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal }).finally(() => clearTimeout(t));
  };

  containers.forEach(async (container) => {
    const cfg = {
      rssUrl: container.getAttribute('data-rss-url') || defaults.rssUrl,
      posts: parseInt(container.getAttribute('data-posts'), 10) || defaults.posts,
      showThumbnails: (container.getAttribute('data-show-thumbnails') || `${defaults.showThumbnails}`) !== 'false',
      showDates: (container.getAttribute('data-show-dates') || `${defaults.showDates}`) !== 'false',
      showAuthors: (container.getAttribute('data-show-authors') || `${defaults.showAuthors}`) !== 'false',
      showDescriptions: (container.getAttribute('data-show-descriptions') || `${defaults.showDescriptions}`) !== 'false',
      largePosts: parseInt(container.getAttribute('data-large-posts'), 1) || defaults.largePosts,
      largeShowThumbnails: (container.getAttribute('data-large-show-thumbnails') || `${defaults.largeShowThumbnails}`) !== 'false',
      largeShowDates: (container.getAttribute('data-large-show-dates') || `${defaults.largeShowDates}`) !== 'false',
      largeShowAuthors: (container.getAttribute('data-large-show-authors') || `${defaults.largeShowAuthors}`) !== 'false',
      largeShowDescriptions: (container.getAttribute('data-large-show-descriptions') || `${defaults.largeShowDescriptions}`) !== 'false',
      titleElement: container.getAttribute('data-title-element') || defaults.titleElement,
      dateProp: container.getAttribute('data-date-prop') || defaults.dateProp,
      authorProp: container.getAttribute('data-author-prop') || defaults.authorProp,
      descriptionProp: container.getAttribute('data-description-prop') || defaults.descriptionProp,
      dateFormat: container.getAttribute('data-date-format') || defaults.dateFormat,
    };

    if (!cfg.rssUrl) {
      container.innerHTML = '<p class="feed-error">Error: No RSS URL specified.</p>';
      return;
    }

    const feedBase = normalizeUrl(cfg.rssUrl);
    const encodedFeedUrl = encodeURIComponent(`${feedBase}/feed`);
    const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedFeedUrl}`;

    // Minimal skeleton while loading (optional)
    container.innerHTML = '<div class="feed-skeleton">Loading…</div>';

    try {
      let data;
      const cachedData = fetchCachedData(feedBase);
      if (isCacheReady(cachedData)) {
        console.log('Reuse cached data');
        data = cachedData;
      } else {
        console.log('Fetch fresh from ' + feedBase);
        const res = await fetchWithTimeout(rssUrl, 12000);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
        if (data.status !== 'ok' || !Array.isArray(data.items)) {
          throw new Error(data.message || 'Failed to parse feed');
        }
        updateCachedData(feedBase, data);
      }

      const posts = data.items.slice(0, Math.max(1, cfg.posts));
      if (!posts.length) {
        container.innerHTML = '<p class="feed-empty">No posts available.</p>';
        return;
      }

      // Clear and render
      container.innerHTML = '';
      posts.forEach((post, index) => {
        container.appendChild(buildCard(post, cfg, index));
      });
    } catch (err) {
      console.error('RSS feed error:', err);
      container.innerHTML = '<p class="feed-error">Could not load posts. Please try again later.</p>';
    }
  });
})();

function decodeHTMLEntities(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return doc.documentElement.textContent;
}

function fetchCachedData(feedBase) {
  // Try to find feed data stored in cache
  const cached = localStorage.getItem('cached_rss_'+feedBase);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch(e) {
      return null;
    }
  }
  return null;
}

function isCacheReady(cachedData) {
  const cacheMinutesTTL = 5; // minutes cached data still valid

  if (cachedData === null) return false;
  
  if ('storeDate' in cachedData) {
    const storeDate = new Date(cachedData.storeDate);
    const now = new Date();
    // 1. Subtracting dates gives the difference in milliseconds
    const diffInMs = now - storeDate; 
    // 2. Divide by 1000 (seconds) and 60 (minutes)
    const diffInMins = diffInMs  / (1000 * 60); 

    console.log(diffInMins);
    return diffInMins < cacheMinutesTTL;
  }

  return false;
}

function updateCachedData(feedBase, data) {
  data.storeDate = new Date();
  localStorage.setItem('cached_rss_'+feedBase, JSON.stringify(data));
}