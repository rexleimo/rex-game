import type { OracleCatalogForm } from './types.ts';
import { shuffle } from './progress.ts';

export interface ReferenceItem {
  form: OracleCatalogForm;
  options: string[];
  answer: number;
}

/** Samples one form for each source-labelled headword in a round. */
export function buildReferenceItems(forms: OracleCatalogForm[], itemCount: number): ReferenceItem[] {
  const formsByLabel = new Map<string, OracleCatalogForm[]>();
  for (const form of forms) {
    const variants = formsByLabel.get(form.modern) ?? [];
    variants.push(form);
    formsByLabel.set(form.modern, variants);
  }
  const labels = shuffle([...formsByLabel.keys()]);
  return labels.slice(0, Math.min(itemCount, labels.length)).map((label) => {
    const form = shuffle(formsByLabel.get(label)!)[0]!;
    const distractors = shuffle(labels.filter((candidate) => candidate !== label)).slice(0, 3);
    const options = shuffle([label, ...distractors]);
    return { form, options, answer: options.indexOf(label) };
  });
}
