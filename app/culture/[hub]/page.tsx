import { notFound } from 'next/navigation';
import { CultureDocument } from '@/components/site/CultureDocument';
import { getCulturePage, listCultureHubs } from '@/content/culture/registry';
import { buildCultureMetadata } from '@/core/seo/cultureMetadata';

export function generateStaticParams() {
  return listCultureHubs().map((h) => ({ hub: h.hub }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const { hub } = await params;
  const page = getCulturePage(hub);
  if (!page) return {};
  const ogImage = page.ogImage ?? `/assets/og/culture-${page.hub}.png`;
  return buildCultureMetadata(page, ogImage);
}

export default async function CultureHubPage({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const { hub } = await params;
  const page = getCulturePage(hub);
  if (!page) notFound();
  return <CultureDocument page={page} />;
}
