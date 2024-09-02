import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators";

@customElement('rotation-stats')
export class RotationStats extends LitElement {
    static override styles = css`
        :host {
            --label-height: 4rem;
            grid-area: stats;
        }

        dl {
            width: 100%;
            height: 100%;
            margin: 0;
            display: flex;
            flex-flow: column-reverse wrap;
            text-align: center;
            border: 3px solid var(--color-background-secondary);
            box-sizing: border-box;
        }
        
        dt,dd {
            width: 20%;
            margin: 0;
        }

        dt:nth-of-type(odd),
        dd:nth-of-type(odd) {
            background-color: var(--color-background-secondary);
        }
        
        dt {
            height: var(--label-height);
            color: var(--color-text-secondary);
            font-size: calc(var(--font-size) + .2rem)
        }

        dd {
            height: calc(100% - var(--label-height));
            align-content: end;
            font-size: 2.8rem;
            color: var(--color-text-highlight, rgb(85, 136, 170));
        }
    `;

    @property()
    accessor stats: any;

    @property()
    accessor type: "day" | "month" | "year" | "all" = 'day';

    override render() {
        if(!this.stats) {
            return null;
        }
        
        return html`<dl>
            <dt>CO2 uitstoot vermeden</dt>
            <dd>${this.stats.plantDetail.totalReduceCo2} ton</dd>
            <dt>Bomen geplant</dt>
            <dd>${this.stats.plantDetail.totalPlantTreeNum}</dd>
            <dt>Zonnesterkte</dt>
            <dd>${this.stats.weather.solarradiation} W/m2</dd>
            <dt>Opbrengst</dt>
            <dd>€&nbsp;${this.stats.plantDetail.income}</dd>
            <dt>Geproduceerd vandaag</dt>
            <dd>${this.stats.dayProduction} kWh</dd>
        </dl>`;
    }
}
