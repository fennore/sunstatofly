import { LitElement, css, html } from "lit";
import '@material/web/progress/circular-progress';
import { customElement } from "lit/decorators";

@customElement('page-loader-wrapper')
export class Wrapper extends LitElement {
    static override styles = css`
        div {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            justify-content: center;
            align-content: center;
        }
    `;

    override render() {
        return html`<div><slot></slot></div>`;
    }
}
