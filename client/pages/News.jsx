import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

//  API Keys for multiple news sources
const NEWS_APIS = {
  gnews: '904dd807db2f1b8735aa9f91d0c5916f', // Your current GNews key
  mediastack: 'a8578630c7451b28bd1ee8b89b63b868', // MediaStack API (browser-friendly)
};

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    let allArticles = [];

    try {
      // Try both APIs in sequence
      const apis = [
        () => fetchFromGNews(),
        () => fetchFromMediaStack(),
      ];

      for (const apiCall of apis) {
        try {
          const articles = await apiCall();
          if (articles && articles.length > 0) {
            console.log(`API returned ${articles.length} articles from ${articles[0]?.apiSource}`);
            allArticles = [...allArticles, ...articles];
          }
        } catch (apiError) {
          console.warn('API failed:', apiError.message);
        }
      }

      console.log(`Total articles before filtering: ${allArticles.length}`);
      console.log('API sources:', [...new Set(allArticles.map(a => a.apiSource))]);

      // Remove duplicates and filter for Mithi River content
      const uniqueArticles = removeDuplicates(allArticles);
      console.log('Unique articles before Mithi filter:', uniqueArticles.map(a => ({
        title: a.title,
        source: a.apiSource,
        hasMithi: a.title.toLowerCase().includes('mithi') || a.description.toLowerCase().includes('mithi')
      })));

      const mithiArticles = uniqueArticles.filter(article => {
        const title = article.title.toLowerCase();
        const description = article.description.toLowerCase();
        const hasMithi = title.includes('mithi') || description.includes('mithi');
        if (!hasMithi) {
          console.log(`Filtered out (no Mithi): "${article.title}" from ${article.apiSource}`);
        }
        return hasMithi;
      });

      console.log(`Found ${allArticles.length} total articles, ${mithiArticles.length} about Mithi River`);
      console.log('Final Mithi articles by source:', [...new Set(mithiArticles.map(a => a.apiSource))]);

      if (mithiArticles.length === 0) {
        throw new Error('No articles mentioning Mithi River found across both APIs');
      }

      // Ensure balanced mix from both sources
      const gnewsArticles = mithiArticles.filter(a => a.apiSource === 'GNews');
      const mediastackArticles = mithiArticles.filter(a => a.apiSource === 'MediaStack');
      
      console.log(`GNews articles: ${gnewsArticles.length}, MediaStack articles: ${mediastackArticles.length}`);
      
      // Interleave articles from both sources for balanced display
      const balancedArticles = [];
      const maxLength = Math.max(gnewsArticles.length, mediastackArticles.length);
      
      for (let i = 0; i < maxLength && balancedArticles.length < 12; i++) {
        if (i < gnewsArticles.length) balancedArticles.push(gnewsArticles[i]);
        if (i < mediastackArticles.length && balancedArticles.length < 12) balancedArticles.push(mediastackArticles[i]);
      }
      
      console.log('Final balanced articles:', balancedArticles.map(a => `${a.apiSource}: ${a.title.substring(0, 50)}...`));
      
      setArticles(balancedArticles);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Both news APIs failed:', err);
      setError(err.message);
      setArticles(getFallbackNews());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // GNews API
  const fetchFromGNews = async () => {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q="Mithi River"&lang=en&max=10&apikey=${NEWS_APIS.gnews}`
    );
    const data = await response.json();
    
    if (data.errors) throw new Error(`GNews: ${data.errors[0]}`);
    if (!response.ok) throw new Error(`GNews: ${data.message || 'Failed to fetch'}`);
    
    return data.articles?.map(article => ({
      id: `gnews-${article.url}`,
      title: article.title,
      description: article.description,
      date: new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      source: article.source.name,
      url: article.url,
      imageUrl: article.image,
      category: categorizeArticle(article.title + ' ' + article.description),
      apiSource: 'GNews'
    })) || [];
  };

  // MediaStack API (browser-friendly)
  const fetchFromMediaStack = async () => {
    if (!NEWS_APIS.mediastack || NEWS_APIS.mediastack === 'YOUR_MEDIASTACK_KEY_HERE') {
      throw new Error('MediaStack key not configured');
    }

    const response = await fetch(
      `http://api.mediastack.com/v1/news?access_key=${NEWS_APIS.mediastack}&keywords=Mithi River&languages=en&limit=10&sort=published_desc`
    );
    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(`MediaStack: ${data.error?.info || 'Failed to fetch'}`);
    }
    
    return data.data?.map(article => ({
      id: `mediastack-${article.url}`,
      title: article.title,
      description: article.description,
      date: new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      source: article.source,
      url: article.url,
      imageUrl: article.image || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      category: categorizeArticle(article.title + ' ' + article.description),
      apiSource: 'MediaStack'
    })) || [];
  };

  const removeDuplicates = (articles) => {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const categorizeArticle = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('pollution') || lowerText.includes('contamination')) return 'Alert';
    if (lowerText.includes('conservation') || lowerText.includes('clean')) return 'Conservation';
    if (lowerText.includes('technology') || lowerText.includes('innovation')) return 'Technology';
    return 'Update';
  };

  const getFallbackNews = () => {
    return [
      {
        id: 1,
        title: "Mithi River Flooding Impact on Mumbai",
        description: "Heavy monsoon rains cause Mithi River to overflow, affecting thousands of residents in low-lying areas.",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        source: "Times of India",
        url: "https://timesofindia.indiatimes.com/city/mumbai",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        category: "Alert"
      },
      {
        id: 2,
        title: "BMC Launches Mithi River Cleaning Drive",
        description: "Municipal corporation initiates comprehensive cleanup campaign to remove plastic waste and restore water quality along the 17.84 km stretch.",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        source: "Mumbai Mirror",
        url: "https://mumbaimirror.indiatimes.com",
        imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
        category: "Conservation"
      },
      {
        id: 3,
        title: "Smart Sensors Monitor Mithi River Water Quality",
        description: "IoT-enabled sensors deployed across 15 locations provide real-time data on pollution levels, pH, and dissolved oxygen in Mithi River.",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        source: "Indian Express",
        url: "https://indianexpress.com",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
        category: "Technology"
      },
      {
        id: 4,
        title: "Mithi River Pollution Levels Exceed Safe Limits",
        description: "Latest tests reveal BOD and COD levels far above permissible standards, raising concerns about ecosystem health and public safety.",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        source: "Hindustan Times",
        url: "https://hindustantimes.com",
        imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800",
        category: "Alert"
      },
      {
        id: 5,
        title: "Community Groups Join Hands for Mithi River Revival",
        description: "Local NGOs and resident associations collaborate on tree plantation and waste management initiatives along Mithi River banks.",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        source: "Mid-Day",
        url: "https://mid-day.com",
        imageUrl: "https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?w=800",
        category: "Conservation"
      },
      {
        id: 6,
        title: "Mithi River: From Lifeline to Liability",
        description: "Analysis of how rapid urbanization and industrial discharge transformed Mumbai's vital waterway into one of India's most polluted rivers.",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        source: "The Hindu",
        url: "https://thehindu.com",
        imageUrl: "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=800",
        category: "Update",
        apiSource: "Fallback"
      }
    ];
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Alert': return 'destructive';
      case 'Conservation': return 'default';
      case 'Technology': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Fetching news from multiple sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mithi River News</h1>
              <p className="text-gray-600">Latest updates from multiple news sources</p>
              {lastUpdated && (
                <p className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
              )}
            </div>
            {/* Refresh News button removed as requested */}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Could not fetch live news</p>
              <p className="text-sm text-yellow-700 mt-1">Error: {error}</p>
              <p className="text-xs text-yellow-600 mt-2">💡 Showing fallback articles about Mithi River</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-3 right-3" variant={getCategoryColor(article.category)}>
                  {article.category}
                </Badge>
                {article.apiSource && (
                  <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                    {article.apiSource}
                  </Badge>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{article.date}</span>
                  <span></span>
                  <span>{article.source}</span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{article.description}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  Read Full Article
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
