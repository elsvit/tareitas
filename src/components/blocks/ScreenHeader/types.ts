import { SvgProps } from 'react-native-svg';
import { ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';

export interface IIconButton {
  icon?: React.FC<SvgProps>;
  imageSource?: ImageSourcePropType;
  onPress: () => void;
}

export interface IScreenHeader {
  title?: string;
  hasBackButton?: boolean;
  onBackPress?: () => void;
  leftButton?: IIconButton;
  rightButtons?: IIconButton[];
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}
