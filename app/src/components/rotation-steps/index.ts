import { LitElement, TemplateResult, css, html } from "lit";
import { customElement, property } from "lit/decorators";

import '@material/web/tabs/tabs'
import '@material/web/tabs/primary-tab'

@customElement('rotation-steps')
export class RotationSteps extends LitElement {
    static override styles = css`
        :host {
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

    override render() {
        const tabs: Array<TemplateResult> = [];

        this.steps.forEach((label, key) => {
            tabs.push(html`<md-primary-tab ?active=${key === this.activeStep}>${label}</md-primary-tab>`);
        });

        return html`<md-tabs>
            ${tabs}
        </md-tabs>`;
    }
}
