// Shared i18n type — structure only, values are string
export interface TranslationStep {
  title: string;
  description: string;
  shortcut?: string;
}

export interface TranslationFeature {
  title: string;
  desc: string;
}

export interface TranslationFaq {
  q: string;
  a: string;
}

export interface Translations {
  common: {
    cancel: string; save: string; delete: string; confirm: string; back: string;
    search: string; loading: string; error: string; close: string; export: string;
    share: string; rename: string; open: string; add: string; yes: string; no: string;
    or: string; with: string; french: string; english: string; german: string;
  };
  landing: {
    metaTitle: string; metaDesc: string; login: string; signup: string;
    heroTitle1: string; heroTitle2: string; heroTitle3: string; heroTitle4: string;
    heroSub1: string; heroSub2: string; heroSub3: string; heroSub4: string;
    ctaBeta: string; ctaDiscover: string; heroImgAlt: string;
    featuresTitle: string; featuresSub: string; features: TranslationFeature[];
    stepsTitle: string; stepsSub: string; steps: TranslationFeature[];
    aboutTitle: string; aboutP1: string; aboutP2: string; aboutP3: string; aboutP4: string; aboutP5: string;
    aboutImgAlt: string; audienceLabel: string; audienceTitle: string; audience: string[];
    faqTitle: string; faqSub: string; faq: TranslationFaq[];
    ctaTitle: string; ctaSub: string; ctaButton: string;
  };
  footer: {
    tagline: string; product: string; features: string; pricing: string; pricingBeta: string;
    faq: string; legal: string; legalNotice: string; privacy: string; terms: string;
    contact: string; copyright: string; madeWith: string;
  };
  auth: {
    welcomeBack: string; accessGenograms: string; continueGoogle: string; orByEmail: string;
    email: string; password: string; forgotPassword: string; invalidCredentials: string;
    logging: string; login: string; noAccount: string; createAccount: string;
    joinGenogy: string; startCreating: string; fullName: string; alreadyRegistered: string;
    passwordMinLength: string; creating: string; createMyAccount: string; hasAccount: string;
    forgotPasswordTitle: string; forgotPasswordSub: string; resetEmailSent: string;
    sending: string; resetPassword: string; welcomeGenogy: string; checkEmail: string;
    googleError: string; minCharsPlaceholder: string; welcomeToast: string;
    acceptPrivacy: string; acceptPrivacyRequired: string;
  };
  dashboard: {
    createNew: string; noFiles: string; createFromMember: string; myGenograms: string;
    name: string; creator: string; lastModified: string; createdAt: string; actions: string;
    me: string; noGenogram: string; createFirst: string; createGenogram: string;
    noResults: string; noResultsFor: string; limitReached: string; deleted: string;
    renamed: string; myAccount: string; signOut: string; dossierNotes: string;
  };
  createModal: {
    title: string; description: string; firstName: string; lastName: string; gender: string;
    male: string; female: string; birthDate: string; creating: string; create: string;
    genogramOf: string; created: string; createError: string;
  };
  editor: {
    searchPlaceholder: string; notes: string; export: string; share: string;
    backToDashboard: string; members: string; familyLinks: string; pathologies: string;
    emotionalLinks: string; addPathology: string; noPathologyCreated: string;
    centerOnMember: string; hidePathologies: string; showPathologies: string;
    hideEmotionalLinks: string; showEmotionalLinks: string;
    catName: string; catProfession: string; catPathology: string; catRelation: string;
    link: string; member: string;
  };
  controls: {
    undo: string; redo: string; zoomIn: string; zoomOut: string; recenter: string;
    exitPresentation: string; presentationMode: string; help: string; helpShortcuts: string;
  };
  memberEdit: {
    memberSheet: string; editMember: string; newMember: string; edit: string;
    firstNames: string; firstNameHint: string; lastNameLabel: string; birthName: string;
    photo: string; saveForPhoto: string; genderLabel: string; female: string; male: string;
    nonBinary: string; profession: string; retiredF: string; retiredM: string;
    birth: string; death: string; alive: string; yearsOld: string; deceasedAt: string;
    dateMarkedUncertain: string; markUncertain: string; genderIdentity: string;
    sexualOrientation: string; transgender: string; homosexualM: string; homosexualF: string;
    bisexualM: string; bisexualF: string; pathologiesLabel: string; noPathologyDefined: string;
    addPathology: string; twins: string; twinGroup: string; twinGroupHint: string;
    twinGroupPlaceholder: string; clinicalNotes: string; notesPlaceholder: string;
    relations: string; children: string; childrenPlural: string; noEmotionalLink: string;
    emotionalLinksLabel: string; deleteMember: string; deleteMemberTitle: string;
    deleteMemberDesc: string; identity: string; dates: string; age: string; ageAtDeath: string;
    genderAndOrientation: string; coupleRelations: string; monozygotic: string; dizygotic: string;
    group: string; type: string; pregnancy: string; miscarriage: string; abortion: string;
    stillborn: string; eventYear: string; deleteEvent: string; irreversible: string;
    meetingYear: string; marriageYear: string; commonLawYear: string; separationYear: string;
    divorceYear: string; widowYear: string; loveAffairYear: string; endYear: string;
  };
  unionEdit: {
    title: string; relationType: string; meetingYear: string; endYear: string;
    notes: string; notesPlaceholder: string;
  };
  linkModal: {
    editTitle: string; createTitle: string; current: string; deleteLink: string;
  };
  createMember: {
    parent: string; sibling: string; child: string; spouseMarried: string;
    spouseDivorced: string; spouseSeparated: string; spouseWidowed: string;
    parentBio: string; parentAdoptive: string; addParents: string;
    perinatalEvents: string; pregnancyLabel: string; miscarriageLabel: string;
    abortionLabel: string; stillbornMale: string; stillbornFemale: string;
  };
  memberCard: {
    yearsOld: string; createMember: string; createLink: string;
    dragHint: string; cancelLabel: string; retiredF: string; retiredM: string;
    viewLabel: string; editLabel: string;
  };
  shareModal: {
    title: string; linkSharing: string; reader: string; editorAccess: string;
    generate: string; inviteByEmail: string; invite: string; linkCreated: string;
    linkError: string; inviteSent: string; inviteError: string; shareDeleted: string;
    linkCopied: string;
  };
  account: {
    myAccount: string; myProfile: string; settings: string; firstName: string;
    lastName: string; professionLabel: string; emailLabel: string; phoneLabel: string;
    sirenLabel: string; billingLabel: string; saveChanges: string; saving: string;
    profileUpdated: string; saveError: string; requiredFields: string; changePassword: string;
    changePasswordDesc: string; sendResetLink: string; sendingLink: string; emailSent: string;
    emailSendError: string; deleteAccount: string; deleteAccountDesc: string;
    deleteAccountConfirmTitle: string; deleteAccountConfirmDesc: string; yesDelete: string;
    deleteRequested: string; exportData: string; exportDataDesc: string; exporting: string;
    exportSuccess: string; exportError: string;
  };
  cookieBanner: {
    message: string; accept: string; learnMore: string;
  };
  resetPassword: {
    newPassword: string; chooseSecure: string; newPasswordLabel: string;
    confirmPassword: string; updating: string; updatePassword: string;
    passwordsDontMatch: string; passwordUpdated: string; updateError: string;
    invalidLink: string; backToLogin: string;
  };
  saveIndicator: {
    saving: string; saved: string; error: string;
  };
  notesModal: {
    dossierNotes: string; newNote: string; noNotes: string; addFirst: string;
    addNote: string; saveNote: string; noteSaved: string; noteSaveError: string;
    noteLoadError: string; noteDeleteError: string; notePlaceholder: string;
    exportPdf: string; exportTxt: string; exportedOn: string;
  };
  beta: {
    exportNotAvailable: string; shareNotAvailable: string; sharePreviewAlt: string;
  };
  addPathology: {
    title: string; chooseColor: string; add: string;
  };
  parentPicker: {
    chooseParentCouple: string; whichUnionChild: string; whichUnionPerinatal: string;
    unknownParent: string; otherPartner: string; newPartner: string; newPartnerDesc: string;
  };
  onboarding: {
    welcomeTitle: string; welcomeDesc: string; letsGo: string; skipTutorial: string;
    neverShow: string; previous: string; next: string; finish: string;
    steps: TranslationStep[];
    linkAnimSelect: string; linkAnimDrag: string; linkAnimChoose: string;
    animClickPlus: string; animHoldAndDrag: string; animClick: string; animClickPencil: string;
    animGuide: string; animSlide: string; animSpouse: string; animFound: string;
    animUndoDesc: string; animTypeLien: string; animFusionnel: string;
  };
  familyLinks: {
    married: string; common_law: string; separated: string; divorced: string;
    widowed: string; love_affair: string;
  };
  emotionalLinkTypes: {
    fusional: string; distant: string; conflictual: string; ambivalent: string;
    cutoff: string; violence: string; emotional_abuse: string; physical_violence: string;
    sexual_abuse: string; neglect: string; controlling: string;
  };
}
