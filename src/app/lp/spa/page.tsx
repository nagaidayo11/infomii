import Home from "@/app/page";

type LpPageProps = {
  searchParams: Promise<{
    ab?: string;
    scene?: string;
    src?: string;
    utm_source?: string;
  }>;
};

export default async function LpSpaPage({ searchParams }: LpPageProps) {
  const query = await searchParams;
  return Home({
    searchParams: Promise.resolve({
      ...query,
      lp: "spa",
      scene: query.scene ?? "bath",
    }),
  });
}
