import { CloudMoonIcon } from 'lucide-react';
import { useState } from 'react';
import Modal from './ui/Modal';

export default function DreamTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className='flex justify-center'>
        <button
          className='flex items-center py-1 opacity-80 hover:animate-pulse'
          onClick={() => setIsModalOpen(true)}
        >
          <CloudMoonIcon className='size-4' />
          <span className='text-sm'>The Dream</span>
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='A Realized Dream 🌙'
        centerTitle={true}
      >
        <div className='space-y-2 px-3'>
          <p className='text-center leading-snug text-pretty'>
            Until starting this project in 2025, I would draft up my budget in a
            Google Doc. Just a list of my monthly expenses, along with a few
            other important matters — you know, like saving goals. This worked
            for a while (literally since 2020), but it started to feel clunky.
            Too many sections, too many bullet points, too much scrolling. I
            wanted something more visual, more intuitive to understand and
            explore. And that became Akyl, a simple, yet powerful budgeting tool
            that helps you see the bigger picture.
          </p>
          <p className='text-right'>- Nova</p>
        </div>
      </Modal>
    </>
  );
}
