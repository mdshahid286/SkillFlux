# Tech News Page Setup

## News API Integration

The Tech News page now fetches live news via the backend proxy (`/api/news`) with caching. Here's how to set it up:

### 1. Get News API Key

1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Environment Configuration

Create a `.env` file in the `client` directory and add:

```env
REACT_APP_API_BASE_URL=http://localhost:5000

Also create a `.env` file in the `server` directory and add:

```
NEWS_API_KEY=your-actual-newsapi-key-here
NEWS_CACHE_TTL_MS=60000
```
```

### 3. API Limits

- **Free Tier**: 1,000 requests per day
- **Rate Limit**: 1 request per second
- **Articles**: Up to 20 articles per request

### 4. Features

The Tech News page includes:

- **Real-time News**: Fetches latest tech news from NewsAPI via backend proxy
- **Category Filtering**: Technology, Programming, AI/ML, Cybersecurity, Startups, Mobile
- **Search Functionality**: Search through article titles and descriptions
- **Auto Refresh**: Refreshes news every 60 seconds
- **Responsive Design**: Works on all device sizes
- **Fallback Data**: Shows mock data if API is unavailable
- **Error Handling**: Graceful error messages and retry options

### 5. Categories Available

- 💻 Technology
- ⚡ Programming  
- 🤖 AI & ML
- 🔒 Cybersecurity
- 🚀 Startups
- 📱 Mobile

### 6. Mock Data

If the News API is not configured or fails, the page will show mock data for development purposes.

### 7. Customization

You can customize:
- Number of articles per page (currently 20)
- Categories and their search terms
- Styling and layout
- Error messages and fallback content

## Usage

1. Ensure server is running (default `http://localhost:5000`)
2. Navigate to `/news` in your application
2. Select a category to filter news
3. Use the search bar to find specific topics
4. Click "Read Full Article" to open the original source
5. Use the refresh button to get the latest news

## Troubleshooting

- **No articles showing**: Check your API key and internet connection
- **API errors**: Verify your API key is correct and you haven't exceeded rate limits
- **Images not loading**: Some articles may not have images; fallback images are provided
