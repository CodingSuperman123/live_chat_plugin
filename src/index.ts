class RoboChat {
  private element: HTMLElement | null;

  constructor(strSelector: string, options: { position?: string }) {
     this.element = document.querySelector(strSelector);
     this.init();
  }

  private init() {
    console.log(this.element);
  }
}
