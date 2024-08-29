import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators";

@customElement('rotation-stats')
export class RotationStats extends LitElement {
    static override styles = css`
        :host {
            grid-area: stats;
        }
        dl {
        }
    `;

    @property()
    accessor stats: any;

    @property()
    accessor type: string = 'day';

    override render() {
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
