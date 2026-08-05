export type WidgetType = 'basic' | 'button' | 'card' | 'deck' | 'holder' | 'label' | 'seat';

export interface Widget {
  id: string;
  type: WidgetType;
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  parent?: string;
  deck?: string;
  cardType?: string;
  [property: string]: unknown;
}

export interface GameInfo {
  name: string;
  description: string;
  players: string;
  mode: 'vs';
  language: string;
  attribution: string;
  ruleText: string;
  helpText: string;
  variant: string;
  bgg?: string;
  image: string;
}

export interface GameFile {
  _meta: { version: number; info: GameInfo };
  [id: string]: Widget | { version: number; info: GameInfo };
}

export interface Bounds { x: number; y: number; width: number; height: number }
