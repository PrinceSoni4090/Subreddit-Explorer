import { NextResponse } from 'next/server';

const REDDIT_API_BASE = 'https://oauth.reddit.com';

async function getAccessToken() {
  try {
    console.log('Getting access token with credentials:', {
      clientId: process.env.REDDIT_CLIENT_ID,
      userAgent: process.env.REDDIT_USER_AGENT,
    });

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token error response:', errorText);
      throw new Error(`Token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token received');
    }
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    console.log('Fetching post with params:', { postId });

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Fetch post data with authentication using the by_id endpoint
    const postUrl = `${REDDIT_API_BASE}/by_id/t3_${postId}`;
    console.log('Fetching post from URL:', postUrl);

    const postResponse = await fetch(
      postUrl,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': process.env.REDDIT_USER_AGENT || '',
        },
      }
    );

    console.log('Post response status:', postResponse.status);

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error('Post error response:', errorText);
      throw new Error(`Reddit API error: ${postResponse.status} - ${errorText}`);
    }

    const postData = await postResponse.json();
    
    if (!postData.data?.children?.[0]?.data) {
      console.error('Invalid post data structure:', JSON.stringify(postData, null, 2));
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = postData.data.children[0].data;
    
    // Transform the response to match your expected format
    const transformedPost = {
      id: post.id,
      title: post.title,
      selftext: post.selftext,
      author: post.author,
      subreddit: post.subreddit,
      ups: post.ups,
      downs: post.downs,
      num_comments: post.num_comments,
      created_utc: post.created_utc,
      url: post.url,
      post_hint: post.post_hint,
      preview: post.preview,
      media: post.media,
      is_video: post.is_video
    };

    return NextResponse.json(transformedPost);

  } catch (error) {
    console.error('Post API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
