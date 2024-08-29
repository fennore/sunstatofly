import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('info-panel')
export class InfoPanel extends LitElement {
    static override styles = css`
        :host {
            grid-area: info;
            display: flex;
            flex-direction: column;
            font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
        }

        h1 {
            font-size: 3rem;
        }

        p {
            flex-grow: 1;
            font-size: 2rem;
        }
        
        :host:after {
            display:block;
            content: url(./img/owl.svg);
        }
    `;

    override render() {
        return html`<div class="txt-balloon">
            <h1>Info</h1>
            <p>Info</p>
        </div>`;
    }
}