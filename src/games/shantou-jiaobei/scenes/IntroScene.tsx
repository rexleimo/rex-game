import { JIAOBEI_QUICK_ANSWER, JIAOBEI_SIGNS } from '../content/culture';

const FACE_ASSETS = {
  rounded: { src: '/assets/jiaobei/jiaobei-rounded.webp', label: '凸面 / 红漆' },
  flat: { src: '/assets/jiaobei/jiaobei-flat.webp', label: '平面 / 木底' },
} as const;

/** Cinematic opening tableau: six cups arranged as the three traditional signs. */
export function IntroScene({ onStart }: { onStart: () => void }) {
  return (
    <section className="intro rise">
      <div className="intro__cinema" aria-label="六枚新月形筊杯在黑丝绸上排成圣杯、阴杯与笑杯">
        <div className="intro__silk" aria-hidden />
        <div className="intro__halo" aria-hidden />
        <div className="intro__smoke intro__smoke--one" aria-hidden />
        <div className="intro__smoke intro__smoke--two" aria-hidden />
        <div className="intro__specimens">
          {JIAOBEI_SIGNS.map((sign, index) => {
            const faces = Array.from({ length: 2 }, (_, faceIndex) => (
              faceIndex < sign.flatFaceCount ? FACE_ASSETS.flat : FACE_ASSETS.rounded
            ));
            return (
              <article className={`intro__specimen intro__specimen--${sign.result}`} key={sign.result}>
                <span className="intro__specimen-index">0{index + 1}</span>
                <div className="intro__cup-stage" role="img" aria-label={`${sign.name}：${sign.faces}`}>
                  {faces.map((face, faceIndex) => (
                    <figure className={`intro__face intro__face--${faceIndex + 1}`} key={`${face.label}-${faceIndex}`}>
                      <img src={face.src} alt={face.label} width="320" height="150" />
                      <figcaption>{face.label}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="intro__specimen-copy"><strong>{sign.name}</strong><span>{sign.faces}</span><em>{sign.meaning}</em></div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="intro__content">
        <p className="intro__index">潮汕跋杯 · 三象陈列</p>
        <h2 className="intro__title">六枚如刃<br />一问见心</h2>
        <div className="intro__culture"><strong>潮汕圣杯是什么？</strong><p>{JIAOBEI_QUICK_ANSWER}</p></div>
        <div className="intro__actions"><button className="btn btn--gold intro__start" onClick={onStart}>开始掷筊</button><a className="intro__learn" href="#jiaobei-guide">了解潮汕圣杯文化与三种杯象</a></div>
        <p className="intro__note">可使用摄像头手势或按钮操作；摄像头并非必需。</p>
      </div>
    </section>
  );
}
