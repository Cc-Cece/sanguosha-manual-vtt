import type { AssetCatalog, AssetCategory, CardAsset } from '../types/assets.js';
import type { ReserveModel } from '../types/reserveLibrary.js';
import type { Widget } from '../types/vtt.js';
import { createToggleReserveCardRoutine, selectedCss } from '../routines/reserveCardRoutines.js';
import { assetCardFace, cardBack, imageCardBack, widget } from '../widgets/factory.js';

const definitions: Record<Exclude<AssetCategory, 'markers-and-reference'>, { deck: string; holder: string; backKey: 'generals' | 'identities' | 'main'; fallback: string; enlarge: number }> = {
  'gameplay-standard-junzheng-160': { deck: 'main-deck', holder: 'draw-pile', backKey: 'main', fallback: '三国杀', enlarge: 4.7 },
  'gameplay-extra': { deck: 'extra-deck', holder: 'reserve-panel-controller', backKey: 'main', fallback: '扩展牌', enlarge: 4.7 },
  generals: { deck: 'general-deck', holder: 'reserve-panel-controller', backKey: 'generals', fallback: '武将牌', enlarge: 5.0 },
  identities: { deck: 'identity-deck', holder: 'identity-reserve', backKey: 'identities', fallback: '身份牌', enlarge: 5.0 },
};

type DeckCategory = keyof typeof definitions;

function buildDeck(category: DeckCategory, assets: CardAsset[], catalog: AssetCatalog, reserveModel: ReserveModel): Widget[] {
  const definition = definitions[category];
  const cardTypes = Object.fromEntries(assets.map(asset => [`type-${asset.sequence}`, {
    asset: asset.asset,
    label: asset.label,
    sourceSequence: asset.sequence,
    sourceCardId: asset.cardId,
    sourceCategory: asset.category,
    sourceSubCategory: asset.subCategory,
  }]));

  const backAssetUri = catalog.backs?.[definition.backKey];
  const backTemplate = backAssetUri ? imageCardBack(backAssetUri) : cardBack(definition.fallback);
  const deck = widget(definition.deck, 'deck', {
    parent: definition.holder,
    cardDefaults: { width: 90, height: 126, enlarge: definition.enlarge },
    faceTemplates: [backTemplate, assetCardFace()],
    cardTypes,
  });
  const reserveMetaBySequence = new Map(reserveModel.cards.map(card => [card.sequence, card]));

  const cards = assets.map((asset, index) => {
    const reserveMeta = reserveMetaBySequence.get(asset.sequence);
    if (reserveMeta) {
      return widget(`card-${asset.sequence}`, 'card', {
        deck: definition.deck,
        cardType: `type-${asset.sequence}`,
        parent: reserveMeta.homeRowId,
        x: 0,
        y: 0,
        z: reserveMeta.cardOrder + 1,
        activeFace: 1,
        movable: false,
        clickable: true,
        reserveLibraryType: reserveMeta.libraryType,
        reserveCategoryId: reserveMeta.categoryId,
        reserveCategoryLabel: reserveMeta.categoryLabel,
        reserveSelected: reserveMeta.defaultSelected,
        reserveDefaultSelected: reserveMeta.defaultSelected,
        reserveHomeHolder: reserveMeta.homeRowId,
        reservePageId: reserveMeta.homePageId,
        reserveHomeIndex: reserveMeta.homeIndex,
        reserveState: 'draft',
        reserveVisualState: 'selected',
        css: selectedCss(reserveMeta.libraryType),
        clickRoutine: createToggleReserveCardRoutine(reserveMeta.libraryType),
      });
    }

    return widget(`card-${asset.sequence}`, 'card', {
      deck: definition.deck,
      cardType: `type-${asset.sequence}`,
      parent: definition.holder,
      x: 0,
      y: 0,
      z: index + 1,
      activeFace: category === 'gameplay-standard-junzheng-160' ? 0 : 1,
    });
  });

  return [deck, ...cards];
}

export function createAssetDecks(catalog: AssetCatalog, reserveModel: ReserveModel): Widget[] {
  return (Object.keys(definitions) as DeckCategory[])
    .flatMap(category => buildDeck(category, catalog.assets.filter(asset => asset.category === category), catalog, reserveModel));
}
