import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';

import '@material/web/button/filled-button'
import '@material/web/textfield/outlined-text-field';

import './wrapper';
import './show-notification';

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
        return html`
            <form @submit=${this.#handleSave}>
                <key-wrapper>
                    <show-notification>
                        De gegevens worden enkel lokaal opgeslagen.<br>
                        Wanneer u de browsergegevens (voor deze website) wist, dient u deze opnieuw in te geven.
                    </show-notification>
                    <md-outlined-text-field name="plantUid" type="password" label="ID van de installatie" placeholder="Geef het ID in">
                    </md-outlined-text-field>
                    <md-filled-button type="submit">Naar dashboard</md-filled-button>
                </key-wrapper>
            </form>`
    }
}

// TODO <key-icon-button slot="trailing-icon" /> cannot be combined with filled button due to duplicate declaration of custome element: how to fix?
// 