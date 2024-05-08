import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { RefOrCallback, ref } from "lit/directives/ref";
import * as echarts from "echarts";

declare type EChartsType = echarts.EChartsType;
declare type ECOption = echarts.ECOption;
declare type StatsConverter = (
  stats: Array<Array<number | string>>
) => ECOption["dataset"];

@customElement("day-production-chart")
export class DayProductionChart extends LitElement {
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

  @property()
  accessor type: "day" | "month" | "year" | "all" = "day";

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
          { type: "line", areaStyle: {} },
          { type: "line", areaStyle: {} }
        ]
      });
    }
  };

  updateChartOptions: () => void = () => {
    const options: ECOption = {
      dataset: {},
      series: []
    };

    if (this.type === "day") {
      options.dataset = this.prepareDay(this.stats);
      options.series = [
        { type: "line", areaStyle: {} },
        { type: "line", areaStyle: {} }
      ];
    }

    if (this.type === "month") {
      options.dataset = this.prepareMonth(this.stats);
      options.series = [{ type: "bar" }, { type: "bar" }];
    }

    if (this.type === "year") {
      options.dataset = this.prepareYear(this.stats);
      options.series = [{ type: "bar" }, { type: "bar" }];
    }

    if (this.type === "all") {
      options.dataset = this.prepareAll(this.stats);
      options.series = [{ type: "bar" }];
    }

    this.#chart?.setOption(options);
  };

  prepareDay: StatsConverter = ([...cleanStats]) => {
    // Replace label row
    cleanStats.shift();
    cleanStats.unshift(["Tijdstip", "Vandaag", "Gisteren"]);

    // Filter out undefined
    return cleanStats.filter(([timeString, data, compare]) => {
      const [hours, minutes, seconds] = String(timeString).split(":");
      const statDate = new Date();

      statDate.setHours(Number(hours), Number(minutes), Number(seconds), 0);

      return (
        (typeof data !== "undefined" || statDate.getTime() > Date.now()) &&
        typeof compare !== "undefined"
      );
    });
  };

  prepareMonth: StatsConverter = ([...cleanStats]) => {
    // Replace label row
    cleanStats.shift();
    cleanStats.unshift(["Dag", "Deze maand", "Vorige maand"]);

    return cleanStats;
  };

  prepareYear: StatsConverter = stats => {
    const monthsInYear = new Array(12).fill(null);
    const statsMap = new Map(
      stats.map(([label, data, compare]) => [label, [data, compare]])
    );
    const cleanStats = monthsInYear.map((_, index) => {
      const date = new Date();
      date.setMonth(index);
      const monthName = date.toLocaleString("nl", { month: "long" }); // 'en' for language, 'long' for full month name

      return [
        monthName,
        ...(statsMap.get(String(index + 1).padStart(2, "0")) ?? [])
      ];
    });

    // Replace label row
    cleanStats.shift();
    cleanStats.unshift(["Maand", "Dit jaar", "Vorig jaar"]);

    return cleanStats;
  };

  prepareAll: StatsConverter = ([...cleanStats]) => {
    // Replace label row
    cleanStats.shift();
    cleanStats.unshift(["Jaar", "kW"]);

    // Extract compare values
    return cleanStats.map(([label, value]) => [label, value]);
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
        this.updateChartOptions();
        this.#chart?.hideLoading();
      }
    }
  }

  // Render the UI as a function of component state
  override render() {
    return html`
      <div
        class="chart-wrapper"
        ${ref(this.assignChart as RefOrCallback<Element>)}
      ></div>
    `;
  }
}
