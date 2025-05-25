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
        <div className='flex justify-end'>
          <button onClick={onClose} className='btn btn-secondary'>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
