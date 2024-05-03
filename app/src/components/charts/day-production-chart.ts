import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators';
import {RefOrCallback, ref} from 'lit/directives/ref';
import { EChartsType, init } from 'echarts';

@customElement('day-production-chart')
export class DayProductionChart extends LitElement {
  #chart?: EChartsType;

  static override styles=css`
    div {
      width: 100%;
      height: 100%;
      min-height: 250px;
      min-width: 350px;
    }
  `;

  constructor() {
    super();

    this.addEventListener('resize', () => {
      this.#chart?.resize();
    })
  }

  // Declare reactive properties
  @property()
  accessor stats: Array<any> = [];

  assignChart = (canvas?: HTMLCanvasElement) => {
    if(canvas) {
      this.#chart = init(canvas);
      this.#chart.setOption({
        legend: {},
        tooltip: {},
        // Declare an x-axis (category axis).
        // The category map the first column in the dataset by default.
        xAxis: { type: 'category' },
        // Declare a y-axis (value axis).
        yAxis: {},
        // Declare several 'bar' series,
        // every series will auto-map to each column by default.
        series: [{ type: 'bar' }, { type: 'bar' }]
      });
    }
  }

  // Render the UI as a function of component state
  override render() {

    if(!this.stats) {
      // Set loading
      this.#chart?.showLoading();
    } else {
      // Set data
      console.log('day prod stats', this.stats);
      this.#chart?.setOption({
        dataset: {
          source: this.stats
        }
      })
      this.#chart?.hideLoading();
    }
  
    return html`
        <div ${ref(this.assignChart as RefOrCallback<Element>)}></div>
    `;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#chart?.dispose();
  }
}
