import React, { useState, useEffect, useCallback, useMemo } from 'react';

export default function TechNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('technology');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);

  const categories = useMemo(() => [
    { id: 'technology', name: 'Technology', icon: '💻', apiKey: 'technology', query: 'technology' },
    { id: 'artificial-intelligence', name: 'Artificial Intelligence', icon: '🤖', apiKey: 'science', query: 'artificial intelligence' },
    { id: 'startups', name: 'Startups', icon: '🚀', apiKey: 'business', query: 'startup' },
    { id: 'innovation', name: 'Innovation', icon: '💡', apiKey: 'science', query: 'innovation' },
    { id: 'job-market', name: 'Job Market', icon: '📈', apiKey: 'business', query: 'job market' }
  ], []);

  const fetchTechNews = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Map UI category to external API-supported category and query
      const selectedCatOption = categories.find(c => c.id === selectedCategory);
      const apiCategory = selectedCatOption ? selectedCatOption.apiKey : 'technology';
      const q = (searchQuery && searchQuery.trim()) ? searchQuery : (selectedCatOption ? selectedCatOption.query : 'technology');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const qs = new URLSearchParams({ q, category: apiCategory, language: 'en', pageSize: '20' }).toString();
      const response = await fetch(`${baseUrl}/api/news?${qs}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const ok = data.status === 'ok' || data.status === 'fallback';
      if (ok) {
        setArticles(data.articles || []);
        setFilteredArticles(data.articles || []);
      } else {
        throw new Error(data.message || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('Error fetching tech news:', err);
      setError('Failed to load tech news. Please try again later.');
      
      // Fallback to mock data for development
      const mockArticles = generateMockArticles();
      setArticles(mockArticles);
      setFilteredArticles(mockArticles);
    } finally {
      setLoading(false);
    }
  }, [categories, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchTechNews();
  }, [fetchTechNews]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTechNews();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchTechNews]);

  useEffect(() => {
    // Filter articles based on search query
    if (searchQuery.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  const generateMockArticles = () => {
    const mockData = [
      {
        title: "Revolutionary AI Breakthrough: New Language Model Surpasses Human Performance",
        description: "Researchers at leading tech companies have developed a new AI model that demonstrates unprecedented capabilities in natural language understanding and generation.",
        url: "https://example.com/ai-breakthrough",
        urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
        publishedAt: new Date().toISOString(),
        source: { name: "TechCrunch" }
      },
      {
        title: "JavaScript Framework Updates: React 19 and Vue 4 Release New Features",
        description: "Major updates to popular JavaScript frameworks bring improved performance, better developer experience, and new capabilities for modern web development.",
        url: "https://example.com/js-frameworks",
        urlToImage: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Dev.to" }
      },
      {
        title: "Cybersecurity Alert: New Zero-Day Vulnerability Affects Major Operating Systems",
        description: "Security researchers have discovered a critical vulnerability that could allow attackers to gain unauthorized access to systems running popular operating systems.",
        url: "https://example.com/cybersecurity",
        urlToImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "Wired" }
      },
      {
        title: "Startup Raises $50M Series B to Revolutionize Cloud Computing",
        description: "A promising startup has secured significant funding to develop next-generation cloud infrastructure solutions that promise to reduce costs and improve performance.",
        url: "https://example.com/startup-funding",
        urlToImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: "TechCrunch" }
      },
      {
        title: "Mobile App Development Trends: What's Hot in 2024",
        description: "Industry experts share insights on the latest trends in mobile app development, including cross-platform frameworks and emerging technologies.",
        url: "https://example.com/mobile-trends",
        urlToImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: "Mobile World Live" }
      }
    ];
    
    return mockData;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchTechNews();
  };

  if (loading) {
    return (
      <div className="tech-news-page">
        <div className="tech-news-container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📰</div>
            <div style={{ fontSize: '1.2rem', color: 'var(--brown)' }}>Loading latest tech news...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tech-news-page">
      <div className="tech-news-container">
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ 
              color: 'var(--brown)', 
              fontSize: '2.5rem', 
              fontWeight: '700',
              margin: '0 0 0.5rem 0'
            }}>
              Tech News
            </h1>
            <p style={{ 
              color: '#666', 
              fontSize: '1.1rem',
              margin: '0'
            }}>
              Stay updated with the latest in technology
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            style={{
              background: 'var(--brown)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '0.8rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.8rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search tech news..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                border: '2px solid var(--accent)',
                borderRadius: '1rem',
                fontSize: '1rem',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                color: 'var(--brown)',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(141, 103, 72, 0.1)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: '0.8rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              style={{
                background: selectedCategory === category.id ? 
                  'var(--brown)' : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                color: selectedCategory === category.id ? 'white' : 'var(--brown)',
                border: `2px solid ${selectedCategory === category.id ? 'var(--brown)' : 'var(--accent)'}`,
                padding: '0.8rem 1.5rem',
                borderRadius: '1rem',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: selectedCategory === category.id ? 
                  '0 4px 12px rgba(141, 103, 72, 0.3)' : 
                  '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredArticles.map((article, index) => (
            <article 
              key={index} 
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '1.2rem',
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                border: '1px solid #e0e3ea'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
            >
              {/* Article Image */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <img
                  src={article.urlToImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop'}
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {formatDate(article.publishedAt)}
                </div>
              </div>

              {/* Article Content */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    background: 'var(--brown)',
                    color: 'white',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {article.source.name}
                  </span>
                </div>

                <h3 style={{
                  color: 'var(--brown)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  lineHeight: '1.4',
                  marginBottom: '0.8rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {article.title}
                </h3>

                <p style={{
                  color: '#666',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {article.description}
                </p>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--brown)',
                    color: 'white',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '0.8rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(141, 103, 72, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 16px rgba(141, 103, 72, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(141, 103, 72, 0.3)';
                  }}
                >
                  <span>📖</span>
                  <span>Read Full Article</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* No Results */}
        {filteredArticles.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: '1.2rem',
            border: '2px dashed var(--accent)',
            marginTop: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: 'var(--brown)', marginBottom: '1rem' }}>No Articles Found</h3>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
              {searchQuery ? 
                `No articles match your search for "${searchQuery}". Try a different search term.` :
                'No articles available for this category. Try refreshing or selecting a different category.'
              }
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'var(--brown)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
