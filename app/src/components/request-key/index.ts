import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators';
import '@material/web/textfield/outlined-text-field';
import '@material/web/icon/icon'
import '@material/web/iconbutton/icon-button'
import '@material/web/button/filled-button'

import './wrapper.js';

type Data = { [k:string]: any }

export class SaveEvent extends Event {
    constructor(eventName: string, data: Data) {
        super(eventName);

        this.data = data;
    }

    data: Data;
}

@customElement('request-key')
export class RequestKey extends LitElement {
    static override styles = css`
        form {
            width: 100vw;
            min-height: 100vh;
        }
    `

    constructor() {
        super();

        this.addEventListener('submit', this.#handleSave)
    }

    #handleSave = (event: any): any => {
        event.stopPropagation();
        event.preventDefault();
        const target: HTMLFormElement = event.target;
        const data = Object.fromEntries(new FormData(target));

        this.dispatchEvent(new SaveEvent('save', { data }));
    }

    override render() {
        return html`<form>
            <key-wrapper>
                <md-outlined-text-field name="key" type="password" label="Toegangssleutel" placeholder="Geef de toegangssleutel in">
                    <md-icon-button type="button" toggle slot="trailing-icon">
                        <md-icon>visibility</md-icon>
                        <md-icon slot="selected">visibility_off</md-icon>
                    </md-icon-button>
                </md-outlined-text-field>
                <md-filled-button type="submit">Naar dashboard</md-filled-button>
            </key-wrapper>
        </form>`
    }
}