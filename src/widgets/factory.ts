import type { Widget } from '../types/vtt.js';

export function widget(id: string, type: Widget['type'], properties: Omit<Widget, 'id' | 'type'> = {}): Widget {
  return { id, type, ...properties };
}

export function label(id: string, text: string, x: number, y: number, width: number, parent?: string): Widget {
  return widget(id, 'label', { text, x, y, width, height: 26, ...(parent ? { parent } : {}), movable: false, layer: 2,
    css: { color: '#f5dfb0', fontSize: '16px', textAlign: 'center', fontWeight: '600' } });
}

export function zone(id: string, text: string, x: number, y: number, width: number, height: number, parent?: string): Widget {
  return widget(id, 'holder', { x, y, width, height, ...(parent ? { parent } : {}), text, movable: false, alignChildren: true,
    preventPiles: true, stackOffsetX: 18, stackOffsetY: 2, color: '#14251ecc', textColor: '#f4ddb0',
    css: { border: '2px dashed #b99457', borderRadius: '8px' } });
}

export const cardBack = (labelText: string) => ({ objects: [{ type: 'text', x: 5, y: 45, width: 80, height: 30,
  value: labelText, color: '#edd394', fontSize: 17, textAlign: 'center' }],
  css: { background: 'radial-gradient(circle,#81312a,#3a1010)', border: '3px double #cba75e', borderRadius: '7px' } });

export const textCardFace = (title: string, subtitle: string, color = '#f2e5c5') => ({ objects: [
  { type: 'text', x: 5, y: 12, width: 80, height: 38, value: title, color: '#28170d', fontSize: 19, textAlign: 'center', css: { fontWeight: '700' } },
  { type: 'text', x: 5, y: 70, width: 80, height: 22, value: subtitle, color: '#5d3822', fontSize: 12, textAlign: 'center' },
], css: { background: color, border: '3px solid #71462a', borderRadius: '7px' } });

export const dynamicTextCardFace = (titleProperty: string, subtitleProperty: string, color = '#f2e5c5') => ({ objects: [
  { type: 'text', x: 5, y: 12, width: 80, height: 38, color: '#28170d', fontSize: 19, textAlign: 'center', dynamicProperties: { value: titleProperty }, css: { fontWeight: '700' } },
  { type: 'text', x: 5, y: 70, width: 80, height: 32, color: '#5d3822', fontSize: 12, textAlign: 'center', dynamicProperties: { value: subtitleProperty } },
], css: { background: color, border: '3px solid #71462a', borderRadius: '7px' } });
