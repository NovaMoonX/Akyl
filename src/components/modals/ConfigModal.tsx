import { BackgroundVariant } from '@xyflow/react';
import {
  CashFlowVerbiagePairs,
  NO_BACKGROUND_VARIANT,
  type CashFlowVerbiage,
  type Config,
} from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';
import Modal from '../ui/Modal';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const backgroundOptions = [
  { label: 'None', value: NO_BACKGROUND_VARIANT },
  { label: 'Cross', value: BackgroundVariant.Cross },
  { label: 'Dots', value: BackgroundVariant.Dots },
  { label: 'Lines', value: BackgroundVariant.Lines },
];

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
];

const periodConversionOptions = [
  { 
    label: 'Exact Ratios', 
    value: 'exact',
    description: 'Uses 4 weeks/month, 52 weeks/year, 12 months/year. Example: $100/week = $400/month',
  },
  { 
    label: 'Day-Based', 
    value: 'day-based',
    description: 'Uses days as intermediate (30 days/month, 365 days/year). Example: $100/week = $428.57/month',
  },
];

export default function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { space, updateConfig } = useSpace();
  const config = space.config;

  if (!config) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Space Configurations'>
      <div className='flex flex-col gap-4'>
        {/* Background Pattern */}
        <div>
          <label className='font-medium'>Background Pattern</label>
          <div className='mt-1 flex gap-2'>
            {backgroundOptions.map((opt) => (
              <button
                key={opt.value}
                className={join(
                  'btn btn-sm',
                  config.backgroundPattern === opt.value
                    ? 'btn-primary'
                    : 'btn-secondary',
                )}
                onClick={() =>
                  updateConfig({
                    backgroundPattern: opt.value as Config['backgroundPattern'],
                  })
                }
                type='button'
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {/* Currency */}
        <div>
          <label className='font-medium'>Currency</label>
          <div className='mt-1 flex gap-2'>
            {currencyOptions.map((opt) => (
              <button
                key={opt.value}
                className={join(
                  'btn btn-sm',
                  config.currency === opt.value
                    ? 'btn-primary'
                    : 'btn-secondary',
                )}
                onClick={() =>
                  updateConfig({ currency: opt.value as Config['currency'] })
                }
                type='button'
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {/* Cash Flow Verbiage */}
        <div>
          <label className='font-medium'>Cash Flow Verbiage</label>
          <div className='mt-1 flex flex-wrap gap-2'>
            {(Object.keys(CashFlowVerbiagePairs) as CashFlowVerbiage[]).map(
              (key) => (
                <button
                  key={key}
                  className={join(
                    'btn btn-sm capitalize',
                    config.cashFlowVerbiage === key
                      ? 'btn-primary'
                      : 'btn-secondary',
                  )}
                  onClick={() => updateConfig({ cashFlowVerbiage: key })}
                  type='button'
                >
                  {CashFlowVerbiagePairs[key].in} /{' '}
                  {CashFlowVerbiagePairs[key].out}
                </button>
              ),
            )}
          </div>
        </div>
        {/* Period Conversion Method */}
        <div>
          <label className='font-medium'>Period Conversion Method</label>
          <div className='mt-1 flex flex-col gap-2'>
            {periodConversionOptions.map((opt) => (
              <button
                key={opt.value}
                className={join(
                  'btn btn-sm text-left flex flex-col items-start gap-1 h-auto py-2',
                  (config.periodConversionMethod || 'exact') === opt.value
                    ? 'btn-primary'
                    : 'btn-secondary',
                )}
                onClick={() =>
                  updateConfig({
                    periodConversionMethod: opt.value as 'exact' | 'day-based',
                  })
                }
                type='button'
              >
                <span className='font-semibold'>{opt.label}</span>
                <span className='text-xs opacity-80'>{opt.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div className='flex justify-end'>
          <button onClick={onClose} className='btn btn-secondary'>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
