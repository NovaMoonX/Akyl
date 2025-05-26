import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { CashFlowVerbiagePairs } from '../../lib';
import { NODE_CORE_ID } from '../../lib/node.constants';
import { useSpace } from '../../store';

interface CoreNodeProps {
  id: string;
}

function CoreNode({ id }: CoreNodeProps) {
  const cashFlowVerbiage = useSpace(
    useShallow((state) => state?.space?.config?.cashFlowVerbiage),
  );

  if (id !== NODE_CORE_ID || !cashFlowVerbiage) {
    return null;
  }

  const inflowLabel = CashFlowVerbiagePairs[cashFlowVerbiage].in;
  const outflowLabel = CashFlowVerbiagePairs[cashFlowVerbiage].out;

  return (
    <div className='bg-surface-light dark:bg-surface-dark relative flex size-32 items-center justify-end rounded-full border-2 border-stone-400 shadow-md'>
      {/* Inflow Handle at the Top */}
      <Handle
        type='target'
        position={Position.Top}
        className='size-4 rounded-full !bg-teal-500'
      />
      {/* Outflow Handle at the Bottom */}
      <Handle
        type='source'
        position={Position.Bottom}
        className='size-4 rounded-full !bg-teal-500'
      />
      {/* Dashed Divider */}
      <div className='absolute top-1/2 right-2 left-2 z-0 -translate-y-[1px] border-t-2 border-dashed border-stone-400' />
      {/* Inflow Label (top half) */}
      <div className='absolute top-0 left-0 flex h-1/2 w-full items-center justify-center'>
        <span className='translate-y-1.5 text-lg font-bold'>{inflowLabel}</span>
      </div>
      {/* Outflow Label (bottom half) */}
      <div className='absolute bottom-0 left-0 flex h-1/2 w-full items-center justify-center'>
        <span className='-translate-y-1.5 text-lg font-bold'>
          {outflowLabel}
        </span>
      </div>
    </div>
  );
}

export default memo(CoreNode);
