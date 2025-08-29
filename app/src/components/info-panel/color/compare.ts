import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('color-compare')
export class ColorCompare extends LitElement {
    static override styles = css`
        :host {
            color: rgba(var(--accent-graph-compare), 1);
            font-weight: 420;
        }
    `;

    override render() {
        return html`<slot />`;
    }
}