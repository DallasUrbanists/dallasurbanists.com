// Plugin Imports
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { IdAttributePlugin } from "@11ty/eleventy";
import { deleteSync as fullclean } from 'del';


// 11ty Conig Export
export default function (eleventyConfig) {
  fullclean('_site/*');

  // Enable Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(IdAttributePlugin);
	
  // Copy the `assets` directory to the compiled site folder
  eleventyConfig.addPassthroughCopy('./assets');
  eleventyConfig.addPassthroughCopy('./styles');
  eleventyConfig.addPassthroughCopy('./plugins');
  eleventyConfig.addPassthroughCopy('./favicon*');
  eleventyConfig.addPassthroughCopy('./_redirects'); // cloudflare redirects

  // Configure (archived) blog posts as a collection
  eleventyConfig.addCollection('posts', collection =>
    collection.getFilteredByGlob('./blog/_posts/*.md').sort((a, b) => b.date - a.date)
  )

  // Configure other collections
  eleventyConfig.addCollection('groups', collection =>
    collection.getFilteredByGlob('./_groups/*.md')
  )
  eleventyConfig.addCollection('hyperlocals', collection =>
    collection.getFilteredByGlob('./_hyperlocals/*.md')
  )
  eleventyConfig.addCollection('mixers', collection =>
    collection.getFilteredByGlob('./_mixers/*.md')
  )

  // Drafts
  // https://www.11ty.dev/docs/config-preprocessors/#example-drafts
  // do not use `_drafts`, only `_posts` with `draft: true` or `published: false`
  eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
    if (data.draft || data.published === false) {
      if (process.env.ELEVENTY_RUN_MODE === "build") return false;
      else {
        if (!data.title) data.title = data.page.fileSlug; // untitled drafts
        data.title = '[Draft] ' + data.title; // show in dev
      }
    }
  });

  // Jekyll Hangovers
  // https://24ways.org/2018/turn-jekyll-up-to-eleventy/

  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: ''
  });

  // Reproduce some Jekyll Liquid filters, sometimes loosely
  eleventyConfig.addFilter('next_upcoming', next_upcoming);

  function next_upcoming(events) {
    const now = new Date();
    const upcoming = events.filter(session => new Date(session.date) > now);
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  eleventyConfig.addFilter('upcoming_only', upcoming_only);

  function upcoming_only(events) {
    const now = new Date();
    return events.filter(session => new Date(session.date) > now);
  }

  eleventyConfig.addFilter('sort_by_upcoming_session', sort_by_upcoming_session);

  function sort_by_upcoming_session(hyperlocals) {
    const now = new Date();
    return hyperlocals.slice(0).sort((a, b) => {
      const aNext = next_upcoming(a.data.sessions);
      const bNext = next_upcoming(b.data.sessions);
      if (!aNext) return 1;
      if (!bNext) return -1;
      return new Date(aNext.date) - new Date(bNext.date);
    });
  }

  eleventyConfig.addFilter('group_by', groupBy);
  eleventyConfig.addFilter('sort_by', sortBy);
  eleventyConfig.addFilter('where', where);
  eleventyConfig.addFilter('absolute_url', absolute_url);
  eleventyConfig.addFilter('relative_path', relative_path);
  eleventyConfig.addFilter('relative_url', relative_path);


  function absolute_url(value) {
    return "https://dallasurbansits.org/" + value;
  }

  function relative_path(value) {
    return value;
  }

  function where(array, key, value) {
    return array.filter(item => {
      const data = item && item.data ? item.data : item
      return typeof value === 'undefined' ? key in data : data[key] === value
    })
  }

  function sortBy(array, key) {
    return array
      .slice(0)
      .sort((a, b) =>
        a[key].toLowerCase() < b[key].toLowerCase()
          ? -1
          : a[key].toLowerCase() > b[key].toLowerCase()
            ? 1
            : 0
      )
  }

  function groupBy(array, key) {
    const get = entry => key.split('.').reduce((acc, key) => acc[key], entry)
    const map = array.reduce((acc, entry) => {
      const value = get(entry)

      if (typeof acc[value] === 'undefined') {
        acc[value] = []
      }

      acc[value].push(entry)
      return acc
    }, {})

    return Object.keys(map).reduce(
      (acc, key) => [...acc, { name: key, items: map[key] }],
      []
    )
  }

  // Liquid Include Syntax
  // https://24ways.org/2018/turn-jekyll-up-to-eleventy/
  eleventyConfig.setLiquidOptions({
    jsTruthy: true,
    strictFilters: false,
    dynamicPartials: false,
    root: [
      '_includes',
      '.'
    ]
  });
}