import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const appRoot = process.cwd();
const variants = [
  { name: "web", base: join(appRoot, "web") }
];
const privacyConfigurationText = readFileSync(join(appRoot, "dataverse", "lbl_privacytexts.json"), "utf8");
const privacyConfiguration = JSON.parse(privacyConfigurationText);
const configGenerator = readFileSync(join(appRoot, "scripts", "generate-runtime-config.mjs"), "utf8");

assert.equal(privacyConfiguration.code, "lbl_privacytexts", "privacy JSON uses the Dataverse setting code");
assert.equal(privacyConfiguration.defaultType, "805720000", "privacy JSON has a deterministic fallback type");
assert.ok(privacyConfigurationText.length < 50000, "privacy JSON fits in gin_value_string");
assert.match(configGenerator, /clientId:\s*"CLIENT_ID"/, "config generator reads CLIENT_ID");
assert.match(configGenerator, /tenantId:\s*"TENANT_ID"/, "config generator reads TENANT_ID");
assert.match(configGenerator, /dataverseUrl:\s*"DATAVERSE_URL"/, "config generator reads DATAVERSE_URL");
assert.match(configGenerator, /window\.APP_CONFIG/, "config generator writes APP_CONFIG");
assert.doesNotMatch(configGenerator, /contactIdFieldName/, "Contact ID field is not environment configuration");

for (const consentType of ["805720000", "805720001", "805720002", "805720003"]) {
  const typeConfiguration = privacyConfiguration.types[consentType];
  assert.ok(typeConfiguration, `privacy JSON contains consent type ${consentType}`);

  for (const language of ["it", "en"]) {
    assert.ok(typeConfiguration[language]?.profileCreationText, `${consentType}: ${language} profile creation text exists`);
    assert.ok(typeConfiguration[language]?.consents?.privacy, `${consentType}: ${language} privacy consent text exists`);
  }
}

