import type { AssetCatalog, AssetCategory, CardAsset } from '../types/assets.js';
import type { Widget } from '../types/vtt.js';
import { assetCardFace, cardBack, imageCardBack, widget } from '../widgets/factory.js';

const definitions: Record<Exclude<AssetCategory, 'markers-and-reference'>, { deck: string; holder: string; backKey: 'generals' | 'identities' | 'main'; fallback: string; enlarge: number }> = {
  'gameplay-standard-junzheng-160': { deck: 'main-deck', holder: 'draw-pile', backKey: 'main', fallback: '三国杀', enlarge: 4.7 },
  'gameplay-extra': { deck: 'extra-deck', holder: 'extra-card-composer-zone', backKey: 'main', fallback: '扩展牌', enlarge: 4.7 },
  generals: { deck: 'general-deck', holder: 'gen-row-std', backKey: 'generals', fallback: '武将牌', enlarge: 5.0 },
  identities: { deck: 'identity-deck', holder: 'identity-composer-zone', backKey: 'identities', fallback: '身份牌', enlarge: 5.0 },
};

type DeckCategory = keyof typeof definitions;

function buildDeck(category: DeckCategory, assets: CardAsset[], catalog: AssetCatalog): Widget[] {
  const definition = definitions[category];
  const cardTypes = Object.fromEntries(assets.map(asset => [`type-${asset.sequence}`, { asset: asset.asset, label: asset.label,
    sourceSequence: asset.sequence, sourceCardId: asset.cardId }]));

  const backAssetUri = catalog.backs?.[definition.backKey];
  const backTemplate = backAssetUri ? imageCardBack(backAssetUri) : cardBack(definition.fallback);

  const deck = widget(definition.deck, 'deck', { parent: definition.holder,
    cardDefaults: { width: 90, height: 126, enlarge: definition.enlarge },
    faceTemplates: [backTemplate, assetCardFace()], cardTypes });
  const cards = assets.map(asset => {
    let targetHolder = definition.holder;
    if (category === 'generals') {
      targetHolder = asset.sequence <= 25 ? 'gen-row-std' : 'gen-row-exp';
    }
    return widget(`card-${asset.sequence}`, 'card', { deck: definition.deck,
      cardType: `type-${asset.sequence}`, parent: targetHolder, activeFace: category === 'gameplay-standard-junzheng-160' ? 0 : 1 });
  });
  return [deck, ...cards];
}

export function createAssetDecks(catalog: AssetCatalog): Widget[] {
  return (Object.keys(definitions) as DeckCategory[]).flatMap(category => buildDeck(category, catalog.assets.filter(asset => asset.category === category), catalog));
}
