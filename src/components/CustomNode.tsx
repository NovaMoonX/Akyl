import { Handle, Position } from '@xyflow/react';
import React, { memo } from 'react';

interface CustomNodeData {
  emoji: React.ReactNode;
  name: string;
  job: string;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

function CustomNode({ data }: CustomNodeProps) {
  return (
    <div className='bg-surface-light dark:bg-surface-dark rounded-md border-2 border-stone-400 px-4 py-2 shadow-md'>
      <div className='flex'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
          {data.emoji}
        </div>
        <div className='ml-2'>
          <div className='text-lg font-bold text-black'>{data.name}</div>
          <div className='text-gray-500'>{data.job}</div>
        </div>
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

export default memo(CustomNode);
