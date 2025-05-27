import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { CashFlowVerbiagePairs, formatCurrency } from '../../lib';
import { NODE_CORE_ID } from '../../lib/node.constants';
import { useSpace } from '../../store';

interface CoreNodeProps {
  id: string;
}

function CoreNode({ id }: CoreNodeProps) {
  const [cashFlowVerbiage, currency] = useSpace(
    useShallow((state) => [
      state?.space?.config?.cashFlowVerbiage,
      state?.space?.config?.currency,
    ]),
  );
  const { incomesTotal, expensesTotal } = useBudget();

  if (id !== NODE_CORE_ID || !cashFlowVerbiage || !currency) {
    return null;
  }

  const inflowLabel = CashFlowVerbiagePairs[cashFlowVerbiage].in;
  const outflowLabel = CashFlowVerbiagePairs[cashFlowVerbiage].out;

  return (
    <div className='bg-surface-light dark:bg-surface-dark border-node-border relative flex h-48 w-40 items-center justify-end rounded-full border shadow-md'>
      {/* Dashed Divider */}
      <div className='border-node-border/70 absolute top-1/2 right-2 left-2 z-0 -translate-y-[1px] border-t-2 border-dashed' />
      {/* Inflow Label (top half) */}
      <div className='absolute top-0 left-0 flex h-1/2 w-full translate-y-1 flex-col items-center justify-center'>
        <span className='text-xl font-bold'>{inflowLabel}</span>
        <span className='text-inflow font-semibold/80 text-xl'>
          {formatCurrency(incomesTotal, currency)}
        </span>
      </div>
      {/* Outflow Label (bottom half) */}
      <div className='absolute bottom-0 left-0 flex h-1/2 w-full -translate-y-1.5 flex-col items-center justify-center'>
        <span className='text-xl font-bold'>{outflowLabel}</span>
        <span className='text-outflow font-semibold/80 text-xl'>
          {formatCurrency(expensesTotal, currency)}
        </span>
      </div>

      {/* move handle inward for smoother edge animation */}
      <Handle
        type='target'
        position={Position.Top}
        className='invisible translate-y-3'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        className='invisible -translate-y-3'
      />
    </div>
  );
}

export default memo(CoreNode);
