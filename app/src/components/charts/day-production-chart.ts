import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators';
import {RefOrCallback, ref} from 'lit/directives/ref';
import { Chart } from 'chart.js';

@customElement('day-production-chart')
export class DayProductionChart extends LitElement {
  // #chart?: Chart;

  // Define scoped styles right with your component, in plain CSS
  static override styles = css`
    :host {
      color: blue;
    }
  `;

  constructor() {
    super();
    
  }

  // Declare reactive properties
  @property()
  override accessor title: string = 'Productie vandaag';

  assignChart = (canvas?: Element & HTMLCanvasElement) => {
    if(canvas) {
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Productie vandaag',
            data: [],
            borderWidth: 1
          }]
        },
      });
    }
  }

  // Render the UI as a function of component state
  override render() {
    return html`
      <p>${this.title}!</p>
      <div>
        <canvas ${ref(this.assignChart as RefOrCallback<Element>)} />
      </div>
    `;
  }
}
