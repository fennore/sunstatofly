import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";

import day from './text/day';
import month from './text/month';
import year from './text/year';
import all from './text/all';

const TEXT = new Map([
    ['day', html`${day}`],
    ['month', html`${month}`],
    ['year', html`${year}`],
    ['all', html`${all}`]
])

@customElement('info-panel')
export class InfoPanel extends LitElement {
    static override styles = css`
        :host {
            grid-area: info;
            display: flex;
            flex-direction: column;
        }

        h1 {
            font-size: 2rem;
            font-weight: 400;
        }

        p {
            font-size: 1.35rem;
        }

        .txt-balloon {
            position: relative;
	        background: #00aabb;
	        border-radius: .7em;
            flex-grow: 1;
        }

        .txt-balloon:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 0;
            border: 35px solid transparent;
            border-top-color: #00aabb;
            border-bottom: 0;
            border-right: 0;
            margin-left: -17.5px;
            margin-bottom: -35px;
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