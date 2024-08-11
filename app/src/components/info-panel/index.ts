import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('info-panel')
export class InfoPanel extends LitElement {
    static override styles = css`
        .info-panel {
            display: flex;
            flex-direction: row;
            align-items: space-between;
        }
        .info-panel:after {
            display:block;
            content: '/img/owl.svg';
            float: left;
        }
    `;

    override render() {
        return html`<div class="info-panel">
            <h1>Info</h1>
            <p>Info</p>
        </div>`;
    }
}