/* EagleEyE — news
   GET /api/news
   Fetches Ghana stock market & finance news from multiple sources.
   All sources are directly related to GSE, Ghana finance, or
   African capital markets.
   Cache: 2 hours
*/

const FEEDS = [
  // ---- GSE OFFICIAL ----
  {
    url: 'https://gse.com.gh/feed/',
    source: 'Ghana Stock Exchange',
    category: 'GSE Official',
  },
  // ---- GHANA FINANCIAL PRESS ----
  {
    url: 'https://thebftonline.com/category/markets/feed/',
    source: 'Business & Financial Times',
    category: 'Markets',
  },
  {
    url: 'https://thebftonline.com/category/banking-finance/feed/',
    source: 'Business & Financial Times',
    category: 'Banking & Finance',
  },
  {
    url: 'https://citibusinessnews.com/category/stocks/feed/',
    source: 'Citi Business News',
    category: 'Stocks',
  },
  {
    url: 'https://citibusinessnews.com/category/banking/feed/',
    source: 'Citi Business News',
    category: 'Banking',
  },
  {
    url: 'https://myjoyonline.com/business/feed/',
    source: 'MyJoyOnline Business',
    category: 'Business',
  },
  // ---- GOOGLE NEWS RSS (best fallback — no auth, works from Vercel) ----
  {
    url: 'https://news.google.com/rss/search?q=Ghana+Stock+Exchange+GSE&hl=en-GH&gl=GH&ceid=GH:en',
    source: 'Google News',
    category: 'GSE News',
  },
  {
    url: 'https://news.google.com/rss/search?q=GSE+Ghana+shares+stocks&hl=en-GH&gl=GH&ceid=GH:en',
    source: 'Google News',
    category: 'Ghana Stocks',
  },
  {
    url: 'https://news.google.com/rss/search?q=Ghana+stock+market+investment&hl=en&gl=GH&ceid=GH:en',
    source: 'Google News',
    category: 'Investment',
  },
  // ---- WEST AFRICA CAPITAL MARKETS ----
  {
    url: 'https://businessday.ng/capital-market/feed/',
    source: 'BusinessDay',
    category: 'Capital Markets',
  },
  {
    url: 'https://nairametrics.com/category/stock-market/feed/',
    source: 'Nairametrics',
    category: 'Stock Markets',
  },
];

// Keywords that must appear for an article to pass the finance filter
const FINANCE_KEYWORDS = [
  'gse', 'ghana stock', 'stock exchange', 'shares', 'dividend',
  'ipo', 'listing', 'market cap', 'equity', 'investor', 'trading',
  'portfolio', 'investment', 'securities', 'capital market',
  'mtn ghana', 'gcb', 'ecobank', 'calbank', 'access bank',
  'goil', 'ggbl', 'guinness ghana', 'total energies',
  'kasapreko', 'republic bank', 'enterprise group',
  'bond', 'yield', 'interest rate', 'bank of ghana',
  'sec ghana', 'pension', 'mutual fund',
  'nairobi', 'nigerian stock', 'african market', 'west africa finance',
];

function isFinanceRelated(title, desc) {
  const text = (title + ' ' + desc).toLowerCase();
  return FINANCE_KEYWORDS.some(kw => text.includes(kw));
}

function parseRSS(xml, source, defaultCategory) {
  const items = [];
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  for (const match of blocks) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? (m[1] || m[2] || '').trim() : '';
    };
    const title = get('title')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
      .replace(/<[^>]+>/g, '').trim();
    const link    = get('link') || (block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()) || '';
    const pubDate = get('pubDate') || get('dc:date') || get('published') || '';
    const desc    = get('description').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').substring(0, 220).trim();
    const cat     = get('category') || defaultCategory;
    const dateObj = pubDate ? new Date(pubDate) : new Date(0);

    if (!title || !link) continue;

    // Filter: only keep finance/GSE-related articles
    // GSE Official and BFT Markets feeds are always trusted — no filtering
    const trusted = source === 'Ghana Stock Exchange' || defaultCategory === 'Markets' || defaultCategory === 'Stocks' || defaultCategory === 'Capital Markets';
    if (!trusted && !isFinanceRelated(title, desc)) continue;

    items.push({
      title: title.substring(0, 130),
      link,
      date: pubDate,
      dateObj,
      description: desc,
      category: cat.substring(0, 40),
      source,
    });
    if (items.length >= 12) break;
  }
  return items;
}

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=7200', // 2 hour cache
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch(feed.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'EagleEyE/1.0 (+https://eagleeyeinvests.com)',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
        });
        clearTimeout(timeout);
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRSS(xml, feed.source, feed.category);
      } catch (e) {
        clearTimeout(timeout);
        return [];
      }
    })
  );

  // Collect, deduplicate, sort
  let articles = [];
  results.forEach(r => { if (r.status === 'fulfilled') articles = articles.concat(r.value); });

  // Deduplicate by title
  const seen = new Set();
  articles = articles.filter(a => {
    const key = a.title.toLowerCase().substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort newest first
  articles.sort((a, b) => b.dateObj - a.dateObj);

  // Format dates
  articles = articles.map(({ dateObj, date, ...rest }) => ({
    ...rest,
    date: dateObj > new Date(0)
      ? dateObj.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
  }));

  // Fallback if all feeds fail
  if (articles.length === 0) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        articles: [
          { title: 'Kasapreko PLC begins trading on the Ghana Stock Exchange', link: 'https://gse.com.gh/news-announcements/', date: '13 Jun 2026', description: 'Kasapreko Company PLC officially commenced trading on the GSE following a successful GH₵1.72 billion IPO — the largest manufacturing IPO in Ghanaian history.', category: 'GSE Official', source: 'Ghana Stock Exchange' },
          { title: 'EGH declares dividend of GH₵1.1132 per share payable July 8, 2026', link: 'https://gse.com.gh/news-announcements/', date: '10 Jun 2026', description: 'Ecobank Ghana Limited announces annual dividend of GHS 1.1132 per share, ex-date June 10, 2026.', category: 'Dividends', source: 'Ghana Stock Exchange' },
          { title: 'GSE-CI index year-to-date performance update', link: 'https://gse.com.gh', date: 'Jun 2026', description: 'The Ghana Stock Exchange Composite Index has gained over 69% year-to-date, outperforming many emerging market benchmarks.', category: 'Markets', source: 'Ghana Stock Exchange' },
          { title: 'ZEN Petroleum Holdings commences trading on GSE', link: 'https://gse.com.gh/news-announcements/', date: 'Apr 2026', description: 'ZEN Petroleum Holdings PLC officially commenced trading on the Ghana Stock Exchange Main Board.', category: 'GSE Official', source: 'Ghana Stock Exchange' },
          { title: 'Republic Bank Ghana declares dividend of GH₵0.046 per share', link: 'https://gse.com.gh/news-announcements/', date: 'May 2026', description: 'Republic Bank (Ghana) PLC announces annual dividend of GHS 0.046 per share, payable June 1, 2026.', category: 'Dividends', source: 'Ghana Stock Exchange' },
        ],
        fetched_at: new Date().toISOString(),
        fallback: true,
        sources_attempted: FEEDS.length,
        sources_succeeded: 0,
      }),
    };
  }

  return {
    statusCode: 200, headers,
    body: JSON.stringify({
      articles: articles.slice(0, 40),
      fetched_at: new Date().toISOString(),
      sources_attempted: FEEDS.length,
      sources_succeeded: results.filter(r => r.status === 'fulfilled' && r.value.length > 0).length,
      total: articles.length,
    }),
  };
};
