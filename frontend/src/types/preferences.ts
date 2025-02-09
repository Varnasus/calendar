export interface Preferences {
  theme: 'light' | 'dark';
  filters: {
    status: string[];
    campaign: string[];
    type: string[];
  };
  navPanelOpen: boolean;
} 