import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('color-blue')
export class ColorBlue extends LitElement {
    static override styles = css`
        :host {
            color: var(--graph-blue);
        }
    `;

    override render() {
        return html`<slot />`;
    }
}