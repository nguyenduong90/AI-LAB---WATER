

import React from 'react';
import { ActionType, LabState } from '../types';
import { FireIcon } from './icons/FireIcon';
import { IceIcon } from './icons/IceIcon';
import { SaltIcon } from './icons/SaltIcon';
import { DropIceIcon } from './icons/DropIceIcon';

interface ActionPanelProps {
  onAction: (action: ActionType) => void;
  labState: LabState;
  isLoading: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, labState, isLoading }) => {
  const actions = [
    { 
      type: ActionType.HEAT_WATER, 
      label: 'Đun nóng nước', 
      icon: <FireIcon />, 
      disabled: labState.isHeating || labState.isSaltInWater || labState.isIceInWater || isLoading,
      color: 'bg-red-500 hover:bg-red-600',
    },
     { 
      type: ActionType.DISSOLVE_SALT, 
      label: 'Thêm muối', 
      icon: <SaltIcon />,
      disabled: labState.isHeating || labState.isIceInWater || labState.saltLevel >= 10 || isLoading,
      color: 'bg-green-500 hover:bg-green-600',
    },
    { 
      type: ActionType.DROP_ICE_IN_WATER, 
      label: 'Thả đá vào nước nóng', 
      icon: <DropIceIcon />,
      disabled: !labState.isHeating || labState.isIceInWater || isLoading,
      color: 'bg-teal-500 hover:bg-teal-600',
    },
    { 
      type: ActionType.ADD_ICE, 
      label: 'Đặt đá lên nắp', 
      icon: <IceIcon />,
      disabled: !labState.showVapor || labState.isIceOnLid || isLoading,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
  ];

  return (
    <div className="p-4 border-t-2 border-blue-200/50">
      <h3 className="text-lg font-bold text-center mb-4 text-blue-800">Chọn hành động</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ type, label, icon, disabled, color }) => (
          <button
            key={type}
            onClick={() => onAction(type)}
            disabled={disabled}
            className={`flex flex-col sm:flex-row items-center justify-center p-3 rounded-xl text-white font-semibold shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
              ${color}
              ${disabled ? 'opacity-50 cursor-not-allowed scale-100' : ''}
            `}
          >
            <span className="w-6 h-6 mb-1 sm:mb-0 sm:mr-2">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
