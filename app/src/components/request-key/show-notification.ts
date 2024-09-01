import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators";

@customElement('show-notification')
export class ShowNotification extends LitElement {
    static override styles = css`
        :host {
            border: 1px solid var(--color-text-secondary);
            color: 1px solid var(--color-text-secondary);
            background-color: var(--color-background-secondary);
            padding: var(--spacing) var(--spacing-2);
        }

        md-icon {
            display: inline-block;
        }
    `
    override render() {
        return html`<md-icon>info</md-icon><slot />`;
    }
}
