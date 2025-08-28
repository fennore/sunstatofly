import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

import '@material/web/icon/icon'
import '@material/web/iconbutton/icon-button'

@customElement('key-icon-button')
export class KeyIconButton extends LitElement {
    override render() {
        return html`
            <md-icon-button type="button" toggle>
                <md-icon>visibility</md-icon>
                <md-icon slot="selected">visibility_off</md-icon>
            </md-icon-button>
        `
    }
}