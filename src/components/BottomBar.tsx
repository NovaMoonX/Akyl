import {
  PlusIcon,
  Settings2Icon,
  XIcon,
  ArrowRightIcon,
  CalculatorIcon,
  TableIcon,
  WorkflowIcon,
  PinIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';
import { generateId, join } from '../utils';
import BulkSheetEditor from './BulkSheetEditor';
import HeaderBarSheets from './header/HeaderBarSheets';
import Modal from './ui/Modal';
import BottomActions from './BottomActions';
import HeaderBarTimeWindow from './header/HeaderBarTimeWindow';
import CalculatorModal from './modals/CalculatorModal';
import SidebarActions from './SidebarActions';

export default function BottomBar() {
  const [
    sheets,
    activeSheet,
    setActiveSheet,
    addSheet,
    updateSheet,
    removeSheet,
    description,
    pinned,
  ] = useSpace(
    useShallow((state) => [
      state?.space?.sheets,
      state?.space?.config?.activeSheet || 'all',
      state.setActiveSheet,
      state.addSheet,
      state.updateSheet,
      state.removeSheet,
      state.space?.description,
      state.space?.pinned,
    ]),
  );
  const { updateSpace } = useSpace();
  const [
    selectedBudgetItems,
    isBulkEditMode,
    setIsBulkEditMode,
    clearBudgetItemSelection,
  ] = useSpace(
    useShallow((state) => [
      state.selectedBudgetItems,
      state.isBulkEditMode,
      state.setIsBulkEditMode,
      state.clearBudgetItemSelection,
    ]),
  );
  const [viewMode, setViewMode] = useSpace(
    useShallow((state) => [state.viewMode, state.setViewMode]),
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddSheetModalOpen, setIsAddSheetModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editingSheetName, setEditingSheetName] = useState('');
  const [deleteConfirmSheetId, setDeleteConfirmSheetId] = useState<
    string | null
  >(null);

  // Quick bar state for "Added to sheet" prompt
  const [quickSheet, setQuickSheet] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const quickTimerRef = useRef<number | null>(null);

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

  const handleEndBulkEdit = () => {
    clearBudgetItemSelection();
    setIsBulkEditMode(false);
  };

  const handleToggleBulkEdit = () => {
    if (isBulkEditMode) {
      // Exit bulk edit mode
      handleEndBulkEdit();
    } else {
      // Enter bulk edit mode
      setIsBulkEditMode(true);
    }
  };

  const handleAddedToSheet = (sheet: { id: string; name: string }) => {
    setQuickSheet(sheet);
    if (quickTimerRef.current) {
      window.clearTimeout(quickTimerRef.current);
    }
    quickTimerRef.current = window.setTimeout(() => {
      setQuickSheet(null);
      quickTimerRef.current = null;
    }, 5000);
  };

  const closeQuickBar = () => {
    setQuickSheet(null);
    if (quickTimerRef.current) {
      window.clearTimeout(quickTimerRef.current);
      quickTimerRef.current = null;
    }
  };

  if (isBulkSelecting) {
    return (
      <>
        <BulkSheetEditor
          endBulkEdit={handleEndBulkEdit}
          onAddedToSheet={handleAddedToSheet}
        />
        {quickSheet && (
          <div className='bg-surface-light dark:bg-surface-dark fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 shadow-lg dark:border-gray-700'>
            <span className='text-xs sm:text-sm'>
              Added to "{quickSheet.name}"
            </span>
            <button
              onClick={() => {
                setActiveSheet(quickSheet.id);
                closeQuickBar();
              }}
              className='inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-0.5 text-xs text-white hover:bg-emerald-600 sm:text-sm'
              title='Go to sheet'
            >
              Go <ArrowRightIcon className='size-3.5' />
            </button>
            <button
              onClick={closeQuickBar}
              className='rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700'
              aria-label='Dismiss notification'
              title='Dismiss notification'
            >
              <XIcon className='size-3.5' />
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className='bg-surface-light dark:bg-surface-dark fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-gray-300 px-4 py-2 shadow-lg dark:border-gray-700'>
        <div className='flex items-center gap-2 sm:gap-3'>
          {/* Desktop: Button-based sheet selector */}
          <div className='hidden sm:block'>
            <HeaderBarSheets onConfirmSheetDeletion={setDeleteConfirmSheetId} />
          </div>

          {/* Mobile: Select-based sheet selector */}
          <div className='sm:hidden'>
            <select
              value={activeSheet}
              onChange={(e) => setActiveSheet(e.target.value)}
              className='max-w-36 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-ellipsis focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800'
            >
              <option value='all'>All</option>
              {sheets &&
                sheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
            </select>
          </div>

          <div className='hidden h-6 w-px bg-gray-300 sm:block dark:bg-gray-700' />

          {/* View Toggle Button */}
          <button
            onClick={() =>
              setViewMode(viewMode === 'flowchart' ? 'table' : 'flowchart')
            }
            className='rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            aria-label={
              viewMode === 'flowchart'
                ? 'Switch to Table View'
                : 'Switch to Flowchart View'
            }
            title={
              viewMode === 'flowchart'
                ? 'Switch to Table View'
                : 'Switch to Flowchart View'
            }
          >
            {viewMode === 'flowchart' ? (
              <TableIcon className='size-5' />
            ) : (
              <WorkflowIcon className='size-5' />
            )}
          </button>

          <div className='h-6 w-px bg-gray-300 dark:bg-gray-700' />

          {/* Calculator Button - Desktop only on mobile, sidebar has it */}
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className='hidden rounded-full p-1.5 transition-colors hover:bg-gray-100 sm:block dark:hover:bg-gray-700'
            aria-label='Open Calculator'
            title='Open Calculator'
          >
            <CalculatorIcon className='size-5' />
          </button>

          <div className='hidden h-6 w-px bg-gray-300 sm:block dark:bg-gray-700' />

          {/* Desktop: Custom Popup */}
          <div className='relative hidden sm:block'>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              aria-label='Settings'
              title='Settings'
              id='settings-btn'
            >
              <Settings2Icon className='size-5' />
            </button>
            {isDropdownOpen && (
              <div
                className='bg-surface-light dark:bg-surface-dark absolute bottom-full left-1/2 z-50 mb-2 w-80 -translate-x-1/2 rounded-xl border border-gray-300 p-6 shadow-lg dark:border-gray-700'
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
                  {viewMode === 'flowchart' && (
                    <div className='flex flex-col items-center'>
                      <span className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                        Display Options
                      </span>
                      <BottomActions
                        className=''
                        actionClassName='rounded-md'
                      />
                    </div>
                  )}
                  <div>
                    <span className='mb-2 block text-center text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Manage Sheets
                    </span>
                    <div className='flex flex-col gap-2'>
                      {sheets &&
                        sheets.map((sheet) => (
                          <div
                            key={sheet.id}
                            className='flex items-center gap-2'
                          >
                            {editingSheetId === sheet.id ? (
                              <>
                                <input
                                  type='text'
                                  value={editingSheetName}
                                  onChange={(e) =>
                                    setEditingSheetName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                      handleRenameSheet(sheet.id);
                                    if (e.key === 'Escape') {
                                      setEditingSheetId(null);
                                      setEditingSheetName('');
                                    }
                                  }}
                                  className='flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleRenameSheet(sheet.id)}
                                  className='rounded bg-emerald-500 px-2 py-1 text-xs text-white hover:bg-emerald-600'
                                >
                                  Save
                                </button>
                              </>
                            ) : (
                              <>
                                <span className='flex-1 text-sm'>
                                  {sheet.name}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingSheetId(sheet.id);
                                    setEditingSheetName(sheet.name);
                                  }}
                                  className='rounded bg-gray-500 px-2 py-1 text-xs text-white hover:bg-gray-600'
                                >
                                  Rename
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirmSheetId(sheet.id)
                                  }
                                  className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
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
                  className='absolute top-2 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  aria-label='Close popup'
                >
                  x
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {quickSheet && (
        <div className='bg-surface-light dark:bg-surface-dark fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 shadow-lg dark:border-gray-700'>
          <span className='text-xs sm:text-sm'>
            Added to "{quickSheet.name}"
          </span>
          <button
            onClick={() => {
              setActiveSheet(quickSheet.id);
              closeQuickBar();
            }}
            className='inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-0.5 text-xs text-white hover:bg-emerald-600 sm:text-sm'
            title='Go to sheet'
          >
            Go <ArrowRightIcon className='size-3.5' />
          </button>
          <button
            onClick={closeQuickBar}
            className='rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700'
            aria-label='Dismiss notification'
            title='Dismiss notification'
          >
            <XIcon className='size-3.5' />
          </button>
        </div>
      )}

      {/* Mobile Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title='Settings'
        centerTitle={true}
      >
        <div className='flex flex-col items-center gap-4 pb-2'>
          {/* Space Description and Pin */}
          <div className='w-full'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => updateSpace({ pinned: !pinned })}
                  className='shrink-0'
                  aria-label={pinned ? 'Unpin Space' : 'Pin Space'}
                >
                  <PinIcon
                    className={join(
                      'size-5',
                      pinned ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400',
                    )}
                  />
                </button>
                <span className='text-sm text-gray-700 dark:text-gray-200'>
                  {pinned ? 'Pinned' : 'Not pinned'}
                </span>
              </div>
              <textarea
                value={description || ''}
                onChange={(e) => updateSpace({ description: e.target.value })}
                placeholder='Add a description...'
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
                rows={3}
              />
            </div>
          </div>

          <div>
            <span className='mb-1 block text-center font-medium text-gray-700 dark:text-gray-200'>
              Budget Time Window
            </span>
            <HeaderBarTimeWindow />
          </div>

          {viewMode === 'flowchart' && (
            <div>
              <span className='mb-1 block text-center font-medium text-gray-700 dark:text-gray-200'>
                Display Options
              </span>
              <BottomActions className='' actionClassName='rounded-md' />
            </div>
          )}

          <div className='w-full'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='block text-center font-medium text-gray-700 dark:text-gray-200'>
                Manage Sheets
              </span>
              <button
                onClick={() => setIsAddSheetModalOpen(true)}
                className='rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
                aria-label='Add new sheet'
                title='Add new sheet'
              >
                <PlusIcon className='size-4' />
              </button>
            </div>
            <div className='flex flex-col gap-2'>
              {sheets &&
                sheets.map((sheet) => (
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
                          className='flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameSheet(sheet.id)}
                          className='rounded bg-emerald-500 px-2 py-1 text-xs text-white hover:bg-emerald-600'
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
                          className='rounded bg-gray-500 px-2 py-1 text-xs text-white hover:bg-gray-600'
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmSheetId(sheet.id);
                            setIsSettingsModalOpen(false);
                          }}
                          className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
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
              className='w-full rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
              autoFocus
            />
          </div>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => {
                setIsAddSheetModalOpen(false);
                setNewSheetName('');
              }}
              className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              onClick={handleAddSheet}
              disabled={!newSheetName.trim()}
              className='rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50'
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
            Are you sure you want to delete this sheet? This will remove the
            sheet from all budget items.
          </p>
          <div className='flex justify-center gap-2'>
            <button
              onClick={() => setDeleteConfirmSheetId(null)}
              className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              onClick={() =>
                deleteConfirmSheetId && handleDeleteSheet(deleteConfirmSheetId)
              }
              className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Mobile Sidebar Actions */}
      {viewMode === 'flowchart' && (
        <SidebarActions
          onMultiSelectClick={handleToggleBulkEdit}
          onCalculatorClick={() => setIsCalculatorOpen(true)}
          onSettingsClick={() => setIsSettingsModalOpen(true)}
          isMultiSelectActive={isBulkEditMode || isBulkSelecting}
        />
      )}
    </>
  );
}
