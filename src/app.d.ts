declare module 'mapicgc-gl-js' {
  export const Config: {
    getConfigICGC: () => Promise<{
      Styles: Record<string, any>;
      [key: string]: any;
    }>;
  };

  export class Map {
    constructor(options: any);
    on(event: string, ...args: any[]): void;
    once(event: string, ...args: any[]): void;
    off(event: string, ...args: any[]): void;
    addSource(id: string, source: any): void;
    getSource(id: string): any;
    addLayer(layer: any, beforeId?: string): void;
    setPaintProperty(layerId: string, name: string, value: any): void;
    setFilter(layerId: string, filter: any): void;
    queryRenderedFeatures(pointOrBox?: any, options?: any): any[];
    getCanvas(): HTMLCanvasElement;
    easeTo(options: any): void;
    remove(): void;
    getStyle(): any;
    [key: string]: any;
  }
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
