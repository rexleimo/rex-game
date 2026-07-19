import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CultureDocument } from '@/components/site/CultureDocument';
import { getCulturePage, listCulturePages } from '@/content/culture/registry';
import { SITE_ORIGIN } from '@/content/site';

export function generateStaticParams() {
  return listCulturePages()
    .filter((p) => p.kind === 'topic')
    .map((p) => ({ hub: p.hub, topic: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string; topic: string }>;
}): Promise<Metadata> {
  const { hub, topic } = await params;
  const page = getCulturePage(hub, topic);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_ORIGIN}${page.path}`,
    },
  };
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
