import type {CSSResultGroup } from 'lit';
import { LitElement, css, html, nothing} from 'lit';
import {customElement,  state} from 'lit/decorators';

import {initiateDb, SolarPlantRepository} from './db';

import '@material/web/dialog/dialog'

import './components/app-loader';
import './components/request-key';
import './components/chart-dashboard'
import { SaveEvent } from './components/request-key';

const KEY_REF = "saj-solar-plant";

const repositories = [
  SolarPlantRepository
]

@customElement('solar-app')
export class App extends LitElement {
  #dbName = 'SolarPowerStats';

  static override styles?: CSSResultGroup = css`
    :host {
      --font-family: 'Red Hat Display', sans-serif;
      --font-weight: 300;
      --font-size: 1.1rem;
      --color-text-highlight: rgba(239, 62, 54, 1);
      --color-text-main: rgba(40, 48, 68, 1);
      --color-text-secondary: rgba(109, 152, 186, 1);
      --color-background-main: rgba(245, 241, 224, 1);
      --color-background-secondary: rgba(109, 152, 186, .3);
      --accent-background-highlight: 239, 62, 54;
      --color-background-contrastText: rgba(255, 255, 255, 1);
      --accent-graph-main: 4, 167, 119;
      --accent-graph-compare: 109, 152, 186;
      --spacing: 0.6rem;
      --spacing-2: 1.25rem;
      font-family: var(--font-family);
      font-weight: var(--font-weight);
      font-size: var(--font-size);
      line-height: calc(var(--font-size) * 1.3)
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

    
    // Build state from URL 
    const params = new URLSearchParams(window.location.search);
    
    this.#plantUid = params.get('plantUid');
    
    // When no state from URL params, build from client side db
    if(!this.#plantUid) {
      // Set initial loading state
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