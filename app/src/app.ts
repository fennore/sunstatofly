import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Chart } from 'chart.js';

@customElement('day-production-chart')
export class DayProductionChart extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static override styles = css`
    :host {
      color: blue;
    }
  `;

  // Declare reactive properties
  @property()
  override title: string = 'Productie vandaag';

  // Render the UI as a function of component state
  override render() {
    return html`<p>${this.title}!</p>`;
  }
}

@customElement('app')
export class App extends LitElement {
  override render() {
    return html`<p>Hallo wereld</p>`
  }
}