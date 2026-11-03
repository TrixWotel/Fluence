# Fluence: Geography Tests

Served at https://trixwotel.github.io/Fluence/geography/ as the geography folder of the Fluence site (see the space branch).

* **index.html** and **quiz.js** are the tests: the World Map, or one continent at a time. A country test names a country and you click it. A capitals test (geography/#capitals/eu, and so on for every map) names a capital and you click its country, on the same map.
* **countries.json** is the map: Natural Earth countries at 50m (public domain), simplified.
* **capitals.json** is each country's capital and where it is, from Natural Earth's populated places (public domain), brought up to date for 2026 (Gitega for Burundi, Ciudad de la Paz for Equatorial Guinea), plus Yaren for Nauru, which Natural Earth leaves out. Where one name isn't the whole story (Bolivia, South Africa, the Netherlands and a few more), a note says so after you answer.

The colors, buttons and motion come from the space branch: settings.js, kit/look.js and kit/site.css.

## License

Apache License 2.0, see LICENSE. The map and the capitals come from Natural Earth (public domain).
