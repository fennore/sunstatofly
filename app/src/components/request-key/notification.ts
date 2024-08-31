import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators";

@customElement('notification')
export class Notification extends LitElement {
    static override styles = css`
        :host {
            border: 1px solid #88b;
            color: 1px solid #88b;
            background-color: #ccf;
            padding: .4rem 1rem;
        }

        md-icon {
            display: inline-block;
        }
    `
    override render() {
        return html`<md-icon>info</md-icon><slot />`;
    }
}
