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

export default async function LpResortPage({ searchParams }: LpPageProps) {
  const query = await searchParams;
  return Home({
    searchParams: Promise.resolve({
      ...query,
      lp: "resort",
      scene: query.scene ?? "bath",
    }),
  });
}
