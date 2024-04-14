var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// import { Chart } from 'chart.js';
let DayProductionChart = class DayProductionChart extends LitElement {
    constructor() {
        super(...arguments);
        // Declare reactive properties
        this.title = 'Productie vandaag';
    }
    // Render the UI as a function of component state
    render() {
        return html `<p>${this.title}!</p>`;
    }
};
// Define scoped styles right with your component, in plain CSS
DayProductionChart.styles = css `
    :host {
      color: blue;
    }
  `;
__decorate([
    property()
], DayProductionChart.prototype, "title", void 0);
DayProductionChart = __decorate([
    customElement('day-production-chart')
], DayProductionChart);
export { DayProductionChart };
let App = class App extends LitElement {
    render() {
        return html `<p>Hallo wereld</p>`;
    }
};
App = __decorate([
    customElement('app')
], App);
export { App };
//# sourceMappingURL=app.js.map