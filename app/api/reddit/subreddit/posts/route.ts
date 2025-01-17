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
    const subreddit = searchParams.get('subreddit')?.replace(/^r\//, '');
    const after = searchParams.get('after');
    
    if (!subreddit) {
      return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const response = await fetch(
      `${REDDIT_API_BASE}/r/${subreddit}/hot?limit=10${after ? `&after=${after}` : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': process.env.REDDIT_USER_AGENT || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    
    const posts = data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      ups: child.data.ups,
      downs: child.data.downs,
      num_comments: child.data.num_comments,
      url: child.data.url,
      created_utc: child.data.created_utc,
      thumbnail: child.data.thumbnail,
      post_hint: child.data.post_hint,
      is_video: child.data.is_video,
      media: child.data.media,
      selftext: child.data.selftext,
      subreddit: child.data.subreddit,
      preview: child.data.preview
    }));

    return NextResponse.json({
      posts,
      after: data.data.after,
      before: data.data.before
    });

  } catch (error) {
    console.error('Subreddit posts API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
