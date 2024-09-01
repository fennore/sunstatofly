import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('green')
export class Green extends LitElement {
    static override styles = css`
        :host {
            color: var(--graph-green);
        }
    `;

    override render() {
        return html`<slot />`;
    }
}