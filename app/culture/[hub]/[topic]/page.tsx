import { notFound } from 'next/navigation';
import { CultureDocument } from '@/components/site/CultureDocument';
import { getCulturePage, listCulturePages } from '@/content/culture/registry';
import { buildCultureMetadata } from '@/core/seo/cultureMetadata';

export function generateStaticParams() {
  return listCulturePages()
    .filter((p) => p.kind === 'topic')
    .map((p) => ({ hub: p.hub, topic: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string; topic: string }>;
}) {
  const { hub, topic } = await params;
  const page = getCulturePage(hub, topic);
  if (!page) return {};
  const ogImage = page.ogImage ?? `/assets/og/culture-${page.hub}-${page.slug}.png`;
  return buildCultureMetadata(page, ogImage);
}

export default async function CultureTopicPage({
  params,
}: {
  params: Promise<{ hub: string; topic: string }>;
}) {
  const { hub, topic } = await params;
  const page = getCulturePage(hub, topic);
  if (!page) notFound();
  return <CultureDocument page={page} />;
}
