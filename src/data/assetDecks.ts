import type { AssetCatalog, AssetCategory, CardAsset } from '../types/assets.js';
import type { Widget } from '../types/vtt.js';
import { assetCardFace, cardBack, imageCardBack, widget } from '../widgets/factory.js';
import { getExtraCategoryId, getGeneralCategoryId } from './reserveTaxonomy.js';
import { buildReserveViewRegistry } from './reserveViewModel.js';
import { toggleReserveCardRoutine } from '../routines/reserveCardRoutines.js';

const viewRegistry = buildReserveViewRegistry();

const definitions: Record<Exclude<AssetCategory, 'markers-and-reference'>, { deck: string; holder: string; backKey: 'generals' | 'identities' | 'main'; fallback: string; enlarge: number }> = {
  'gameplay-standard-junzheng-160': { deck: 'main-deck', holder: 'draw-pile', backKey: 'main', fallback: '三国杀', enlarge: 4.7 },
  'gameplay-extra': { deck: 'extra-deck', holder: 'extra-reserve', backKey: 'main', fallback: '扩展牌', enlarge: 4.7 },
  generals: { deck: 'general-deck', holder: 'general-reserve', backKey: 'generals', fallback: '武将牌', enlarge: 5.0 },
  identities: { deck: 'identity-deck', holder: 'identity-reserve', backKey: 'identities', fallback: '身份牌', enlarge: 5.0 },
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

  const cards = assets.map((asset) => {
    let targetHolder = definition.holder;
    let homeIndex = 0;
    let isReserve = false;
    let libType: 'general' | 'extra' = 'general';
    let catId = 'std';
    let defaultSel = true;

    if (category === 'generals') {
      isReserve = true;
      libType = 'general';
      catId = getGeneralCategoryId(asset.sequence);
      defaultSel = true;
      const target = viewRegistry.cardTargetHolders[asset.sequence];
      if (target) {
        targetHolder = target.holderId;
        homeIndex = target.indexInHolder;
      }
    } else if (category === 'gameplay-extra') {
      isReserve = true;
      libType = 'extra';
      catId = getExtraCategoryId(asset.sequence);
      defaultSel = false;
      const target = viewRegistry.cardTargetHolders[asset.sequence + 1000];
      if (target) {
        targetHolder = target.holderId;
        homeIndex = target.indexInHolder;
      }
    }

    const baseProps: Widget = {
      id: `card-${asset.sequence}`,
      type: 'card',
      deck: definition.deck,
      cardType: `type-${asset.sequence}`,
      parent: targetHolder,
      x: 0,
      y: 0,
      activeFace: category === 'gameplay-standard-junzheng-160' ? 0 : 1,
    };

    if (isReserve) {
      return widget(`card-${asset.sequence}`, 'card', {
        ...baseProps,
        movable: false,
        clickable: true,
        reserveLibraryType: libType,
        reserveCategoryId: catId,
        reserveSelected: defaultSel,
        reserveDefaultSelected: defaultSel,
        reserveHomeHolder: targetHolder,
        reserveHomeIndex: homeIndex,
        reserveState: 'draft',
        clickRoutine: toggleReserveCardRoutine,
        css: defaultSel
          ? { border: '3px solid #50e080', opacity: 1.0, filter: 'none' }
          : { border: '3px solid #e04030', opacity: 0.45, filter: 'grayscale(0.8)' },
      });
    }

    return widget(`card-${asset.sequence}`, 'card', baseProps);
  });

  return [deck, ...cards];
}

export function createAssetDecks(catalog: AssetCatalog): Widget[] {
  return (Object.keys(definitions) as DeckCategory[]).flatMap(category => buildDeck(category, catalog.assets.filter(asset => asset.category === category), catalog));
}
