export {};

declare global {
  interface Window {
    pannellum: {
      viewer: (
        container: string | HTMLElement,
        config: unknown
      ) => {
        destroy: () => void;
        resize?: () => void;
      };
    };
  }
}
