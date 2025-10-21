import React from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export const ShowIconButton = ({ show, setShow }) => {
  const Icon = show ? EyeIcon : EyeSlashIcon;
  return (
    <button
      type="button"
      onClick={() => setShow(!show)}
      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      title={show ? 'Hide section' : 'Show section'}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
};

export const MoveIconButton = ({ type, onClick, size = 'default' }) => {
  const Icon = type === 'up' ? ChevronUpIcon : ChevronDownIcon;
  const sizeClass = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';
  const paddingClass = size === 'small' ? 'p-1' : 'p-1.5';

  return (
    <button
      type="button"
      onClick={() => onClick(type)}
      className={`rounded ${paddingClass} text-gray-400 hover:bg-gray-100 hover:text-gray-600`}
      title={`Move ${type}`}
    >
      <Icon className={sizeClass} />
    </button>
  );
};

export const DeleteIconButton = ({ onClick, tooltipText }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
      title={tooltipText}
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
};

export const BulletListIconButton = ({ showBulletPoints, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(!showBulletPoints)}
      className="rounded p-1.5 text-sm text-gray-500 hover:bg-gray-100"
      title={showBulletPoints ? 'Hide bullet points' : 'Show bullet points'}
    >
      {showBulletPoints ? '• List' : 'Plain'}
    </button>
  );
};

