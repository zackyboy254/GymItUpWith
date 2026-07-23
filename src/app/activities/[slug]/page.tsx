import { notFound } from 'next/navigation';
import { PROGRAM_DETAILS, PROGRAM_SLUGS } from '@/lib/programs';
import { ActivityDetail } from '@/app/programs/[slug]/page';

const activitySlugs = ['community-run', 'community-walk', 'hiking', 'meetups', 'networking', 'kids-fitness'];

export function generateStaticParams() {
  return activitySlugs.map((slug) => ({ slug }));
}

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = PROGRAM_SLUGS[slug];
  if (!program || !activitySlugs.includes(slug)) notFound();
  return <ActivityDetail detail={PROGRAM_DETAILS[program]} program={program} related="programs" />;
}
