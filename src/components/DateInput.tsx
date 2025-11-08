import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Box, Input, useTheme } from 'native-base';

export interface DateInputProps {
  label?: string;
  value?: string;
  mode?: 'date' | 'time' | 'datetime';
  displayFormat?: (date: Date) => string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
  isInvalid?: boolean;
}

const defaultFormat = (date: Date) =>
  date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export default function DateInput({
  value,
  mode = 'date',
  displayFormat = defaultFormat,
  placeholder,
  minimumDate,
  maximumDate,
  onChange,
  isInvalid,
}: DateInputProps) {
  const theme = useTheme();

  const currentDate = value ? new Date(value) : undefined;

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  if (Platform.OS === ('web' as typeof Platform.OS)) {
    const htmlType =
      mode === 'time' ? 'time' : mode === 'datetime' ? 'datetime-local' : 'date';

    const formatForWeb = (date: Date) => {
      if (mode === 'time') {
        return date.toISOString().slice(11, 16);
      }
      if (mode === 'datetime') {
        return date.toISOString().slice(0, 16);
      }
      return date.toISOString().slice(0, 10);
    };

    const parseWebValue = (text: string) => {
      if (!text) return;
      if (mode === 'time') {
        const [hours, minutes] = text.split(':').map(Number);
        const base = currentDate ?? new Date();
        base.setHours(hours);
        base.setMinutes(minutes);
        base.setSeconds(0);
        onChange(new Date(base));
      } else if (mode === 'datetime') {
        onChange(new Date(text));
      } else {
        onChange(new Date(`${text}T00:00:00`));
      }
    };

    return (
      <input
        type={htmlType}
        value={currentDate ? formatForWeb(currentDate) : ''}
        placeholder={placeholder}
        onChange={(event) => parseWebValue(event.target.value)}
        style={{
          width: '100%',
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: isInvalid ? '#ef4444' : '#e5e7eb',
          padding: '11px 16px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          outline: 'none',
          fontSize: 14,
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
    );
  }

  const showPicker = () => {
    if (Platform.OS === 'android') {
      if (mode === 'datetime') {
        DateTimePickerAndroid.open({
          value: currentDate ?? new Date(),
          mode: 'date',
          minimumDate,
          maximumDate,
          onChange: (event, selectedDate) => {
            if (selectedDate) {
              DateTimePickerAndroid.open({
                value: selectedDate,
                mode: 'time',
                onChange: (_timeEvent, timeDate) => {
                  if (timeDate) {
                    const combined = new Date(selectedDate);
                    combined.setHours(timeDate.getHours());
                    combined.setMinutes(timeDate.getMinutes());
                    combined.setSeconds(timeDate.getSeconds());
                    onChange(combined);
                  }
                },
              });
            }
          },
        });
      } else {
        DateTimePickerAndroid.open({
          value: currentDate ?? new Date(),
          mode,
          minimumDate,
          maximumDate,
          onChange: handleChange,
        });
      }
    }
  };

  const inputValue = currentDate ? displayFormat(currentDate) : '';

  if (Platform.OS === 'ios') {
    return (
      <Box borderWidth={1} borderColor={isInvalid ? 'error.500' : 'neutral.200'} borderRadius="xl">
        <DateTimePicker
          value={currentDate ?? new Date()}
          mode={mode}
          display={mode === 'date' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
          style={{
            width: '100%',
            paddingVertical: 8,
          }}
        />
      </Box>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={showPicker}>
      <Input
        pointerEvents="none"
        value={inputValue}
        placeholder={placeholder}
        isInvalid={isInvalid}
        editable={false}
        bg="white"
        borderColor={isInvalid ? 'error.500' : 'neutral.200'}
        _focus={{
          borderColor: isInvalid ? 'error.500' : theme.colors.primary?.[600],
        }}
      />
      {Platform.OS === 'web' && (
        <DateTimePicker
          value={currentDate ?? new Date()}
          mode={mode}
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      )}
    </TouchableOpacity>
  );
}

