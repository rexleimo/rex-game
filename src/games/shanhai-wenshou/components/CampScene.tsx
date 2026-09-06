'use client';

import { useState } from 'react';
import type { MountainId, WenshouSave } from '../core/types';
import { getBeast } from '../content/beasts';
import { getItem, ITEMS, SHRINE_COSTS } from '../content/items';
import { deriveStats, partyCap } from '../core/progression';
import { commissionRewardText, commissionState, commissionsFor } from '../action/commissions';
import styles from '../ShanhaiWenshouGame.module.css';

type CampTab = 'rest' | 'board' | 'craft' | 'equip' | 'party' | 'shrine';

/** 营地：歇脚 / 炼制 / 佩戴 / 兽栏编队 / 祠祭。 */
export function CampScene({
  save,
  mountain,
  onRest,
  onCraft,
  onEquip,
  onUnequip,
  onClaim,
  onParty,
  onBuy,
  onUpgrade,
  onBack,
}: {
  save: WenshouSave;
  mountain: MountainId;
  onRest: () => void;
  onCraft: (itemId: string) => void;
  onEquip: (charmId: string) => void;
  onUnequip: (slot: number) => void;
  onClaim: (commissionId: string) => void;
  onParty: (beastId: string) => void;
  onBuy: (itemId: string) => void;
  onUpgrade: (key: 'qi' | 'satchel' | 'tame' | 'blessing') => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<CampTab>('rest');
  const stats = deriveStats(save);
  const cap = partyCap(save.level);

  const craftables = ITEMS.filter((i) => i.craft);
  const shop = ITEMS.filter((i) => i.price);

  return (
    <div className={styles.campRoot}>
      <header className={styles.campHead}>
        <h2>营地 · 祠前歇脚</h2>
        <p className={styles.campMeta}>
          金玉 {save.jade} · 体力 {save.hp}/{stats.maxHp} · 气 {save.qi}/{stats.maxQi}
          {(save.charms?.length ?? 0) > 0 ? ` · 佩戴 ${save.charms!.map((c) => getItem(c)?.name ?? c).join('／')}` : ''}
          {save.ngPlus ? ` · ${save.ngPlus + 1}周目` : ''}
        </p>
      </header>

      <div className={styles.menuTabs} role="tablist">
        {(
          [
            ['rest', '歇脚'],
            ['board', '委托板'],
            ['craft', '炼制'],
            ['equip', '佩饰'],
            ['party', '兽栏'],
            ['shrine', '祠祭'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`${styles.menuTab} ${tab === key ? styles.menuTabOn : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'rest' && (
        <div className={styles.campPanel}>
          <p>祠前的白菅席已铺好。歇一晚，体力与气全数回复。</p>
          <button type="button" className={styles.primaryBtn} onClick={onRest}>
            席地而眠
          </button>
        </div>
      )}

      {tab === 'board' && (
        <div className={styles.campPanel}>
          <p className={styles.menuNote}>「闻」拍：村民把难处写在板上，做完一笔是一笔——山望也跟着涨。</p>
          <div className={styles.craftList}>
            {commissionsFor(mountain).map((def) => {
              const st = commissionState(def, save);
              return (
                <div key={def.id} className={styles.craftRow}>
                  <div>
                    <strong>{st.def.name}{st.claimed ? ' · 已交割' : st.done ? ' · 可交割' : ''}</strong>
                    <small>{st.def.desc}</small>
                    <small className={styles.craftInputs}>
                      进度 {st.progress}/{st.def.amount ?? 1} · 酬：{commissionRewardText(st.def)}
                    </small>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={st.claimed || !st.done}
                    onClick={() => onClaim(def.id)}
                  >
                    {st.claimed ? '已完成' : st.done ? '交割' : '未完'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className={styles.menuNote}>清巢的计数只算这一座山；寻物交割时会从行囊里扣掉山产。</p>
        </div>
      )}

      {tab === 'craft' && (
        <div className={styles.campPanel}>
          <p className={styles.menuNote}>原文里的「食之」「佩之」，都在这里落地成实物。</p>
          <div className={styles.craftList}>
            {craftables.map((item) => {
              const inputs = Object.entries(item.craft!.inputs);
              const can = inputs.every(([id, n]) => (save.items[id] ?? 0) >= n);
              return (
                <div key={item.id} className={styles.craftRow}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.desc}</small>
                    <small className={styles.craftInputs}>
                      {inputs.map(([id, n]) => `${getItem(id)?.name ?? id}×${n}`).join(' + ')}
                      {` （现有 ${inputs.map(([id]) => `${getItem(id)?.name ?? id}×${save.items[id] ?? 0}`).join('，')}）`}
                    </small>
                  </div>
                  <button type="button" className={styles.secondaryBtn} disabled={!can} onClick={() => onCraft(item.id)}>
                    炼制
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'equip' && (() => {
        const slots = save.charms ?? [];
        return (
          <div className={styles.campPanel}>
            <p className={styles.menuNote}>佩饰三槽（GDD §3.3）——「不迷」「不畏」「不聋」可以叠着戴，Build 自己配。</p>
            <div className={styles.craftList}>
              {[0, 1, 2].map((slot) => {
                const cid = slots[slot];
                return (
                  <div key={slot} className={styles.craftRow}>
                    <div>
                      <strong>槽{slot + 1} · {cid ? getItem(cid)?.name ?? cid : '空'}</strong>
                      <small>{cid ? (getItem(cid)?.desc ?? '') : '未佩戴'}</small>
                    </div>
                    {cid && (
                      <button type="button" className={styles.ghostBtn} onClick={() => onUnequip(slot)}>
                        摘下
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.craftList}>
              {ITEMS.filter((i) => i.charm).map((item) => {
                const worn = slots.includes(item.id);
                return (
                  <div key={item.id} className={styles.craftRow}>
                    <div>
                      <strong>{item.name} ×{save.items[item.id] ?? 0}{worn ? ' · 已佩戴' : ''}</strong>
                      <small>{item.desc}</small>
                      <small>效果：{(item.charm!.immune ?? []).length > 0 ? `免疫${item.charm!.immune!.map(labelStatus).join('、')} ` : ''}
                        {item.charm!.atk ? `攻+${Math.round(item.charm!.atk * 100)}% ` : ''}
                        {item.charm!.def ? `防+${item.charm!.def} ` : ''}
                        {item.charm!.spd ? `速+${item.charm!.spd} ` : ''}
                        {item.charm!.maxHp ? `体+${Math.round(item.charm!.maxHp * 100)}%` : ''}
                      </small>
                    </div>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      disabled={(save.items[item.id] ?? 0) <= 0 || worn || slots.length >= 3}
                      onClick={() => onEquip(item.id)}
                    >
                      佩戴
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {tab === 'party' && (
        <div className={styles.campPanel}>
          <p className={styles.menuNote}>出战兽灵 {save.party.length}/{cap}（Lv.6 二席、Lv.14 三席）。点选收录的兽即可上场或替换。</p>
          <div className={styles.craftList}>
            {Object.keys(save.beasts)
              .filter((id) => (save.beasts[id as keyof typeof save.beasts] ?? 0) > 0)
              .map((id) => {
                const beast = getBeast(id);
                if (!beast) return null;
                const active = save.party.includes(id as never);
                return (
                  <div key={id} className={styles.craftRow}>
                    <div>
                      <strong>{beast.name} ×{save.beasts[id as keyof typeof save.beasts]}</strong>
                      <small>被动 · {beast.kit.passive}：{beast.kit.passiveDesc}</small>
                      {beast.kit.active && <small>主动 · {beast.kit.active.name}：{beast.kit.active.desc}</small>}
                    </div>
                    <button
                      type="button"
                      className={active ? styles.ghostBtn : styles.secondaryBtn}
                      disabled={!active && save.party.length >= cap}
                      onClick={() => onParty(id)}
                    >
                      {active ? '歇息' : '出战'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === 'shrine' && (
        <div className={styles.campPanel}>
          <p className={styles.menuNote}>以金玉易物、修祠。「毛用一璋玉瘗，糈用稌米，白菅为席。」</p>
          <div className={styles.craftList}>
            {shop.map((item) => (
              <div key={item.id} className={styles.craftRow}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.desc}</small>
                </div>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  disabled={save.jade < item.price!}
                  onClick={() => onBuy(item.id)}
                >
                  {item.price} 金玉
                </button>
              </div>
            ))}
          </div>
          <h3 className={styles.shrineTitle}>修祠（永久增益）</h3>
          <div className={styles.craftList}>
            {(
              [
                ['qi', '气海充盈', '+8 气上限'],
                ['satchel', '行囊结实', '探索收获更丰'],
                ['tame', '糈米盈仓', '驯化更易'],
                ['blessing', '神恩加身', '战斗回复更厚'],
              ] as const
            ).map(([key, name, desc]) => {
              const lv = save.shrine[key];
              const cost = SHRINE_COSTS[key][lv];
              const maxed = lv >= SHRINE_COSTS[key].length;
              return (
                <div key={key} className={styles.craftRow}>
                  <div>
                    <strong>{name} · {['一','二','三','四'][lv]}阶</strong>
                    <small>{desc}</small>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={maxed || save.jade < cost}
                    onClick={() => onUpgrade(key)}
                  >
                    {maxed ? '已圆满' : `${cost} 金玉`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button type="button" className={styles.ghostBtn} onClick={onBack}>
        回到{save.chapterDone ? '山海' : '山野'}
      </button>
    </div>
  );
}

function labelStatus(status: string): string {
  const map: Record<string, string> = { zhang: '瘴', mi: '迷', ju: '惧', nu: '怒' };
  return map[status] ?? status;
}
