import Link from 'next/link';
import { Reveal } from './Reveal';

const GATEWAYS = [
  {
    q: '节气 · 一年如何被拆成 24 段?',
    teaser: '四立、二至二分、物候与农时——用排序和配对把时序装进手指记忆。',
    count: '1 篇导读',
    href: '/culture/jieqi/',
  },
  {
    q: '掷筊 · 圣杯怎么看?',
    teaser: '一平一凸为圣杯,两平为笑杯……快速回答 + 判读口诀 + 线上与庙里的差别。',
    count: '3 篇导读',
    href: '/culture/jiaobei/',
  },
  {
    q: '英歌 · 为什么叫「战舞」?',
    teaser: '脸谱、槌法、队形——从水浒角色到巡游节奏,一次讲清。',
    count: '2 篇导读',
    href: '/culture/yingge/',
  },
  {
    q: '剪纸 · 纹样里的吉祥话',
    teaser: '莲年有余、喜上眉梢——每个纹样都是一句可以剪出来的祝福。',
    count: '2 篇导读',
    href: '/culture/jianzhi/',
  },
];

export function CultureGateway() {
  return (
    <div className="gateway">
      {GATEWAYS.map((g, i) => (
        <Reveal key={g.href} delay={i * 90}>
          <Link className="gateway__card" href={g.href}>
            <span className="gateway__q">{g.q}</span>
            <span className="gateway__teaser">{g.teaser}</span>
            <span className="gateway__count">{g.count} →</span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
