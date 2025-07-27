import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import ColorizeIcon from '@mui/icons-material/Colorize';
import React, { useState, useRef, useCallback } from 'react';
import type { ColorChangeHandler } from 'react-color';
import { ChromePicker } from 'react-color';
import { colorToString } from './colorToString';
import type { ColorPickerProps } from './types';

const ColorPicker: React.FC<ColorPickerProps> = ({
  buttonContent = 'Change color',
  icon = <ColorizeIcon style={{ marginLeft: '4px', fontSize: '19px' }} />,
  onChange,
  onChangeComplete,
  onDialogOpen,
  color,
  style,
  ...props
}) => {
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const anchorElRef = useRef<HTMLButtonElement>(null);

  const handleClickShowColorPicker = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (onDialogOpen) {
        onDialogOpen();
      }
      setIsColorPickerVisible((prev) => !prev);
    },
    [onDialogOpen]
  );

  const handleChange: ColorChangeHandler = useCallback(
    (e) => {
      onChange?.(e.rgb);
    },
    [onChange]
  );

  const handleChangeComplete: ColorChangeHandler = useCallback(
    (e) => {
      onChangeComplete?.(e.rgb);
    },
    [onChangeComplete]
  );

  return (
    <>
      <Button
        ref={anchorElRef}
        variant="contained"
        onClick={handleClickShowColorPicker}
        style={{
          ...style,
          borderColor: colorToString(color),
          borderStyle: 'solid',
          borderWidth: '2px',
        }}
        {...props}
      >
        {buttonContent as React.ReactNode}
        {icon as React.ReactNode}
      </Button>
      <Popover
        open={isColorPickerVisible}
        anchorEl={anchorElRef.current}
        onClose={handleClickShowColorPicker}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <div>
          <ChromePicker
            color={color ?? undefined}
            onChange={handleChange}
            onChangeComplete={handleChangeComplete}
          />
        </div>
      </Popover>
    </>
  );
};

export default ColorPicker;
