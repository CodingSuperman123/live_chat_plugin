"use strict";
class RoboChat {
    constructor(strSelector, options) {
        this.element = document.querySelector(strSelector);
        this.init();
    }
    init() {
        console.log(this.element);
    }
}
