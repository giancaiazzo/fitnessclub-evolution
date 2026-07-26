export {};

declare global {
  interface Window {
    pannellum: {
      viewer: (
        container: string | HTMLElement,
        config: any
      ) => {
        destroy: () => void;
        resize?: () => void;
      };
    };
  }
}