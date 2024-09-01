import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";

import './color/blue'
import './color/green'

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
            --balloon-background: rgba(0, 130, 200, .3);
            grid-area: info;
            display: flex;
            flex-direction: column;
            justify-content: end;
        }

        h1 {
            font-size: 2rem;
            font-weight: 400;
        }

        p {
            margin-top: 0;
            margin-bottom: .8em;
        }

        .txt-balloon {
            font-size: 1.2rem;
            position: relative;
            padding: .8em 1.4em;
            margin: 0 3px 1.2em 0;
	        background: var(--balloon-background);
	        border-radius: 1.6em;
            flex-grow: 1;
            transition: flex-grow 0.6s ease-out;
        }

        .txt-balloon:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 0;
            border: 35px solid transparent;
            border-top-color: var(--balloon-background);
            border-bottom: 0;
            border-right: 0;
            margin-left: -17.5px;
            margin-bottom: -35px;
        }

        :host:before {
            display:block;
            content:'';
            flex-grow: 1;
            transition: flex-grow 0.6s ease-out;
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