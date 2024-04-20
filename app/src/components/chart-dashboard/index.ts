import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";

@customElement('chart-dashboard')
export class ChartDashboard extends LitElement {
    override render() {
        return html`The dashboard`;
    }
}