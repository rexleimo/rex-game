import type { Metadata } from 'next';
import Link from 'next/link';
import { JiaobeiGame } from '@/games/shantou-jiaobei/JiaobeiGame';
import { faqItems } from '@/games/shantou-jiaobei/content/faq';
import { JIAOBEI_QUICK_ANSWER, JIAOBEI_SIGNS } from '@/games/shantou-jiaobei/content/culture';

const PAGE_URL = 'https://game.rexai.top/games/shantou-jiaobei/';
const HERO_URL = 'https://game.rexai.top/assets/jiaobei-hero.png';

export const metadata: Metadata = {
  title: '潮汕掷筊（跋杯）文化与在线筊杯体验',
  description:
    '了解潮汕掷筊、跋杯的文化背景与圣杯、阴杯、笑杯含义，并通过电影感 3D 场景体验三次在线投掷。',
  keywords: [
    '潮汕掷筊',
    '潮汕跋杯',
    '筊杯',
    '掷筊',
    '圣杯',
    '阴杯',
    '笑杯',
    '民俗文化',
    '在线筊杯',
  ],
  openGraph: {
    title: '潮汕掷筊文化与在线筊杯体验',
    description: '认识圣杯、阴杯、笑杯，在黑丝绸与香烟氛围中完成三次电影感投掷。',
    url: PAGE_URL,
    type: 'website',
    images: [{
      url: HERO_URL,
      width: 1200,
      height: 630,
      alt: '六枚血红色新月形筊杯分为圣杯、阴杯、笑杯三组陈列在黑丝绸上',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '潮汕掷筊文化与在线筊杯体验',
    description: '了解筊杯三种常见组合，并体验三次电影感在线投掷。',
    images: [HERO_URL],
  },
  alternates: { canonical: '/games/shantou-jiaobei/' },
};

const sources = [
  {
    name: '国立台湾历史博物馆典藏：筊杯',
    href: 'https://collections.nmth.gov.tw/CollectionContent.aspx?a=132&rno=2006.003.0191.0001',
  },
  {
    name: '教育百科：掷筊',
    href: 'https://pedia.cloud.edu.tw/Entry/Detail/?title=%E6%93%B2%E7%AD%8A',
  },
  {
    name: '国家文化记忆库：掷筊相关文化记录',
    href: 'https://tcmb.culture.tw/zh-tw/detail?id=247158&indexCode=Culture_Place',
  },
];

export default function ShantouJiaobeiPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': PAGE_URL + '#webpage',
        url: PAGE_URL,
        name: '潮汕掷筊（跋杯）文化与在线筊杯体验',
        description: '潮汕掷筊文化说明、三种常见杯象与电影感在线互动体验。',
        inLanguage: 'zh-CN',
        dateModified: '2026-07-17',
        primaryImageOfPage: { '@type': 'ImageObject', url: HERO_URL },
        breadcrumb: { '@id': PAGE_URL + '#breadcrumb' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': PAGE_URL + '#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'rex-game', item: 'https://game.rexai.top/' },
          { '@type': 'ListItem', position: 2, name: '潮汕掷筊', item: PAGE_URL },
        ],
      },
      {
        '@type': 'VideoGame',
        '@id': PAGE_URL + '#game',
        name: '潮汕掷筊在线体验',
        description: '以两枚物理筊杯完成三次投掷，并获得综合杯象解读。',
        url: PAGE_URL,
        image: HERO_URL,
        applicationCategory: 'Game',
        genre: ['CasualGame', 'CulturalGame'],
        inLanguage: 'zh-CN',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Webcam access is optional.',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        publisher: { '@type': 'Organization', name: 'rex-game', url: 'https://game.rexai.top/' },
      },
      {
        '@type': 'HowTo',
        name: '如何体验在线潮汕掷筊',
        step: [
          { '@type': 'HowToStep', position: 1, name: '静心默念', text: '在心中整理一个清楚、具体的问题。' },
          { '@type': 'HowToStep', position: 2, name: '选择方式', text: '使用摄像头手势，或直接点击投掷按钮。' },
          { '@type': 'HowToStep', position: 3, name: '完成三掷', text: '观察两枚筊杯每一次落地后的平面与凸面组合。' },
          { '@type': 'HowToStep', position: 4, name: '阅读结果', text: '结合三次杯象查看本次互动的综合说明。' },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <JiaobeiGame />

      <article className="jiaobei-guide" id="jiaobei-guide">
        <header className="jiaobei-guide__hero">
          <p>快速回答 / Quick answer</p>
          <h2>什么是潮汕掷筊（跋杯）？</h2>
          <div className="jiaobei-guide__answer">
            <p>
              {JIAOBEI_QUICK_ANSWER}
            </p>
            <p>
              本页面先提供可操作的电影感在线体验，再以可见文字说明常见含义、体验步骤与资料来源。它是文化展示，不替代真实仪式、地方传承或个人判断。
            </p>
          </div>
        </header>

        <section className="jiaobei-guide__section" aria-labelledby="signs-title">
          <div className="jiaobei-guide__heading">
            <span>01</span>
            <div><p>三种常见杯象</p><h3 id="signs-title">圣、阴、笑如何分辨？</h3></div>
          </div>
          <div className="jiaobei-guide__signs">
            {JIAOBEI_SIGNS.map((sign) => <article key={sign.result}><strong>{sign.name}</strong><b>{sign.faces}</b><p>{sign.meaning}。</p></article>)}
          </div>
          <p className="jiaobei-guide__caveat">名称、正反面称法、投掷次数和判读礼序会因地区、庙宇及家庭传统而不同，请以当地习俗为准。</p>
        </section>

        <section className="jiaobei-guide__section" aria-labelledby="steps-title">
          <div className="jiaobei-guide__heading">
            <span>02</span>
            <div><p>立即体验</p><h3 id="steps-title">四步完成在线投掷</h3></div>
          </div>
          <ol className="jiaobei-guide__steps">
            <li><span>1</span><div><strong>静心整理问题</strong><p>尽量让问题具体、单一，避免一次询问多件事。</p></div></li>
            <li><span>2</span><div><strong>选择输入方式</strong><p>可启用摄像头做抬手、落手动作，也可直接点击按钮。</p></div></li>
            <li><span>3</span><div><strong>观察三次落杯</strong><p>每次均由两枚物理筊杯落地，记录平面与凸面的组合。</p></div></li>
            <li><span>4</span><div><strong>阅读综合说明</strong><p>三次完成后展开结果，并把它视为文化互动而非决策依据。</p></div></li>
          </ol>
        </section>

        <section className="jiaobei-guide__section" aria-labelledby="faq-title">
          <div className="jiaobei-guide__heading">
            <span>03</span>
            <div><p>常见问题</p><h3 id="faq-title">关于潮汕筊杯的简明回答</h3></div>
          </div>
          <dl className="jiaobei-guide__faq">
            {faqItems.map((item) => <div key={item.question}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}
          </dl>
        </section>

        <footer className="jiaobei-guide__sources">
          <div><p>资料与边界</p><h3>继续了解掷筊文化</h3></div>
          <p>
            <Link href="/culture/jiaobei/">文化枢纽：潮汕掷筊</Link>
            {' · '}
            <Link href="/culture/jiaobei/sheng-yin-xiao/">圣阴笑含义</Link>
            {' · '}
            <Link href="/culture/jiaobei/how-to-read/">如何读杯</Link>
            {' · '}
            <Link href="/culture/jiaobei/online-vs-ritual/">在线与仪式</Link>
          </p>
          <ul>{sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.name}<span aria-hidden>↗</span></a></li>)}</ul>
          <p className="jiaobei-guide__disclaimer">本文综合公开文化资料作通识说明，不宣称覆盖所有地方传统；若用于真实礼俗，请尊重当地庙宇、长辈与传承者的指引。</p>
        </footer>
      </article>
    </>
  );
}
