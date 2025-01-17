import SubredditPageClient from "./SubredditPageClient";

export default function SubredditPage({
  params,
}: {
  params: { subredditId: string };
}) {
  return <SubredditPageClient params={params} />;
}
