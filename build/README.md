# Burst Build Chain #

### Wat is dit? ###

Een epic build chain *zonder* eindeloos lange config bestanden, dankzij [Webpack](https://github.com/webpack/webpack). Met deze custom build chain kun je moeiteloos je front-end assets compilen, onafhankelijk van het type project (Drupal, Wordpress, Laravel). Je hoeft enkel aan te geven waar de `src` en de `public` mappen zich bevinden, de rest is plug-and-play!

### Opzetten ###

* Installeer [npm](https://docs.npmjs.com/getting-started/installing-node)
* Clone deze repository naar de build map van je project (dit kan wanneer je naar de root van je project gaat in de terminal met de volgende regel: 
`git clone [url om te clonen] .`
* Kopieer `serverConfig.example.js` en hernoem deze naar `serverConfig.js` (deze wordt geignored)
* Voeg een `src` map toe in je project voor je thema/code
* Voeg in de 'src' map een `sass` `images` `svg` `js` map toe met in de `js` map een `app.js` 
* Plaat in de `app.js` de volgende code: 

```
#!javascript

/**
 *  SASS/SCSS
 */
require('../sass/app.scss');

/**
 *  IMG
 */

// zorgt ervoor dat alle images worden gecompiled
require.context('../images/', true, /\.(jpe?g|png|gif)$/);

/**
 *  SVG
 */

// zorgt ervoor dat alle svg's worden gecompiled naar 1 sprite, die automatisch in de HTML wordt geinject
var files = require.context('../svg', true, /^\.\/.*\.svg$/);
files.keys().forEach(files);

```


* Pas in de `serverConfig.js` de `publicPath` en de `srcPath` aan naar de juiste paden
* Aanpassen van de `outputName` is optioneel, wel handig als je met meerdere mensen eraan werkt
* Installeer dependencies: voer `npm install` uit in de `/build` map

### Aan de slag ###

Er zijn een drietal commando's:

* `npm run watch` - deze build de assets volgens de `dev.js` config file, en zet een watcher op de bestanden
* `npm run build:dev` - deze build de assets **eenmalig** volgens de `dev.js` config file 
* `npm run build:prod` - deze build de assets **eenmalig** volgens de `prod.js` config file

Met de `dev.js` config wordt er **geen** apart .css bestand gegenereerd. Deze wordt inline in het output bestand van de Javascript geplaatst (default: `app.js`) en in de HTML geïjecteerd 'on page load'. Er wordt ook niks geminimized. Dit zorgt er voor dat het builden onwijs snel is, en dat is natuurlijk wat we willen tijdens het developen. 

Met de `prod.js` wordt er wel een apart .css bestand gegenereerd. Deze heet altijd `app.css` en komt in een submap `/css` terecht in de door jou aangegeven public folder. Hier wordt wel alles geminimized en geoptimaliseerd. Deze duurt dan ook aanzienlijk langer om te compilen.

Mist er informatie? Geef het aan in een issue en dan wordt het aangevuld.