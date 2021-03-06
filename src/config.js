import mimeTypeOptions from './lookupMimeTypes.js'
import isoTags from './lookupISOTags.js'
import epaThemeTags from './lookupEPAThemeTags.js'
import placeTags from './lookupPlaceTags.js'
import languages from './lookupLanguages.js'
import rights from './lookupRights.js'
import programs from './lookupEPAPrograms.js'
import sor from './lookupEPASOR.js'
import piti from './lookupEPAPrimaryITInvestments.js'
import { date } from 'quasar'

var global_validators = {
  nonTrivialText: function(txt, options) {
    txt = txt || ''
    if (txt.trim().length === 0) return 'Empty.'
    if (
      txt.split(' ').filter(function(n) {
        return n && n.length >= options.minCharsinWord
      }).length >= options.minWords
    )
      return ''
    else return 'You need to provide a non-trivial value.'
  },

  mustSelectSomeTags: function(selectedTags, { minTags = 1 } = {}) {
    if (selectedTags.length == 0) return 'Empty.'
    if (selectedTags.length >= minTags) return ''
    else return 'Must have at least ' + minTags + ' keywords.'
  },

  validDate: function(txt, options) {
    config.noop(options) // So that linter does not complain
    txt = txt.trim()
    if (txt == '') return 'Empty.'
    // Is it a valid date
    if (
      date.isValid(txt) &&
      (txt.match(/^\d\d\d\d-\d\d-\d\d$/) ||
        txt.match(/^\d\d\d\d-\d\d$/) ||
        txt.match(/^\d\d\d\d$/))
    )
      return ''
    return 'Invalid date.'
  },

  validRange: function(txt, options) {
    config.noop(options) // So that linter does not complain
    txt = txt.trim()
    if (txt == '' || txt == '/') return 'Empty.'
    // Is it a valid date range
    var parts = txt.split('/')
    if (parts.length != 2) return 'Invalid date range.'
    var dtStart = parts[0]
    var dtEnd = parts[1]
    if ((dtStart && !dtEnd) || (!dtStart && dtEnd))
      return 'Incomplete date range.'
    if (global_validators.validDate(dtStart) != '') return 'Invalid start date.'
    if (global_validators.validDate(dtEnd) != '') return 'Invalid end date.'
    dtStart = Date.parse(dtStart)
    dtEnd = Date.parse(dtEnd)
    if (!dtStart) return 'Invalid start date.'
    if (!dtEnd) return 'Invalid end date.'
    if (dtStart > dtEnd) return 'Start date later than end date.'
    return ''
  },

  validDateOrRepetition: function(txt, options) {
    config.noop(options) // So that linter does not complain
    // Is it a repetition
    if (txt.match(/^R\/PT?\d+[DHMWY]$/)) return ''
    // Is it a valid date
    if (txt.match(/^\d\d\d\d-\d\d-\d\d$/) && Date.parse(txt)) return ''
    return 'Invalid value.'
  },

  validEmail: function(email, options) {
    config.noop(options) // So that linter does not complain
    if (email.trim() == '') return 'Empty.'
    // Email validation is tricky business... and in the eye of the beprovider...
    // eslint-disable-next-line
    var re = /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i
    if (re.test(String(email).toLowerCase())) return ''
    return 'Invalid email address.'
  },

  validUrl: function(url, options) {
    config.noop(options) // So that linter does not complain
    if (!url || url.trim() == '') return 'Empty.'
    var urlRegexp = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi

    if (url.match(urlRegexp)) return ''
    return 'Invalid URL.'
  },

  nonEmpty: function(inp, { typ = String } = {}) {
    if (typ == String && inp.trim() > '') return ''
    if (typ == Boolean && inp != null) return ''
    return 'Empty.'
  },

  crossValidateModifiedAndAccrualPeriodicity: function(txt, options) {
    config.noop(options) // So that linter does not complain
    if (
      global_validators.validDate(options.doc.modified) == '' ||
      options.doc.accrualPeriodicity
    )
      return ''
    if (!options.doc.modified || !options.doc.accrualPeriodicity)
      return 'Empty.'
    return 'You must populate update frequency element when you leave last update element empty.'
  },

  passThruValidation: function(obj, options) {
    config.noop(options) // So that linter does not complain
    var val
    if (obj && Array.isArray(obj)) {
      val = obj.find(item => item.validations)
      if (val) val = val.validations
    }
    return val ? val : 'Empty.'
  }
}

var validationIsEmpty = function(validation) {
  return (
    validation.startsWith('Empty.') ||
    validation.startsWith('Must select at least one.') ||
    validation.startsWith('Must make a selection.')
  )
}

