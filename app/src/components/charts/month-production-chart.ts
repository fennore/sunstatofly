import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { RefOrCallback, ref } from "lit/directives/ref";
import * as echarts from "echarts";

type EChartsType = echarts.EChartsType;

@customElement("month-production-chart")
export class MonthProductionChart extends LitElement {
  #chart?: EChartsType;

  static override styles = css`
    div.chart-wrapper {
      display: inline-block;
    }
  `;

  constructor() {
    super();

    this.addEventListener("resize", () => {
      this.#chart?.resize();
    });
  }

  // Declare reactive properties
  @property()
  accessor stats: Array<any> | null = null;

  assignChart = (element: HTMLElement) => {
    if (element) {
      this.#chart = echarts.init(element, null, {
        width: 1800,
        height: 800
      });
      this.#chart?.setOption({
        legend: {},
        tooltip: {},
        // Declare an x-axis (category axis).
        // The category map the first column in the dataset by default.
        xAxis: { type: "category" },
        // Declare a y-axis (value axis).
        yAxis: { type: "value" },
        // Declare several 'bar' series,
        // every series will auto-map to each column by default.
        series: [
          { type: "bar" },
          { type: "bar" }
        ]
      });
    }
  };

  prepareStats: (stats: Array<Array<string | number>>) => Array<Array<string | number>> = stats => {
    const cleanStats = [...stats];
    // Replace label row
    cleanStats.shift();
    cleanStats.unshift(['Dag', 'Deze maand', 'Vorige maand']);

    return cleanStats;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#chart?.dispose();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    if (changedProperties.has("stats")) {
      if (!this.stats) {
        // Set loading
        this.#chart?.showLoading();
      } else {
        // Set data
        this.#chart?.setOption({
          dataset: {
            source: this.prepareStats(this.stats)
          }
        });
        this.#chart?.hideLoading();
      }
    }
  }

  // Render the UI as a function of component state
  override render() {
    
    return html`
      <div class="chart-wrapper" ${ref(this.assignChart as RefOrCallback<Element>)}></div>
    `;
  }
}
