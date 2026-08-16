export type SettingsSelectItem = {
  type: 'select';
  id: string;
  title: string;
  selected: boolean;
  onPress: () => void;
};

export type SettingsSwitchItem = {
  type: 'switch';
  id: string;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export type SettingsItem = SettingsSelectItem | SettingsSwitchItem;

export type SettingsSection = {
  id: string;
  title: string;
  description?: string;
  defaultExpanded?: boolean;
  visible?: boolean;
  items: SettingsItem[];
};
