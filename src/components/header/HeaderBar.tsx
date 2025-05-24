export default function HeaderBar() {
  return (
    <div className='bg-surface-light dark:bg-surface-dark flex w-full flex-grow items-center justify-between rounded-lg px-4 py-2.5 shadow-md'>
      <input
        placeholder='Space Title'
        className='w-96 text-xl font-bold text-ellipsis text-gray-800 placeholder:text-gray-500 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
      />
      <div className='flex gap-3'>
        <button className='text-surface-light rounded border border-transparent px-4 py-2.5 transition not-dark:bg-emerald-500 not-dark:hover:bg-emerald-600 dark:text-emerald-600 hover:dark:border-emerald-600'>
          Add Income
        </button>
        <button className='text-surface-light rounded border border-transparent px-4 py-2.5 transition not-dark:bg-rose-500 not-dark:hover:bg-rose-600 dark:text-rose-600 hover:dark:border-rose-600'>
          Add Expense
        </button>
      </div>
    </div>
  );
}
