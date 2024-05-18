import { LitElement, TemplateResult, css, html } from "lit";
import { customElement, property } from "lit/decorators";

@customElement('rotation-steps')
export class RotationSteps extends LitElement {
    static override styles = css`
        md-tabs {
            max-width: 75vw;
            margin-bottom: 1rem;
        }
    `;

    @property()
    accessor steps: Map<string, string> = new Map();

    @property()
    accessor activeStep: string = 'day';

    override render() {
        const tabs: Array<TemplateResult> = [];

        this.steps.forEach(([key, label]) => {
            tabs.push(html`<md-primary-tab${key === this.activeStep ? ' active' : ''}>${label}</md-primary-tab>`);
        });

        return html`<md-tabs>
            ${tabs.join('')}
        </md-tabs>`;
    }
}
