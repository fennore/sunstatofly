import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { RefOrCallback, ref } from "lit/directives/ref";
import * as echarts from "echarts";

type EChartsType = echarts.EChartsType;

@customElement("day-production-chart")
export class DayProductionChart extends LitElement {
  #chart?: EChartsType;

  static override styles = css`
    div.chart-wrapper {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 250px;
      min-width: 350px;
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
    console.log("assigning", element);

    if (element) {
      this.#chart = echarts.init(element);
      this.#chart?.setOption({
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ["time", "today", "yesterday"],
            ["test", 10, 20],
            ["test2", 15, 18],
            ["test3", 22, 8],
            ["test4", 18, 12]
          ]
        },
        // Declare an x-axis (category axis).
        // The category map the first column in the dataset by default.
        xAxis: { type: "category" },
        // Declare a y-axis (value axis).
        yAxis: { type: "value" },
        // Declare several 'bar' series,
        // every series will auto-map to each column by default.
        series: [
          { type: "line", areaStyle: {} },
          { type: "line", areaStyle: {} }
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
      console.log("stats updated");
      if (!this.stats) {
        // Set loading
        this.#chart?.showLoading();
      } else {
        // Set data
        console.log("day prod stats", this.stats);
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
    console.log("rendering", this.stats);
    
    return html`
      <div class="chart-wrapper" ${ref(this.assignChart as RefOrCallback<Element>)}></div>
    `;
  }
}
