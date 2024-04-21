import {LitElement, html, nothing} from 'lit';
import {customElement,  state} from 'lit/decorators';

import {initiateDb, SolarAccessRepository} from './db/index.js';

import '@material/web/dialog/dialog'

import './components/app-loader/index.js';
import './components/request-key/index.js';
import './components/chart-dashboard/index.js'
import { SaveEvent } from './components/request-key/index.js';

const KEY_REF = "saj-solar-key";

@customElement('solar-app')
export class App extends LitElement {
  @state()
  accessor #accessKey: string | null = null;

  @state()
  accessor #loading: Boolean = false;

  @state()
  accessor #error: string | null = null;

  constructor() {
    super()

    this.#loading = true;
    initiateDb().then(db => {
      const repo = new SolarAccessRepository(db, 'solar-access');
      repo.get(KEY_REF).then(accessKey => {
        this.#accessKey = accessKey?.key ?? null;
        this.#loading = false;
      });
    }).catch(() => {
      this.#error = "Something went wrong, try again later."
    });
  }

  handleSave: (event: SaveEvent) => void = (event) => {
    console.log(event);
    const { key } = event.data;
    console.log(key);
    initiateDb().then(db => {
      const repo = new SolarAccessRepository(db, 'solar-access');
      const solarAccess = { reference: KEY_REF, key };
      console.log(solarAccess);
      repo.create(solarAccess).then(() => {
        this.#accessKey = key;
        this.#loading = false;
      });
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

    if(!this.#accessKey) {
      return html`${inject}<request-key @save=${this.handleSave}></request-key>`;
    }

    return html`${inject}<chart-dashboard></chart-dashboard>`;
  }
}