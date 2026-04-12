/// <reference types="astro/client" />

interface HtmxApi {
  process(node: Element): void;
  trigger(node: Element | string, eventName: string, detail?: unknown): void;
  ajax(verb: string, path: string, context?: Element | string): void;
  find(selector: string): Element | null;
  findAll(selector: string): NodeListOf<Element>;
  closest(node: Element, selector: string): Element | null;
  values(node: Element): Record<string, string>;
  remove(node: Element): void;
  addClass(node: Element, clazz: string, delay?: number): void;
  removeClass(node: Element, clazz: string, delay?: number): void;
  toggleClass(node: Element, clazz: string): void;
  takeClass(node: Element, clazz: string): void;
  defineExtension(name: string, extension: object): void;
  logAll(): void;
  logger: ((elt: Element, event: string, data: unknown) => void) | null;
  config: {
    historyEnabled: boolean;
    historyCacheSize: number;
    refreshOnHistoryMiss: boolean;
    defaultSwapStyle: string;
    defaultSwapDelay: number;
    defaultSettleDelay: number;
    includeIndicatorStyles: boolean;
    indicatorClass: string;
    requestClass: string;
    addedClass: string;
    settlingClass: string;
    swappingClass: string;
    allowEval: boolean;
    useTemplateFragments: boolean;
    wsReconnectDelay: string;
    disableSelector: string;
    timeout: number;
  };
}

declare global {
  interface Window {
    htmx?: HtmxApi;
    __API_URL__?: string;
  }
}

export {};
