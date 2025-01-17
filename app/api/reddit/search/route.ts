import { NextResponse } from 'next/server';

const REDDIT_API_BASE = 'https://oauth.reddit.com';

async function getAccessToken() {
  const basic = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT || '',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Search subreddits with authentication
    const searchResponse = await fetch(
      `${REDDIT_API_BASE}/subreddits/search?q=${encodeURIComponent(query)}&limit=10&sort=relevance`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': process.env.REDDIT_USER_AGENT || '',
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Reddit API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    // Transform the response to match your expected format
    const subreddits = searchData.data.children.map((child: any) => ({
      id: child.data.name,
      name: child.data.display_name,
      description: child.data.public_description,
      subscribers: child.data.subscribers,
      url: child.data.url,
    }));

    return NextResponse.json({
      subreddits,
      after: searchData.data.after,
      before: searchData.data.before,
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search subreddits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
