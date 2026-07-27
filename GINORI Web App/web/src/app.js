(function () {
  const config = window.APP_CONFIG || {};
  const dataverseUrl = normalizeDataverseUrl(config.dataverseUrl);
  const contactIdFieldName = "hnr_txtcontactid";
  const qrCodeImageFieldName = "hnr_qrcodeimg";
  const placeholderValues = [
    "INSERISCI_CLIENT_ID_AZURE_AD",
    "INSERISCI_TENANT_ID_AZURE_AD",
    "https://INSERISCI_ORG.crm4.dynamics.com"
  ];
  const filterFields = [
    { value: "firstname", label: "Nome" },
    { value: "lastname", label: "Cognome" },
    { value: "emailaddress1", label: "Email" },
    { value: "telephone1", label: "Telefono" },
    { value: "contactIdText", label: "Contact ID" }
  ];
  const filterOperators = [
    { value: "eq", label: "È uguale a", needsValue: true },
    { value: "ne", label: "Diverso da", needsValue: true },
    { value: "contains", label: "Contiene", needsValue: true },
    { value: "not-contains", label: "Non contiene", needsValue: true },
    { value: "starts-with", label: "Inizia con", needsValue: true },
    { value: "not-starts-with", label: "Non inizia con", needsValue: true },
    { value: "ends-with", label: "Termina con", needsValue: true },
    { value: "not-ends-with", label: "Non termina con", needsValue: true },
    { value: "has-data", label: "Contiene dati", needsValue: false },
    { value: "no-data", label: "Non contiene dati", needsValue: false }
  ];
  const sortDirectionOptions = [
    { value: "asc", label: "Dalla A alla Z" },
    { value: "desc", label: "Dalla Z alla A" }
  ];
  let preferredContactMethodOptions = [
    { value: "", label: "Seleziona metodo" },
    { value: "1", label: "Qualsiasi" },
    { value: "2", label: "Email" },
    { value: "3", label: "Telefono" },
    { value: "4", label: "Fax" },
    { value: "5", label: "Posta" }
  ];
  let salutationOptions = [
    { value: "", label: "Seleziona titolo" },
    { value: "sig", label: "Sig." },
    { value: "sigra", label: "Sig.ra" },
    { value: "dott", label: "Dott." },
    { value: "dottssa", label: "Dott.ssa" }
  ];
  const consentManagementTypes = {
    allExplicit: 805720000,
    privacyMarketingExplicitProfilingImplicit: 805720001,
    onlyPrivacyExplicit: 805720002,
    privacyMarketingThirdPartyExplicitProfilingImplicit: 805720003
  };
  const contactOptionSetFields = {
    preferredcontactmethodcode: {
      stateKey: "preferredcontactmethodcode",
      fallback: preferredContactMethodOptions
    },
    gin_salutation: {
      stateKey: "gin_salutation",
      fallback: salutationOptions
    }
  };
  const recentAccountsStorageKey = "ginoriRecentAccounts";

  const languageStorageKey = "ginoriLanguage";
  const activeContactRouteStorageKey = "ginoriActiveContactRoute";
  const translations = {
    it: {
      "app.title": "PROFILI CLIENTE",
      "app.titleCase": "Profili Cliente",
      "auth.lede": "Accedi con Azure AD per visualizzare, creare e modificare i profili cliente.",
      "account.logout": "Esci",
      "account.switch": "Accedi con un altro account",
      "button.login": "Accedi",
      "button.filter": "Filtro",
      "button.sort": "Ordina",
      "button.refresh": "Aggiorna",
      "button.new": "Nuovo",
      "button.save": "Salva",
      "button.confirm": "Conferma",
      "search.placeholder": "Cerca",
      "list.empty": "Nessun profilo cliente trovato.",
      "contactId.unavailable": "Contact ID non disponibile",
      "contactId.copied": "Contact ID copiato correttamente",
      "card.title": "Digital Customer Card",
      "section.profile": "INFORMAZIONI DI PROFILO",
      "section.contact": "INFORMAZIONI DI COMUNICAZIONE",
      "section.privacy": "PRIVACY",
      "field.firstName": "Nome",
      "field.lastName": "Cognome",
      "field.email": "Email",
      "field.phone": "Telefono",
      "field.salutation": "Titolo",
      "field.firstNameRequired": "Nome",
      "field.lastNameRequired": "Cognome",
      "field.residenceCountryRequired": "Paese di Residenza",
      "field.birthDateRequired": "Data di Nascita",
      "field.city": "Città",
      "field.address": "Indirizzo",
      "field.country": "Nazione",
      "field.mobile": "Cellulare",
      "field.preferredContact": "Metodo di contatto preferita",
      "field.emailRequired": "Email",
      "field.postalCode": "CAP/ZIP CODE",
      "field.state": "STATO/PROVINCIA/REGIONE",
      "field.wechat": "WeChat",
      "field.privacyDate": "Data Ricezione Consenso Privacy",
      "field.privacyConsentText": "Ho letto e compreso la informativa sulla privacy e acconsento di creare il mio profilo Ginori",
      "field.marketingConsentText": "Accetto di ricevere aggiornamenti sulle nuove attività, prodotti esclusivi, servizi personalizzati di GINORI 1735 e ad avere un'esperienza personalizzata sulla base dei miei interessi.",
      "field.profilingConsentText": "Comprendo che Richard Ginori S.r.l trarrà inferenze sulla base delle mie informazioni di profilo (profilazione)",
      "field.thirdPartyConsent": "Consenso Terze Parti",
      "password.title": "Conferma operazione",
      "password.label": "Inserisci password",
      "password.invalid": "Password errata",
      "date.previousPeriod": "Periodo precedente",
      "date.previousYear": "Anno precedente",
      "date.previousMonth": "Mese precedente",
      "date.chooseMonthYear": "Scegli mese e anno",
      "date.nextPeriod": "Periodo successivo",
      "date.nextYear": "Anno successivo",
      "date.nextMonth": "Mese successivo"
    },
    en: {
      "app.title": "CUSTOMER PROFILES",
      "app.titleCase": "Customer Profiles",
      "auth.lede": "Sign in with Azure AD to view, create and edit customer profiles.",
      "account.logout": "Sign out",
      "account.switch": "Sign in with another account",
      "button.login": "Sign in",
      "button.filter": "Filter",
      "button.sort": "Sort",
      "button.refresh": "Refresh",
      "button.new": "New",
      "button.save": "Save",
      "button.confirm": "Confirm",
      "search.placeholder": "Search",
      "list.empty": "No customer profile found.",
      "contactId.unavailable": "Contact ID unavailable",
      "contactId.copied": "Contact ID copied to clipboard",
      "card.title": "Digital Customer Card",
      "section.profile": "PROFILE INFORMATION",
      "section.contact": "COMMUNICATION INFORMATION",
      "section.privacy": "PRIVACY",
      "field.firstName": "First name",
      "field.lastName": "Last name",
      "field.email": "Email",
      "field.phone": "Phone",
      "field.salutation": "Title",
      "field.firstNameRequired": "First name",
      "field.lastNameRequired": "Last name",
      "field.residenceCountryRequired": "Country of residence",
      "field.birthDateRequired": "Date of birth",
      "field.city": "City",
      "field.address": "Address",
      "field.country": "Country",
      "field.mobile": "Mobile phone",
      "field.preferredContact": "Preferred contact method",
      "field.emailRequired": "Email",
      "field.postalCode": "ZIP/Postal code",
      "field.state": "State/Province/Region",
      "field.wechat": "WeChat",
      "field.privacyDate": "Privacy consent received date",
      "field.privacyConsentText": "I have read and understood the privacy notice and consent to the creation of my Ginori profile",
      "field.marketingConsentText": "I agree to receive updates about new activities, exclusive products, personalized services from GINORI 1735 and to have a personalized experience based on my interests.",
      "field.profilingConsentText": "I understand that Richard Ginori S.r.l will draw inferences based on my profile information (profiling)",
      "field.thirdPartyConsent": "Third-party consent",
      "password.title": "Confirm action",
      "password.label": "Enter password",
      "password.invalid": "Wrong password",
      "date.previousPeriod": "Previous period",
      "date.previousYear": "Previous year",
      "date.previousMonth": "Previous month",
      "date.chooseMonthYear": "Choose month and year",
      "date.nextPeriod": "Next period",
      "date.nextYear": "Next year",
      "date.nextMonth": "Next month"
    }
  };
  let filterNodeId = 0;

  const elements = {
    appSplash: document.getElementById("appSplash"),
    appSplashLogo: document.querySelector(".app-splash-logo"),
    loginButton: document.getElementById("loginButton"),
    heroLoginButton: document.getElementById("heroLoginButton"),
    userMenuButton: document.getElementById("userMenuButton"),
    brandLink: document.querySelector(".brand"),
    headerLogoFull: document.getElementById("headerLogoFull"),
    headerLogoMark: document.getElementById("headerLogoMark"),
    accountMenu: document.getElementById("accountMenu"),
    menuLogoutButton: document.getElementById("menuLogoutButton"),
    switchAccountButton: document.getElementById("switchAccountButton"),
    languageButtons: document.querySelectorAll("[data-language]"),
    userInitials: document.getElementById("userInitials"),
    userName: document.getElementById("userName"),
    menuUserInitials: document.getElementById("menuUserInitials"),
    menuUserName: document.getElementById("menuUserName"),
    menuUserEmail: document.getElementById("menuUserEmail"),
    accountTenantLogo: document.querySelector(".account-tenant-logo"),
    signedOutView: document.getElementById("signedOutView"),
    contactsView: document.getElementById("contactsView"),
    pageHeading: document.querySelector(".page-heading-compact"),
    listWordmark: document.querySelector(".list-wordmark"),
    listSearchInput: document.getElementById("listSearchInput"),
    refreshButton: document.getElementById("refreshButton"),
    advancedFilterButton: document.getElementById("advancedFilterButton"),
    mobileSortButton: document.getElementById("mobileSortButton"),
    mobileSortDialog: document.getElementById("mobileSortDialog"),
    mobileSortForm: document.getElementById("mobileSortForm"),
    mobileSortFieldSelect: document.getElementById("mobileSortFieldSelect"),
    mobileSortField: document.getElementById("mobileSortField"),
    mobileSortDirectionSelect: document.getElementById("mobileSortDirectionSelect"),
    mobileSortDirection: document.getElementById("mobileSortDirection"),
    closeMobileSortButton: document.getElementById("closeMobileSortButton"),
    cancelMobileSortButton: document.getElementById("cancelMobileSortButton"),
    newContactButton: document.getElementById("newContactButton"),
    contactsSentinel: document.getElementById("contactsSentinel"),
    contactsSpinner: document.getElementById("contactsSpinner"),
    listLoadingOverlay: document.getElementById("listLoadingOverlay"),
    columnMenu: document.getElementById("columnMenu"),
    columnMenuButtons: document.querySelectorAll("[data-column-field]"),
    columnMenuItems: document.querySelectorAll("[data-column-action]"),
    columnFilterPanel: document.getElementById("columnFilterPanel"),
    columnFilterOperatorSelect: document.getElementById("columnFilterOperatorSelect"),
    columnFilterOperator: document.getElementById("columnFilterOperator"),
    columnFilterInput: document.getElementById("columnFilterInput"),
    closeFilterPanelButton: document.getElementById("closeFilterPanelButton"),
    applyFilterButton: document.getElementById("applyFilterButton"),
    clearFilterButton: document.getElementById("clearFilterButton"),
    statusMessage: document.getElementById("statusMessage"),
    toastMessage: document.getElementById("toastMessage"),
    contactsTableBody: document.getElementById("contactsTableBody"),
    emptyState: document.getElementById("emptyState"),
    dialog: document.getElementById("contactPageView"),
    form: document.getElementById("contactPageForm"),
    formSections: document.querySelector("#contactPageView .form-sections"),
    dateInputs: document.querySelectorAll("#contactPageView .date-picker-input"),
    dialogTitle: document.getElementById("contactPageTitle"),
    closeDialogButton: document.getElementById("closeContactPageButton"),
    cancelButton: null,
    saveContactButton: document.getElementById("contactPageSaveContactButton"),
    contactSavingOverlay: document.getElementById("contactPageSavingOverlay"),
    formError: document.getElementById("contactPageFormError"),
    salutationSelect: document.querySelector('#contactPageView [data-form-select="salutation"]'),
    salutationInput: document.getElementById("contactPageSalutationInput"),
    firstNameInput: document.getElementById("contactPageFirstNameInput"),
    lastNameInput: document.getElementById("contactPageLastNameInput"),
    countryOfResidenceInput: document.getElementById("contactPageCountryOfResidenceInput"),
    countryOfResidenceResults: document.getElementById("contactPageCountryOfResidenceResults"),
    birthDateInput: document.getElementById("contactPageBirthDateInput"),
    contactIdField: document.getElementById("contactPageContactIdField"),
    contactIdCopyButton: document.getElementById("contactPageContactIdCopyButton"),
    contactIdOutput: document.getElementById("contactPageContactIdOutput"),
    qrCodeField: document.getElementById("contactPageQrCodeField"),
    qrCodeImage: document.getElementById("contactPageQrCodeImage"),
    emailInput: document.getElementById("contactPageEmailInput"),
    addressLine1Input: document.getElementById("contactPageAddressLine1Input"),
    addressCityInput: document.getElementById("contactPageAddressCityInput"),
    addressPostalCodeInput: document.getElementById("contactPageAddressPostalCodeInput"),
    addressStateInput: document.getElementById("contactPageAddressStateInput"),
    addressCountryInput: document.getElementById("contactPageAddressCountryInput"),
    addressCountryResults: document.getElementById("contactPageAddressCountryResults"),
    mobilePhoneInput: document.getElementById("contactPageMobilePhoneInput"),
    wechatInput: document.getElementById("contactPageWechatInput"),
    preferredContactMethodSelect: document.querySelector('#contactPageView [data-form-select="preferred-contact-method"]'),
    preferredContactMethodInput: document.getElementById("contactPagePreferredContactMethodInput"),
    profilingConsentInput: document.getElementById("contactPageProfilingConsentInput"),
    marketingConsentInput: document.getElementById("contactPageMarketingConsentInput"),
    privacyConsentReceivedDateInput: document.getElementById("contactPagePrivacyConsentReceivedDateInput"),
    privacyConsentInput: document.getElementById("contactPagePrivacyConsentInput"),
    privacyConsentField: document.getElementById("contactPagePrivacyConsentField"),
    marketingConsentField: document.getElementById("contactPageMarketingConsentField"),
    profilingConsentField: document.getElementById("contactPageProfilingConsentField"),
    thirdPartyConsentField: document.getElementById("contactPageThirdPartyConsentField"),
    thirdPartyConsentInput: document.getElementById("contactPageThirdPartyConsentInput"),
    privacyText: document.getElementById("contactPagePrivacyText"),
    privacyIntro: document.getElementById("contactPagePrivacyIntro"),
    privacyConsentText: document.getElementById("contactPagePrivacyConsentText"),
    marketingConsentText: document.getElementById("contactPageMarketingConsentText"),
    profilingConsentText: document.getElementById("contactPageProfilingConsentText"),
    thirdPartyConsentText: document.getElementById("contactPageThirdPartyConsentText"),
    privacyFooter: document.getElementById("contactPagePrivacyFooter"),
    accountSearchInput: document.getElementById("contactPageAccountSearchInput"),
    accountResults: document.getElementById("contactPageAccountResults"),
    selectedAccountCard: document.getElementById("contactPageSelectedAccountCard"),
    selectedAccountName: document.getElementById("contactPageSelectedAccountName"),
    selectedAccountId: document.getElementById("contactPageSelectedAccountId"),
    clearAccountButton: document.getElementById("contactPageClearAccountButton"),
    passwordDialog: document.getElementById("contactPasswordDialog"),
    passwordForm: document.getElementById("contactPasswordForm"),
    passwordInput: document.getElementById("contactPasswordInput"),
    passwordError: document.getElementById("contactPasswordError"),
    closePasswordDialogButton: document.getElementById("closePasswordDialogButton"),
    confirmPasswordButton: document.getElementById("confirmPasswordButton"),
    advancedFilterDialog: document.getElementById("advancedFilterDialog"),
    advancedFilterForm: document.getElementById("advancedFilterForm"),
    advancedFilterRows: document.getElementById("advancedFilterRows"),
    addAdvancedFilterRowButton: document.getElementById("addAdvancedFilterRowButton"),
    clearAdvancedFiltersButton: document.getElementById("clearAdvancedFiltersButton"),
    closeAdvancedFilterButton: document.getElementById("closeAdvancedFilterButton"),
    cancelAdvancedFiltersButton: document.getElementById("cancelAdvancedFiltersButton")
  };
  const headerLogoSources = [
    "./assets/logo_full_white_transparent.png",
    "./assets/logo_full_white_transparent.png"
  ];
  const criticalLogoSources = [
    "./assets/logo_full_white_transparent.png",
    "./assets/ginori-1735-wordmark-dark.svg",
    "./assets/ginori-crown-dark.svg"
  ];

  const state = {
    msalInstance: null,
    account: null,
    contacts: [],
    editingContact: null,
    isLoadingContactDetail: false,
    isContactDetailReady: false,
    nextContactsLink: "",
    isLoadingContacts: false,
    contactsObserver: null,
    isResetLoadingContacts: false,
    sortField: "lastname",
    sortDirection: "asc",
    activeColumnField: "",
    filterTree: createRootFilterTree(),
    listSearchTerm: "",
    selectedAccount: null,
    selectedCountryOfResidence: null,
    selectedAddressCountry: null,
    customConsentPayload: {},
    activeDateInput: null,
    datePickerMonth: null,
    datePickerMode: "days",
    datePickerElement: null,
    recentAccounts: [],
    logoPreloadPromise: null,
    listSearchTimer: null,
    accountSearchTimer: null,
    accountResultsHideTimer: null,
    countrySearchTimer: null,
    countryResultsHideTimer: null,
    columnMenuHideTimer: null,
    columnFilterPanelHideTimer: null,
    splashHideTimer: null,
    splashHiddenTimer: null,
    toastTimer: null,
    pendingPasswordAction: null,
    contactPassword: "",
    isRestoringContactRoute: false,
    activeContactRouteHash: "",
    currentLanguage: "it",
    isContactPageOpen: false,
    optionSetMetadata: {},
    privacyTextConfiguration: null,
    activeQrCodeImageUrl: ""
  };

  document.addEventListener("DOMContentLoaded", initialize);

  async function initialize() {
    state.logoPreloadPromise = preloadCriticalLogos();
    const minimumInitialSplashTime = wait(2500);

    if (!hasValidConfig()) {
      setStatus("Compila clientId, tenantId e dataverseUrl in config.js.", true);
      elements.signedOutView.hidden = true;
      elements.contactsView.hidden = false;
      scheduleSplashHide();
      return;
    }

    if (!window.msal || !window.msal.PublicClientApplication) {
      setStatus("Libreria MSAL non disponibile. Verifica la connessione o il riferimento CDN.", true);
      elements.signedOutView.hidden = true;
      elements.contactsView.hidden = false;
      scheduleSplashHide();
      return;
    }

    state.msalInstance = new msal.PublicClientApplication({
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin
      },
      cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
      }
    });

    await state.msalInstance.initialize();
    await state.msalInstance.handleRedirectPromise();

    wireEvents();
    restoreAccount();
    restoreRecentAccounts();
    restoreLanguage();
    renderSortState();
    renderIcons();
    applyTranslations();
    await state.logoPreloadPromise;
    renderShell();

    if (state.account) {
      if (shouldRestoreStoredContactRouteBeforeList()) {
        await loadFormMetadata();
        await restoreContactRoute({ deferEditContactLoad: true });
        hideSplash({ immediate: true });
        loadContacts({ reset: true });
      } else {
        await Promise.all([loadFormMetadata(), loadContacts(), minimumInitialSplashTime]);
        await restoreContactRoute();
        hideSplash();
      }
    } else {
      await minimumInitialSplashTime;
      hideSplash();
    }
  }

  function wireEvents() {
    elements.loginButton?.addEventListener("click", login);
    elements.heroLoginButton.addEventListener("click", login);
    elements.userMenuButton.addEventListener("click", toggleAccountMenu);
    elements.brandLink.addEventListener("click", preventHeaderNavigationWhenLocked);
    elements.menuLogoutButton.addEventListener("click", (event) => {
      event.stopPropagation();
      logout();
    });
    elements.switchAccountButton.addEventListener("click", switchAccount);
    elements.languageButtons.forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    elements.contactIdCopyButton.addEventListener("click", (event) => {
      event.stopPropagation();
      copyContactIdToClipboard(elements.contactIdOutput.textContent);
    });
    document.addEventListener("click", closeAccountMenuOnOutsideClick);
    document.addEventListener("keydown", closeAccountMenuOnEscape);
    elements.advancedFilterButton.addEventListener("click", openAdvancedFilterDialog);
    elements.advancedFilterForm.addEventListener("submit", applyAdvancedFilters);
    elements.mobileSortButton.addEventListener("click", openMobileSortDialog);
    elements.mobileSortForm.addEventListener("submit", applyMobileSort);
    elements.closeMobileSortButton.addEventListener("click", closeMobileSortDialog);
    elements.cancelMobileSortButton.addEventListener("click", closeMobileSortDialog);
    elements.addAdvancedFilterRowButton.addEventListener("click", handleAddAdvancedFilterRow);
    elements.clearAdvancedFiltersButton.addEventListener("click", clearAllFilters);
    elements.closeAdvancedFilterButton.addEventListener("click", closeAdvancedFilterDialog);
    elements.cancelAdvancedFiltersButton.addEventListener("click", closeAdvancedFilterDialog);
    elements.refreshButton.addEventListener("click", refreshContactsWithSplash);
    elements.listSearchInput.addEventListener("input", handleListSearch);
    elements.newContactButton.addEventListener("click", openNewContactDialog);
    elements.columnMenuButtons.forEach((button) => {
      button.addEventListener("click", (event) => openColumnMenu(event, button));
    });
    elements.columnMenuItems.forEach((button) => {
      button.addEventListener("click", () => handleColumnMenuAction(button.dataset.columnAction));
    });
    elements.applyFilterButton.addEventListener("click", applyColumnFilter);
    elements.clearFilterButton.addEventListener("click", clearColumnFilter);
    elements.closeFilterPanelButton.addEventListener("click", () => {
      closeColumnFilterPanel();
      renderIcons();
    });
    setupCustomFilterSelect(elements.columnFilterOperatorSelect, filterOperators, elements.columnFilterOperator.value, renderColumnFilterInput);
    setupCustomFilterSelect(elements.mobileSortFieldSelect, filterFields, elements.mobileSortField.value);
    setupCustomFilterSelect(elements.mobileSortDirectionSelect, sortDirectionOptions, elements.mobileSortDirection.value);
    setupCustomFilterSelect(elements.salutationSelect, salutationOptions, elements.salutationInput.value);
    setupCustomFilterSelect(elements.preferredContactMethodSelect, preferredContactMethodOptions, elements.preferredContactMethodInput.value);
    elements.columnFilterInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyColumnFilter();
      }
    });
    document.addEventListener("click", () => {
      closeAllCustomFilterSelects();
      closeDatePicker();
    });
    document.addEventListener("click", closeAccountResultsOnOutsideClick);
    document.addEventListener("click", closeCountryResultsOnOutsideClick);
    document.addEventListener("click", closeColumnMenuOnOutsideClick);
    document.addEventListener("keydown", closeColumnMenuOnEscape);
    elements.accountSearchInput.addEventListener("input", searchAccountsWithDebounce);
    elements.accountSearchInput.addEventListener("click", toggleAccountResults);
    elements.accountSearchInput.addEventListener("keydown", handleAccountSearchKeydown);
    elements.countryOfResidenceInput.addEventListener("input", () => handleCountryInput("residence"));
    elements.countryOfResidenceInput.addEventListener("click", () => toggleCountryResults("residence"));
    elements.countryOfResidenceInput.addEventListener("keydown", (event) => handleCountrySearchKeydown(event, "residence"));
    elements.addressCountryInput.addEventListener("input", () => handleCountryInput("address"));
    elements.addressCountryInput.addEventListener("click", () => toggleCountryResults("address"));
    elements.addressCountryInput.addEventListener("keydown", (event) => handleCountrySearchKeydown(event, "address"));
    elements.privacyConsentInput.addEventListener("change", applyConsentConfiguration);
    elements.clearAccountButton.addEventListener("click", () => setSelectedAccount(null));
    elements.closeDialogButton.addEventListener("click", () => requestPasswordForAction("close"));
    elements.form.addEventListener("submit", requestPasswordForSubmit);
    elements.passwordForm.addEventListener("submit", confirmPasswordAction);
    elements.closePasswordDialogButton.addEventListener("click", closePasswordDialog);
    elements.passwordDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closePasswordDialog();
    });
    elements.formSections.addEventListener("scroll", updateContactDialogScrollDepth, { passive: true });
    elements.dateInputs.forEach((input) => {
      input.addEventListener("click", (event) => toggleDatePicker(event, input));
      input.addEventListener("keydown", handleDateInputKeydown);
    });
    window.addEventListener("scroll", updateStickyListDepth, { passive: true });
    window.addEventListener("resize", () => {
      updateStickyListDepth();
      positionDatePicker();
    }, { passive: true });
    window.addEventListener("popstate", handleContactRouteNavigation);
    window.addEventListener("hashchange", handleContactRouteNavigation);
    setupContactsObserver();
    updateStickyListDepth();
  }

  function hasValidConfig() {
    return Boolean(config.clientId && config.tenantId && dataverseUrl) &&
      !placeholderValues.includes(config.clientId) &&
      !placeholderValues.includes(config.tenantId) &&
      !placeholderValues.includes(config.dataverseUrl);
  }

  function restoreAccount() {
    const accounts = state.msalInstance.getAllAccounts();
    state.account = accounts[0] || null;

    if (state.account) {
      state.msalInstance.setActiveAccount(state.account);
    }
  }

  function restoreRecentAccounts() {
    try {
      const storedAccounts = JSON.parse(window.localStorage.getItem(recentAccountsStorageKey) || "[]");
      state.recentAccounts = Array.isArray(storedAccounts)
        ? storedAccounts.filter((account) => account.id && account.name).slice(0, 8)
        : [];
    } catch {
      state.recentAccounts = [];
    }
  }

  async function loadFormMetadata() {
    await Promise.all([
      ...Object.keys(contactOptionSetFields).map(loadContactOptionSetMetadata),
      loadPrivacyTextConfiguration()
    ]);
    applyOptionSetMetadata();
    applyPrivacyTexts();
  }

  async function loadPrivacyTextConfiguration() {
    try {
      const filter = encodeURIComponent("gin_code eq 'lbl_privacytexts'");
      const data = await dataverseFetch(`/gin_appboutiquesettings?$select=gin_value_string&$filter=${filter}&$top=1`);
      const serializedConfiguration = data.value?.[0]?.gin_value_string || "";
      state.privacyTextConfiguration = JSON.parse(serializedConfiguration);

      if (!state.privacyTextConfiguration?.types || typeof state.privacyTextConfiguration.types !== "object") {
        throw new Error("Configurazione testi privacy non valida.");
      }
    } catch (error) {
      state.privacyTextConfiguration = null;
      console.warn("Testi privacy configurabili non disponibili", error);
    }
  }

  async function loadContactOptionSetMetadata(logicalName) {
    try {
      const path = `/EntityDefinitions(LogicalName='contact')/Attributes(LogicalName='${logicalName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet`;
      const metadata = await dataverseFetch(path);
      state.optionSetMetadata[logicalName] = metadata.OptionSet?.Options || [];
    } catch (error) {
      state.optionSetMetadata[logicalName] = null;
      console.warn(`Option set metadata non disponibile per ${logicalName}`, error);
    }
  }

  function applyOptionSetMetadata() {
    preferredContactMethodOptions = buildOptionSetOptions("preferredcontactmethodcode");
    salutationOptions = buildOptionSetOptions("gin_salutation");
    refreshCustomFilterSelectOptions(elements.preferredContactMethodSelect, preferredContactMethodOptions);
    refreshCustomFilterSelectOptions(elements.salutationSelect, salutationOptions);
  }

  function buildOptionSetOptions(logicalName) {
    const definition = contactOptionSetFields[logicalName];
    const fallback = definition.fallback;
    const options = state.optionSetMetadata[logicalName];

    if (!Array.isArray(options) || !options.length) {
      return [getLocalizedPlaceholderOption(logicalName, fallback[0]), ...fallback.slice(1)];
    }

    return [
      getLocalizedPlaceholderOption(logicalName, fallback[0]),
      ...options
        .filter((option) => option && option.Value !== undefined && option.Value !== null)
        .sort((left, right) => (left.Value || 0) - (right.Value || 0))
        .map((option) => ({
          value: String(option.Value),
          label: getLocalizedOptionLabel(option.Label) || String(option.Value)
        }))
    ];
  }

  function getLocalizedOptionLabel(label) {
    const localizedLabels = label?.LocalizedLabels || [];
    const languageCode = state.currentLanguage === "en" ? 1033 : 1040;
    return localizedLabels.find((localizedLabel) => localizedLabel.LanguageCode === languageCode)?.Label ||
      label?.UserLocalizedLabel?.Label ||
      localizedLabels[0]?.Label ||
      "";
  }

  function getLocalizedPlaceholderOption(logicalName, fallbackOption) {
    const labels = {
      preferredcontactmethodcode: { it: "Seleziona metodo", en: "Select method" },
      gin_salutation: { it: "Seleziona titolo", en: "Select title" }
    };
    return {
      ...fallbackOption,
      label: labels[logicalName]?.[state.currentLanguage] || fallbackOption.label
    };
  }

  async function login() {
    setBusy(true);
    let isLoginLoadingShown = false;
    try {
      const loginResponse = await state.msalInstance.loginPopup(getLoginRequest());
      showSplash();
      isLoginLoadingShown = true;
      state.account = loginResponse.account;
      state.msalInstance.setActiveAccount(state.account);
      await restoreCriticalLogos();
      renderShell();
      await restoreCriticalLogos();
      await Promise.all([loadFormMetadata(), loadContacts()]);
    } catch (error) {
      setStatus(getErrorMessage(error), true);
    } finally {
      if (isLoginLoadingShown) {
        hideSplash();
      }
      setBusy(false);
    }
  }

  async function logout() {
    if (state.isContactPageOpen) {
      return;
    }
    const accountToLogout = state.account || state.msalInstance.getActiveAccount() || state.msalInstance.getAllAccounts()[0];
    if (!accountToLogout) {
      state.account = null;
      renderShell();
      return;
    }

    closeAccountMenu();
    setBusy(true);
    try {
      await state.msalInstance.logoutPopup({
        account: accountToLogout,
        mainWindowRedirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin
      });
    } finally {
      await clearMsalAccounts();
      state.account = null;
      state.contacts = [];
      state.nextContactsLink = "";
      await restoreCriticalLogos();
      renderShell();
      await restoreCriticalLogos();
      renderContacts();
      setBusy(false);
    }
  }

  async function clearMsalAccounts() {
    const cachedAccounts = state.msalInstance.getAllAccounts();
    await Promise.allSettled(cachedAccounts.map((cachedAccount) =>
      state.msalInstance.clearCache({ account: cachedAccount })
    ));
    state.msalInstance.setActiveAccount(null);
  }

  function renderShell() {
    const isSignedIn = Boolean(state.account);
    if (elements.loginButton) {
      elements.loginButton.hidden = isSignedIn;
    }
    elements.userMenuButton.hidden = !isSignedIn;
    elements.signedOutView.hidden = isSignedIn;
    elements.contactsView.hidden = !isSignedIn;
    closeAccountMenu();

    if (isSignedIn) {
      const displayName = state.account.name || state.account.username || "Utente";
      const email = state.account.username || "";
      const initials = getInitials(displayName || email);
      elements.userName.textContent = displayName;
      elements.userInitials.textContent = initials;
      elements.menuUserName.textContent = displayName;
      elements.menuUserEmail.textContent = email;
      if (elements.menuUserInitials) {
        elements.menuUserInitials.textContent = initials;
      }
    } else {
      elements.userName.textContent = "";
      elements.userInitials.textContent = "";
      elements.menuUserName.textContent = "";
      elements.menuUserEmail.textContent = "";
      if (elements.menuUserInitials) {
        elements.menuUserInitials.textContent = "";
      }
      setStatus("");
    }

    ensureLogosVisible();
    window.requestAnimationFrame(updateStickyListDepth);
  }

  function getLogoElements() {
    return [
      elements.appSplashLogo,
      elements.headerLogoFull,
      elements.headerLogoMark,
      elements.accountTenantLogo,
      elements.listWordmark
    ].filter(Boolean);
  }

  function ensureLogosVisible(options = {}) {
    getLogoElements().forEach((logo) => {
      if (!logo) {
        return;
      }

      const source = getLogoFallbackSource(logo);
      const currentSource = logo.getAttribute("src");
      const isBroken = logo.complete && logo.naturalWidth === 0;
      if (!currentSource || currentSource !== source || (options.retryBroken && isBroken)) {
        if (options.retryBroken && isBroken) {
          logo.removeAttribute("src");
        }
        logo.setAttribute("src", source);
      }

      logo.loading = "eager";
      logo.decoding = "sync";
      logo.style.removeProperty("display");
      logo.style.removeProperty("opacity");
      logo.style.removeProperty("visibility");
    });
  }

  function getLogoFallbackSource(logo) {
    if (logo.classList.contains("app-splash-logo")) {
      return "./assets/ginori-crown-dark.svg";
    }

    if (logo.classList.contains("list-wordmark")) {
      return "./assets/ginori-1735-wordmark-dark.svg";
    }

    if (logo.classList.contains("account-tenant-logo")) {
      return "./assets/ginori-crown-dark.svg";
    }

    return logo.classList.contains("brand-logo-mark") ? headerLogoSources[1] : headerLogoSources[0];
  }

  function preloadCriticalLogos() {
    return Promise.allSettled(criticalLogoSources.map(preloadImage));
  }

  function preloadImage(source) {
    const image = new Image();
    image.decoding = "sync";
    image.loading = "eager";
    image.src = source;

    if (!image.decode) {
      return waitForImageLoad(image);
    }

    return Promise.race([
      image.decode(),
      waitForImageLoad(image)
    ]).catch(() => undefined);
  }

  async function restoreCriticalLogos() {
    state.logoPreloadPromise = preloadCriticalLogos();
    await state.logoPreloadPromise;
    ensureLogosVisible({ retryBroken: true });
    await Promise.allSettled(getLogoElements().map(waitForLogoElement));
    ensureLogosVisible({ retryBroken: true });
  }

  function waitForLogoElement(logo) {
    if (!logo) {
      return Promise.resolve();
    }

    if (logo.complete && logo.naturalWidth > 0) {
      return Promise.resolve();
    }

    const source = getLogoFallbackSource(logo);
    if (!logo.getAttribute("src") || (logo.complete && logo.naturalWidth === 0)) {
      return reloadLogoElement(logo, source);
    }

    return waitForImageLoad(logo);
  }

  function reloadLogoElement(logo, source) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        logo.onload = null;
        logo.onerror = null;
        resolve();
      };

      logo.onload = finish;
      logo.onerror = finish;
      logo.removeAttribute("src");
      window.requestAnimationFrame(() => {
        logo.setAttribute("src", source);
      });
      window.setTimeout(finish, 1200);
    });
  }

  function waitForImageLoad(image) {
    return new Promise((resolve) => {
      if (image.complete) {
        resolve();
        return;
      }

      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        image.onload = null;
        image.onerror = null;
        resolve();
      };

      image.onload = finish;
      image.onerror = finish;
      window.setTimeout(finish, 1200);
    });
  }

  function scheduleSplashHide() {
    window.clearTimeout(state.splashHideTimer);
    state.splashHideTimer = window.setTimeout(hideSplash, 2500);
  }

  async function refreshContactsWithSplash() {
    showSplash();
    const minimumRefreshTime = wait(1200);
    try {
      await Promise.all([loadContacts({ reset: true }), minimumRefreshTime]);
    } finally {
      hideSplash();
    }
  }

  function showSplash() {
    if (!elements.appSplash) {
      return;
    }

    window.clearTimeout(state.splashHideTimer);
    window.clearTimeout(state.splashHiddenTimer);
    ensureLogosVisible({ retryBroken: true });
    elements.appSplash.hidden = false;
    window.requestAnimationFrame(() => {
      elements.appSplash.classList.remove("is-hiding");
    });
  }

  function hideSplash({ immediate = false } = {}) {
    if (!elements.appSplash) {
      return;
    }

    window.clearTimeout(state.splashHideTimer);
    window.clearTimeout(state.splashHiddenTimer);
    if (immediate) {
      elements.appSplash.classList.add("is-hiding");
      elements.appSplash.hidden = true;
      return;
    }

    elements.appSplash.classList.add("is-hiding");
    state.splashHiddenTimer = window.setTimeout(() => {
      if (elements.appSplash) {
        elements.appSplash.hidden = true;
      }
    }, 450);
  }

  function wait(milliseconds) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function toggleAccountMenu(event) {
    event.stopPropagation();
    if (state.isContactPageOpen) {
      return;
    }
    const shouldOpen = elements.accountMenu.hidden;
    elements.accountMenu.hidden = !shouldOpen;
    elements.userMenuButton.setAttribute("aria-expanded", String(shouldOpen));
  }

  function closeAccountMenu() {
    elements.accountMenu.hidden = true;
    elements.userMenuButton.setAttribute("aria-expanded", "false");
  }

  function closeAccountMenuOnOutsideClick(event) {
    if (
      elements.accountMenu.hidden ||
      elements.accountMenu.contains(event.target) ||
      elements.userMenuButton.contains(event.target)
    ) {
      return;
    }

    closeAccountMenu();
  }

  function closeAccountMenuOnEscape(event) {
    if (event.key === "Escape") {
      closeAccountMenu();
    }
  }

  async function switchAccount() {
    if (state.isContactPageOpen) {
      return;
    }
    closeAccountMenu();
    state.account = null;
    state.contacts = [];
    state.nextContactsLink = "";
    renderContacts();
    setBusy(true);

    try {
      const loginResponse = await state.msalInstance.loginPopup({
        ...getLoginRequest(),
        prompt: "select_account"
      });
      showSplash();
      state.account = loginResponse.account;
      state.msalInstance.setActiveAccount(state.account);
      renderShell();
      await loadContacts();
    } catch (error) {
      renderShell();
      setStatus(getErrorMessage(error), true);
    } finally {
      hideSplash();
      setBusy(false);
    }
  }

  async function loadContacts({ reset = true } = {}) {
    if (!state.account || state.isLoadingContacts) {
      return;
    }

    state.isLoadingContacts = true;
    state.isResetLoadingContacts = reset;

    if (reset) {
      state.contacts = [];
      state.nextContactsLink = "";
      renderContacts();
    }

    setStatus("");
    setBusy(true);
    updateContactsSpinner();

    try {
      const selectFields = [
        "contactid",
        "firstname",
        "lastname",
        "birthdate",
        "emailaddress1",
        "telephone1",
        "_parentcustomerid_value",
        contactIdFieldName
      ];

      const query = [
        `$select=${selectFields.join(",")}`,
        `$orderby=${getOrderBy()}`,
        getFilterQuery()
      ].filter(Boolean).join("&");

      const path = reset || !state.nextContactsLink ? `/contacts?${query}` : state.nextContactsLink;
      const data = await dataverseFetch(path);
      const contactsPage = (data.value || []).map(mapContact);

      state.contacts = reset ? contactsPage : [...state.contacts, ...contactsPage];
      state.nextContactsLink = data["@odata.nextLink"] || "";

      renderContacts();
      setStatus("");
    } catch (error) {
      setStatus(getErrorMessage(error), true);
    } finally {
      state.isLoadingContacts = false;
      state.isResetLoadingContacts = false;
      setBusy(false);
      updateContactsSpinner();
      updateEmptyState();
    }
  }

  function renderContacts() {
    elements.contactsTableBody.replaceChildren();
    updateEmptyState();
    updateContactsSpinner();
    renderSortState();

    for (const contact of state.contacts) {
      const row = document.createElement("tr");
      row.tabIndex = 0;
      row.innerHTML = `
        <td><span class="row-action"></span></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      `;

      const nameCell = row.querySelector(".row-action");
      nameCell.textContent = contact.firstname || "";

      const cells = row.querySelectorAll("td");
      const cellLabels = ["Nome", "Cognome", "Email", "Telefono", "Contact ID"];
      cells[1].textContent = contact.lastname || "";
      cells[2].textContent = contact.emailaddress1 || "";
      cells[3].textContent = contact.telephone1 || "";
      cells[4].textContent = contact.contactIdText || "";
      cells[2].classList.add("cell-muted", "cell-email");
      cells[3].classList.add("cell-muted", "cell-phone");
      cells[4].classList.add("cell-contact-id");
      cells.forEach((cell) => {
        cell.dataset.label = cellLabels[[...cells].indexOf(cell)];
        cell.title = cell.textContent || "";
      });

      cells[4].addEventListener("click", (event) => {
        event.stopPropagation();
        copyContactIdToClipboard(contact.contactIdText);
      });

      row.addEventListener("click", () => openEditContactFromList(contact));
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEditContactFromList(contact);
        }
      });
      elements.contactsTableBody.append(row);
    }
  }

  function updateEmptyState() {
    elements.emptyState.hidden = state.isLoadingContacts || state.contacts.length > 0;
  }

  function handleListSearch() {
    state.listSearchTerm = elements.listSearchInput.value;
    window.clearTimeout(state.listSearchTimer);
    state.listSearchTimer = window.setTimeout(() => loadContacts({ reset: true }), 320);
  }

  function normalizeListSearchValue(value = "") {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function openNewContactDialog({ prefillConsentDate = true } = {}) {
    state.editingContact = null;
    state.isContactDetailReady = true;
    state.isLoadingContactDetail = false;
    setContactRoute("#contact/new");
    elements.dialogTitle.textContent = "Digital Customer Card";
    elements.form.reset();
    state.selectedCountryOfResidence = null;
    state.selectedAddressCountry = null;
    clearCountryInput(elements.countryOfResidenceInput);
    clearCountryInput(elements.addressCountryInput);
    updateReadonlyProfileFields(null);
    setCustomFilterSelectValue(elements.salutationSelect, salutationOptions, "");
    setCustomFilterSelectValue(elements.preferredContactMethodSelect, preferredContactMethodOptions, "");
    setCustomPrivacyDefaults({ prefillConsentDate });
    applyConsentConfiguration();
    setSelectedAccount(null);
    hideAccountResults();
    hideCountryResults("residence");
    hideCountryResults("address");
    setFormError("");
    setContactSaving(false);
    showContactPage();
    updateContactDialogScrollDepth();
    renderIcons();
    elements.firstNameInput.focus();
    closeDatePicker();
  }

  function openEditContactDialog(contact) {
    state.editingContact = contact;
    state.isContactDetailReady = true;
    setContactRoute(`#contact/${contact.id}`);
    elements.dialogTitle.textContent = "Digital Customer Card";
    applyContactToForm(contact);
    setFormError("");
    setContactSaving(false);
    showContactPage();
    updateContactDialogScrollDepth();
    renderIcons();
    elements.firstNameInput.focus();
    closeDatePicker();
  }

  function openPendingEditContactDialog(contactId) {
    state.editingContact = { id: contactId };
    state.isContactDetailReady = false;
    state.isLoadingContactDetail = true;
    elements.dialogTitle.textContent = "Digital Customer Card";
    elements.form.reset();
    state.selectedCountryOfResidence = null;
    state.selectedAddressCountry = null;
    clearCountryInput(elements.countryOfResidenceInput);
    clearCountryInput(elements.addressCountryInput);
    updateReadonlyProfileFields(null);
    setCustomFilterSelectValue(elements.salutationSelect, salutationOptions, "");
    setCustomFilterSelectValue(elements.preferredContactMethodSelect, preferredContactMethodOptions, "");
    applyConsentConfiguration();
    setSelectedAccount(null);
    hideAccountResults();
    hideCountryResults("residence");
    hideCountryResults("address");
    setFormError("");
    setContactSaving(false);
    elements.saveContactButton.disabled = true;
    showContactPage();
    updateContactDialogScrollDepth();
    renderIcons();
    closeDatePicker();
  }

  function applyContactToForm(contact) {
    setCustomFilterSelectValue(elements.salutationSelect, salutationOptions, String(contact.gin_salutation || ""));
    elements.firstNameInput.value = contact.firstname || "";
    elements.lastNameInput.value = contact.lastname || "";
    state.selectedCountryOfResidence = contact.countryOfResidenceId
      ? {
        id: contact.countryOfResidenceId,
        name: contact.gin_countryofresidenceName || "",
        consentFlagsManagement: contact.countryOfResidenceConsentFlagsManagement || ""
      }
      : null;
    elements.countryOfResidenceInput.value = contact.gin_countryofresidenceName || "";
    elements.countryOfResidenceInput.dataset.countryId = contact.countryOfResidenceId || "";
    elements.countryOfResidenceInput.dataset.consentFlagsManagement = contact.countryOfResidenceConsentFlagsManagement || "";
    elements.birthDateInput.value = toDateDisplayValue(contact.birthdate);
    elements.emailInput.value = contact.emailaddress1 || "";
    elements.addressLine1Input.value = contact.address1_line1 || "";
    elements.addressCityInput.value = contact.address1_city || "";
    elements.addressPostalCodeInput.value = contact.address1_postalcode || "";
    elements.addressStateInput.value = contact.address1_stateorprovince || "";
    state.selectedAddressCountry = contact.addressCountryId
      ? { id: contact.addressCountryId, name: contact.gin_address1_countryidName || "" }
      : null;
    elements.addressCountryInput.value = contact.gin_address1_countryidName || "";
    elements.addressCountryInput.dataset.countryId = contact.addressCountryId || "";
    elements.mobilePhoneInput.value = contact.mobilephone || "";
    elements.wechatInput.value = contact.gin_wechat || "";
    setCustomFilterSelectValue(elements.preferredContactMethodSelect, preferredContactMethodOptions, String(contact.preferredcontactmethodcode || ""));
    elements.profilingConsentInput.checked = Boolean(contact.gin_consensoprofilazione);
    elements.marketingConsentInput.checked = Boolean(contact.gin_consensomarketing);
    elements.privacyConsentReceivedDateInput.value = toDateDisplayValue(contact.new_dataricezioneconsenso);
    elements.privacyConsentInput.checked = Boolean(contact.new_consensoprivacy);
    elements.thirdPartyConsentInput.checked = Boolean(contact.gin_consensoterzeparti);
    updateReadonlyProfileFields(contact);
    applyConsentConfiguration();
    setSelectedAccount(contact.accountId ? { id: contact.accountId, name: contact.accountName || "Account" } : null);
    hideAccountResults();
  }

  function updateReadonlyProfileFields(contact) {
    if (state.activeQrCodeImageUrl && state.activeQrCodeImageUrl !== contact?.qrCodeImageUrl) {
      URL.revokeObjectURL(state.activeQrCodeImageUrl);
      state.activeQrCodeImageUrl = "";
    }

    const contactIdText = contact?.contactIdText || "";
    const qrCodeImageUrl = contact?.qrCodeImageUrl || "";

    elements.contactIdOutput.textContent = contactIdText;
    elements.contactIdField.hidden = !contactIdText;

    elements.qrCodeImage.hidden = !qrCodeImageUrl;
    elements.qrCodeField.hidden = !qrCodeImageUrl;
    if (qrCodeImageUrl) {
      elements.qrCodeImage.src = qrCodeImageUrl;
      state.activeQrCodeImageUrl = qrCodeImageUrl;
    } else {
      elements.qrCodeImage.removeAttribute("src");
    }

  }

  async function openEditContactFromList(contact) {
    if (!contact?.id) {
      return;
    }

    openEditContactDialog(contact);
    state.isLoadingContactDetail = true;
    state.isContactDetailReady = false;
    elements.saveContactButton.disabled = true;
    try {
      const fullContact = await loadContactById(contact.id);
      state.editingContact = fullContact;
      state.isContactDetailReady = true;
      applyContactToForm(fullContact);
      setFormError("");
      elements.saveContactButton.disabled = false;
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      state.isLoadingContactDetail = false;
      if (state.editingContact && !state.isContactDetailReady) {
        elements.saveContactButton.disabled = true;
      }
    }
  }

  function closeDialog() {
    closeDatePicker();
    elements.form.classList.remove("is-form-scrolled");
    elements.dialog.hidden = true;
    elements.contactsView.hidden = false;
    state.isContactPageOpen = false;
    setHeaderLocked(false);
    setContactRoute("", { replace: true });
  }

  function updateContactDialogScrollDepth() {
    elements.form.classList.toggle("is-form-scrolled", elements.formSections.scrollTop > 6);
  }

  function showContactPage() {
    elements.contactsView.hidden = true;
    elements.dialog.hidden = false;
    state.isContactPageOpen = true;
    setHeaderLocked(true);
  }

  function requestPasswordForSubmit(event) {
    event.preventDefault();
    requestPasswordForAction(state.editingContact ? "update" : "create");
  }

  function requestPasswordForAction(action) {
    state.pendingPasswordAction = action;
    elements.passwordInput.value = "";
    setPasswordError("");
    if (!elements.passwordDialog.open) {
      elements.passwordDialog.showModal();
    }
    renderIcons();
    elements.passwordInput.focus();
  }

  function closePasswordDialog() {
    setPasswordError("");
    elements.passwordInput.value = "";
    if (elements.passwordDialog.open) {
      elements.passwordDialog.close();
    }
  }

  async function confirmPasswordAction(event) {
    event.preventDefault();
    let expectedPassword = "";

    try {
      expectedPassword = await getContactPassword();
    } catch (error) {
      setPasswordError(getErrorMessage(error));
      return;
    }

    if (elements.passwordInput.value !== expectedPassword) {
      setPasswordError(t("password.invalid"));
      elements.passwordInput.select();
      return;
    }

    const action = state.pendingPasswordAction;
    closePasswordDialog();

    if (action === "close" || action === "browser-back-close") {
      closeDialog();
      return;
    }

    if (action === "create" || action === "update") {
      await saveContact();
    }
  }

  function setPasswordError(message) {
    elements.passwordError.textContent = message;
    elements.passwordError.hidden = !message;
  }

  async function getContactPassword() {
    if (state.contactPassword) {
      return state.contactPassword;
    }

    const filter = encodeURIComponent("gin_code eq 'pwd_closedigitalcustomercard'");
    const data = await dataverseFetch(`/gin_appboutiquesettings?$select=gin_value_string&$filter=${filter}`);
    state.contactPassword = data.value?.[0]?.gin_value_string || "";
    return state.contactPassword;
  }

  function setContactRoute(hash, { replace = false } = {}) {
    if (state.isRestoringContactRoute) {
      return;
    }
    const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
    if (window.location.hash === hash) {
      state.activeContactRouteHash = hash;
      persistContactRoute(hash);
      return;
    }

    if (replace) {
      history.replaceState(null, "", nextUrl);
    } else {
      history.pushState(null, "", nextUrl);
    }
    state.activeContactRouteHash = hash;
    persistContactRoute(hash);
  }

  function handleContactRouteNavigation() {
    if (!state.isContactPageOpen || state.isRestoringContactRoute) {
      return;
    }

    const activeHash = state.activeContactRouteHash || "#contact/new";
    if (window.location.hash === activeHash) {
      return;
    }

    history.pushState(null, "", `${window.location.pathname}${window.location.search}${activeHash}`);
    if (state.pendingPasswordAction === "browser-back-close" && elements.passwordDialog.open) {
      return;
    }
    requestPasswordForAction("browser-back-close");
  }

  async function restoreContactRoute({ deferEditContactLoad = false } = {}) {
    const storedHash = getStoredContactRouteHash();
    const shouldAskPasswordAfterRestore = !window.location.hash && Boolean(storedHash);
    const hash = window.location.hash || storedHash || "";
    if (hash === "#contact/new") {
      state.isRestoringContactRoute = true;
      if (shouldAskPasswordAfterRestore) {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
      }
      openNewContactDialog({ prefillConsentDate: true });
      state.activeContactRouteHash = hash;
      persistContactRoute(hash);
      state.isRestoringContactRoute = false;
      if (shouldAskPasswordAfterRestore) {
        requestPasswordForAction("browser-back-close");
      }
      return;
    }

    const match = hash.match(/^#contact\/([0-9a-f-]{36})$/i);
    if (!match) {
      return;
    }

    if (deferEditContactLoad && shouldAskPasswordAfterRestore) {
      state.isRestoringContactRoute = true;
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
      openPendingEditContactDialog(match[1]);
      state.activeContactRouteHash = hash;
      persistContactRoute(hash);
      state.isRestoringContactRoute = false;
      requestPasswordForAction("browser-back-close");
      window.setTimeout(() => loadRestoredContactDetail(match[1]), 0);
      return;
    }

    const contact = await loadContactById(match[1]);
    state.isRestoringContactRoute = true;
    if (shouldAskPasswordAfterRestore) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
    openEditContactDialog(contact);
    state.activeContactRouteHash = hash;
    persistContactRoute(hash);
    state.isRestoringContactRoute = false;
    if (shouldAskPasswordAfterRestore) {
      requestPasswordForAction("browser-back-close");
    }
  }

  async function loadRestoredContactDetail(contactId) {
    try {
      const fullContact = await loadContactById(contactId);
      if (!state.isContactPageOpen || state.editingContact?.id?.toLowerCase() !== contactId.toLowerCase()) {
        return;
      }

      state.editingContact = fullContact;
      state.isContactDetailReady = true;
      applyContactToForm(fullContact);
      setFormError("");
      elements.saveContactButton.disabled = false;
    } catch (error) {
      if (state.isContactPageOpen) {
        setFormError(getErrorMessage(error));
      }
    } finally {
      if (state.editingContact?.id?.toLowerCase() === contactId.toLowerCase()) {
        state.isLoadingContactDetail = false;
      }
    }
  }

  async function loadContactById(contactId) {
    const selectFields = [
      "contactid",
      "firstname",
      "lastname",
      "birthdate",
      "emailaddress1",
      "telephone1",
      "mobilephone",
      "address1_line1",
      "address1_city",
      "address1_postalcode",
      "address1_stateorprovince",
      "gin_salutation",
      "_gin_countryofresidence_value",
      "_gin_address1_countryid_value",
      "gin_wechat",
      "preferredcontactmethodcode",
      "new_dataricezioneconsenso",
      "new_consensoprivacy",
      "gin_consensomarketing",
      "gin_consensoprofilazione",
      "gin_consensoterzeparti",
      "_parentcustomerid_value",
      contactIdFieldName
    ];

    const data = await dataverseFetch(`/contacts(${contactId})?$select=${selectFields.join(",")}`);
    const contact = mapContact(data);
    await hydrateContactCountryDetails(contact);
    contact.qrCodeImageUrl = await loadContactQrCodeImage(contactId);
    return contact;
  }

  async function loadContactQrCodeImage(contactId) {
    try {
      const blob = await dataverseFetchBlob(`/contacts(${contactId})/${qrCodeImageFieldName}/$value`);
      if (!blob || !blob.size) {
        return "";
      }
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn("QR Code non disponibile sul contatto:", error);
      return "";
    }
  }

  async function hydrateContactCountryDetails(contact) {
    const [residenceCountry, addressCountry] = await Promise.all([
      contact.countryOfResidenceId ? loadCountryById(contact.countryOfResidenceId) : Promise.resolve(null),
      contact.addressCountryId ? loadCountryById(contact.addressCountryId) : Promise.resolve(null)
    ]);

    if (residenceCountry) {
      contact.gin_countryofresidenceName = residenceCountry.name || contact.gin_countryofresidenceName;
      contact.countryOfResidenceConsentFlagsManagement = residenceCountry.consentFlagsManagement || "";
    }

    if (addressCountry) {
      contact.gin_address1_countryidName = addressCountry.name || contact.gin_address1_countryidName;
    }
  }

  async function loadCountryById(countryId) {
    try {
      const country = await dataverseFetch(`/gin_countries(${countryId})?$select=gin_countryid,gin_name,gin_consentflagsmanagement`);
      return {
        id: country.gin_countryid,
        name: country.gin_name,
        consentFlagsManagement: country.gin_consentflagsmanagement
      };
    } catch (error) {
      console.warn(`Paese non recuperabile: ${countryId}`, error);
      return null;
    }
  }

  function persistContactRoute(hash) {
    try {
      if (/^#contact\/(?:new|[0-9a-f-]{36})$/i.test(hash || "")) {
        window.sessionStorage.setItem(activeContactRouteStorageKey, hash);
      } else {
        window.sessionStorage.removeItem(activeContactRouteStorageKey);
      }
    } catch {
      // sessionStorage can be unavailable in restricted browser contexts.
    }
  }

  function getStoredContactRouteHash() {
    try {
      const hash = window.sessionStorage.getItem(activeContactRouteStorageKey) || "";
      return /^#contact\/(?:new|[0-9a-f-]{36})$/i.test(hash) ? hash : "";
    } catch {
      return "";
    }
  }

  function shouldRestoreStoredContactRouteBeforeList() {
    return !window.location.hash && Boolean(getStoredContactRouteHash());
  }

  async function saveContact() {
    setFormError("");

    if (state.isLoadingContactDetail) {
      setFormError("Caricamento dati cliente in corso");
      return;
    }
    if (state.editingContact && !state.isContactDetailReady) {
      setFormError("Dati cliente non caricati correttamente");
      return;
    }

    try {
      const isEditing = Boolean(state.editingContact);
      const payload = buildContactPayload({ onlyChanged: isEditing });

      if (isEditing && !Object.keys(payload).length) {
        closeDialog();
        showToast("Nessuna modifica da salvare");
        return;
      }

      setContactSaving(true);

      if (isEditing) {
        await dataverseFetch(`/contacts(${state.editingContact.id})`, {
          method: "PATCH",
          headers: {
            Prefer: "return=minimal"
          },
          body: JSON.stringify(payload)
        });
        updateContactLocally(state.editingContact.id, payload);
      } else {
        const createdContact = await dataverseFetch("/contacts", {
          method: "POST",
          headers: {
            Prefer: "return=minimal"
          },
          body: JSON.stringify(payload)
        });
        const createdContactId = createdContact.contactid;
        addContactLocally(createContactFromPayload(payload, createdContactId));
        await generateScannableCodeForContact(createdContactId);
        const fullContact = await loadContactById(createdContactId);
        state.editingContact = fullContact;
        state.isContactDetailReady = true;
        applyContactToForm(fullContact);
        setContactRoute(`#contact/${createdContactId}`);
      }

      if (isEditing) {
        closeDialog();
      }
      renderContacts();
      showToast("Profilo Cliente salvato");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setContactSaving(false);
    }
  }

  function setContactSaving(isSaving) {
    elements.contactSavingOverlay.hidden = !isSaving;
    elements.saveContactButton.disabled = isSaving;
    elements.closeDialogButton.disabled = isSaving;
    elements.form.setAttribute("aria-busy", String(isSaving));
  }

  async function generateScannableCodeForContact(contactId) {
    const result = await dataverseFetch("/hnr_barcodegenerator", {
      method: "POST",
      body: JSON.stringify({ entityid: contactId })
    });
    const errorMessage = result.errorMsg || result.errormsg || "";

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    const qrCodeBase64 = Array.isArray(result.base64array) ? result.base64array[1] : "";
    if (!qrCodeBase64) {
      throw new Error("QR Code non restituito dal processo Dataverse.");
    }

    await dataverseFetch(`/contacts(${contactId})`, {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        hnr_txtcontactid: contactId,
        hnr_qrcodeimg: qrCodeBase64
      })
    });
  }

  function buildContactPayload({ onlyChanged = false } = {}) {
    applyConsentConfiguration();
    state.customConsentPayload = buildCustomConsentPayload();

    const formValues = {
      gin_salutation: cleanOptionValue(elements.salutationInput.value),
      firstname: cleanValue(elements.firstNameInput.value),
      lastname: cleanValue(elements.lastNameInput.value),
      birthdate: toDatePayloadValue(elements.birthDateInput.value),
      emailaddress1: cleanValue(elements.emailInput.value),
      address1_line1: cleanValue(elements.addressLine1Input.value),
      address1_city: cleanValue(elements.addressCityInput.value),
      address1_postalcode: cleanValue(elements.addressPostalCodeInput.value),
      address1_stateorprovince: cleanValue(elements.addressStateInput.value),
      mobilephone: cleanValue(elements.mobilePhoneInput.value),
      gin_wechat: cleanValue(elements.wechatInput.value),
      preferredcontactmethodcode: cleanNumericValue(elements.preferredContactMethodInput.value),
      ...buildCustomConsentPayload()
    };

    const payload = onlyChanged
      ? buildChangedContactPayload(formValues)
      : { ...formValues };

    const accountId = state.selectedAccount?.id || "";
    const previousAccountId = state.editingContact?.accountId || "";

    if (!onlyChanged && accountId) {
      payload["parentcustomerid_account@odata.bind"] = `/accounts(${accountId})`;
    } else if (onlyChanged && accountId !== previousAccountId && accountId) {
      payload["parentcustomerid_account@odata.bind"] = `/accounts(${accountId})`;
    } else if (onlyChanged && accountId !== previousAccountId && previousAccountId) {
      payload["parentcustomerid_account@odata.bind"] = null;
    }

    applyCountryLookupPayload(payload, {
      onlyChanged,
      fieldName: "gin_countryofresidence",
      selectedCountry: state.selectedCountryOfResidence,
      inputValue: elements.countryOfResidenceInput.value,
      previousId: state.editingContact?.countryOfResidenceId || "",
      required: true
    });
    applyCountryLookupPayload(payload, {
      onlyChanged,
      fieldName: "gin_address1_countryid",
      selectedCountry: state.selectedAddressCountry,
      inputValue: elements.addressCountryInput.value,
      previousId: state.editingContact?.addressCountryId || "",
      required: false
    });

    return payload;
  }

  function buildCustomConsentPayload() {
    return {
      new_dataricezioneconsenso: toDatePayloadValue(elements.privacyConsentReceivedDateInput.value),
      new_consensoprivacy: elements.privacyConsentInput.checked,
      gin_consensomarketing: elements.marketingConsentInput.checked,
      gin_consensoprofilazione: elements.profilingConsentInput.checked,
      gin_consensoterzeparti: elements.thirdPartyConsentInput.checked
    };
  }

  function buildChangedContactPayload(formValues) {
    if (!state.editingContact) {
      return { ...formValues };
    }

    return Object.entries(formValues).reduce((payload, [field, value]) => {
      const previousValue = state.editingContact[field] || "";
      const nextValue = value || "";
      if (previousValue !== nextValue) {
        payload[field] = value;
      }

      return payload;
    }, {});
  }

  function applyCountryLookupPayload(payload, { onlyChanged, fieldName, selectedCountry, inputValue, previousId, required }) {
    const selectedId = selectedCountry?.id || "";
    const hasText = Boolean(cleanValue(inputValue || ""));

    if ((required || hasText) && !selectedId) {
      throw new Error("Seleziona un paese dai risultati della ricerca.");
    }

    const bindFieldName = `${fieldName}@odata.bind`;

    if (!onlyChanged && selectedId) {
      payload[bindFieldName] = `/gin_countries(${selectedId})`;
    } else if (onlyChanged && selectedId !== previousId && selectedId) {
      payload[bindFieldName] = `/gin_countries(${selectedId})`;
    } else if (onlyChanged && selectedId !== previousId && previousId && !required) {
      payload[bindFieldName] = null;
    }
  }

  function setSelectedAccount(account) {
    state.selectedAccount = account;
    elements.selectedAccountCard.hidden = !account;
    elements.accountSearchInput.hidden = Boolean(account);
    elements.accountSearchInput.value = "";

    if (account) {
      elements.selectedAccountName.textContent = account.name || "Account";
      elements.selectedAccountId.textContent = "Account collegato";
    } else {
      elements.selectedAccountName.textContent = "";
      elements.selectedAccountId.textContent = "";
    }

    renderIcons();
  }

  function setCustomPrivacyDefaults({ prefillConsentDate = true } = {}) {
    elements.profilingConsentInput.checked = false;
    elements.marketingConsentInput.checked = false;
    elements.privacyConsentInput.checked = false;
    elements.thirdPartyConsentInput.checked = false;
    elements.privacyConsentReceivedDateInput.value = prefillConsentDate ? toDateDisplayValue(new Date()) : "";
  }

  function toggleDatePicker(event, input) {
    event.stopPropagation();
    if (state.activeDateInput === input && state.datePickerElement && !state.datePickerElement.hidden) {
      closeDatePicker();
      return;
    }

    openDatePicker(input);
  }

  function handleDateInputKeydown(event) {
    if (event.key === "Escape") {
      closeDatePicker();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDatePicker(event, event.currentTarget);
    }
  }

  function openDatePicker(input) {
    state.activeDateInput = input;
    state.datePickerMonth = getDatePickerMonth(input.value);
    state.datePickerMode = "days";
    renderDatePicker();
    positionDatePicker();
  }

  function closeDatePicker() {
    if (!state.datePickerElement || state.datePickerElement.hidden) {
      return;
    }

    state.datePickerElement.classList.add("is-closing");
    window.setTimeout(() => {
      if (state.datePickerElement) {
        state.datePickerElement.hidden = true;
        state.datePickerElement.classList.remove("is-closing");
      }
    }, 240);
    state.activeDateInput = null;
  }

  function getDatePickerElement() {
    if (state.datePickerElement) {
      return state.datePickerElement;
    }

    const datePicker = document.createElement("div");
    datePicker.className = "date-picker-popover";
    datePicker.hidden = true;
    datePicker.addEventListener("click", (event) => event.stopPropagation());
    elements.form.append(datePicker);
    state.datePickerElement = datePicker;
    return datePicker;
  }

  function renderDatePicker() {
    const datePicker = getDatePickerElement();
    const visibleMonth = state.datePickerMonth || new Date();
    const selectedDate = parseDateInputValue(state.activeDateInput.value);
    const todayValue = toDateInputValue(new Date());
    const isMonthMode = state.datePickerMode === "months";
    const isYearMode = state.datePickerMode === "years";
    const decadeStart = Math.floor(visibleMonth.getFullYear() / 12) * 12;
    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
    const previousLabel = isYearMode ? t("date.previousPeriod") : isMonthMode ? t("date.previousYear") : t("date.previousMonth");
    const nextLabel = isYearMode ? t("date.nextPeriod") : isMonthMode ? t("date.nextYear") : t("date.nextMonth");

    datePicker.innerHTML = `
      <div class="date-picker-header">
        <button class="date-picker-nav" type="button" data-date-action="prev" aria-label="${previousLabel}">&lt;</button>
        <button class="date-picker-title" type="button" data-date-action="toggle-view" aria-label="${t("date.chooseMonthYear")}">
          ${isYearMode ? `${decadeStart} - ${decadeStart + 11}` : isMonthMode ? visibleMonth.getFullYear() : formatDatePickerMonth(visibleMonth)}
        </button>
        <button class="date-picker-nav" type="button" data-date-action="next" aria-label="${nextLabel}">&gt;</button>
      </div>
      ${isYearMode ? '<div class="date-picker-years"></div>' : isMonthMode ? '<div class="date-picker-months"></div>' : `
        <div class="date-picker-weekdays" aria-hidden="true">
          ${getDatePickerWeekdayLabels().map((label) => `<span>${label}</span>`).join("")}
        </div>
        <div class="date-picker-days"></div>
      `}
    `;

    datePicker.querySelector('[data-date-action="prev"]').addEventListener("click", () => changeDatePickerPage(-1));
    datePicker.querySelector('[data-date-action="next"]').addEventListener("click", () => changeDatePickerPage(1));
    datePicker.querySelector('[data-date-action="toggle-view"]').addEventListener("click", toggleDatePickerMode);

    if (isYearMode) {
      renderDatePickerYears(datePicker, visibleMonth);
      datePicker.hidden = false;
      datePicker.classList.remove("is-closing");
      return;
    }

    if (isMonthMode) {
      renderDatePickerMonths(datePicker, visibleMonth);
      datePicker.hidden = false;
      datePicker.classList.remove("is-closing");
      return;
    }

    const days = datePicker.querySelector(".date-picker-days");
    for (let index = 0; index < 42; index += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      const value = toDateInputValue(day);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "date-picker-day";
      button.textContent = String(day.getDate());
      button.dataset.value = value;
      button.classList.toggle("is-outside", day.getMonth() !== visibleMonth.getMonth());
      button.classList.toggle("is-today", value === todayValue);
      button.classList.toggle("is-selected", selectedDate && value === toDateInputValue(selectedDate));
      button.addEventListener("click", () => selectDatePickerDay(value));
      days.append(button);
    }

    datePicker.hidden = false;
    datePicker.classList.remove("is-closing");
  }

  function renderDatePickerMonths(datePicker, visibleMonth) {
    const months = datePicker.querySelector(".date-picker-months");
    const selectedDate = parseDateInputValue(state.activeDateInput.value);
    const monthLabels = Array.from({ length: 12 }, (_, index) =>
      new Date(visibleMonth.getFullYear(), index, 1).toLocaleDateString(getDatePickerLocale(), { month: "short" })
    );

    monthLabels.forEach((label, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "date-picker-month";
      button.textContent = label.replace(".", "");
      button.classList.toggle(
        "is-selected",
        Boolean(selectedDate && selectedDate.getFullYear() === visibleMonth.getFullYear() && selectedDate.getMonth() === index)
      );
      button.addEventListener("click", () => selectDatePickerMonth(index));
      months.append(button);
    });
  }

  function renderDatePickerYears(datePicker, visibleMonth) {
    const years = datePicker.querySelector(".date-picker-years");
    const selectedDate = parseDateInputValue(state.activeDateInput.value);
    const startYear = Math.floor(visibleMonth.getFullYear() / 12) * 12;

    for (let index = 0; index < 12; index += 1) {
      const year = startYear + index;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "date-picker-year";
      button.textContent = String(year);
      button.classList.toggle("is-selected", Boolean(selectedDate && selectedDate.getFullYear() === year));
      button.addEventListener("click", () => selectDatePickerYear(year));
      years.append(button);
    }
  }

  function toggleDatePickerMode() {
    if (state.datePickerMode === "days") {
      state.datePickerMode = "months";
    } else if (state.datePickerMode === "months") {
      state.datePickerMode = "years";
    } else {
      state.datePickerMode = "months";
    }
    renderDatePicker();
    positionDatePicker();
  }

  function selectDatePickerMonth(monthIndex) {
    state.datePickerMonth = new Date(
      state.datePickerMonth.getFullYear(),
      monthIndex,
      1
    );
    state.datePickerMode = "days";
    renderDatePicker();
    positionDatePicker();
  }

  function selectDatePickerYear(year) {
    state.datePickerMonth = new Date(
      year,
      state.datePickerMonth.getMonth(),
      1
    );
    state.datePickerMode = "months";
    renderDatePicker();
    positionDatePicker();
  }

  function changeDatePickerPage(offset) {
    const yearOffset = state.datePickerMode === "years" ? offset * 12 : state.datePickerMode === "months" ? offset : 0;
    const monthOffset = state.datePickerMode === "days" ? offset : 0;
    state.datePickerMonth = new Date(
      state.datePickerMonth.getFullYear() + yearOffset,
      state.datePickerMonth.getMonth() + monthOffset,
      1
    );
    renderDatePicker();
    positionDatePicker();
  }

  function selectDatePickerDay(value) {
    if (state.activeDateInput) {
      state.activeDateInput.value = toDateDisplayValue(value);
      state.activeDateInput.dispatchEvent(new Event("input", { bubbles: true }));
      state.activeDateInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    closeDatePicker();
  }

  function positionDatePicker() {
    if (!state.activeDateInput || !state.datePickerElement || state.datePickerElement.hidden) {
      return;
    }

    const rect = state.activeDateInput.getBoundingClientRect();
    const formRect = elements.form.getBoundingClientRect();
    const picker = state.datePickerElement;
    const width = Math.min(310, rect.width, formRect.width - 24);
    const left = Math.min(
      Math.max(12, rect.left - formRect.left),
      formRect.width - width - 12
    );
    const top = Math.min(
      rect.bottom - formRect.top + 8,
      formRect.height - 376
    );
    picker.style.width = `${width}px`;
    picker.style.left = `${Math.max(12, left)}px`;
    picker.style.top = `${Math.max(12, top)}px`;
  }

  function getDatePickerMonth(value) {
    const parsedDate = parseDateInputValue(value);
    const baseDate = parsedDate || new Date();
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  }

  function parseDateInputValue(value) {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value || "")) {
      const [day, month, year] = value.split("/").map(Number);
      return new Date(year, month - 1, day);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
      return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDatePickerMonth(value) {
    return value.toLocaleDateString(getDatePickerLocale(), {
      month: "long",
      year: "numeric"
    });
  }

  function getDatePickerLocale() {
    return state.currentLanguage === "en" ? "en-US" : "it-IT";
  }

  function getDatePickerWeekdayLabels() {
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.toLocaleDateString(getDatePickerLocale(), { weekday: "short" }).replace(".", "");
    });
  }

  function handleCountryInput(kind) {
    const lookup = getCountryLookupElements(kind);
    if (!lookup) {
      return;
    }

    if (kind === "residence") {
      state.selectedCountryOfResidence = null;
      elements.countryOfResidenceInput.removeAttribute("data-country-id");
      elements.countryOfResidenceInput.removeAttribute("data-consent-flags-management");
      applyConsentConfiguration();
    } else {
      state.selectedAddressCountry = null;
      elements.addressCountryInput.removeAttribute("data-country-id");
    }

    searchCountriesWithDebounce(kind);
  }

  function searchCountriesWithDebounce(kind) {
    window.clearTimeout(state.countrySearchTimer);
    const lookup = getCountryLookupElements(kind);
    const term = lookup.input.value.trim();

    if (term.length < 2) {
      hideCountryResults(kind);
      return;
    }

    state.countrySearchTimer = window.setTimeout(() => searchCountries(term, kind), 260);
  }

  async function searchCountries(term, kind) {
    const lookup = getCountryLookupElements(kind);
    if (!lookup) {
      return;
    }

    try {
      const trimmedTerm = term.trim();
      const escapedTerm = escapeODataString(trimmedTerm);
      const query = [
        "$select=gin_countryid,gin_name,gin_consentflagsmanagement",
        trimmedTerm ? `$filter=contains(gin_name,'${escapedTerm}')` : "",
        "$orderby=gin_name asc",
        "$top=20"
      ].filter(Boolean).join("&");
      const data = await dataverseFetch(`/gin_countries?${query}`);
      renderCountryResults(data.value || [], kind);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  function renderCountryResults(countries, kind) {
    const lookup = getCountryLookupElements(kind);
    const cleanCountries = (countries || []).filter((country) => country.gin_countryid && country.gin_name);
    window.clearTimeout(state.countryResultsHideTimer);
    lookup.results.classList.remove("is-closing");
    lookup.results.replaceChildren();

    if (!cleanCountries.length) {
      const empty = document.createElement("div");
      empty.className = "account-result";
      empty.textContent = "Nessun paese trovato";
      lookup.results.append(empty);
      lookup.results.hidden = false;
      return;
    }

    for (const country of cleanCountries) {
      const button = document.createElement("button");
      button.className = "account-result";
      button.type = "button";
      button.innerHTML = '<i data-lucide="globe-2" aria-hidden="true"></i><span></span>';
      button.querySelector("span").textContent = country.gin_name;
      button.addEventListener("click", () => {
        selectCountry(kind, {
          id: country.gin_countryid,
          name: country.gin_name,
          consentFlagsManagement: country.gin_consentflagsmanagement
        });
        hideCountryResults(kind);
      });
      lookup.results.append(button);
    }

    lookup.results.hidden = false;
    renderIcons();
  }

  function selectCountry(kind, country) {
    const lookup = getCountryLookupElements(kind);
    lookup.input.value = country.name || "";
    lookup.input.dataset.countryId = country.id || "";

    if (kind === "residence") {
      state.selectedCountryOfResidence = country;
      lookup.input.dataset.consentFlagsManagement = country.consentFlagsManagement || "";
      applyConsentConfiguration();
    } else {
      state.selectedAddressCountry = country;
    }
  }

  function toggleCountryResults(kind) {
    const lookup = getCountryLookupElements(kind);
    const term = lookup.input.value.trim();

    if (!lookup.results.hidden) {
      hideCountryResults(kind);
      return;
    }

    if (term.length >= 2) {
      searchCountries(term, kind);
    }
  }

  function handleCountrySearchKeydown(event, kind) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    window.clearTimeout(state.countrySearchTimer);
    searchCountries(getCountryLookupElements(kind).input.value.trim(), kind);
  }

  function closeCountryResultsOnOutsideClick(event) {
    if (event.target.closest(".country-lookup")) {
      return;
    }

    hideCountryResults("residence");
    hideCountryResults("address");
  }

  function hideCountryResults(kind) {
    const lookup = getCountryLookupElements(kind);
    if (!lookup || lookup.results.hidden) {
      return;
    }

    lookup.results.classList.add("is-closing");
    state.countryResultsHideTimer = window.setTimeout(() => {
      lookup.results.hidden = true;
      lookup.results.classList.remove("is-closing");
      lookup.results.replaceChildren();
    }, 280);
  }

  function getCountryLookupElements(kind) {
    return kind === "residence"
      ? { input: elements.countryOfResidenceInput, results: elements.countryOfResidenceResults }
      : { input: elements.addressCountryInput, results: elements.addressCountryResults };
  }

  function clearCountryInput(input) {
    input.value = "";
    input.removeAttribute("data-country-id");
    input.removeAttribute("data-consent-flags-management");
  }

  function applyConsentConfiguration() {
    const configuration = getConsentConfiguration(getCountryConsentFlagsManagement());
    const privacyValue = elements.privacyConsentInput.checked;

    setConsentFieldVisibility(elements.marketingConsentField, configuration.marketingExplicit);
    setConsentFieldVisibility(elements.profilingConsentField, configuration.profilingExplicit);
    setConsentFieldVisibility(elements.thirdPartyConsentField, configuration.thirdPartyExplicit);

    if (!configuration.marketingExplicit) {
      elements.marketingConsentInput.checked = privacyValue;
    }

    if (!configuration.profilingExplicit) {
      elements.profilingConsentInput.checked = privacyValue;
    }

    if (!configuration.thirdPartyExplicit) {
      elements.thirdPartyConsentInput.checked = false;
    }

    elements.marketingConsentInput.disabled = !configuration.marketingExplicit;
    elements.profilingConsentInput.disabled = !configuration.profilingExplicit;
    elements.thirdPartyConsentInput.disabled = !configuration.thirdPartyExplicit;
    applyPrivacyTexts();
  }

  function applyPrivacyTexts() {
    const consentType = String(getCountryConsentFlagsManagement());
    const configuration = state.privacyTextConfiguration;
    const defaultType = String(configuration?.defaultType || "");
    const typeConfiguration = configuration?.types?.[consentType] || configuration?.types?.[defaultType];
    const localizedTexts = typeConfiguration?.[state.currentLanguage] || typeConfiguration?.it;
    const consentTexts = localizedTexts?.consents || {};
    const introText = localizedTexts?.profileCreationText || "";

    elements.privacyText.textContent = localizedTexts?.privacyText || "";
    elements.privacyText.hidden = !localizedTexts?.privacyText;
    elements.privacyIntro.textContent = introText;
    elements.privacyIntro.hidden = !introText;
    elements.privacyConsentText.textContent = normalizeRequiredConsentText(
      consentTexts.privacy || t("field.privacyConsentText")
    );
    elements.marketingConsentText.textContent = consentTexts.marketing || t("field.marketingConsentText");
    elements.profilingConsentText.textContent = consentTexts.profiling || t("field.profilingConsentText");
    elements.thirdPartyConsentText.textContent = consentTexts.thirdParty || t("field.thirdPartyConsent");
    elements.privacyFooter.textContent = localizedTexts?.footerText || "";
    elements.privacyFooter.hidden = !localizedTexts?.footerText;
  }

  function normalizeRequiredConsentText(value) {
    return String(value || "")
      .replace(/\s*[\uFE0E\uFE0F]?\s*\*/g, "")
      .replace(/\s+([.,;:!?])/g, "$1")
      .trim();
  }

  function getConsentConfiguration(consentFlagsManagement) {
    if (consentFlagsManagement == null) {
      return {
        marketingExplicit: true,
        profilingExplicit: true,
        thirdPartyExplicit: true
      };
    }

    switch (consentFlagsManagement) {
      case consentManagementTypes.allExplicit:
        return {
          marketingExplicit: true,
          profilingExplicit: true,
          thirdPartyExplicit: false
        };
      case consentManagementTypes.privacyMarketingExplicitProfilingImplicit:
        return {
          marketingExplicit: true,
          profilingExplicit: false,
          thirdPartyExplicit: false
        };
      case consentManagementTypes.onlyPrivacyExplicit:
        return {
          marketingExplicit: false,
          profilingExplicit: false,
          thirdPartyExplicit: false
        };
      case consentManagementTypes.privacyMarketingThirdPartyExplicitProfilingImplicit:
        return {
          marketingExplicit: true,
          profilingExplicit: false,
          thirdPartyExplicit: true
        };
      default:
        return {
          marketingExplicit: true,
          profilingExplicit: true,
          thirdPartyExplicit: true
        };
    }
  }

  function getCountryConsentFlagsManagement() {
    const value =
      state.selectedCountryOfResidence?.consentFlagsManagement ||
      elements.countryOfResidenceInput.dataset.consentFlagsManagement;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  function setConsentFieldVisibility(field, isVisible) {
    field.hidden = !isVisible;
    field.setAttribute("aria-hidden", String(!isVisible));
    field.classList.toggle("is-implicit", !isVisible);
  }

  function searchAccountsWithDebounce() {
    window.clearTimeout(state.accountSearchTimer);
    const term = elements.accountSearchInput.value.trim();

    if (term.length < 2) {
      if (!term) {
        showRecentAccounts();
      } else {
        hideAccountResults();
      }
      return;
    }

    state.accountSearchTimer = window.setTimeout(() => searchAccounts(term), 250);
  }

  function toggleAccountResults() {
    if (!elements.accountResults.hidden) {
      hideAccountResults();
      return;
    }

    const term = elements.accountSearchInput.value.trim();
    if (term.length >= 2) {
      searchAccounts(term);
      return;
    }

    showRecentAccounts();
  }

  async function searchAccounts(term) {
    try {
      const trimmedTerm = term.trim();
      const escapedTerm = escapeODataString(trimmedTerm);
      const query = [
        "$select=accountid,name",
        trimmedTerm ? `$filter=contains(name,'${escapedTerm}')` : "",
        "$orderby=name asc",
        "$top=20"
      ].filter(Boolean).join("&");
      const data = await dataverseFetch(`/accounts?${query}`);
      renderAccountResults(data.value || []);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  function handleAccountSearchKeydown(event) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    window.clearTimeout(state.accountSearchTimer);
    searchAccounts(elements.accountSearchInput.value.trim());
  }

  function showRecentAccounts() {
    if (elements.accountSearchInput.value.trim()) {
      return;
    }

    if (!state.recentAccounts.length) {
      hideAccountResults();
      return;
    }

    renderAccountResults(state.recentAccounts.map((account) => ({
      accountid: account.id,
      name: account.name
    })));
  }

  function renderAccountResults(accounts) {
    const cleanAccounts = filterRenderableAccounts(accounts);
    window.clearTimeout(state.accountResultsHideTimer);
    elements.accountResults.classList.remove("is-closing");
    elements.accountResults.replaceChildren();

    if (!cleanAccounts.length) {
      const empty = document.createElement("div");
      empty.className = "account-result";
      empty.textContent = "Nessun account trovato";
      elements.accountResults.append(empty);
      elements.accountResults.hidden = false;
      return;
    }

    for (const account of cleanAccounts) {
      const button = document.createElement("button");
      button.className = "account-result";
      button.type = "button";
      button.innerHTML = '<i data-lucide="building-2" aria-hidden="true"></i><span></span>';
      button.querySelector("span").textContent = account.name || "Account";
      button.addEventListener("click", () => {
        const selectedAccount = { id: account.accountid, name: account.name || "Account" };
        setSelectedAccount(selectedAccount);
        rememberRecentAccount(selectedAccount);
        hideAccountResults();
      });
      elements.accountResults.append(button);
    }

    elements.accountResults.hidden = false;
    renderIcons();
  }

  function filterRenderableAccounts(accounts) {
    return (accounts || []).filter((account) => {
      const id = String(account.accountid || account.id || "").trim();
      const name = String(account.name || "").trim();
      return Boolean(id && name) && !/^recupero dei dati in corso/i.test(name);
    });
  }

  function hideAccountResults() {
    window.clearTimeout(state.accountResultsHideTimer);

    if (elements.accountResults.hidden) {
      return;
    }

    elements.accountResults.classList.add("is-closing");
    state.accountResultsHideTimer = window.setTimeout(() => {
      elements.accountResults.hidden = true;
      elements.accountResults.classList.remove("is-closing");
      elements.accountResults.replaceChildren();
    }, 280);
  }

  function closeAccountResultsOnOutsideClick(event) {
    if (event.target.closest(".account-lookup")) {
      return;
    }

    hideAccountResults();
  }

  function rememberRecentAccount(account) {
    if (!filterRenderableAccounts([{ accountid: account.id, name: account.name }]).length) {
      return;
    }

    state.recentAccounts = [
      account,
      ...state.recentAccounts.filter((recentAccount) => recentAccount.id !== account.id)
    ].slice(0, 8);
    try {
      window.localStorage.setItem(recentAccountsStorageKey, JSON.stringify(state.recentAccounts));
    } catch {
      // Recent accounts are a convenience only; the lookup keeps working without storage.
    }
  }

  function updateContactLocally(contactId, payload) {
    const contactIndex = state.contacts.findIndex((contact) => contact.id === contactId);

    if (contactIndex === -1) {
      return;
    }

    const contact = {
      ...state.contacts[contactIndex]
    };

    [
      "firstname",
      "lastname",
      "birthdate",
      "emailaddress1",
      "address1_line1",
      "address1_city",
      "address1_postalcode",
      "address1_stateorprovince",
      "gin_salutation",
      "mobilephone",
      "gin_wechat",
      "preferredcontactmethodcode",
      "new_dataricezioneconsenso",
      "new_consensoprivacy",
      "gin_consensomarketing",
      "gin_consensoprofilazione",
      "gin_consensoterzeparti"
    ].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        contact[field] = typeof payload[field] === "boolean" || typeof payload[field] === "number"
          ? payload[field]
          : payload[field] || "";
      }
    });

    if (Object.prototype.hasOwnProperty.call(payload, "parentcustomerid_account@odata.bind")) {
      contact.accountId = state.selectedAccount?.id || "";
      contact.accountName = state.selectedAccount?.name || "";
    }

    if (Object.prototype.hasOwnProperty.call(payload, "gin_countryofresidence@odata.bind")) {
      contact.countryOfResidenceId = state.selectedCountryOfResidence?.id || "";
      contact.gin_countryofresidenceName = state.selectedCountryOfResidence?.name || "";
      contact.countryOfResidenceConsentFlagsManagement = state.selectedCountryOfResidence?.consentFlagsManagement || "";
    }

    if (Object.prototype.hasOwnProperty.call(payload, "gin_address1_countryid@odata.bind")) {
      contact.addressCountryId = state.selectedAddressCountry?.id || "";
      contact.gin_address1_countryidName = state.selectedAddressCountry?.name || "";
    }

    state.contacts[contactIndex] = contact;
  }

  function addContactLocally(rawContact) {
    if (!rawContact || !rawContact.contactid) {
      loadContacts({ reset: true });
      return;
    }

    const contact = mapContact(rawContact);
    contact.accountId = state.selectedAccount?.id || contact.accountId;
    contact.accountName = state.selectedAccount?.name || contact.accountName;
    state.contacts = [contact, ...state.contacts];
  }

  function createContactFromPayload(payload, contactId) {
    return {
      contactid: contactId || window.crypto.randomUUID?.() || String(Date.now()),
      gin_salutation: payload.gin_salutation || "",
      firstname: payload.firstname || "",
      lastname: payload.lastname || "",
      birthdate: payload.birthdate || "",
      emailaddress1: payload.emailaddress1 || "",
      address1_line1: payload.address1_line1 || "",
      address1_city: payload.address1_city || "",
      address1_postalcode: payload.address1_postalcode || "",
      address1_stateorprovince: payload.address1_stateorprovince || "",
      mobilephone: payload.mobilephone || "",
      gin_wechat: payload.gin_wechat || "",
      preferredcontactmethodcode: payload.preferredcontactmethodcode || null,
      new_dataricezioneconsenso: payload.new_dataricezioneconsenso || "",
      new_consensoprivacy: Boolean(payload.new_consensoprivacy),
      gin_consensomarketing: Boolean(payload.gin_consensomarketing),
      gin_consensoprofilazione: Boolean(payload.gin_consensoprofilazione),
      gin_consensoterzeparti: Boolean(payload.gin_consensoterzeparti),
      _gin_countryofresidence_value: state.selectedCountryOfResidence?.id || "",
      "_gin_countryofresidence_value@OData.Community.Display.V1.FormattedValue": state.selectedCountryOfResidence?.name || "",
      _gin_address1_countryid_value: state.selectedAddressCountry?.id || "",
      "_gin_address1_countryid_value@OData.Community.Display.V1.FormattedValue": state.selectedAddressCountry?.name || "",
      _parentcustomerid_value: state.selectedAccount?.id || "",
      "_parentcustomerid_value@OData.Community.Display.V1.FormattedValue": state.selectedAccount?.name || ""
    };
  }

  async function dataverseFetch(path, options = {}) {
    const token = await acquireToken();
    const requestUrl = path.startsWith("http") ? path : `${dataverseUrl}/api/data/v9.2${path}`;
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Prefer: 'odata.include-annotations="OData.Community.Display.V1.FormattedValue",odata.maxpagesize=100,return=representation',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const detail = await readError(response);
      throw new Error(detail || `Dataverse ha risposto con HTTP ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (response.status === 204 || response.headers.get("content-length") === "0" || !contentType.includes("application/json")) {
      return getNoContentResponseData(response);
    }

    return response.json();
  }

  async function dataverseFetchBlob(path, options = {}) {
    const token = await acquireToken();
    const requestUrl = path.startsWith("http") ? path : `${dataverseUrl}/api/data/v9.2${path}`;
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        Accept: "image/*,application/octet-stream",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const detail = await readError(response);
      throw new Error(detail || `Dataverse ha risposto con HTTP ${response.status}.`);
    }

    return response.blob();
  }

  function getNoContentResponseData(response) {
    const entityId = response.headers.get("OData-EntityId") || response.headers.get("odata-entityid");
    const idMatch = entityId?.match(/\(([^)]+)\)$/);
    return idMatch ? { contactid: idMatch[1] } : {};
  }

  async function acquireToken() {
    const tokenRequest = {
      ...getLoginRequest(),
      account: state.account
    };

    try {
      const response = await state.msalInstance.acquireTokenSilent(tokenRequest);
      return response.accessToken;
    } catch (error) {
      if (error instanceof msal.InteractionRequiredAuthError) {
        const response = await state.msalInstance.acquireTokenPopup(tokenRequest);
        return response.accessToken;
      }

      throw error;
    }
  }

  function getLoginRequest() {
    return {
      scopes: [`${dataverseUrl}/user_impersonation`]
    };
  }

  function mapContact(raw) {
    return {
      id: raw.contactid,
      firstname: raw.firstname || "",
      lastname: raw.lastname || "",
      birthdate: toDateInputValue(raw.birthdate),
      emailaddress1: raw.emailaddress1 || "",
      telephone1: raw.telephone1 || "",
      address1_line1: raw.address1_line1 || "",
      address1_city: raw.address1_city || "",
      address1_postalcode: raw.address1_postalcode || "",
      address1_stateorprovince: raw.address1_stateorprovince || "",
      mobilephone: raw.mobilephone || "",
      preferredcontactmethodcode: raw.preferredcontactmethodcode || "",
      accountId: raw._parentcustomerid_value || "",
      accountName:
        raw.parentcustomerid_account?.name ||
        raw["_parentcustomerid_value@OData.Community.Display.V1.FormattedValue"] ||
        "",
      contactIdText: raw[contactIdFieldName] || "",
      gin_salutation: raw.gin_salutation || "",
      countryOfResidenceId: raw._gin_countryofresidence_value || "",
      gin_countryofresidenceName: raw["_gin_countryofresidence_value@OData.Community.Display.V1.FormattedValue"] || "",
      countryOfResidenceConsentFlagsManagement: raw["gin_countryofresidence.gin_consentflagsmanagement"] || "",
      addressCountryId: raw._gin_address1_countryid_value || "",
      gin_address1_countryidName: raw["_gin_address1_countryid_value@OData.Community.Display.V1.FormattedValue"] || "",
      gin_wechat: raw.gin_wechat || "",
      gin_consensoprofilazione: Boolean(raw.gin_consensoprofilazione),
      gin_consensomarketing: Boolean(raw.gin_consensomarketing),
      new_dataricezioneconsenso: toDateInputValue(raw.new_dataricezioneconsenso),
      new_consensoprivacy: Boolean(raw.new_consensoprivacy),
      gin_consensoterzeparti: Boolean(raw.gin_consensoterzeparti)
    };
  }

  function setSort(field, direction) {
    state.sortField = field;
    state.sortDirection = direction;
    closeColumnMenu();

    loadContacts({ reset: true });
  }

  function getOrderBy() {
    const direction = state.sortDirection;

    if (state.sortField === "firstname") {
      return `firstname ${direction},lastname ${direction}`;
    }

    if (state.sortField === "emailaddress1") {
      return `emailaddress1 ${direction},lastname asc,firstname asc`;
    }

    if (state.sortField === "telephone1") {
      return `telephone1 ${direction},lastname asc,firstname asc`;
    }

    if (state.sortField === "contactIdText") {
      return `${contactIdFieldName} ${direction},lastname asc,firstname asc`;
    }

    return `lastname ${direction},firstname ${direction}`;
  }

  function getFilterQuery() {
    const filterTreeExpression = buildFilterTreeExpression(state.filterTree);
    const listSearchExpression = buildListSearchExpression();
    const filters = [filterTreeExpression, listSearchExpression].filter(Boolean);
    return filters.length ? `$filter=${filters.join(" and ")}` : "";
  }

  function buildFilterTreeExpression(node) {
    if (!node) {
      return "";
    }

    if (node.type === "condition") {
      return buildFilterExpression(node.field, node);
    }

    const expressions = (node.children || [])
      .map(buildFilterTreeExpression)
      .filter(Boolean);

    if (!expressions.length) {
      return "";
    }

    const joined = expressions.join(` ${node.logic || "and"} `);
    return expressions.length > 1 ? `(${joined})` : joined;
  }

  function buildListSearchExpression() {
    const searchValue = normalizeListSearchValue(state.listSearchTerm);
    if (!searchValue) {
      return "";
    }

    const escapedValue = escapeODataString(searchValue);
    const expressions = [
      `contains(firstname,'${escapedValue}')`,
      `contains(lastname,'${escapedValue}')`,
      `contains(emailaddress1,'${escapedValue}')`,
      `contains(telephone1,'${escapedValue}')`
    ];

    expressions.push(`contains(${contactIdFieldName},'${escapedValue}')`);

    return expressions.join(" or ").replace(/^(.+)$/, "($1)");
  }

  function buildFilterExpression(field, filter) {
    if (!filter || (!filter.value && filter.operator !== "has-data" && filter.operator !== "no-data")) {
      return "";
    }

    const escapedValue = escapeODataString(filter.value || "");
    const target = field === "contactIdText" ? contactIdFieldName : field;

    if (filter.operator === "eq") {
      return `${target} eq '${escapedValue}'`;
    }

    if (filter.operator === "ne") {
      return `${target} ne '${escapedValue}'`;
    }

    if (filter.operator === "contains") {
      return `contains(${target},'${escapedValue}')`;
    }

    if (filter.operator === "not-contains") {
      return `not contains(${target},'${escapedValue}')`;
    }

    if (filter.operator === "starts-with") {
      return `startswith(${target},'${escapedValue}')`;
    }

    if (filter.operator === "not-starts-with") {
      return `not startswith(${target},'${escapedValue}')`;
    }

    if (filter.operator === "ends-with") {
      return `endswith(${target},'${escapedValue}')`;
    }

    if (filter.operator === "not-ends-with") {
      return `not endswith(${target},'${escapedValue}')`;
    }

    if (filter.operator === "has-data") {
      return `${target} ne null`;
    }

    if (filter.operator === "no-data") {
      return `${target} eq null`;
    }

    return "";
  }

  function renderSortState() {
    elements.columnMenuButtons.forEach((button) => {
      const isActive = button.dataset.columnField === state.sortField;
      const hasFilter = hasFilterForField(button.dataset.columnField);
      button.setAttribute("aria-sort", isActive ? getAriaSortDirection() : "none");
      button.classList.toggle("is-filtered", hasFilter);
      button.setAttribute("aria-label", `${button.dataset.columnLabel}${hasFilter ? ", filtro applicato" : ""}`);
    });
  }

  function hasFilterForField(field) {
    return flattenFilterTree(state.filterTree).some((condition) => condition.field === field);
  }

  function flattenFilterTree(node) {
    if (!node) {
      return [];
    }

    if (node.type === "condition") {
      return [node];
    }

    return (node.children || []).flatMap(flattenFilterTree);
  }

  function getRootConditionForField(field) {
    return (state.filterTree.children || []).find((node) => node.type === "condition" && node.field === field);
  }

  function upsertRootCondition(condition) {
    const existingIndex = state.filterTree.children.findIndex((node) => node.type === "condition" && node.field === condition.field);
    const nextCondition = {
      ...condition,
      id: existingIndex >= 0 ? state.filterTree.children[existingIndex].id : createFilterNodeId(),
      type: "condition"
    };

    if (existingIndex >= 0) {
      state.filterTree.children.splice(existingIndex, 1, nextCondition);
    } else {
      state.filterTree.children.push(nextCondition);
    }
  }

  function removeRootCondition(field) {
    state.filterTree.children = state.filterTree.children.filter((node) => !(node.type === "condition" && node.field === field));
  }

  function openColumnMenu(event, button) {
    event.stopPropagation();
    const shouldReplayAnimation = !elements.columnMenu.hidden;
    window.clearTimeout(state.columnMenuHideTimer);
    elements.columnMenu.classList.remove("is-closing");
    closeAllCustomFilterSelects();
    state.activeColumnField = button.dataset.columnField;
    elements.columnFilterPanel.hidden = true;
    const existingFilter = getRootConditionForField(state.activeColumnField) || { operator: "eq", value: "" };
    elements.columnFilterOperator.value = existingFilter.operator;
    setCustomFilterSelectValue(elements.columnFilterOperatorSelect, filterOperators, existingFilter.operator);
    elements.columnFilterInput.value = existingFilter.value || "";
    renderColumnFilterInput();
    elements.columnMenuButtons.forEach((menuButton) => {
      menuButton.setAttribute("aria-expanded", String(menuButton === button));
    });

    renderColumnMenuState();

    const rect = button.getBoundingClientRect();
    elements.columnMenu.hidden = false;
    elements.columnMenu.style.left = `${Math.min(rect.left, window.innerWidth - 356)}px`;
    elements.columnMenu.style.top = `${rect.bottom + 8}px`;
    if (shouldReplayAnimation) {
      elements.columnMenu.style.animation = "none";
      void elements.columnMenu.offsetHeight;
      elements.columnMenu.style.animation = "";
    }
  }

  function handleColumnMenuAction(action) {
    if (!state.activeColumnField) {
      return;
    }

    if (action === "sort-asc") {
      setSort(state.activeColumnField, "asc");
      return;
    }

    if (action === "sort-desc") {
      setSort(state.activeColumnField, "desc");
      return;
    }

    if (action === "filter") {
      if (elements.columnFilterPanel.hidden) {
        openColumnFilterPanel();
      } else {
        closeColumnFilterPanel();
      }
      renderIcons();
      return;
    }

    closeColumnMenu();
  }

  function openColumnFilterPanel() {
    window.clearTimeout(state.columnFilterPanelHideTimer);
    elements.columnFilterPanel.classList.remove("is-closing");
    elements.columnFilterPanel.hidden = false;
    renderColumnFilterInput();
    elements.columnFilterOperatorSelect.querySelector(".custom-filter-select-button").focus();
  }

  function closeColumnFilterPanel({ immediate = false } = {}) {
    window.clearTimeout(state.columnFilterPanelHideTimer);
    closeAllCustomFilterSelects();

    if (elements.columnFilterPanel.hidden) {
      return;
    }

    if (immediate) {
      elements.columnFilterPanel.hidden = true;
      elements.columnFilterPanel.classList.remove("is-closing");
      return;
    }

    elements.columnFilterPanel.classList.add("is-closing");
    state.columnFilterPanelHideTimer = window.setTimeout(() => {
      elements.columnFilterPanel.hidden = true;
      elements.columnFilterPanel.classList.remove("is-closing");
    }, 300);
  }

  function applyColumnFilter() {
    if (!state.activeColumnField) {
      return;
    }

    const value = elements.columnFilterInput.value.trim();
    const operator = elements.columnFilterOperator.value;
    if (operator === "has-data" || operator === "no-data" || value) {
      upsertRootCondition({
        field: state.activeColumnField,
        operator,
        value
      });
    } else {
      removeRootCondition(state.activeColumnField);
    }

    closeColumnMenu();
    loadContacts({ reset: true });
  }

  function clearColumnFilter() {
    if (state.activeColumnField) {
      removeRootCondition(state.activeColumnField);
    }

    elements.columnFilterInput.value = "";
    closeColumnMenu();
    loadContacts({ reset: true });
  }

  function openAdvancedFilterDialog() {
    renderAdvancedFilterTree(cloneFilterTree(state.filterTree));
    elements.advancedFilterDialog.showModal();
    renderIcons();
  }

  function closeAdvancedFilterDialog() {
    elements.advancedFilterDialog.close();
  }

  function openMobileSortDialog() {
    setCustomFilterSelectValue(elements.mobileSortFieldSelect, filterFields, state.sortField);
    setCustomFilterSelectValue(elements.mobileSortDirectionSelect, sortDirectionOptions, state.sortDirection);
    elements.mobileSortDialog.showModal();
    renderIcons();
  }

  function closeMobileSortDialog() {
    closeAllCustomFilterSelects();
    elements.mobileSortDialog.close();
  }

  function applyMobileSort(event) {
    event.preventDefault();
    state.sortField = elements.mobileSortField.value || "lastname";
    state.sortDirection = elements.mobileSortDirection.value || "asc";
    closeMobileSortDialog();
    renderSortState();
    loadContacts({ reset: true });
  }

  function createDefaultFilter() {
    return {
      id: createFilterNodeId(),
      type: "condition",
      field: "firstname",
      operator: "contains",
      value: ""
    };
  }

  function createFilterNodeId() {
    filterNodeId += 1;
    return `filter-node-${filterNodeId}`;
  }

  function createRootFilterTree(children = []) {
    return {
      id: "root",
      type: "group",
      logic: "and",
      children
    };
  }

  function cloneFilterTree(tree) {
    return JSON.parse(JSON.stringify(tree || createRootFilterTree()));
  }

  function renderAdvancedFilterTree(tree) {
    elements.advancedFilterRows.replaceChildren();
    flattenFilterTree(tree).forEach((node) => {
      elements.advancedFilterRows.append(createAdvancedFilterCondition(node));
    });
    updateAdvancedFilterAddButton();
    renderIcons();
  }

  function createAdvancedFilterCondition(filter = createDefaultFilter()) {
    const row = document.createElement("div");
    row.className = "advanced-filter-row filter-builder-grid";
    row.dataset.nodeType = "condition";
    row.dataset.nodeId = filter.id || createFilterNodeId();
    row.innerHTML = `
      <span class="filter-row-marker" aria-hidden="true"></span>
      <div class="custom-filter-select" data-filter-select="field">
        <input class="advanced-filter-field" type="hidden" />
        <button class="custom-filter-select-button" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Campo">
          <span></span>
        </button>
        <div class="custom-filter-select-menu" role="listbox" hidden></div>
      </div>
      <div class="custom-filter-select" data-filter-select="operator">
        <input class="advanced-filter-operator" type="hidden" />
        <button class="custom-filter-select-button" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Operatore">
          <span></span>
        </button>
        <div class="custom-filter-select-menu" role="listbox" hidden></div>
      </div>
      <input class="advanced-filter-value" type="search" aria-label="Valore" />
      <button class="remove-filter-row" type="button" aria-label="Elimina filtro">
        <i data-lucide="trash-2" aria-hidden="true"></i>
      </button>
    `;

    const valueInput = row.querySelector(".advanced-filter-value");

    setupCustomFilterSelect(row.querySelector('[data-filter-select="field"]'), filterFields, filter.field, updateAdvancedFilterAddButton);
    setupCustomFilterSelect(row.querySelector('[data-filter-select="operator"]'), filterOperators, filter.operator, () => {
      renderAdvancedFilterValueInput(row);
      updateAdvancedFilterAddButton();
    });
    valueInput.value = filter.value || "";

    valueInput.addEventListener("input", updateAdvancedFilterAddButton);
    row.querySelector(".remove-filter-row").addEventListener("click", () => {
      row.remove();
      updateAdvancedFilterAddButton();
    });

    renderAdvancedFilterValueInput(row);
    return row;
  }

  function addAdvancedFilterCondition() {
    if (!areAdvancedFilterRowsValid()) {
      focusFirstInvalidAdvancedFilterRow();
      updateAdvancedFilterAddButton();
      return;
    }

    elements.advancedFilterRows.append(createAdvancedFilterCondition(createDefaultFilter()));
    updateAdvancedFilterAddButton();
    renderIcons();
  }

  function setupCustomFilterSelect(wrapper, options, selectedValue, onChange) {
    const input = wrapper.querySelector("input");
    const button = wrapper.querySelector(".custom-filter-select-button");
    const label = button.querySelector("span");
    const menu = wrapper.querySelector(".custom-filter-select-menu");

    input.value = selectedValue;
    label.textContent = getOptionLabel(options, selectedValue);
    menu.replaceChildren(...options.map((option) => {
      const item = document.createElement("button");
      item.className = "custom-filter-select-option";
      item.type = "button";
      item.role = "option";
      item.dataset.value = option.value;
      item.textContent = option.label;
      item.setAttribute("aria-selected", String(option.value === selectedValue));
      item.addEventListener("click", () => {
        input.value = option.value;
        label.textContent = option.label;
        menu.querySelectorAll(".custom-filter-select-option").forEach((menuItem) => {
          menuItem.setAttribute("aria-selected", String(menuItem === item));
        });
        closeCustomFilterSelect(wrapper);
        onChange?.();
      });
      return item;
    }));

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!menu.hidden) {
        closeCustomFilterSelect(wrapper);
        return;
      }

      closeAllCustomFilterSelects(wrapper);
      openCustomFilterSelect(wrapper);
    });

    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCustomFilterSelect(wrapper);
        button.focus();
      }
    });
  }

  function setCustomFilterSelectValue(wrapper, options, selectedValue) {
    const input = wrapper.querySelector("input");
    const button = wrapper.querySelector(".custom-filter-select-button");
    const label = button.querySelector("span");
    const menu = wrapper.querySelector(".custom-filter-select-menu");

    input.value = selectedValue;
    label.textContent = getOptionLabel(options, selectedValue);
    menu.querySelectorAll(".custom-filter-select-option").forEach((menuItem) => {
      menuItem.setAttribute("aria-selected", String(menuItem.dataset.value === selectedValue));
    });
  }

  function refreshCustomFilterSelectOptions(wrapper, options) {
    if (!wrapper) {
      return;
    }

    const input = wrapper.querySelector("input");
    const button = wrapper.querySelector(".custom-filter-select-button");
    const label = button.querySelector("span");
    const menu = wrapper.querySelector(".custom-filter-select-menu");
    const selectedValue = input.value;

    label.textContent = getOptionLabel(options, selectedValue);
    menu.replaceChildren(...options.map((option) => {
      const item = document.createElement("button");
      item.className = "custom-filter-select-option";
      item.type = "button";
      item.role = "option";
      item.dataset.value = option.value;
      item.textContent = option.label;
      item.setAttribute("aria-selected", String(option.value === selectedValue));
      item.addEventListener("click", () => {
        input.value = option.value;
        label.textContent = option.label;
        menu.querySelectorAll(".custom-filter-select-option").forEach((menuItem) => {
          menuItem.setAttribute("aria-selected", String(menuItem === item));
        });
        closeCustomFilterSelect(wrapper);
      });
      return item;
    }));
  }

  function getOptionLabel(options, value) {
    return options.find((option) => option.value === value)?.label || options[0]?.label || "";
  }

  function openCustomFilterSelect(wrapper) {
    const button = wrapper.querySelector(".custom-filter-select-button");
    const menu = wrapper.querySelector(".custom-filter-select-menu");
    menu.hidden = false;
    menu.classList.remove("is-closing");
    button.setAttribute("aria-expanded", "true");
    positionCustomFilterSelectMenu(wrapper);
  }

  function closeCustomFilterSelect(wrapper) {
    const button = wrapper.querySelector(".custom-filter-select-button");
    const menu = wrapper.querySelector(".custom-filter-select-menu");
    if (menu.hidden) {
      return;
    }

    menu.classList.add("is-closing");
    button.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      menu.hidden = true;
      menu.classList.remove("is-closing");
      resetCustomFilterSelectMenuPosition(menu);
    }, 340);
  }

  function positionCustomFilterSelectMenu(wrapper) {
    const button = wrapper.querySelector(".custom-filter-select-button");
    const menu = wrapper.querySelector(".custom-filter-select-menu");
    const shouldFloat = wrapper.id === "mobileSortFieldSelect" || wrapper.id === "mobileSortDirectionSelect";

    resetCustomFilterSelectMenuPosition(menu);

    if (wrapper.id === "columnFilterOperatorSelect") {
      const rect = button.getBoundingClientRect();
      const availableSpace = window.innerHeight - rect.bottom - 24;
      menu.style.maxHeight = `${Math.max(170, Math.min(300, availableSpace))}px`;
    }

    if (!shouldFloat) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const viewportGap = 12;
    const menuGap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - viewportGap;
    const spaceAbove = rect.top - viewportGap;
    const openAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const availableSpace = Math.max(180, (openAbove ? spaceAbove : spaceBelow) - menuGap);
    const maxHeight = Math.min(360, availableSpace);
    const top = openAbove
      ? Math.max(viewportGap, rect.top - maxHeight - menuGap)
      : Math.min(rect.bottom + menuGap, window.innerHeight - maxHeight - viewportGap);

    menu.classList.add("is-floating");
    menu.style.width = `${rect.width}px`;
    menu.style.left = `${Math.min(Math.max(viewportGap, rect.left), window.innerWidth - rect.width - viewportGap)}px`;
    menu.style.top = `${top}px`;
    menu.style.maxHeight = `${maxHeight}px`;
    menu.style.transformOrigin = openAbove ? "bottom center" : "top center";
  }

  function resetCustomFilterSelectMenuPosition(menu) {
    menu.classList.remove("is-floating");
    menu.style.width = "";
    menu.style.left = "";
    menu.style.top = "";
    menu.style.maxHeight = "";
    menu.style.transformOrigin = "";
  }

  function closeAllCustomFilterSelects(exceptWrapper = null) {
    document.querySelectorAll(".custom-filter-select").forEach((wrapper) => {
      if (wrapper !== exceptWrapper) {
        closeCustomFilterSelect(wrapper);
      }
    });
  }

  function handleAddAdvancedFilterRow() {
    addAdvancedFilterCondition();
  }

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function renderAdvancedFilterValueInput(row) {
    const operator = row.querySelector(".advanced-filter-operator").value;
    const valueInput = row.querySelector(".advanced-filter-value");
    const needsValue = filterOperators.find((item) => item.value === operator).needsValue !== false;
    valueInput.hidden = !needsValue;
    valueInput.required = needsValue;

    if (!needsValue) {
      valueInput.value = "";
    }
  }

  function updateAdvancedFilterAddButton() {
    const hasRows = Boolean(elements.advancedFilterRows.children.length);
    const filterBuilder = elements.advancedFilterRows.closest(".filter-builder");
    filterBuilder.classList.toggle("has-filter-rows", hasRows);
    window.requestAnimationFrame(() => updateFilterBuilderGuide(filterBuilder));
    elements.addAdvancedFilterRowButton.disabled = !areAdvancedFilterRowsValid();
  }

  function updateFilterBuilderGuide(filterBuilder) {
    if (!filterBuilder) {
      return;
    }

    const addButtonCenter = elements.addAdvancedFilterRowButton.offsetTop + (elements.addAdvancedFilterRowButton.offsetHeight / 2);
    filterBuilder.style.setProperty("--filter-line-end", `${Math.max(addButtonCenter, 92)}px`);
  }

  function areAdvancedFilterRowsValid() {
    const rows = [...elements.advancedFilterRows.querySelectorAll(".advanced-filter-row")];
    return rows.every(isAdvancedFilterRowValid);
  }

  function isAdvancedFilterRowValid(row) {
    const field = row.querySelector(".advanced-filter-field").value;
    const operator = row.querySelector(".advanced-filter-operator").value;
    const valueInput = row.querySelector(".advanced-filter-value");
    const operatorConfig = filterOperators.find((item) => item.value === operator);
    const hasValidField = filterFields.some((item) => item.value === field);
    const hasValidOperator = Boolean(operatorConfig);
    const hasRequiredValue = operatorConfig.needsValue === false || Boolean(valueInput.value.trim());

    return hasValidField && hasValidOperator && hasRequiredValue;
  }

  function focusFirstInvalidAdvancedFilterRow() {
    const invalidRow = [...elements.advancedFilterRows.querySelectorAll(".advanced-filter-row")]
      .find((row) => !isAdvancedFilterRowValid(row));

    if (!invalidRow) {
      return;
    }

    const valueInput = invalidRow.querySelector(".advanced-filter-value");
    const operator = invalidRow.querySelector(".advanced-filter-operator").value;
    const needsValue = filterOperators.find((item) => item.value === operator).needsValue !== false;
    const target = needsValue && !valueInput.value.trim()
      ? valueInput
      : invalidRow.querySelector(".custom-filter-select-button");
    target.focus();
  }

  function readAdvancedFilterTree() {
    return createRootFilterTree(readFilterNodesFromContainer(elements.advancedFilterRows));
  }

  function readFilterNodesFromContainer(container) {
    return [...container.children]
      .filter((child) => child.matches(".advanced-filter-row"))
      .map(readFilterNode)
      .filter(Boolean);
  }

  function readFilterNode(element) {
    const field = element.querySelector(".advanced-filter-field").value;
    const operator = element.querySelector(".advanced-filter-operator").value;
    const value = element.querySelector(".advanced-filter-value").value.trim();
    if (operator !== "has-data" && operator !== "no-data" && !value) {
      return null;
    }

    return {
      id: element.dataset.nodeId || createFilterNodeId(),
      type: "condition",
      field,
      operator,
      value
    };
  }

  function applyAdvancedFilters(event) {
    event.preventDefault();
    if (!areAdvancedFilterRowsValid()) {
      elements.advancedFilterForm.reportValidity();
      focusFirstInvalidAdvancedFilterRow();
      updateAdvancedFilterAddButton();
      return;
    }

    state.filterTree = readAdvancedFilterTree();
    closeAdvancedFilterDialog();
    renderSortState();
    loadContacts({ reset: true });
  }

  function clearAllFilters() {
    state.filterTree = createRootFilterTree();
    renderAdvancedFilterTree(cloneFilterTree(state.filterTree));
    renderSortState();
    loadContacts({ reset: true });
  }

  function renderColumnFilterInput() {
    const operator = elements.columnFilterOperator.value;
    const needsValue = operator !== "has-data" && operator !== "no-data";
    elements.columnFilterInput.hidden = !needsValue;
    elements.columnFilterInput.required = needsValue;

    if (!needsValue) {
      elements.columnFilterInput.value = "";
    }
  }

  function renderColumnMenuState() {
    elements.columnMenuItems.forEach((item) => {
      const action = item.dataset.columnAction;
      const isActive =
        state.activeColumnField === state.sortField &&
        ((action === "sort-asc" && state.sortDirection === "asc") ||
          (action === "sort-desc" && state.sortDirection === "desc"));

      item.classList.toggle("is-active", isActive);
      item.classList.toggle("has-filter", action === "filter" && hasFilterForField(state.activeColumnField));
    });
  }

  function closeColumnMenu() {
    window.clearTimeout(state.columnMenuHideTimer);
    closeAllCustomFilterSelects();

    if (!elements.columnMenu.hidden) {
      elements.columnMenu.classList.add("is-closing");
      state.columnMenuHideTimer = window.setTimeout(() => {
        elements.columnMenu.hidden = true;
        elements.columnMenu.classList.remove("is-closing");
      }, 280);
    }

    closeColumnFilterPanel({ immediate: true });
    elements.columnMenuButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
  }

  function closeColumnMenuOnOutsideClick(event) {
    if (
      elements.columnMenu.hidden ||
      elements.columnMenu.contains(event.target) ||
      [...elements.columnMenuButtons].some((button) => button.contains(event.target))
    ) {
      return;
    }

    closeColumnMenu();
  }

  function closeColumnMenuOnEscape(event) {
    if (event.key === "Escape") {
      closeColumnMenu();
    }
  }

  function getAriaSortDirection() {
    return state.sortDirection === "asc" ? "ascending" : "descending";
  }


  function restoreLanguage() {
    const savedLanguage = window.localStorage.getItem(languageStorageKey);
    state.currentLanguage = translations[savedLanguage] ? savedLanguage : "it";
  }

  function setLanguage(language) {
    if (!translations[language]) {
      return;
    }
    state.currentLanguage = language;
    window.localStorage.setItem(languageStorageKey, language);
    applyTranslations();
  }

  function applyTranslations() {
    document.documentElement.lang = state.currentLanguage;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = t(element.dataset.i18n);
      if (element.children.length) {
        const textNode = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (textNode) {
          textNode.textContent = " " + value + " ";
        }
      } else {
        element.textContent = value;
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    elements.languageButtons.forEach((button) => {
      const isActive = button.dataset.language === state.currentLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    applyOptionSetMetadata();
    applyPrivacyTexts();
    if (state.datePickerElement && !state.datePickerElement.hidden && state.activeDateInput) {
      renderDatePicker();
      positionDatePicker();
    }
  }

  function t(key) {
    return translations[state.currentLanguage]?.[key] || translations.it[key] || key;
  }

  function setHeaderLocked(isLocked) {
    document.body.classList.toggle("is-contact-page-open", isLocked);
    elements.switchAccountButton.disabled = isLocked;
    elements.menuLogoutButton.disabled = isLocked;
    elements.userMenuButton.setAttribute("aria-disabled", String(isLocked));
  }

  function preventHeaderNavigationWhenLocked(event) {
    if (!state.isContactPageOpen) {
      return;
    }
    event.preventDefault();
  }

  function renderIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function getInitials(value) {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function cleanValue(value) {
    const trimmed = value.trim();
    return trimmed || null;
  }

  function cleanNumericValue(value) {
    const trimmed = String(value || "").trim();
    return trimmed ? Number(trimmed) : null;
  }

  function cleanOptionValue(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return null;
    }

    return /^-?\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
  }

  function toDateInputValue(value) {
    if (!value) {
      return "";
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return String(value).slice(0, 10);
  }

  function toDateDisplayValue(value) {
    const date = value instanceof Date ? value : parseDateInputValue(toDateInputValue(value));
    if (!date) {
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function toDatePayloadValue(value) {
    const date = parseDateInputValue(value);
    return date ? toDateInputValue(date) : null;
  }

  function escapeODataString(value) {
    return value.replace(/'/g, "''");
  }

  function normalizeDataverseUrl(value) {
    return (value || "").trim().replace(/\/+$/, "");
  }

  function setStatus(message, isError = false) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.toggle("is-error", isError);
  }

  function showToast(message) {
    window.clearTimeout(state.toastTimer);
    elements.toastMessage.textContent = message;
    elements.toastMessage.hidden = false;
    state.toastTimer = window.setTimeout(() => {
      elements.toastMessage.hidden = true;
    }, 2600);
  }

  async function copyContactIdToClipboard(value) {
    const contactId = String(value || "").trim();

    if (!contactId) {
      showToast(t("contactId.unavailable"));
      return;
    }

    try {
      if (navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(contactId);
      } else {
        copyTextWithFallback(contactId);
      }
      showToast(t("contactId.copied"));
    } catch (error) {
      copyTextWithFallback(contactId);
      showToast(t("contactId.copied"));
    }
  }

  function copyTextWithFallback(value) {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  function setFormError(message) {
    elements.formError.textContent = message;
    elements.formError.hidden = !message;
  }

  function setBusy(isBusy) {
    if (elements.loginButton) {
      elements.loginButton.disabled = isBusy;
    }
    elements.heroLoginButton.disabled = isBusy;
    elements.advancedFilterButton.disabled = isBusy;
    elements.mobileSortButton.disabled = isBusy;
    elements.refreshButton.disabled = isBusy;
    elements.newContactButton.disabled = isBusy;
  }

  function setupContactsObserver() {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    state.contactsObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && state.nextContactsLink && !state.isLoadingContacts) {
          loadContacts({ reset: false });
        }
      },
      {
        root: null,
        rootMargin: "280px 0px",
        threshold: 0
      }
    );

    state.contactsObserver.observe(elements.contactsSentinel);
  }

  function updateContactsSpinner() {
    elements.contactsSpinner.hidden = !state.isLoadingContacts || !state.contacts.length;
    elements.listLoadingOverlay.hidden = !state.isLoadingContacts || !state.isResetLoadingContacts;
  }

  function updateStickyListDepth() {
    const depth = Math.min(window.scrollY / 140, 1);
    document.documentElement.style.setProperty("--list-sticky-depth", depth.toFixed(3));

    if (!elements.pageHeading || elements.contactsView.hidden) {
      return;
    }

    const headingBottom = elements.pageHeading.getBoundingClientRect().bottom;
    document.documentElement.style.setProperty("--column-sticky-top", `${Math.max(0, Math.ceil(headingBottom))}px`);
  }

  async function readError(response) {
    try {
      const body = await response.json();
      return body.error.message || body.message || "";
    } catch (_) {
      return response.statusText;
    }
  }

  function getErrorMessage(error) {
    return error.message || "Operazione non riuscita.";
  }
})();
