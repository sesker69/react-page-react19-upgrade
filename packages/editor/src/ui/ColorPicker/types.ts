import type React from 'react';
import { RGBColor } from 'react-color';

export interface ColorPickerProps {
  onChange: (color: RGBColor) => void;
  onChangeComplete: (color: RGBColor) => void;
  color?: RGBColor | null;
  buttonContent?: React.ReactElement | string;
  icon?: React.ReactElement | string;
  onDialogOpen?: () => void;
  style?: React.CSSProperties;
}

export { RGBColor };
