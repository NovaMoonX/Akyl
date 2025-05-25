import { Handle, Position } from '@xyflow/react';
import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { CashFlowVerbiagePairs } from '../../lib';
import { NODE_IN_ID, NODE_OUT_ID } from '../../lib/node.constants';
import { useSpace } from '../../store';

interface L1NodeProps {
  id: string;
}

function L1Node({ id }: L1NodeProps) {
  const cashFlowVerbiage = useSpace(
    useShallow((state) => state.space.config.cashFlowVerbiage),
  );
  const label = useMemo(() => {
    if (id === NODE_IN_ID) {
      return CashFlowVerbiagePairs[cashFlowVerbiage].in;
    }
    return CashFlowVerbiagePairs[cashFlowVerbiage].out;
  }, [id, cashFlowVerbiage]);

  if (id !== NODE_IN_ID && id !== NODE_OUT_ID) {
    return null;
  }

  return (
    <div className='bg-surface-light dark:bg-surface-dark rounded-md border-2 border-stone-400 px-4 py-2 shadow-md'>
      <div className='flex'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
          {label}
        </div>
        {/* <div className='ml-2'>
          <div className='text-lg font-bold text-black'>{data.name}</div>
          <div className='text-gray-500'>{data.job}</div>
        </div> */}
      </div>

      <Handle
        type='target'
        position={Position.Top}
        className='w-16 !bg-teal-500'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-16 !bg-teal-500'
      />
    </div>
  );
}

export default memo(L1Node);
