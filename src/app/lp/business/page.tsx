import Home from "@/app/page";

type LpPageProps = {
  searchParams: Promise<{
    ab?: string;
    scene?: string;
    src?: string;
    utm_source?: string;
    win?: string;
  }>;
};

export default async function LpBusinessPage({ searchParams }: LpPageProps) {
  const query = await searchParams;
  return Home({
    searchParams: Promise.resolve({
      ...query,
      lp: "business",
      scene: query.scene ?? "checkin",
    }),
  });
}
