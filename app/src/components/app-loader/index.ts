import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators";
import '@material/web/progress/circular-progress';

import './wrapper.js';

@customElement('app-loader')
export class AppLoader extends LitElement {

    @property({type: Boolean})
    accessor loading: Boolean = false;

    override render() {
        if(!this.loading) {
            return html``;
        }

        return html`<page-loader-wrapper><md-circular-progress indeterminate></md-circular-progress></page-loader-wrapper>`;
    }
}