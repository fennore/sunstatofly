import { LitElement, TemplateResult, css, html } from "lit";
import { customElement, property } from "lit/decorators";

import '@material/web/tabs/tabs'
import '@material/web/tabs/primary-tab'

@customElement('rotation-steps')
export class RotationSteps extends LitElement {
    static override styles = css`
        :host {
            --md-primary-tab-label-text-color: var(--color-text-secondary);
            --md-primary-tab-active-label-text-color: var(--color-text-highlight);
            --md-primary-tab-active-indicator-color: var(--color-text-highlight);
            --md-primary-tab-active-focus-label-text-color: var(--color-text-highlight);
            --md-primary-tab-active-hover-label-text-color: var(--color-text-highlight);
            grid-area: steps;
        }

        md-tabs {
            height: 100%;
            text-align: center;
        }

        md-primary-tab {
            height: 100%;
            align-content: center;
            font-family: inherit;
        }
    `;

    @property()
    accessor steps: Map<string, string> = new Map();

    @property()
    accessor activeStep: string = 'day';

    #handleTabClick = (step: string) => () => {
        const event = new CustomEvent('changeStep', { detail: { step } });
        
        return this.dispatchEvent(event);
    }

    override render() {
        const tabs: Array<TemplateResult> = [];

        this.steps.forEach((label, key) => {
            tabs.push(html`<md-primary-tab ?active=${key === this.activeStep} @click=${this.#handleTabClick(key)}>${label}</md-primary-tab>`);
        });

        return html`<md-tabs>
            ${tabs}
        </md-tabs>`;
    }
}
