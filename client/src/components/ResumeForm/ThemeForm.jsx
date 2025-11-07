import React from 'react';
import { BaseForm } from './Form';
import { InputGroupWrapper } from './Form/InputGroup';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import {
  changeSettings,
  selectSettings
} from '../../redux/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

const THEME_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b', // Slate
  '#000000'  // Black
];

const FONT_FAMILIES = [
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times' },
  { name: 'Calibri', value: 'Calibri' }
];

const FONT_SIZES = ['9', '10', '11', '12', '13', '14'];
const DOCUMENT_SIZES = [
  { label: 'Letter', value: 'LETTER' },
  { label: 'A4', value: 'A4' }
];

export const ThemeForm = () => {
  const settings = useAppSelector(selectSettings);
  const { fontSize, fontFamily, documentSize } = settings;
  // const themeColor = settings.themeColor || DEFAULT_THEME_COLOR; // Unused
  const dispatch = useAppDispatch();

  const handleSettingsChange = (field, value) => {
    dispatch(changeSettings({ field, value }));
  };

  return (
    <BaseForm>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Cog6ToothIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold tracking-wide text-gray-900">
            Resume Setting
          </h1>
        </div>

        {/* Theme Color */}
        <div>
          <InputGroupWrapper label="Theme Color" />
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_COLORS.map((color, idx) => (
              <div
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-sm text-white transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                key={idx}
                onClick={() => handleSettingsChange('themeColor', color)}
                tabIndex={0}
                role="button"
              >
                {settings.themeColor === color ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <InputGroupWrapper label="Font Family" />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.value}
                type="button"
                onClick={() => handleSettingsChange('fontFamily', font.value)}
                className={`rounded-md border px-3 py-2 text-sm transition-all ${
                  fontFamily === font.value
                    ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <InputGroupWrapper label="Font Size (pt)" />
          <div className="mt-2 grid grid-cols-6 gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSettingsChange('fontSize', size)}
                className={`rounded-md border px-3 py-2 text-sm transition-all ${
                  fontSize === size
                    ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Document Size */}
        <div>
          <InputGroupWrapper label="Document Size" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            {DOCUMENT_SIZES.map((doc) => (
              <button
                key={doc.value}
                type="button"
                onClick={() => handleSettingsChange('documentSize', doc.value)}
                className={`rounded-md border px-3 py-2 text-sm transition-all ${
                  documentSize === doc.value
                    ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {doc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BaseForm>
  );
};

