import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { RefOrCallback, ref } from "lit/directives/ref";
import * as echarts from "echarts";

type EChartsType = echarts.EChartsType;

@customElement("year-production-chart")
export class YearProductionChart extends LitElement {
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
        width: 900,
        height: 600
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
          { type: "block" },
          { type: "block" }
        ]
      });
    }
  };

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
            source: this.stats
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
