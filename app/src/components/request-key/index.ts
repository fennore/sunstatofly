import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators';
import '@material/web/textfield/outlined-text-field';

import './wrapper'

@customElement('request-key')
export class RequestKey extends LitElement {
    static override styles = css`
        form {
            width: 100vw;
            min-height: 100vh;
        }
    `
    
    @property()
    accessor name: string = '';

    @property()
    accessor onSave: Function = () => {};

    override render() {
        return html`<form @submit=${this.onSave}>
            <key-wrapper>
                <md-outlined-text-field type="password" label="Key" placeholder="Geef de toegangssleutel in">
                    <md-icon-button toggle slot="trailing-icon">
                        <md-icon>visibility</md-icon>
                        <md-icon slot="selected">visibility_off</md-icon>
                    </md-icon-button>
                </md-outlined-text-field>
            </key-wrapper>
        </form>`
    }
}