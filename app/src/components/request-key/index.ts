import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators';

import '@material/web/button/filled-button'
import '@material/web/textfield/outlined-text-field';

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

        // TODO find out how this works on submit, is there no bubbling etc.? using @submit for now...
        // this.addEventListener('submit', this.#handleSave)
    }

    #handleSave = (event: any): any => {
        event.stopPropagation();
        event.preventDefault();
        const target: HTMLFormElement = event.target;
        const data = Object.fromEntries(new FormData(target));

        this.dispatchEvent(new SaveEvent('save', data ));
    }

    override render() {
        return html`<form @submit=${this.#handleSave}>
            <key-wrapper>
                <md-outlined-text-field name="key" type="password" label="Toegangssleutel" placeholder="Geef de toegangssleutel in">
                </md-outlined-text-field>
                <md-filled-button type="submit">Naar dashboard</md-filled-button>
            </key-wrapper>
        </form>`
    }
}

// TODO <key-icon-button slot="trailing-icon" /> cannot be combined with filled button due to duplicate declaration of custome element: how to fix?
// 