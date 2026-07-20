'use client';

import { useCallback, useState } from 'react';
import { GameChrome } from '@/components/game/GameChrome';
import '@/styles/game-shell.css';
import { IntroScene } from './scenes/IntroScene';
import { OfferingScene } from './scenes/OfferingScene';
import { ResultScene } from './scenes/ResultScene';
import { sfx } from './audio/SfxManager';

/** 游戏阶段状态机 */
export type Phase = 'intro' | 'offering' | 'result';

/** 单次掷杯结果 */
export type CupResult = 'sheng' | 'xiao' | 'yin';

/** 心愿分类 */
export type WishCategory = '感情' | '事业' | '学业' | '财运' | '健康' | '其他';

export interface GameState {
  /** 玩家心愿文本（玩家在合十静心时默念，不强制输入） */
  wish: string;
  wishCategory: WishCategory;
  /** 三次掷杯结果 */
  throws: CupResult[];
}

const INITIAL: GameState = { wish: '', wishCategory: '其他', throws: [] };

const EDITION: Record<Phase, string> = {
  intro: '展品 / 序章',
  offering: '仪式进行中',
  result: '落杯已定',
};

/**
 * 潮汕圣杯占卜 —— 游戏根组件。
 * 流程：intro → offering(×3) → result
 * （合十静心的 5 秒即「请愿」时刻，不再单设心愿输入页）
 */
export function JiaobeiGame() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [state, setState] = useState<GameState>(INITIAL);

  const go = useCallback((p: Phase) => setPhase(p), []);

  const handleThrow = useCallback(
    (result: CupResult) => {
      setState((s) => {
        const throws = [...s.throws, result];
        // 三掷完成 → 结果页
        if (throws.length >= 3) {
          setTimeout(() => go('result'), 900);
        }
        return { ...s, throws };
      });
    },
    [go],
  );

  const restart = useCallback(() => {
    setState(INITIAL);
    setPhase('intro');
  }, []);

  return (
    <main className={`jiaobei jiaobei--${phase}`}>
      <GameChrome title="潮汕圣杯" edition={EDITION[phase]}>
        {phase === 'intro' && (
          <IntroScene
            onStart={() => {
              // 在用户手势内解锁音频，并播准备音
              sfx.unlock();
              sfx.playPrepare();
              go('offering');
            }}
          />
        )}
        {phase === 'offering' && (
          <OfferingScene
            state={state}
            onThrow={handleThrow}
            onDone={() => go('result')}
            onWishChange={(wish) => setState((s) => ({ ...s, wish }))}
            onWishCategoryChange={(wishCategory) => setState((s) => ({ ...s, wishCategory }))}
          />
        )}
        {phase === 'result' && <ResultScene state={state} onRestart={restart} />}
      </GameChrome>
    </main>
  );
}
