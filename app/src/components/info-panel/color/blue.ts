import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('blue')
export class Blue extends LitElement {
    static override styles = css`
        :host {
            color: var(--graph-blue);
        }
    `;

    override render() {
        return html`<slot />`;
    }
}