import {CSSResultGroup, LitElement, css, html, nothing} from 'lit';
import {customElement,  state} from 'lit/decorators';

import {initiateDb, SolarPlantRepository} from './db/index.js';

import '@material/web/dialog/dialog'

import './components/app-loader/index.js';
import './components/request-key/index.js';
import './components/chart-dashboard/index.js'
import { SaveEvent } from './components/request-key/index.js';

// TODO build and use rollup instead of dns + import map (is way too slow!)

const KEY_REF = "saj-solar-plant";

const repositories = [
  SolarPlantRepository
]

@customElement('solar-app')
export class App extends LitElement {
  #dbName = 'SolarPowerStats';

  static override styles?: CSSResultGroup = css`
    :host {
      --color-text-highlight: rgba(239, 62, 54, 1);
      --color-text-main: rgba(40, 48, 68, 1);
      --color-text-secondary: rgba(109, 152, 186, 1);
      --color-background-main: rgba(232, 221, 181, 1);
      --color-background-secondary: rgba(109, 152, 186, .3);
      --color-background-contrastText: rgba(255, 255, 255, 1);
      --md-ripple-hover-color: rgba(239, 62, 54, .15);
      --md-ripple-pressed-color: rgba(239, 62, 54, .25);
      --accent-graph-main: 4, 167, 119;
      --accent-graph-compare: 109, 152, 186;
      --spacing: 0.6rem;
      --spacing-2: 1.25rem;
      font-family: 'Red Hat Display', sans-serif;
      font-weight: 300;
      color: var(--color-text-main);
      background-color: var(--color-background-contrastText);
    }
  `;

  @state()
  accessor #plantUid: string | null = null;

  @state()
  accessor #loading: Boolean = false;

  @state()
  accessor #error: string | null = null;

  constructor() {
    super();

    this.#loading = true;
    const db = initiateDb(this.#dbName, repositories);
    const repo = new SolarPlantRepository(db);
      
    repo.get(KEY_REF).then(plant => {
        this.#plantUid = plant?.plantUid ?? null;
        this.#loading = false;
    }).catch((error) => {
        console.error(error);
        this.#error = "Something went wrong, try again later."
    });
  }

  handleSave: (event: SaveEvent) => void = (event) => {
    const { plantUid } = event.data;
    const db = initiateDb(this.#dbName, repositories);
    const repo = new SolarPlantRepository(db);
    const solarPlant = { reference: KEY_REF, plantUid };

    repo.create(solarPlant).then(() => {
        this.#plantUid = plantUid;
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

    if(!this.#plantUid) {
      return html`${inject}<request-key @save=${this.handleSave}></request-key>`;
    }

    return html`${inject}<chart-dashboard plantUid=${this.#plantUid}></chart-dashboard>`;
  }
}