for (const variant of variants) {
  const html = readFileSync(join(variant.base, "index.html"), "utf8");
  const js = readFileSync(join(variant.base, "src", "app.js"), "utf8");
  const css = readFileSync(join(variant.base, "src", "styles.css"), "utf8");

  assert.doesNotMatch(html, /�|Ã/, `${variant.name}: HTML has no mojibake or replacement characters`);
  assert.match(html, /Città/, `${variant.name}: city label keeps accented a`);
  assert.match(html, /data-i18n="field\.city"/, `${variant.name}: city label is wired to translations`);
  assert.match(html, /data-column-field="contactIdText"/, `${variant.name}: table header targets Contact ID field`);
  assert.match(html, />Contact ID</, `${variant.name}: table header label is Contact ID`);
  assert.doesNotMatch(html, /data-column-field="account" data-column-label="Account"/, `${variant.name}: Account column removed from list`);

  assert.match(js, /const contactIdFieldName\s*=\s*"hnr_txtcontactid"/, `${variant.name}: app uses the static Contact ID logical name`);
  assert.doesNotMatch(js, /config\.contactIdFieldName/, `${variant.name}: app does not read Contact ID from config`);
  assert.match(js, /contactIdText:\s*raw\[contactIdFieldName\]/, `${variant.name}: raw Contact ID field is mapped to contactIdText`);
  assert.match(js, /raw\.parentcustomerid_account\?\.name/, `${variant.name}: missing account expand cannot break contact mapping`);
  assert.match(js, /`\/contacts\?\$\{query\}`/, `${variant.name}: contact list OData query starts with ?`);
  assert.match(js, /`\/contacts\(\$\{contactId\}\)\?\$select=/, `${variant.name}: single contact OData query starts with ?`);
  assert.match(js, /function openEditContactFromList\(/, `${variant.name}: list row loads full contact before opening edit form`);
  assert.match(js, /openEditContactFromList\(contact\)/, `${variant.name}: list row edit uses full contact loader`);
  assert.match(js, /openEditContactDialog\(contact\);[\s\S]*?loadContactById\(contact\.id\)/, `${variant.name}: list row opens form before detail fetch can fail`);
  assert.match(js, /isContactDetailReady/, `${variant.name}: editing save is guarded until full contact detail is loaded`);
  const openEditContactFromListBody = js.match(/async function openEditContactFromList\([\s\S]*?\n  async function loadContactById/)[0];
  assert.doesNotMatch(openEditContactFromListBody, /setContactSaving\(true\)/, `${variant.name}: opening a record does not show saving overlay`);
  const restoreContactRouteBody = js.match(/async function restoreContactRoute\([\s\S]*?\n  async function loadRestoredContactDetail/)[0];
  assert.doesNotMatch(restoreContactRouteBody, /state\.contacts\.find/, `${variant.name}: refreshing a contact route always reloads the full contact record`);
  assert.match(restoreContactRouteBody, /const contact = await loadContactById\(match\[1\]\)/, `${variant.name}: contact route restore uses full Dataverse contact detail`);
  assert.doesNotMatch(js, /\$expand=parentcustomerid_account\(\$select=name\)/, `${variant.name}: contact reads do not depend on account expand`);
  assert.match(js, /"new_dataricezioneconsenso"/, `${variant.name}: consent acceptance date is selected from Dataverse`);
  assert.match(js, /new_dataricezioneconsenso:\s*toDateInputValue\(raw\.new_dataricezioneconsenso\)/, `${variant.name}: consent acceptance date is mapped from Dataverse`);
  assert.match(js, /function openNewContactDialog\(\{ prefillConsentDate = true \} = \{\}\)/, `${variant.name}: new contact prefills consent date by default`);
  assert.match(js, /openNewContactDialog\(\{ prefillConsentDate: true \}\)/, `${variant.name}: route restore prefills new contact consent date`);
  assert.match(js, /window\.addEventListener\("popstate", handleContactRouteNavigation\)/, `${variant.name}: browser back is handled inside the customer card`);
  assert.match(js, /window\.addEventListener\("hashchange", handleContactRouteNavigation\)/, `${variant.name}: manual contact URL hash removal is handled inside the customer card`);
  assert.doesNotMatch(js, /addEventListener\("beforeunload"/, `${variant.name}: manual URL edits do not show the native browser leave prompt`);
  assert.match(js, /history\.pushState\(null, "", nextUrl\)/, `${variant.name}: contact routes are pushed into browser history`);
  assert.match(js, /activeContactRouteStorageKey/, `${variant.name}: active contact route is persisted across manual root navigation`);
  assert.match(js, /shouldRestoreStoredContactRouteBeforeList\(\)[\s\S]*?restoreContactRoute\(\{ deferEditContactLoad: true \}\);[\s\S]*?hideSplash\(\{ immediate: true \}\);[\s\S]*?loadContacts\(\{ reset: true \}\)/, `${variant.name}: manual root navigation shows splash only until the form route is restored`);
  assert.match(js, /function openPendingEditContactDialog\(contactId\)/, `${variant.name}: edit form can be shown before contact detail reload completes`);
  assert.match(js, /shouldAskPasswordAfterRestore[\s\S]*?requestPasswordForAction\("browser-back-close"\)/, `${variant.name}: manual root navigation restores the form and asks for password`);
  assert.match(js, /requestPasswordForAction\("browser-back-close"\)/, `${variant.name}: browser back asks for app password`);
  assert.match(js, /state\.pendingPasswordAction === "browser-back-close" && elements\.passwordDialog\.open/, `${variant.name}: route change password prompt is not duplicated`);
  assert.match(js, /action === "close" \|\| action === "browser-back-close"/, `${variant.name}: password-confirmed browser back closes the form`);
  assert.match(js, /`\/accounts\?\$\{query\}`/, `${variant.name}: account lookup OData query starts with ?`);
  assert.match(js, /copyContactIdToClipboard/, `${variant.name}: Contact ID copy handler exists`);
  assert.match(js, /contactId\.copied/, `${variant.name}: Contact ID copy toast is translated`);
  assert.match(js, /contactId\.unavailable/, `${variant.name}: Contact ID unavailable toast is translated`);
  assert.match(js, /showToast\(t\("contactId\.copied"\)\)/, `${variant.name}: Contact ID copy toast uses current language`);
  assert.match(js, /showToast\(t\("contactId\.unavailable"\)\)/, `${variant.name}: Contact ID unavailable toast uses current language`);
  assert.match(js, /event\.stopPropagation\(\)/, `${variant.name}: Contact ID click does not open edit modal`);
  assert.match(html, /<div id="toastMessage"[\s\S]*?<dialog id="contactDialog"/, `${variant.name}: Contact ID toast is outside the hidden contacts view`);

  assert.match(css, /\.cell-contact-id/, `${variant.name}: Contact ID cell style exists`);
  assert.match(css, /user-select:\s*text/, `${variant.name}: Contact ID text is selectable`);
  assert.match(css, /cursor:\s*text/, `${variant.name}: Contact ID cell uses text cursor`);
  assert.match(css, /\.account-lookup\s*{[^}]*display:\s*none;/s, `${variant.name}: Account lookup is hidden without removing markup or logic`);
  assert.match(
    css,
    /@media \(min-width:\s*761px\) and \(max-width:\s*1100px\)[\s\S]*?th\s*{[\s\S]*?z-index:\s*60;/,
    `${variant.name}: tablet grid header stays below the blue site header`
  );
  assert.match(
    css,
    /@media \(min-width:\s*761px\) and \(max-width:\s*1100px\)[\s\S]*?\.page-heading-compact\s*{[\s\S]*?z-index:\s*50;/,
    `${variant.name}: tablet view header stays below the blue site header`
  );
  assert.match(html, /id="contactDialog"[^>]*(?:hidden|aria-hidden="true")/, `${variant.name}: legacy contact dialog remains hidden`);
  assert.match(html, /id="contactPageView"[^>]*class="contact-page-view"/, `${variant.name}: fullscreen customer card view exists`);
  assert.match(html, /id="contactPageForm"/, `${variant.name}: fullscreen customer card form exists`);
  assert.doesNotMatch(html, /id="contactPageCancelButton"/, `${variant.name}: fullscreen customer card has no cancel button`);
  assert.match(html, /id="contactPasswordDialog"/, `${variant.name}: password confirmation dialog exists`);
  assert.match(html, /id="contactPasswordInput"/, `${variant.name}: password input exists`);
  assert.match(js, /gin_appboutiquesettings\?\$select=gin_value_string&\$filter=/, `${variant.name}: password is fetched from gin_appboutiquesettings`);
  assert.match(js, /gin_code eq 'pwd_closedigitalcustomercard'/, `${variant.name}: password lookup uses the boutique setting code`);
  assert.match(js, /data\.value\?\.\[0\]\?\.gin_value_string/, `${variant.name}: password is read from gin_value_string`);
  assert.match(js, /pendingPasswordAction/, `${variant.name}: pending password action is remembered`);
  assert.match(js, /#contact\/new/, `${variant.name}: new contact refresh route exists`);
  assert.match(js, /#contact\/\$\{contact\.id\}/, `${variant.name}: edit contact refresh route exists`);
  assert.match(css, /\.contact-page-view/, `${variant.name}: fullscreen customer card CSS exists`);
  assert.match(html, /id="languageSwitch"/, `${variant.name}: header language switch exists`);
  assert.match(js, /const translations\s*=\s*{[\s\S]*?\bit:/, `${variant.name}: Italian translations exist`);
  assert.match(js, /const translations\s*=\s*{[\s\S]*?\ben:/, `${variant.name}: English translations exist`);
  assert.match(js, /function setLanguage\(/, `${variant.name}: setLanguage function exists`);
  assert.match(js, /function applyTranslations\(/, `${variant.name}: applyTranslations function exists`);
  assert.match(js, /function setHeaderLocked\(/, `${variant.name}: header lock function exists`);
  assert.match(js, /field\.privacyConsentText/, `${variant.name}: privacy consent label is translated`);
  assert.match(js, /field\.marketingConsentText/, `${variant.name}: marketing consent label is translated`);
  assert.match(js, /field\.profilingConsentText/, `${variant.name}: profiling consent label is translated`);
  assert.match(
    html,
    /id="contactPagePrivacySectionTitle"[\s\S]*?id="contactPagePrivacyText"[\s\S]*?id="contactPagePrivacyIntro"[\s\S]*?class="privacy-options"/,
    `${variant.name}: privacy policy text appears before profile creation text`
  );
  assert.match(
    html,
    /class="privacy-options"[\s\S]*?<\/div>\s*<p id="contactPagePrivacyFooter" class="privacy-intro privacy-footer" hidden><\/p>/,
    `${variant.name}: dynamic privacy footer exists below all opt-in fields`
  );
  assert.match(html, /id="contactPagePrivacyConsentText"/, `${variant.name}: privacy consent copy has a dynamic target`);
  assert.match(html, /id="contactPageMarketingConsentText"/, `${variant.name}: marketing consent copy has a dynamic target`);
  assert.match(html, /id="contactPageProfilingConsentText"/, `${variant.name}: profiling consent copy has a dynamic target`);
  assert.match(html, /id="contactPageThirdPartyConsentText"/, `${variant.name}: third-party consent copy has a dynamic target`);
  assert.match(js, /gin_code eq 'lbl_privacytexts'/, `${variant.name}: privacy copy uses the boutique setting code`);
  assert.match(js, /gin_appboutiquesettings\?\$select=gin_value_string&\$filter=/, `${variant.name}: privacy copy is loaded from boutique settings`);
  assert.match(js, /state\.privacyTextConfiguration\s*=\s*JSON\.parse/, `${variant.name}: privacy JSON is parsed and cached in state`);
  assert.match(js, /function applyPrivacyTexts\(/, `${variant.name}: privacy copy renderer exists`);
  assert.match(js, /privacyText:\s*document\.getElementById\("contactPagePrivacyText"\)/, `${variant.name}: privacy policy copy is wired to the DOM`);
  assert.match(js, /elements\.privacyText\.textContent\s*=\s*localizedTexts\?\.privacyText/, `${variant.name}: privacy policy copy uses the active CRM text`);
  assert.match(js, /privacyFooter:\s*document\.getElementById\("contactPagePrivacyFooter"\)/, `${variant.name}: privacy footer is wired to the DOM`);
  assert.match(js, /elements\.privacyFooter\.textContent\s*=\s*localizedTexts\?\.footerText/, `${variant.name}: privacy footer uses the active CRM text`);
  assert.match(js, /normalizeRequiredConsentText\([\s\S]*?consentTexts\.privacy/, `${variant.name}: CRM privacy copy does not duplicate the required marker`);
  assert.match(js, /String\(getCountryConsentFlagsManagement\(\)\)/, `${variant.name}: privacy copy follows the existing country consent option`);
  assert.match(js, /function applyConsentConfiguration\([\s\S]*?applyPrivacyTexts\(\);/, `${variant.name}: country consent updates also refresh privacy copy`);
  assert.match(js, /function applyTranslations\([\s\S]*?applyPrivacyTexts\(\);/, `${variant.name}: language changes also refresh privacy copy`);
  assert.match(css, /\.privacy-intro\s*{/, `${variant.name}: privacy introduction has responsive styling`);
  assert.match(js, /date\.previousMonth/, `${variant.name}: date picker navigation labels are translated`);
  assert.match(js, /function getDatePickerLocale\(/, `${variant.name}: date picker locale follows app language`);
  assert.match(js, /function getDatePickerWeekdayLabels\(/, `${variant.name}: date picker weekday labels follow app language`);
  assert.match(js, /toLocaleDateString\(getDatePickerLocale\(\)/, `${variant.name}: date picker month names use app locale`);
  assert.doesNotMatch(js, /<span>Lun<\/span><span>Mar<\/span>/, `${variant.name}: date picker weekdays are not hardcoded in Italian`);
  assert.match(html, /data-i18n="field\.privacyConsentText"/, `${variant.name}: privacy consent label is wired to translations`);
  assert.match(html, /data-i18n="field\.marketingConsentText"/, `${variant.name}: marketing consent label is wired to translations`);
  assert.match(html, /data-i18n="field\.profilingConsentText"/, `${variant.name}: profiling consent label is wired to translations`);
  assert.match(js, /const expressions = \[[\s\S]*?return expressions\.join\(" or "\)/, `${variant.name}: list search builds a valid OData string`);
  assert.match(js, /elements\.loginButton\?\.addEventListener/, `${variant.name}: optional header login button cannot block initialization`);
  assert.match(js, /Promise\.race\(\[[\s\S]*?image\.decode\(\)[\s\S]*?waitForImageLoad\(image\)/, `${variant.name}: logo preload cannot hang on image.decode`);
  assert.match(js, /state\.selectedCountryOfResidence\?\.consentFlagsManagement/, `${variant.name}: new contact form handles empty country consent state`);
  assert.match(js, /consentFlagsManagement == null[\s\S]*?marketingExplicit:\s*true[\s\S]*?profilingExplicit:\s*true[\s\S]*?thirdPartyExplicit:\s*true/, `${variant.name}: empty country shows every consent field`);
  assert.match(css, /\.toggle-field\[hidden\]\s*{[\s\S]*?display:\s*none !important;/, `${variant.name}: implicit consent fields are removed from layout when hidden`);
  assert.match(js, /state\.editingContact\?\.accountId/, `${variant.name}: hidden account lookup cannot break new contact save`);
  assert.match(css, /\.language-switch/, `${variant.name}: language switch CSS exists`);
  assert.match(css, /\.contact-page-view\s*{[\s\S]*?top:\s*50px;/, `${variant.name}: fullscreen customer card starts below app header`);
  assert.match(css, /\.toast-message\s*{[\s\S]*?z-index:\s*1500;/, `${variant.name}: toast appears above fullscreen customer card`);
}
