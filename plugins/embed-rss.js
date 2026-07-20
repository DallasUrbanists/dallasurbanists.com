/**
 * Client-side embed of an RSS feed. Originally designed for Substack, but can be used for any kind of RSS feed
 * - Finds elements with a `data-rss-url` attribute
 * - Pulls configuration from data-* attributes with sensible defaults
 * - Fetches the RSS feed (via rss2json) and renders simple cards
 */
(function () {
  const defaults = {
    rssUrl: '',
    subtitlePrefix: '',
    filterTitle: null,
    removeTitle: null,
    showDuplicates: true,
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
    syncWithCalendar: false,
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

  const formatDate = (iso, style='published') => {
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

  const chooseThumbnailByTitle = title => {
    const t = title.trim().toLowerCase();
    const has = parts => {
      for (part of parts) if (!t.includes(part)) return false;
      return true;
    };
    if (has(['urbanists', 'bimonthly', 'mixer'])) return 'mixer may 2026.jpg';
    if (has(['downtown', 'hyperlocal conversation'])) return 'hyperlocals/downtown hlc.jpg';
    if (has(['cedars', 'hyperlocal conversation'])) return 'hyperlocals/cedars hlc.jpg';
    if (has(['uptown', 'oak lawn', 'conversation'])) return 'hyperlocals/uptown oak lawn hlc.jpg';
    if (has(['midtown', 'hyperlocal conversation'])) return 'hyperlocals/midtown hlc.jpg';
    if (has(['far north dallas', 'hyperlocal conversation'])) return 'hyperlocals/fnd hlc.jpg';
    if (has(['hyperlocal conversation'])) return 'hyperlocals/downtown hlc.jpg';
    return 'generic event cover.jpg';
  };

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

    // Render thumbnail, if enabled
    if (opts.showThumbnails) {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail';
      card.appendChild(thumbnail);

      // Use thumbnail property as image source, if provided
      if ('thumbnail' in post && typeof post.thumbnail === 'string' && post.thumbnail.trim() !== '') {
        thumbnail.style.backgroundImage = `url(${post.thumbnail})`;
      }
      // Otherwise, try to extract image from post content
      else {
        const imgUrl = extractFirstImg(post.content);
        if (imgUrl) {
          thumbnail.style.backgroundImage = `url(${imgUrl})`;
        } else {
          const fallback = chooseThumbnailByTitle(post.title);
          thumbnail.style.backgroundImage = `url('/assets/${fallback}')`;
        }
      }
    }

    const body = document.createElement('div');
    body.className = 'body';
    card.appendChild(body);

    const titleText = decodeHTMLEntities(post.title) || 'Untitled';
    const titleParts = titleText.split(':');
    let titleHTML = titleParts.length > 1 ? `<b>${titleParts[0]}:</b> ${titleParts.slice(1).join(':')}` : titleText;
    if (opts.removeTitle !== null && typeof opts.removeTitle === 'string') {
      if (opts.removeTitle.includes('|')) {
        opts.removeTitle.split('|').forEach(remove => {
          titleHTML = titleHTML.replace(remove, '').replace(' :', ':');
        });
      } else {
        titleHTML = titleHTML.replace(opts.removeTitle, '').replace(' :', ':');
      }
    }

    const title = document.createElement(opts.titleElement);
    title.className = 'title';
    title.innerHTML = titleHTML;
    body.appendChild(title);
    card.title = titleText;

    card.classList.add('title_only');
    if (showSubtitle) {
      let subtitleContent = '';
      let descriptionContent = '';
      const subtitle = document.createElement('p');
      subtitle.className = 'subtitle';
      const date = opts.dateProp in post ? formatDate(post[opts.dateProp], opts.dateFormat) : null;
      const author = (opts.authorProp in post && typeof post[opts.authorProp] === 'string' && post[opts.authorProp].trim() !== '') ? post[opts.authorProp] : null;
      if (showDate && date && showAuthor && author) {
        subtitleContent = `${date} by ${author}`;
      } else if (showDate && date) {
        subtitleContent = date;
      } else if (showAuthor && author) {
        subtitleContent = author;
      }
      if (showDescription && opts.descriptionProp in post && typeof post[opts.descriptionProp] === 'string') {
        descriptionContent = decodeHTMLEntities(marked.parse(post[opts.descriptionProp]), 160);
      }
      if (subtitleContent !== '' && descriptionContent !== '') {
        subtitleContent += '—'+descriptionContent;
      } else if (descriptionContent !== '') {
        subtitleContent = descriptionContent;
      }
      if (subtitleContent !== '') {
        subtitle.innerHTML = opts.subtitlePrefix + subtitleContent;
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
      filterTitle: container.getAttribute('data-filter-title') || defaults.filterTitle,
      subtitlePrefix: container.getAttribute('data-subtitle-prefix') || defaults.subtitlePrefix,
      removeTitle: container.getAttribute('data-remove-title') || defaults.removeTitle,
      showDuplicates: (container.getAttribute('data-show-duplicates') || `${defaults.showDuplicates}`) !== 'false',
      posts: parseInt(container.getAttribute('data-posts'), 10) || defaults.posts,
      showThumbnails: (container.getAttribute('data-show-thumbnails') || `${defaults.showThumbnails}`) !== 'false',
      showDates: (container.getAttribute('data-show-dates') || `${defaults.showDates}`) !== 'false',
      showAuthors: (container.getAttribute('data-show-authors') || `${defaults.showAuthors}`) !== 'false',
      showDescriptions: (container.getAttribute('data-show-descriptions') || `${defaults.showDescriptions}`) !== 'false',
      largePosts: parseInt(container.getAttribute('data-large-posts'), 1) || defaults.largePosts,
      largeShowThumbnails: (container.getAttribute('data-large-show-thumbnails') || `${defaults.largeShowThumbnails}`) !== 'false',
      largeShowDates: (container.getAttribute('data-large-show-dates') || `${defaults.largeShowDates}`) !== 'false',
      largeShowAuthors: (container.getAttribute('data-large-show-authors') || `${defaults.largeShowAuthors}`) !== 'false',
      largeShowDescriptions: (
        container.getAttribute('data-large-show-descriptions') || `${defaults.largeShowDescriptions}`
      ) !== 'false',
      titleElement: container.getAttribute('data-title-element') || defaults.titleElement,
      dateProp: container.getAttribute('data-date-prop') || defaults.dateProp,
      authorProp: container.getAttribute('data-author-prop') || defaults.authorProp,
      descriptionProp: container.getAttribute('data-description-prop') || defaults.descriptionProp,
      dateFormat: container.getAttribute('data-date-format') || defaults.dateFormat,
      syncWithCalendar: (container.getAttribute('data-sync-with-calendar') || `${defaults.syncWithCalendar}`) !== 'false',
    };

    if (!cfg.rssUrl) {
      container.innerHTML = '<p class="feed-error">Error: No RSS URL specified.</p>';
      return;
    }

    const feedBase = normalizeUrl(cfg.rssUrl);
    const encodedFeedUrl = encodeURIComponent(`${feedBase}`);
    const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedFeedUrl}`;

    // Minimal skeleton while loading (optional)
    container.innerHTML = '<div class="feed-skeleton">Loading…</div>';

    const draw = async () => {
      try {
        let data;
        const cachedData = fetchCachedData(feedBase);
        if (isCacheReady(cachedData)) {
          data = cachedData;
        } else {
          const res = await fetchWithTimeout(rssUrl, 12000);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = await res.json();
          if (data.status !== 'ok' || !Array.isArray(data.items)) {
            throw new Error(data.message || 'Failed to parse feed');
          }
          updateCachedData(feedBase, data);
        }

        const uniqueTitles = [];
        const posts = data.items
          .map(item => {
            if (cfg.syncWithCalendar && window.syncedEvents) {
              const meetupEventId = item.guid.split('/').filter(g => g !== '').pop(); // Extract the event ID from the guid
              const matchingEvent = window.syncedEvents.find(event =>
                event.remote_id &&
                event.remote_id.includes(`event_${meetupEventId}@meetup.com`)
              );
              return matchingEvent ? { ...matchingEvent, ...item} : null;
            }
            return item;
          })
          .filter(item => {
            if (!item) {
              return false;
            }
            const filterByTitle = cfg.filterTitle !== null && typeof cfg.filterTitle === 'string';
            if (filterByTitle) {
              const titleHasFilter = item.title.trim().toLowerCase().includes(cfg.filterTitle);
              if (titleHasFilter) {
                if (!cfg.showDuplicates) {
                  if (uniqueTitles.includes(item.title)) {
                    return false;
                  } else {
                    uniqueTitles.push(item.title);
                    return true;
                  }
                }
                return true;
              } else {
                return false;
              }
            }
            return true;
          })
          .slice(0, Math.max(1, cfg.posts));

        if (!posts.length) {
          container.innerHTML = '<p class="feed-empty">No posts available.</p>';
          return;
        }

        // Clear and render
        container.innerHTML = '';
        posts.forEach((post, index) => {
          if (index === 0) {
            container.setAttribute('earliestDate', post[cfg.dateProp])
          }
          container.appendChild(buildCard(post, cfg, index));
        });
        window.dispatchEvent(new CustomEvent('FeedDrawn'));
      } catch (err) {
        console.error('RSS feed error:', err);
        container.innerHTML = '<p class="feed-error">Could not load posts. Please try again later.</p>';
      }
    };

    draw();

    if (cfg.syncWithCalendar) {
      window.addEventListener('TeamupSynced', e => { draw(); });
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
    return diffInMins < cacheMinutesTTL;
  }
  return false;
}

function updateCachedData(feedBase, data) {
  data.storeDate = new Date();
  localStorage.setItem('cached_rss_'+feedBase, JSON.stringify(data));
}