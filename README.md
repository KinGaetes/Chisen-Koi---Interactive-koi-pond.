[Español](#espanol) · [Inglés](#english)

<a id="espanol"></a>

# ChisenKoi

Un estanque de koi interactivo, creado como proyecto de portafolio para explorar animación generativa, pathracking, comportamiento heuristico, composición visual y diseño de interfaces con HTML, CSS y JavaScript.

La propuesta es sencilla: un estanque donde peces se mueven e interactúan con lilypads que brotan. El usuario puede ajustar colores, movimiento y vegetación para componer una escena, interactuar con los peces y exportar el resultado. Es un ejercicio creativo y técnico, sin pretensión de representar una simulación biológica realista sino más bien un experimento estetico.

## Qué puedes explorar

- Componer una escena con hasta tres cardúmenes, plantas y flores.
- Ajustar paletas, movimiento y distribución de los elementos.
- Interactuar con los koi mediante el cursor o dibujar un sendero.
- Guardar configuraciones en el navegador para recuperarlas después.
- Exportar una imagen PNG, un vídeo WebM o un HTML ligero de la escena.

La interfaz ofrece español, inglés, chino y japonés.

## Cómo abrirlo

Descarga el proyecto y abre `index.html` en tu navegador. Conserva las carpetas del proyecto junto a ese archivo.

También puede publicarse como sitio estático en GitHub Pages, colocando `index.html`, `css/`, `js/` y `locales/` en la raíz de la fuente de publicación.

## Cómo está organizado

```text
index.html       # Estructura de la interfaz
css/
  styles.css     # Diseño y estilos
js/
  i18n.js        # Carga del CSV y resolución de textos por ID
  app.js         # Animación, interacción y exportaciones
locales/
  translations.csv  # Textos de la interfaz en los cuatro idiomas
  translations.generated.js  # Copia generada para abrir el proyecto localmente
README.md
LICENSE
```

El dibujo y la animación utilizan Canvas 2D. Todo se ejecuta en el navegador, sin backend ni base de datos. Las configuraciones se guardan en `localStorage` y se pierden si se borran los datos del sitio.

El HTML ligero exportado es independiente: incluye el código necesario para reproducir la escena sin el panel de edición.

## Editar textos e idiomas

Todos los textos de la interfaz se mantienen en `locales/translations.csv`. La primera columna, `text_id`, identifica el texto; las siguientes contienen español (`es`), chino (`zh`), inglés (`en`) y japonés (`ja`). Cada fila corresponde a un único ID, utilizado desde el HTML o JavaScript.

Puedes editar el archivo en una hoja de cálculo o en un editor de texto. Guárdalo como CSV separado por comas, con codificación UTF-8. En GitHub Pages, los cambios se leen directamente del CSV al recargar la página.

La versión descargable incluye una copia generada de las traducciones para funcionar al abrir `index.html` directamente. Esa copia debe actualizarse desde el CSV cuando se prepare una nueva versión descargable; los textos se editan siempre en el CSV.

- Conserva los IDs existentes al cambiar una traducción.
- Mantén los marcadores entre llaves, como `{count}`, `{name}` o `{seconds}`, en todos los idiomas: la aplicación los sustituye por los valores correspondientes.
- Usa un editor de CSV para conservar correctamente las comillas, comas y saltos de línea dentro de las celdas.
- Si una celda de chino o japonés queda vacía, se utiliza el texto en inglés. Español e inglés son obligatorios.

Para añadir un texto, crea una fila con un ID único y sus traducciones. En HTML utiliza `data-i18n="tu.id"`; para atributos, por ejemplo `data-i18n-title="tu.id"`. En `app.js`, utiliza `ui('tu.id')` o `ui('tu.id', {count: valor})` si incluye marcadores.

## Controles rápidos

- **Espacio:** pausar o reanudar.
- **R:** regenerar la escena con una nueva semilla.
- **Clic o toque:** interactuar con el estanque; en el modo de sendero, dibujar el recorrido.

## Alcance y limitaciones

ChisenKoi forma parte de un portafolio personal. Su foco está en la exploración visual y la interacción.

El rendimiento depende del dispositivo y de la complejidad de la escena. La grabación de vídeo requiere compatibilidad con `canvas.captureStream` y `MediaRecorder`; su disponibilidad puede variar entre navegadores. Las exportaciones PNG y HTML ofrecen otras formas de guardar el resultado.

## Autor y licencia

Creado por [KinGaetes](https://github.com/KinGaetes). Código disponible bajo la [licencia MIT](LICENSE).

---

<a id="english"></a>

# ChisenKoi

An interactive koi pond, created as a portfolio project to explore generative animation, path tracking, heuristic behavior, visual composition, and interface design with HTML, CSS, and JavaScript.

The idea is simple: a pond where fish move and interact with lily pads that bloom. Users can adjust colors, movement, and vegetation to compose a scene, interact with the fish, and export the result. It is a creative and technical exercise intended as an aesthetic experiment rather than a realistic biological simulation.

## What you can explore

- Compose a scene with up to three schools of fish, plants, and flowers.
- Adjust palettes, movement, and the distribution of elements.
- Interact with the koi using the cursor or draw a path.
- Save settings in the browser to use them again later.
- Export a PNG image, a WebM video, or a lightweight HTML version of the scene.

The interface supports Spanish, English, Chinese, and Japanese.

## How to open it

Download the project and open `index.html` in your browser. Keep the project folders alongside that file.

You can also publish it as a static website on GitHub Pages by placing `index.html`, `css/`, `js/`, and `locales/` at the root of the publishing source.

## Project structure

```text
index.html       # Interface structure
css/
  styles.css     # Design and styles
js/
  i18n.js        # CSV loading and text lookup by ID
  app.js         # Animation, interaction, and exports
locales/
  translations.csv  # Interface text in all four languages
  translations.generated.js  # Generated copy for opening the project locally
README.md
LICENSE
```

Drawing and animation use Canvas 2D. Everything runs in the browser, without a backend or database. Settings are saved in `localStorage` and are lost if the site's data is cleared.

The exported lightweight HTML is self-contained: it includes the code needed to play the scene without the editing panel.

## Editing text and languages

All interface text is maintained in `locales/translations.csv`. The first column, `text_id`, identifies each text; the remaining columns contain Spanish (`es`), Chinese (`zh`), English (`en`), and Japanese (`ja`). Each row corresponds to a unique ID used in the HTML or JavaScript.

You can edit the file in a spreadsheet or text editor. Save it as a comma-separated CSV with UTF-8 encoding. On GitHub Pages, changes are read directly from the CSV when the page is reloaded.

The downloadable version includes a generated copy of the translations so it can work when `index.html` is opened directly. This copy must be updated from the CSV when preparing a new downloadable version; always edit text in the CSV.

- Keep existing IDs when changing a translation.
- Preserve placeholders in braces, such as `{count}`, `{name}`, or `{seconds}`, in every language: the application replaces them with the corresponding values.
- Use a CSV editor to preserve quotes, commas, and line breaks within cells correctly.
- If a Chinese or Japanese cell is empty, the English text is used. Spanish and English are required.

To add text, create a row with a unique ID and its translations. In HTML, use `data-i18n="your.id"`; for attributes, use markers such as `data-i18n-title="your.id"`. In `app.js`, use `ui('your.id')` or `ui('your.id', {count: value})` if the text includes placeholders.

## Quick controls

- **Space:** pause or resume.
- **R:** regenerate the scene with a new seed.
- **Click or tap:** interact with the pond; in path mode, draw the route.

## Scope and limitations

ChisenKoi is part of a personal portfolio. Its focus is visual exploration and interaction.

Performance depends on the device and scene complexity. Video recording requires support for `canvas.captureStream` and `MediaRecorder`; availability may vary between browsers. PNG and HTML exports provide other ways to save the result.

## Author and license

Created by [KinGaetes](https://github.com/KinGaetes). Code available under the [MIT license](LICENSE).
