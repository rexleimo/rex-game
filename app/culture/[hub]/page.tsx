import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CultureDocument } from '@/components/site/CultureDocument';
import { getCulturePage, listCultureHubs } from '@/content/culture/registry';
import { SITE_ORIGIN } from '@/content/site';

export function generateStaticParams() {
  return listCultureHubs().map((h) => ({ hub: h.hub }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string }>;
}): Promise<Metadata> {
  const { hub } = await params;
  const page = getCulturePage(hub);
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
