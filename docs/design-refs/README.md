# Design section references

Direction boards for the Chinese museum site (Task 8). **Implementation truth is `DESIGN.md` + live routes**; images are atmospheric anchors (abstract UI, not pixel-perfect copy).

| File | Section | Live route |
|------|---------|------------|
| `01-home-hero-altar.jpg` | Home hero (Altar night band) | `/` |
| `02-exhibits-bento.jpg` | Three exhibits bento | `/#exhibits` |
| `03-culture-hub-hero.jpg` | Culture hub Quick Answer | `/culture/jiaobei/` |
| `04-topic-article.jpg` | Long-form topic article | `/culture/jiaobei/sheng-yin-xiao/` |
| `05-game-guide-bridge.jpg` | Game stage + guide bridge | `/games/shantou-jiaobei/` |
| *(optional)* `06-home-mobile` | Mobile home stack | `/` — generate later or use browser DevTools |

## Notes

- Prefer **Museum Light** for culture/about; **Altar Dark** for hero + game runtime.
- Single cinnabar CTA; gold hairlines; paper canvas — no purple SaaS gradients.
- Chinese body copy and exact layout ship in code (`src/styles/museum.css`), not in these boards.
