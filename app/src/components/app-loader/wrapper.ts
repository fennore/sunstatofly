import { LitElement, css } from "lit";
import '@material/web/progress/circular-progress';
import { customElement } from "lit/decorators";

@customElement('page-loader-wrapper')
export class Wrapper extends LitElement {
    static override styles = css`
        div {
            display: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
        }
    `;
    override render() {
        return `<div><slot></slot></div>`
    }
}
