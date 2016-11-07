# Timeseries Analysation Tool

## Getting Started

Um das Tool in einem Projekt einzubinden, kann man entweder das dist File *app/dist/concat-min.js* in den Projekt Ordner kopieren oder [Bower](https://bower.io/) verwenden:

```bower install timeseries-analysation-tool --save```

Danach muss das AngularJS Modul *TimeseriesAnalysationTool* noch als Abhängigkeit hinzugefügt werden.

```
angular.module('myApp', ['TimeseriesAnalysationTool']);
```

## Function Reference

Die *three-dim-chart* Direktive kann an jeder Stelle eingebunden werden. Der *data* Parameter ist erforderlich, der *options* Parameter optional.

```
<three-dim-chart data="data" options="options"></three-dim-chart>
```

Das Datenobjekt muss folgene Struktur erfüllen:

```
{
    startDate: new Date('1970-01-01'),	// Start Zeitpunkt
    values: [1.2, 2.5 , 5.6, 8.2],		// Werte als eindimensionales Array
    stepLength: 900000				    // Abstand zwischen den Werten in Millisekunden
}
```

Folgende Optionen sind möglich:

```
{
    colorscale: true, 			// Soll die Farbskala auswählbar sein?
    colorrange: true,			 // Soll die Farbskala Range einstallbar sein?
    initialcolorscale: 'Greens'   // Soll eine bestimmte Farbskala initial gesetzt sein?
}
```

Wobei folgende Werte für *initialcolorscale* möglich sind:

```
['Greys', 'YIGnBu', 'Greens', 'YIOrRd', 'Bluered', 'RdBu', 'Reds', 'Blues', 'Picnic', 'Rainbow', 'Portland', 'Jet', 'Hot', 'Blackbody', 'Earth', 'Electric', 'Viridis']
```

Die Werte können jedezeit von außer per 2-Way-Binding geändert werden.

## Deployment

Im Folgenden sind die nötigen Schritte aufgelistet, um das Projekt zu Bauen:

 - Run ```npm install``` to install build tools.
 - Run ```bower install``` to install frontend dependencies.
 - Run ```gulp webserver``` for a local demo page.
 - Open http://localhost:8000 in your browser.

Desweiteren lässt sich mit ```gulp build``` ein Release Build erzeugen, das man unter *app/dist/concat.js* bzw. *app/dist/concat-min.js* findet.
