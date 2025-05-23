export default function Header() {
  return (
    <header className='bg-white shadow-md px-4 py-3 m-4 flex items-center justify-between rounded-lg absolute top-0 left-0 right-0 z-10'>
      <input placeholder='Space Title' className='text-xl font-bold text-gray-800 placeholder:text-gray-500 focus:outline-none'/>
      <div className='flex gap-3'>
        <button className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition'>Add Income</button>
        <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'>Add Expense</button>
        <button className='bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition'>Load</button>
        <button className='bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition'>Download File</button>
        <button className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition'>
          Upload File
        </button>
      </div>
    </header>
  );
}
