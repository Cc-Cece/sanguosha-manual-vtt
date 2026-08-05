import type { AssetCatalog, AssetCategory, CardAsset } from '../types/assets.js';
import type { Widget } from '../types/vtt.js';
import { assetCardFace, cardBack, widget } from '../widgets/factory.js';

const definitions: Record<AssetCategory, { deck: string; holder: string; back: string; enlarge: number }> = {
  'gameplay-standard-junzheng-160': { deck: 'main-deck', holder: 'draw-pile', back: '三国杀', enlarge: 2.35 },
  'gameplay-extra': { deck: 'extra-deck', holder: 'extra-reserve', back: '扩展牌', enlarge: 2.35 },
  generals: { deck: 'general-deck', holder: 'general-reserve', back: '武将牌', enlarge: 2.5 },
  identities: { deck: 'identity-deck', holder: 'identity-reserve', back: '身份牌', enlarge: 2.5 },
  'markers-and-reference': { deck: 'marker-deck', holder: 'marker-reserve', back: '血量牌', enlarge: 2.2 },
};

function buildDeck(category: AssetCategory, assets: CardAsset[]): Widget[] {
  const definition = definitions[category];
  const cardTypes = Object.fromEntries(assets.map(asset => [`type-${asset.sequence}`, { asset: asset.asset, label: asset.label,
    sourceSequence: asset.sequence, sourceCardId: asset.cardId }]));
  const deck = widget(definition.deck, 'deck', { parent: definition.holder,
    cardDefaults: { width: 90, height: 126, enlarge: definition.enlarge },
    faceTemplates: [cardBack(definition.back), assetCardFace()], cardTypes });
  const cards = assets.map(asset => widget(`card-${asset.sequence}`, 'card', { deck: definition.deck,
    cardType: `type-${asset.sequence}`, parent: definition.holder, activeFace: 0 }));
  return [deck, ...cards];
}

export function createAssetDecks(catalog: AssetCatalog): Widget[] {
  return (Object.keys(definitions) as AssetCategory[]).flatMap(category => buildDeck(category, catalog.assets.filter(asset => asset.category === category)));
}
