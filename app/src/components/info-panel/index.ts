import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";

import day from './text/day';

const TEXT = new Map([
    ['day', html`${day}`],
    ['month', html`
        <p>Maandgrafiek</p>
    `],
    ['year', html`
        <p>Jaargrafiek</p>
    `],
    ['all', html`
        <p>Totaalgrafiek</p>
    `]
])

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
            font-size: 2rem;
        }

        .txt-balloon {
            flex-grow: 1;
        }
        
        :host:after {
            display:block;
            content: url(./img/owl.svg);
            width: 66%;
            align-self: end;
        }
    `;

    @property()
    accessor type: "day" | "month" | "year" | "all" = 'day';

    override render() {
        return html`<div class="txt-balloon">
            ${TEXT.get(this.type)}
        </div>`;
    }
}