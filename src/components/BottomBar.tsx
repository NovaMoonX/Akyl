import { PlusIcon, Settings2Icon, CheckSquareIcon } from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';
import { generateId, join } from '../utils';
import BulkSheetEditor from './BulkSheetEditor';
import HeaderBarSheets from './header/HeaderBarSheets';
import Modal from './ui/Modal';
import BottomActions from './BottomActions';
import HeaderBarTimeWindow from './header/HeaderBarTimeWindow';

export default function BottomBar() {
  const [sheets, activeSheet, setActiveSheet, addSheet, updateSheet, removeSheet] = useSpace(
    useShallow((state) => [
      state?.space?.sheets,
      state?.space?.config?.activeSheet || 'all',
      state.setActiveSheet,
      state.addSheet,
      state.updateSheet,
      state.removeSheet,
    ]),
  );
  const [selectedBudgetItems, clearBudgetItemSelection] = useSpace(
    useShallow((state) => [
      state.selectedBudgetItems,
      state.clearBudgetItemSelection,
    ]),
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddSheetModalOpen, setIsAddSheetModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editingSheetName, setEditingSheetName] = useState('');
  const [deleteConfirmSheetId, setDeleteConfirmSheetId] = useState<string | null>(null);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  const isBulkSelecting = selectedBudgetItems.length > 0;

  const handleAddSheet = () => {
    if (newSheetName.trim()) {
      const newSheet = {
        id: generateId('sheet'),
        name: newSheetName.trim(),
      };
      addSheet(newSheet);
      setNewSheetName('');
      setIsAddSheetModalOpen(false);
    }
  };

  const handleRenameSheet = (sheetId: string) => {
    if (editingSheetName.trim()) {
      updateSheet(sheetId, { name: editingSheetName.trim() });
      setEditingSheetId(null);
      setEditingSheetName('');
    }
  };

  const handleDeleteSheet = (sheetId: string) => {
    removeSheet(sheetId);
    setDeleteConfirmSheetId(null);
  };

  const handleToggleBulkEdit = () => {
    if (isBulkEditMode) {
      // Exit bulk edit mode
      clearBudgetItemSelection();
      setIsBulkEditMode(false);
    } else {
      // Enter bulk edit mode
      setIsBulkEditMode(true);
    }
  };

  if (isBulkSelecting) {
    return <BulkSheetEditor />;
  }

  return (
    <>
      <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-surface-light dark:bg-surface-dark rounded-full shadow-lg px-4 py-2 border border-gray-300 dark:border-gray-700'>
        <div className='flex items-center gap-3'>
          {/* Desktop: Button-based sheet selector */}
          <div className='hidden sm:block'>
            <HeaderBarSheets />
          </div>
          
          {/* Mobile: Select-based sheet selector */}
          <div className='sm:hidden flex items-center gap-2'>
            <select
              value={activeSheet}
              onChange={(e) => setActiveSheet(e.target.value)}
              className='px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-emerald-500 focus:outline-none max-w-36 text-ellipsis'
            >
              <option value='all'>All</option>
              {sheets && sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleToggleBulkEdit}
              className={join(
                'p-1 rounded transition-colors',
                isBulkEditMode || isBulkSelecting
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              aria-label={isBulkEditMode ? 'Exit bulk edit mode' : 'Enter bulk edit mode'}
            >
              <CheckSquareIcon className='size-4' />
            </button>
          </div>

          <div className='h-6 w-px bg-gray-300 dark:bg-gray-700' />
          
          {/* Desktop: Custom Popup */}
          <div className='hidden sm:block relative'>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              aria-label='Settings'
              id='settings-btn'
            >
              <Settings2Icon className='size-5' />
            </button>
            {isDropdownOpen && (
              <div
                className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg p-6 w-80'
                style={{ minWidth: '18rem' }}
                tabIndex={-1}
                onBlur={(e) => {
                  // Only close if focus leaves the popup and not to a child element
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsDropdownOpen(false);
                  }
                }}
              >
                <div className='flex flex-col gap-6'>
                  <div className='flex flex-col items-center'>
                    <span className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Budget Time Window
                    </span>
                    <HeaderBarTimeWindow />
                  </div>
                  <div className='flex flex-col items-center'>
                    <span className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Display Options
                    </span>
                    <BottomActions className='' actionClassName='rounded-md' />
                  </div>
                  <div>
                    <span className='mb-2 block text-sm text-center font-medium text-gray-700 dark:text-gray-200'>
                      Manage Sheets
                    </span>
                    <div className='flex flex-col gap-2'>
                      {sheets && sheets.map((sheet) => (
                        <div key={sheet.id} className='flex items-center gap-2'>
                          {editingSheetId === sheet.id ? (
                            <>
                              <input
                                type='text'
                                value={editingSheetName}
                                onChange={(e) => setEditingSheetName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameSheet(sheet.id);
                                  if (e.key === 'Escape') {
                                    setEditingSheetId(null);
                                    setEditingSheetName('');
                                  }
                                }}
                                className='flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:outline-none'
                                autoFocus
                              />
                              <button
                                onClick={() => handleRenameSheet(sheet.id)}
                                className='px-2 py-1 text-xs rounded bg-emerald-500 text-white hover:bg-emerald-600'
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <>
                              <span className='flex-1 text-sm'>{sheet.name}</span>
                              <button
                                onClick={() => {
                                  setEditingSheetId(sheet.id);
                                  setEditingSheetName(sheet.name);
                                }}
                                className='px-2 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600'
                              >
                                Rename
                              </button>
                              <button
                                onClick={() => setDeleteConfirmSheetId(sheet.id)}
                                className='px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600'
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className='absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  aria-label='Close popup'
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Mobile: Modal */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className='sm:hidden p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            aria-label='Settings'
          >
            <Settings2Icon className='size-5' />
          </button>
        </div>
      </div>

      {/* Mobile Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title='Settings'
        centerTitle={true}
      >
        <div className='flex flex-col items-center gap-4 pb-2'>
          <div>
            <span className='mb-1 block text-center font-medium text-gray-700 dark:text-gray-200'>
              Budget Time Window
            </span>
            <HeaderBarTimeWindow />
          </div>

          <div>
            <span className='mb-1 block text-center font-medium text-gray-700 dark:text-gray-200'>
              Display Options
            </span>
            <BottomActions className='' actionClassName='rounded-md' />
          </div>

          <div className='w-full'>
            <div className='flex items-center justify-between mb-2'>
              <span className='block text-center font-medium text-gray-700 dark:text-gray-200'>
                Manage Sheets
              </span>
              <button
                onClick={() => setIsAddSheetModalOpen(true)}
                className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
                aria-label='Add new sheet'
              >
                <PlusIcon className='size-4' />
              </button>
            </div>
            <div className='flex flex-col gap-2'>
              {sheets && sheets.map((sheet) => (
                <div key={sheet.id} className='flex items-center gap-2'>
                  {editingSheetId === sheet.id ? (
                    <>
                      <input
                        type='text'
                        value={editingSheetName}
                        onChange={(e) => setEditingSheetName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSheet(sheet.id);
                          if (e.key === 'Escape') {
                            setEditingSheetId(null);
                            setEditingSheetName('');
                          }
                        }}
                        className='flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:outline-none'
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameSheet(sheet.id)}
                        className='px-2 py-1 text-xs rounded bg-emerald-500 text-white hover:bg-emerald-600'
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span className='flex-1 text-sm'>{sheet.name}</span>
                      <button
                        onClick={() => {
                          setEditingSheetId(sheet.id);
                          setEditingSheetName(sheet.name);
                        }}
                        className='px-2 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600'
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmSheetId(sheet.id);
                          setIsSettingsModalOpen(false);
                        }}
                        className='px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600'
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Mobile Add Sheet Modal */}
      <Modal
        isOpen={isAddSheetModalOpen}
        onClose={() => {
          setIsAddSheetModalOpen(false);
          setNewSheetName('');
        }}
        title='Add New Sheet'
        centerTitle={true}
      >
        <div className='flex flex-col gap-4 pb-2'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>
              Sheet Name
            </label>
            <input
              type='text'
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSheet();
              }}
              placeholder='Enter sheet name'
              className='w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:outline-none'
              autoFocus
            />
          </div>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => {
                setIsAddSheetModalOpen(false);
                setNewSheetName('');
              }}
              className='px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              onClick={handleAddSheet}
              disabled={!newSheetName.trim()}
              className='px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Add Sheet
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmSheetId !== null}
        onClose={() => setDeleteConfirmSheetId(null)}
        title='Confirm Deletion'
        centerTitle={true}
      >
        <div className='flex flex-col gap-4 pb-2'>
          <p className='text-center text-gray-700 dark:text-gray-200'>
            Are you sure you want to delete this sheet? This will remove the sheet from all budget items.
          </p>
          <div className='flex justify-center gap-2'>
            <button
              onClick={() => setDeleteConfirmSheetId(null)}
              className='px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmSheetId && handleDeleteSheet(deleteConfirmSheetId)}
              className='px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600'
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
