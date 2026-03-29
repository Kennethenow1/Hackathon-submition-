export type PromotionEffect = {
  id: string;
  label: string;
  description?: string;
  tags?: string[];
};

export type EffectsManifest = {
  version: number;
  effects: PromotionEffect[];
};
