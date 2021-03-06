# EPA's Open Data Metadata Editor

The EPA Open Data Metadata Editor is a web-based tool to create records compliant with EPA's Metadata Technical Specification. It includes a JSON version of the Technical Specification that can be reused in other geospatial and non-geo metadata editor tools. The code is released as public domain.

## Project setup

For non-official use, you may want to use your own ESRI app id by updating it in `EsriAuth.vue` and ensure local URLs are registered in your ESRI app config at https://developers.arcgis.com .

By default, build targets deployment to root folder and EPA build targets `/epa-open-data-metadata-editor` folder. Please modify `vue.config.js` to change this behavior.

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn run serve
```

### Compiles and minifies for production

```
yarn run build
```

### Compiles and minifies for production at EPA

```
yarn run build-epa
```

### Lints and fixes files

```
yarn run lint
```

## EPA Disclaimer
The United States Environmental Protection Agency (EPA) GitHub project code is provided on an "as is" basis and the user assumes responsibility for its use. EPA has relinquished control of the information and no longer has responsibility to protect the integrity, confidentiality, or availability of the information. Any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recomendation or favoring by EPA. The EPA seal and logo shall not be used in any manner to imply endorsement of any commercial product or activity by EPA or the United States Government.
