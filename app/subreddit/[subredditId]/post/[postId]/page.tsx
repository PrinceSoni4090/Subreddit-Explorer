import PostPageClient from "./PostPageClient";

export default function PostPage({
  params,
}: {
  params: { subredditId: string; postId: string };
}) {
  return <PostPageClient params={params} />;
}
