import type { Widget } from '../types/vtt.js';

export function widget(id: string, type: Widget['type'], properties: Omit<Widget, 'id' | 'type'> = {}): Widget {
  return { id, type, ...properties };
}

export function label(id: string, text: string, x: number, y: number, width: number, parent?: string, extraProperties?: Partial<Widget>): Widget {
  return widget(id, 'label', { text, x, y, width, height: 24, ...(parent ? { parent } : {}), movable: false, layer: 3,
    css: { color: '#f3dfb3', fontSize: '15px', textAlign: 'center', fontWeight: '600', textShadow: '0 1px 2px #000' }, ...extraProperties });
}

const zoneBase = (text: string, x: number, y: number, width: number, height: number, parent?: string) => ({
  x, y, width, height, ...(parent ? { parent } : {}), text, movable: false, dropTarget: { type: 'card' }, textColor: '#ead9b4',
});

export function pileZone(id: string, text: string, x: number, y: number, width = 96, height = 138, parent?: string, extraProperties?: Partial<Widget>): Widget {
  return widget(id, 'holder', { ...zoneBase(text, x, y, width, height, parent), alignChildren: true, preventPiles: false,
    stackOffsetX: 0, stackOffsetY: 0, color: '#172a25d9', css: { border: '2px solid #b89455', borderRadius: '8px' }, ...extraProperties });
}

export function freeZone(id: string, text: string, x: number, y: number, width: number, height: number, parent?: string, extraProperties?: Partial<Widget>): Widget {
  return widget(id, 'holder', { ...zoneBase(text, x, y, width, height, parent), alignChildren: false, preventPiles: false,
    color: '#1e4136a8', css: { border: '2px solid #789b83', borderRadius: '8px' }, ...extraProperties });
}

export function handZone(id: string, text: string, x: number, y: number, width: number, height: number): Widget {
  return widget(id, 'holder', { ...zoneBase(text, x, y, width, height), alignChildren: true, preventPiles: true,
    childrenPerOwner: true, stackOffsetX: 54, stackOffsetY: 0, color: '#16251fe8',
    css: { border: '3px solid #d2ae64', borderRadius: '12px', boxShadow: '0 -4px 18px #0009' } });
}

export const cardBack = (labelText: string) => ({ objects: [{ type: 'text', x: 5, y: 48, width: 80, height: 28,
  value: labelText, color: '#edd394', fontSize: 17, textAlign: 'center' }],
  css: { background: 'radial-gradient(circle,#81312a,#3a1010)', border: '3px double #cba75e', borderRadius: '7px' } });

export const imageCardBack = (assetUri: string) => ({ border: false, radius: 6, objects: [{ type: 'image', x: 0, y: 0, width: 90, height: 126,
  value: assetUri, color: 'transparent', css: { backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } }] });

export const assetCardFace = () => ({ border: false, radius: 6, objects: [{ type: 'image', x: 0, y: 0, width: 90, height: 126,
  color: 'transparent', dynamicProperties: { value: 'asset' }, css: { backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } }] });
