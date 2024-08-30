import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators";

@customElement('rotation-stats')
export class RotationStats extends LitElement {
    static override styles = css`
        :host {
            grid-area: stats;
        }
        dl {
            width: 100%;
            height: 100%;
            display:flex;
            flex-flow: column wrap;
        }
        
        dt,dd {
            width: 20%;
        }
        
        dt {
            align-self: flex-end;
            height: 2rem;
        }

        dd {
            align-self: flex-start;
            height: calc(100% - 2rem);
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
        
        return html`<div class="stats">
            <dl>
                <dt>Opbrengst</dt>
                <dd>€&nbsp;${this.stats.plantDetail.income}</dd>
                <dt>Bomen geplant</dt>
                <dd>${this.stats.plantDetail.totalPlantTreeNum}</dd>
                <dt>CO2 uitstoot vermeden</dt>
                <dd>${this.stats.plantDetail.totalReduceCo2}</dd>
                <dt>Geproduceerd vandaag</dt>
                <dd>${this.stats.plantDetail.todayElectricity}</dd>
                <dt>Huidig wattage</dt>
                <dd>${this.stats.plantDetail.nowPower}</dd>
            </dl>
        </div>`;
    }
}
