export default function HeaderBar() {
  return (
    <div className='flex w-full flex-grow items-center justify-between rounded-lg bg-white px-4 py-2 shadow-md'>
      <input
        placeholder='Space Title'
        className='w-96 text-xl font-bold text-ellipsis text-gray-800 placeholder:text-gray-500 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
      />
      <div className='flex gap-3'>
        <button className='rounded bg-emerald-500 px-4 py-3 text-white transition hover:bg-emerald-600'>
          Add Income
        </button>
        <button className='rounded bg-rose-500 px-4 py-3 text-white transition hover:bg-rose-600'>
          Add Expense
        </button>
      </div>
    </div>
  );
}
