import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators";
import '@material/web/progress/circular-progress';

@customElement('page-loader-wrapper')
export class Wrapper extends LitElement {
    static override styles = css`
        div {
            display: grid;
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
