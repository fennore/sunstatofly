import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators";

@customElement('chart-dashboard')
export class ChartDashboard extends LitElement {

    @property()
    accessor authKey: string | null = null;

    override render() {
        console.log(this.authKey);
        return html`The dashboard`;
    }
}