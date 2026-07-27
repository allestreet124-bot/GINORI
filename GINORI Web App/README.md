# GINORI 1735 - Azure Static Web App Contatti

Static Web App per gestire i contatti Dynamics 365 Dataverse con autenticazione Azure AD tramite `@azure/msal-browser`.

L'applicazione statica e' contenuta interamente nella cartella `web`.

## Configurazione

Il file `web/config.js` non e' versionato. GitHub Actions lo genera nel runner
prima del deploy con questa struttura:

```js
window.APP_CONFIG = {
  clientId: "CLIENT_ID_APP_REGISTRATION",
  tenantId: "TENANT_ID_AZURE_AD",
  dataverseUrl: "https://nomeorg.crm4.dynamics.com"
};
```

Non serve e non va inserito alcun client secret: questa e' una SPA pubblica.

## Azure AD

1. Creare una App registration in Microsoft Entra ID.
2. Aggiungere una piattaforma Single-page application.
3. Inserire come Redirect URI l'URL della Static Web App e l'eventuale URL locale, per esempio `http://localhost:8000`.
4. In API permissions aggiungere Dynamics CRM / Dataverse con permesso delegato `user_impersonation`.
5. Assicurarsi che gli utenti abbiano i ruoli Dataverse necessari su `contact` e, se usato, `account`.

## GitHub Actions

Il workflow `.github/workflows/deploy-swa.yml` usa i GitHub Environments
`sandbox` e `production`.

Configurare in entrambi gli environment queste Variables:

- `CLIENT_ID`
- `TENANT_ID`
- `DATAVERSE_URL`

Configurare inoltre questo Secret, con il token della relativa Static Web App:

- `AZURE_STATIC_WEB_APPS_API_TOKEN`

Un push sul branch `sandbox` distribuisce l'environment Sandbox. Un push su
`main` o `master` distribuisce Produzione. Il workflow puo' anche essere avviato
manualmente scegliendo l'environment.

Durante l'esecuzione, la pipeline genera `web/config.js`, esegue i test e
pubblica la cartella `web`. Il config generato esiste soltanto nel runner e
non viene aggiunto al repository. La configurazione di routing e header e' in
`web/staticwebapp.config.json`.

Questo workflow viene eseguito da GitHub Actions e non dal repository Azure
DevOps attualmente configurato come remote locale.
