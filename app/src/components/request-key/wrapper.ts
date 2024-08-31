import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators";

@customElement('key-wrapper')
export class Wrapper extends LitElement {
    static override styles = css`
        :host {
            display: grid;
            justify-content: center;
            align-content: center;
            gap: 8px;
            grid-auto-flow: column;
            min-height: 100vh;
        }
    `
    override render() {
        return html`<slot />`;
    }
}
