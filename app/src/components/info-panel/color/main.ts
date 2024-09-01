import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement('color-main')
export class ColorMain extends LitElement {
    static override styles = css`
        :host {
            color: rgba(var(--accent-graph-main), 1);
        }
    `;

    override render() {
        return html`<slot />`;
    }
}