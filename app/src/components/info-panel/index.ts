import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import './color/main'
import './color/compare'

import day from './text/day.js';
import month from './text/month.js';
import year from './text/year.js';
import all from './text/all.js';

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
            --balloon-background: var(--color-background-main);
            --balloon-pointer-size: 35px;
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
            margin-bottom: var(--spacing);
        }

        .txt-balloon {
            font-size: calc(var(--font-size) + 0.35rem);
            position: relative;
            padding: var(--spacing) var(--spacing-2);
            margin: 0 3px var(--spacing-2) 0;
	        background: var(--balloon-background);
	        border-radius: calc(var(--spacing-2) * 1.4);
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
            border: var(--balloon-pointer-size) solid transparent;
            border-top-color: var(--balloon-background);
            border-bottom: 0;
            border-right: 0;
            margin-left: calc(var(--balloon-pointer-size) * -.5);
            margin-bottom: calc(var(--balloon-pointer-size) * -1);
        }

        :host:before {
            display:block;
            content:'';
            flex-grow: 100000;
            transition: flex-grow 0.6s ease-out;
        }

        :host([type="day"]) .txt-balloon, :host([type="year"]) .txt-balloon {
            flex-grow: 2;
        }
        
        :host:after {
            display:block;
            content: url(./img/owl.svg);
            width: calc(100% / 3 * 2);
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