var validation_config = {
  empty: {
    mandatory: { icon: 'fas fa-exclamation-triangle', color: 'fdae61' },
    optional: { icon: 'fas fa-question-circle', color: '9e9e91' }
  },
  nonempty: {
    valid: { icon: 'fas fa-check-circle', color: '1a9641' },
    invalid: { icon: 'fas fa-times-circle', color: 'd7191c' }
  }
}

var config = {
  global_validators: global_validators,
  validationIsEmpty: validationIsEmpty,
  validation_config: validation_config,

  noop: function() {},

  url2mimeType: function(url) {
    var ext = url.split('.').pop()
    if (!ext) return ''
    var searchStr = '(.' + ext + ')'
    var item = mimeTypeOptions.find(o => o.label.indexOf(searchStr) > -1)
    if (item) return item.value
    return ''
  },

  capitalize: function(value) {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },

  getValiMandaVisualizer: function(validations, mandatory) {
    var vals = validations.replace(/^\s+|\s+$/g, '')
    var isEmpty = validationIsEmpty(vals)
    var isValid = vals == ''
    var icon = 'fas fa-meh-rolling-eyes'
    var color = '000000'
    if (mandatory && isEmpty) {
      icon = validation_config.empty.mandatory.icon
      color = validation_config.empty.mandatory.color
    } else if (!mandatory && isEmpty) {
      icon = validation_config.empty.optional.icon
      color = validation_config.empty.optional.color
    } else if (isValid) {
      icon = validation_config.nonempty.valid.icon
      color = validation_config.nonempty.valid.color
    } else if (!isValid) {
      icon = validation_config.nonempty.invalid.icon
      color = validation_config.nonempty.invalid.color
    }
    icon = icon.substring(7)
    var style = 'padding-right:0.3em;color:#' + color
    return { icon: icon, style: style }
  },

  // Extract property from document and check if value is acceptable
  // Fallback to a default value, if not.
  extract: function(
    doc,
    prop,
    { defaultValue = '', extract = true, conf = config, lookup = true } = {}
  ) {
    var val = null
    if (doc && doc[prop]) {
      // Store value of property sought
      val = doc[prop]
      // Remove the property from the document (unless overriden: extract = false)
      if (extract) delete doc[prop]
      // Match against lookup list if applicable
      if (lookup && conf[prop] && conf[prop].availableOptions) {
        var item = conf[prop].availableOptions.find(i => i.value == val)
        // Fallback to default value if no match
        if (!item) val = defaultValue
      }
    }
    return val || defaultValue
  },

  clone: function(o) {
    return JSON.parse(JSON.stringify(o))
  },

  notifyError: function(error) {
    let msg = '',
      dtl = ''
    if (typeof error == 'object') {
      msg = error.name
      dtl = error.message
    } else msg = error

    this.$q.notify({
      message: msg,
      detail: dtl,
      type: 'negative',
      timeout: 0,
      actions: [
        {
          label: 'Dismiss'
        }
      ]
    })
  },

  notifySuccess: function(msg) {
    this.$q.notify({
      message: msg,
      type: 'positive',
      timeout: 0,
      actions: [
        {
          label: 'Dismiss'
        }
      ]
    })
  },

  title: {
    mandatory: true,
    validators: [
      {
        fn: global_validators.nonTrivialText,
        args: { minWords: 2, minCharsinWord: 3 }
      }
    ]
  },

  description: {
    mandatory: true,
    validators: [
      {
        fn: global_validators.nonTrivialText,
        args: { minWords: 5, minCharsinWord: 3 }
      }
    ]
  },

  tags_iso: {
    mandatory: true,
    validators: [{ fn: global_validators.mustSelectSomeTags, args: {} }],
    availableTags: isoTags
  },

  tags_epa_theme: {
    mandatory: true,
    validators: [{ fn: global_validators.mustSelectSomeTags, args: {} }],
    availableTags: epaThemeTags
  },

  tags_place: {
    mandatory: true,
    validators: [{ fn: global_validators.mustSelectSomeTags, args: {} }],
    availableTags: placeTags
  },

  tags_general: {
    mandatory: true,
    validators: [
      { fn: global_validators.mustSelectSomeTags, args: { minTags: 3 } }
    ]
  },

  modified: {
    mandatory: true,
    validators: [
      {
        fn: global_validators.crossValidateModifiedAndAccrualPeriodicity,
        args: {}
      }
    ]
  },

  publisher: {
    mandatory: true,
    validators: [
      {
        fn: global_validators.nonTrivialText,
        args: { minWords: 1, minCharsinWord: 3 }
      }
    ]
  },

  contactPoint: {
    fn: {
      mandatory: true,
      validators: [
        {
          fn: global_validators.nonTrivialText,
          args: { minWords: 1, minCharsinWord: 3 }
        }
      ]
    },

    hasEmail: {
      mandatory: true,
      validators: [{ fn: global_validators.validEmail, args: {} }]
    }
  },

  identifier: {
    mandatory: true,
    validators: [{ fn: global_validators.nonEmpty, args: {} }]
  },

  accessLevel: {
    mandatory: true,
    validators: [{ fn: global_validators.nonEmpty, args: {} }],
    availableOptions: [
      { value: 'public', label: 'public' },
      { value: 'restricted public', label: 'restricted public' },
      { value: 'non-public', label: 'non-public' }
    ]
  },

  rights: {
    mandatory: false,
    validators: [
      {
        fn: global_validators.nonTrivialText,
        args: { minWords: 3, minCharsinWord: 3 }
      }
    ],
    availableOptions: rights
  },

  license: {
    mandatory: true,
    validators: [{ fn: global_validators.validUrl, args: {} }]
  },

  temporal: {
    mandatory: true,
    validators: [{ fn: global_validators.validRange, args: {} }]
  },

  issued: {
    mandatory: false,
    validators: [{ fn: global_validators.validDate, args: {} }]
  },

  language: {
    mandatory: false,
    validators: [{ fn: global_validators.mustSelectSomeTags, args: {} }],
    availableTags: languages
  },

  dataQuality: {
    mandatory: false,
    validators: [{ fn: global_validators.nonEmpty, args: { typ: Boolean } }]
  },

  accrualPeriodicity: {
    mandatory: false,
    validators: [
      {
        fn: global_validators.crossValidateModifiedAndAccrualPeriodicity,
        args: {}
      }
    ]
  },

  conformsTo: {
    mandatory: false,
    validators: [
      {
        fn: global_validators.validUrl,
        args: {}
      }
    ]
  },

  describedBy: {
    mandatory: false,
    validators: [
      {
        fn: global_validators.validUrl,
        args: {}
      }
    ]
  },

  describedByType: {
    mandatory: false,
    validators: [],
    availableOptions: mimeTypeOptions
  },

  landingPage: {
    mandatory: false,
    validators: [
      {
        fn: global_validators.validUrl,
        args: {}
      }
    ]
  },

  references: {
    mandatory: false,
    validators: [
      {
        fn: global_validators.validUrl,
        args: {}
      }
    ]
  },

  distribution: {
    mandatory: false,
    validators: [
      {
        fn: global_validators.passThruValidation,
        args: {}
      }
    ],

    title: {
      mandatory: false,
      validators: [
        {
          fn: global_validators.nonTrivialText,
          args: { minWords: 2, minCharsinWord: 3 }
        }
      ]
    },

    description: {
      mandatory: false,
      validators: []
    },

    url: {
      mandatory: true,
      validators: [
        {
          fn: global_validators.validUrl,
          args: {}
        }
      ]
    },

    mediaType: {
      mandatory: true,
      validators: [{ fn: global_validators.nonEmpty, args: {} }],
      availableOptions: mimeTypeOptions
    },

    format: {
      mandatory: false,
      validators: [],
      availableOptions: [
        { value: '', label: '' },
        { value: 'API', label: 'API' },
        { value: 'Other', label: 'Other' }
      ]
    },

    conformsTo: {
      mandatory: false,
      validators: [
        {
          fn: global_validators.validUrl,
          args: {}
        }
      ]
    },

    describedBy: {
      mandatory: false,
      validators: [
        {
          fn: global_validators.validUrl,
          args: {}
        }
      ]
    },

    describedByType: {
      mandatory: false,
      validators: [],
      availableOptions: mimeTypeOptions
    }
  },

  epa_agreement_no: {
    mandatory: true,
    validators: [{ fn: global_validators.nonEmpty, args: {} }],
    conditions: { isEpaUser: false }
  },

  epa_agreement_type: {
    mandatory: true,
    validators: [{ fn: global_validators.nonEmpty, args: {} }],
    availableOptions: [
      { value: 'Grant', label: 'Grant' },
      { value: 'Contract', label: 'Contract' },
      { value: 'Cooperative Agreement', label: 'Cooperative Agreement' },
      { value: 'Inter-Agency Agreement', label: 'Inter-Agency Agreement' },
      { value: 'Other', label: 'Other' }
    ],
    conditions: { isEpaUser: false }
  },

  epa_contact: {
    mandatory: true,
    validators: [{ fn: global_validators.validEmail, args: {} }],
    conditions: { isEpaUser: false }
  },

  programCode: {
    mandatory: true,
    validators: [{ fn: global_validators.mustSelectSomeTags, args: {} }],
    availableTags: programs,
    conditions: { isEpaUser: true }
  },

  systemofrecords: {
    mandatory: false,
    validators: [],
    availableOptions: sor,
    conditions: { isEpaUser: true }
  },

  primaryitinvestmentuii: {
    mandatory: false,
    validators: [],
    availableOptions: piti,
    conditions: { isEpaUser: true }
  }
}

export default config
