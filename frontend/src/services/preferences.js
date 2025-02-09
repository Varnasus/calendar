const PREFERENCES_KEY = 'app_preferences';
const PREFERENCES_VERSION = 1; // Increment this when making breaking changes

const validatePreferences = (prefs) => {
  const validationRules = {
    theme: (value) => ['light', 'dark'].includes(value),
    filters: (value) => {
      return value && 
        Array.isArray(value.status) && 
        Array.isArray(value.campaign) && 
        Array.isArray(value.type);
    },
    navPanelOpen: (value) => typeof value === 'boolean',
    savedViews: (value) => Array.isArray(value) && value.every(view => (
      view.id && 
      typeof view.name === 'string' && 
      validatePreferences.filters(view.filters)
    )),
    activeView: (value) => typeof value === 'string',
    version: (value) => typeof value === 'number'
  };

  const isValid = Object.keys(validationRules).every(key => {
    if (!prefs[key]) return false;
    return validationRules[key](prefs[key]);
  });

  return isValid;
};

const migratePreferences = (oldPrefs) => {
  const currentVersion = oldPrefs.version || 0;
  let prefs = { ...oldPrefs };

  // Migration steps
  const migrations = [
    // Version 0 to 1
    (prefs) => {
      return {
        ...prefs,
        savedViews: [
          {
            id: 'default',
            name: 'All Items',
            filters: prefs.filters || defaultPreferences.filters
          }
        ],
        activeView: 'default',
        version: 1
      };
    }
    // Add more migrations here as needed
  ];

  // Apply needed migrations
  for (let v = currentVersion; v < PREFERENCES_VERSION; v++) {
    prefs = migrations[v](prefs);
  }

  return prefs;
};

const defaultPreferences = {
  theme: 'light',
  filters: {
    status: [],
    campaign: [],
    type: []
  },
  navPanelOpen: false,
  savedViews: [
    {
      id: 'default',
      name: 'All Items',
      filters: {
        status: [],
        campaign: [],
        type: []
      }
    }
  ],
  activeView: 'default',
  version: PREFERENCES_VERSION
};

export const loadPreferences = () => {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      let parsedPrefs = JSON.parse(saved);
      
      // Migrate old preferences if needed
      if (!parsedPrefs.version || parsedPrefs.version < PREFERENCES_VERSION) {
        parsedPrefs = migratePreferences(parsedPrefs);
        savePreferences(parsedPrefs);
      }

      // Validate preferences
      if (!validatePreferences(parsedPrefs)) {
        console.error('Invalid preferences found, resetting to defaults');
        return defaultPreferences;
      }

      return parsedPrefs;
    }
    return defaultPreferences;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return defaultPreferences;
  }
};

export const savePreferences = (preferences) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

export const updatePreference = (key, value) => {
  const preferences = loadPreferences();
  preferences[key] = value;
  savePreferences(preferences);
  return preferences;
}; 