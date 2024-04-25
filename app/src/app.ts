import {LitElement, html, nothing} from 'lit';
import {customElement,  state} from 'lit/decorators';

import {initiateDb, SolarAccessRepository} from './db/index.js';

import '@material/web/dialog/dialog'

import './components/app-loader/index.js';
import './components/request-key/index.js';
import './components/chart-dashboard/index.js'
import { SaveEvent } from './components/request-key/index.js';

const KEY_REF = "saj-solar-key";

const repositories = [
  SolarAccessRepository
]

@customElement('solar-app')
export class App extends LitElement {
  #dbName = 'SolarPowerStats';

  @state()
  accessor #authKey: string | null = null;

  @state()
  accessor #loading: Boolean = false;

  @state()
  accessor #error: string | null = null;

  constructor() {
    super();

    this.#loading = true;
    const db = initiateDb(this.#dbName, repositories);
    const repo = new SolarAccessRepository(db);
      
    repo.get(KEY_REF).then(authKey => {
      console.log('got this thing', authKey)
        this.#authKey = authKey?.key ?? null;
        this.#loading = false;
    }).catch((error) => {
        console.error(error);
        this.#error = "Something went wrong, try again later."
    });
  }

  handleSave: (event: SaveEvent) => void = (event) => {
    const { key } = event.data;
    const db = initiateDb(this.#dbName, repositories);
    const repo = new SolarAccessRepository(db);
    const solarAccess = { reference: KEY_REF, key };

    repo.create(solarAccess).then(() => {
        this.#authKey = key;
        this.#loading = false;
    }).catch((error) => {
        console.error(error);
        this.#error = "Something went wrong, try again later."
    });
  }

  override render() {
    const errorDialog = html`<md-dialog>
      <div slot="headline">
        Foutmelding
      </div>
      <p slot="content">
        ${this.#error}
      </p>
    </md-dialog>`;

    const loader = html`<app-loader ?loading=${this.#loading}></app-loader>`;

    const inject = html`${this.#error ? errorDialog : nothing}${loader}`

    if(!this.#authKey) {
      return html`${inject}<request-key @save=${this.handleSave}></request-key>`;
    }

    console.log('we got it boys', this.#authKey);

    return html`${inject}<chart-dashboard authKey=${this.#authKey}></chart-dashboard>`;
  }
}