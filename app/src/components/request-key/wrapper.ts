import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators";

@customElement('key-wrapper')
export class Wrapper extends LitElement {
    static override styles = css`
        div {
            display: grid;
            justify-content: center;
            align-content: center;
            gap: 8px;
            grid-auto-flow: column;
        }
    `
    override render() {
        return html`<div><slot></slot></div>`;
    }
}
