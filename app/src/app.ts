import {LitElement, html} from 'lit';
import {customElement,  state} from 'lit/decorators';
import {initiateDb, SolarAccessRepository} from './db/index.js';

import './components/app-loader/index.js';
import './components/request-key/index.js';
import './components/chart-dashboard/index.js'

@customElement('solar-app')
export class App extends LitElement {
  @state()
  accessor #accessKey: string | null = '';

  @state()
  accessor #loading: boolean = true;

  constructor() {
    super()

    this.#loading = true;
    initiateDb().then(db => {
      const repo = new SolarAccessRepository(db, 'solar-access');
      repo.get('saj-solar-key').then(accessKey => {
        this.#accessKey = accessKey?.key ?? null;
        this.#loading = false;
      });
    });
  }

  override render() {
    const loader = html`<app-loader loading={this.loading}></app-loader>`;

    if(!this.#accessKey) {
      return html`${loader}<request-key keyName="saj-solar-key"></request-key>`;
    }

    return html`${loader}<chart-dashboard></chart-dashboard>`;
  }
}