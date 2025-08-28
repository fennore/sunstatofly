import { html } from "lit/static-html.js";

export default html`
    <p>
        In <color-main>groen</color-main> zie je de grafiek van de hoeveelheid opgewekte energie per dag voor deze maand.
    </p>
    <p>
        In <color-compare>blauw</color-compare> zie je ook de grafiek van de hoeveelheid opgewekte energie per dag, maar van vorige maand.
    </p>
    <p>
        De hoeveelheid opgewekte energie gedurende een bepaalde periode wordt uitgedrukt in wattuur (Wh).
        In dit geval per 1000 wattuur, dus kilowattuur (kWh)
    </p>
    <p>
        Wanneer is de hoeveelheid opgewekte energie het grootst, en waarom?
    </p>
`;