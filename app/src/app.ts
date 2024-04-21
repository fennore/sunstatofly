import {LitElement, html} from 'lit';
import {customElement,  state} from 'lit/decorators';
import {initiateDb, SolarAccessRepository} from './db/index.js';

import './components/app-loader/index.js';
import './components/request-key/index.js';
import './components/chart-dashboard/index.js'
import { SaveEvent } from './components/request-key/index.js';

const KEY_REF = "saj-solar-key";

@customElement('solar-app')
export class App extends LitElement {
  @state()
  accessor #accessKey: string | null = '';

  @state()
  accessor #loading: Boolean = false;

  constructor() {
    super()

    this.#loading = true;
    initiateDb().then(db => {
      const repo = new SolarAccessRepository(db, 'solar-access');
      repo.get(KEY_REF).then(accessKey => {
        this.#accessKey = accessKey?.key ?? null;
        this.#loading = false;
      });
    });
  }

  handleSave: (event: SaveEvent) => void = (event) => {
    console.log(event);
    const {key} = event.data;
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
    const loader = html`<app-loader ?loading=${this.#loading}></app-loader>`;

    if(!this.#accessKey) {
      return html`${loader}<request-key @save=${this.handleSave}></request-key>`;
    }

    return html`${loader}<chart-dashboard></chart-dashboard>`;
  }
}