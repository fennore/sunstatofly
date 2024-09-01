import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('color-green')
export class ColorGreen extends LitElement {
    static override styles = css`
        :host {
            color: var(--graph-green);
        }
    `;

    override render() {
        return html`<slot />`;
    }
}