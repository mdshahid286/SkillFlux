import React, { useState, useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';

export const InputGroupWrapper = ({ label, className = '', children }) => (
  <label className={`text-base font-medium text-gray-700 ${className}`}>
    {label}
    {children}
  </label>
);

export const INPUT_CLASS_NAME =
  'mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 text-gray-900 shadow-sm outline-none font-normal text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all';

export const Input = ({
  name,
  value = '',
  placeholder,
  onChange,
  label,
  labelClassName = ''
}) => {
  return (
    <InputGroupWrapper label={label} className={labelClassName}>
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={INPUT_CLASS_NAME}
      />
    </InputGroupWrapper>
  );
};

export const Textarea = ({
  label,
  labelClassName = '',
  name,
  value = '',
  placeholder,
  onChange
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <InputGroupWrapper label={label} className={labelClassName}>
      <textarea
        ref={textareaRef}
        name={name}
        className={`${INPUT_CLASS_NAME} resize-none overflow-hidden`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </InputGroupWrapper>
  );
};

export const BulletListTextarea = ({
  label,
  labelClassName = '',
  name,
  value = [],
  placeholder,
  onChange,
  showBulletPoints = true
}) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari =
      navigator.userAgent.includes('Safari') &&
      !navigator.userAgent.includes('Chrome');
    if (isFirefox || isSafari) {
      setShowFallback(true);
    }
  }, []);

  if (showFallback) {
    return <BulletListTextareaFallback
      label={label}
      labelClassName={labelClassName}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      showBulletPoints={showBulletPoints}
    />;
  }

  return <BulletListTextareaGeneral
    label={label}
    labelClassName={labelClassName}
    name={name}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    showBulletPoints={showBulletPoints}
  />;
};

const BulletListTextareaGeneral = ({
  label,
  labelClassName = '',
  name,
  value = [],
  placeholder,
  onChange,
  showBulletPoints = true
}) => {
  const html = getHTMLFromBulletListStrings(value);

  return (
    <InputGroupWrapper label={label} className={labelClassName}>
      <ContentEditable
        contentEditable={true}
        className={`${INPUT_CLASS_NAME} cursor-text [&>div]:list-item ${
          showBulletPoints ? 'pl-7' : '[&>div]:list-[\'\']'
        }`}
        placeholder={placeholder}
        onChange={(e) => {
          if (e.type === 'input') {
            const { innerText } = e.currentTarget;
            const newBulletListStrings = getBulletListStringsFromInnerText(innerText);
            onChange(name, newBulletListStrings);
          }
        }}
        html={html}
      />
    </InputGroupWrapper>
  );
};

const NORMALIZED_LINE_BREAK = '\n';

const normalizeLineBreak = (str) => str.replace(/\r?\n/g, NORMALIZED_LINE_BREAK);
const dedupeLineBreak = (str) => str.replace(/\n\n/g, NORMALIZED_LINE_BREAK);
const getStringsByLineBreak = (str) => str.split(NORMALIZED_LINE_BREAK);

const getBulletListStringsFromInnerText = (innerText) => {
  const innerTextWithNormalizedLineBreak = normalizeLineBreak(innerText);
  let newInnerText = dedupeLineBreak(innerTextWithNormalizedLineBreak);

  if (newInnerText === NORMALIZED_LINE_BREAK) {
    newInnerText = '';
  }

  return getStringsByLineBreak(newInnerText);
};

const getHTMLFromBulletListStrings = (bulletListStrings) => {
  if (bulletListStrings.length === 0) {
    return '<div></div>';
  }

  return bulletListStrings.map((text) => `<div>${text}</div>`).join('');
};

const BulletListTextareaFallback = ({
  label,
  labelClassName,
  name,
  value = [],
  placeholder,
  onChange,
  showBulletPoints = true
}) => {
  const textareaValue = getTextareaValueFromBulletListStrings(value, showBulletPoints);

  return (
    <Textarea
      label={label}
      labelClassName={labelClassName}
      name={name}
      value={textareaValue}
      placeholder={placeholder}
      onChange={(name, val) => {
        onChange(name, getBulletListStringsFromTextareaValue(val, showBulletPoints));
      }}
    />
  );
};

const getTextareaValueFromBulletListStrings = (bulletListStrings, showBulletPoints) => {
  const prefix = showBulletPoints ? '• ' : '';

  if (bulletListStrings.length === 0) {
    return prefix;
  }

  let value = '';
  for (let i = 0; i < bulletListStrings.length; i++) {
    const string = bulletListStrings[i];
    const isLastItem = i === bulletListStrings.length - 1;
    value += `${prefix}${string}${isLastItem ? '' : '\r\n'}`;
  }
  return value;
};

const getBulletListStringsFromTextareaValue = (textareaValue, showBulletPoints) => {
  const textareaValueWithNormalizedLineBreak = normalizeLineBreak(textareaValue);
  const strings = getStringsByLineBreak(textareaValueWithNormalizedLineBreak);

  if (showBulletPoints) {
    const nonEmptyStrings = strings.filter((s) => s !== '•');

    let newStrings = [];
    for (let string of nonEmptyStrings) {
      if (string.startsWith('• ')) {
        newStrings.push(string.slice(2));
      } else if (string.startsWith('•')) {
        const lastItemIdx = newStrings.length - 1;
        if (lastItemIdx >= 0) {
          const lastItem = newStrings[lastItemIdx];
          newStrings[lastItemIdx] = `${lastItem}${string.slice(1)}`;
        } else {
          newStrings.push(string.slice(1));
        }
      } else {
        newStrings.push(string);
      }
    }
    return newStrings;
  }

  return strings;
};

