'use client';

import { CupResultGlyph } from '../components/CupResultGlyph';

/** 开场：文化介绍（圣杯/笑杯/阴杯）+ 开始按钮。 */
export function IntroScene({ onStart }: { onStart: () => void }) {
  return (
    <section className="intro rise">
      <header className="intro__header">
        <p className="intro__index">仪式说明 / 先静心，再落杯</p>
        <h2 className="intro__title">把问题留在掌心，<br />等杯象落定。</h2>
        <p className="intro__lead">
          潮汕掷筊以一对半月形筊杯回应心里的询问。开始后可以<strong>双手合十静心默念</strong>，也可在舞台下方写下这一问。
        </p>
      </header>

      <ul className="intro__specimens">
        <li className="intro__specimen intro__specimen--sheng">
          <CupResultGlyph result="sheng" size={58} />
          <div><strong>圣杯</strong><em>一凸一平</em><span>所愿可行，仍要亲自走稳。</span></div>
        </li>
        <li className="intro__specimen intro__specimen--xiao">
          <CupResultGlyph result="xiao" size={58} />
          <div><strong>笑杯</strong><em>两片皆平</em><span>问题未明，可稍后再问。</span></div>
        </li>
        <li className="intro__specimen intro__specimen--yin">
          <CupResultGlyph result="yin" size={58} />
          <div><strong>阴杯</strong><em>两片皆凸</em><span>此刻不宜强求，静待时机。</span></div>
        </li>
      </ul>

      <footer className="intro__footer">
        <p className="intro__note">连掷三杯，杯象只作片刻参考。游戏内容仅供娱乐。</p>
        <button className="btn btn--gold intro__start" onClick={onStart}>开始这一问</button>
      </footer>
    </section>
  );
}
