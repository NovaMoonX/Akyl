import {
  FolderOpenIcon,
  GridIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  LogInIcon,
  LogOutIcon,
  MoonIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
  TrashIcon,
  UploadIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { signOutUser } from '../firebase';
import {
  THUMBNAIL_KEY,
} from '../hooks/useCaptureThumbnail';
import useBrowserSpaces from '../hooks/useBrowserSpaces';
import useSyncAllSpaces from '../hooks/useSyncAllSpaces';
import {
  APP_SPACE_LIMIT_REACHED,
  createNewSpace,
  importFile,
  syncSpace,
  type Space,
} from '../lib';
import { join } from '../utils';
import DreamTrigger from './DreamTrigger';
import AuthModal from './modals/AuthModal';
import DeleteSpaceModal from './modals/DeleteSpaceModal';
import HelpModal from './modals/HelpModal';
import ImportModal from './modals/ImportModal';
import Tooltip from './ui/Tooltip';

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function SpaceCardSkeleton() {
  return (
    <div className='animate-pulse rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'>
      <div className='aspect-video bg-gray-200 dark:bg-gray-700' />
      <div className='p-3 space-y-2'>
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
        <div className='h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2' />
      </div>
    </div>
  );
}

type ViewMode = 'grid' | 'list';
const VIEW_MODE_KEY = 'akyl-home-view-mode';

function getStoredViewMode(): ViewMode {
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  return stored === 'list' ? 'list' : 'grid';
}

interface SpaceCardProps {
  space: Space;
  viewMode: ViewMode;
  onPin: (id: string, currentPinned: boolean) => void;
  onDelete: (id: string) => void;
}

function SpaceCard({ space, viewMode, onPin, onDelete }: SpaceCardProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(THUMBNAIL_KEY(space.id));
    setThumbnail(stored);
  }, [space.id]);

  if (viewMode === 'list') {
    return (
      <div className='group relative flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all bg-white dark:bg-gray-900 px-4 py-3'>
        <a href={`/${space.id}`} className='flex items-center justify-center shrink-0' aria-label={`Open ${space.title || 'Untitled Space'}`}>
          <LayoutDashboardIcon className='size-5 text-gray-400 dark:text-gray-500' />
        </a>

        <a
          href={`/${space.id}`}
          className='flex-1 min-w-0'
          title={space.title || 'Untitled Space'}
        >
          <h3
            className={join(
              'font-medium text-sm text-gray-900 dark:text-gray-100 truncate',
              !space.title && 'opacity-60 italic',
            )}
          >
            {space.title || 'Untitled Space'}
          </h3>
        </a>

        {space.pinned && (
          <PinIcon className='size-3.5 shrink-0 fill-yellow-400 text-yellow-400' />
        )}

        {space.metadata?.updatedAt ? (
          <span className='text-xs text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block'>
            {formatRelativeTime(space.metadata.updatedAt)}
          </span>
        ) : null}

        <div className='flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
          <button
            type='button'
            aria-label={space.pinned ? 'Unpin Space' : 'Pin Space'}
            onClick={() => onPin(space.id, Boolean(space.pinned))}
            className='flex items-center justify-center size-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          >
            <PinIcon
              className={join(
                'size-3.5',
                space.pinned
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-500 dark:text-gray-400',
              )}
            />
          </button>
          <button
            type='button'
            aria-label='Delete Space'
            onClick={() => onDelete(space.id)}
            className='flex items-center justify-center size-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors text-gray-500 dark:text-gray-400'
          >
            <TrashIcon className='size-3.5' />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='group relative rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all bg-white dark:bg-gray-900'>
      {/* Thumbnail */}
      <a href={`/${space.id}`} className='block aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden' aria-label={`Open ${space.title || 'Untitled Space'}`}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={space.title || 'Untitled Space'}
            className='w-full h-full object-cover'
            loading='lazy'
          />
        ) : (
          <div className='flex items-center justify-center h-full'>
            <LayoutDashboardIcon className='size-12 text-gray-300 dark:text-gray-600' />
          </div>
        )}
      </a>

      {/* Card footer */}
      <div className='px-3 pt-2.5 pb-3'>
        <a
          href={`/${space.id}`}
          className='block'
          title={space.title || 'Untitled Space'}
        >
          <h3
            className={join(
              'font-medium text-sm text-gray-900 dark:text-gray-100 truncate',
              !space.title && 'opacity-60 italic',
            )}
          >
            {space.title || 'Untitled Space'}
          </h3>
          {space.metadata?.updatedAt ? (
            <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
              {formatRelativeTime(space.metadata.updatedAt)}
            </p>
          ) : null}
        </a>
      </div>

      {/* Action buttons */}
      <div className='absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
        <button
          type='button'
          aria-label={space.pinned ? 'Unpin Space' : 'Pin Space'}
          onClick={() => onPin(space.id, Boolean(space.pinned))}
          className='flex items-center justify-center size-7 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors'
        >
          <PinIcon
            className={join(
              'size-3.5',
              space.pinned
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-500 dark:text-gray-400',
            )}
          />
        </button>
        <button
          type='button'
          aria-label='Delete Space'
          onClick={() => onDelete(space.id)}
          className='flex items-center justify-center size-7 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors text-gray-500 dark:text-gray-400'
        >
          <TrashIcon className='size-3.5' />
        </button>
      </div>

      {/* Pinned badge */}
      {space.pinned && (
        <div className='absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-400/90 text-yellow-900 text-xs font-medium'>
          <PinIcon className='size-2.5 fill-current' />
          Pinned
        </div>
      )}
    </div>
  );
}

export default function LoadScreen() {
  const { currentUser, cryptoKey } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteSpaceId, setDeleteSpaceId] = useState<string>();
  const [search, setSearch] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(getStoredViewMode);
  const { spaces: localSpaces, limitMet } = useBrowserSpaces();
  const { spaces: syncedSpaces, spacesMap: syncedSpacesMap, loading: syncLoading } =
    useSyncAllSpaces();

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const isSyncing = currentUser?.uid ? syncLoading : false;

  // Initialize and update spaces from cloud and local storage
  useEffect(() => {
    let chosenSpaces: Space[] = [];
    if (currentUser?.uid) {
      chosenSpaces = syncedSpaces;

      // Add in any local spaces that are not synced yet
      localSpaces.forEach((localSpace) => {
        if (!syncedSpacesMap[localSpace.id]) {
          chosenSpaces.push(localSpace);
        }
      });
    } else {
      chosenSpaces = localSpaces.filter((space) => !space.metadata?.createdBy);
    }

    setSpaces(chosenSpaces);
  }, [localSpaces, syncedSpaces, syncedSpacesMap, currentUser?.uid]);

  const { pinnedSpaces, unpinnedSpaces } = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? spaces.filter((s) =>
          (s.title || 'Untitled Space').toLowerCase().includes(query),
        )
      : spaces;

    const sortedSpaces = [...filtered].sort((a, b) => {
      const aUpdated = a.metadata?.updatedAt ?? 0;
      const bUpdated = b.metadata?.updatedAt ?? 0;
      if (bUpdated !== aUpdated) {
        return bUpdated - aUpdated;
      }
      return a.title.localeCompare(b.title);
    });

    const pinned = sortedSpaces.filter((space) => space.pinned);
    const unpinned = sortedSpaces.filter((space) => !space.pinned);

    return { pinnedSpaces: pinned, unpinnedSpaces: unpinned };
  }, [spaces, search]);

  const handleTogglePin = async (spaceId: string, currentPinned: boolean) => {
    const spaceData = localStorage.getItem(spaceId);
    if (spaceData) {
      const space = JSON.parse(spaceData) as Space;
      space.pinned = !currentPinned;
      space.metadata.updatedAt = Date.now();
      localStorage.setItem(spaceId, JSON.stringify(space));

      // Update local state
      setSpaces((prevSpaces) =>
        prevSpaces.map((s) => (s.id === spaceId ? space : s)),
      );

      // Sync to cloud if user is authenticated
      if (currentUser?.uid && cryptoKey) {
        try {
          await syncSpace({
            space,
            cryptoKey,
            userId: currentUser.uid,
          });
        } catch (error) {
          console.error('Failed to sync space to cloud:', error);
        }
      }
    }
  };

  const hasSpaces = spaces.length > 0;
  const hasResults = pinnedSpaces.length > 0 || unpinnedSpaces.length > 0;
  const spacesContainerClass =
    viewMode === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'flex flex-col gap-2';

  return (
    <>
      <div className='min-h-dvh w-dvw flex flex-col bg-gray-50 dark:bg-gray-950'>
        {/* Top nav */}
        <header className='sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-center gap-2'>
            <span className='font-brand text-brand text-2xl font-black leading-none'>
              Akyl
            </span>
            <span className='text-brand text-xs -mt-3 -ml-1'>©</span>
          </div>

          <div className='flex items-center gap-2'>
            {currentUser?.email && (
              <span className='hidden sm:block text-xs text-gray-500 dark:text-gray-400 truncate max-w-40'>
                {currentUser.email}
              </span>
            )}
            <button
              type='button'
              aria-label='Toggle theme'
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className='flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            >
              {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            </button>
            {currentUser ? (
              <button
                type='button'
                onClick={() => signOutUser()}
                className='flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              >
                <LogOutIcon size={14} />
                <span className='hidden sm:block'>Sign out</span>
              </button>
            ) : (
              <button
                type='button'
                onClick={() => setIsAuthModalOpen(true)}
                className='flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              >
                <LogInIcon size={14} />
                <span className='hidden sm:block'>Login</span>
              </button>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className='flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-16 max-w-7xl mx-auto w-full'>
          {/* Actions row */}
          <div className='flex flex-wrap items-center gap-2 mb-6'>
            <Tooltip title={APP_SPACE_LIMIT_REACHED} disabled={!limitMet}>
              <button
                type='button'
                disabled={limitMet}
                onClick={() => !limitMet && createNewSpace()}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-sm'
              >
                <PlusIcon size={16} />
                New Space
              </button>
            </Tooltip>

            <button
              type='button'
              onClick={() => importFile()}
              className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            >
              <FolderOpenIcon size={15} />
              <span className='hidden sm:block'>Open</span>
            </button>

            <button
              type='button'
              onClick={() => setIsImportModalOpen(true)}
              className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            >
              <UploadIcon size={15} />
              <span className='hidden sm:block'>Import CSV</span>
            </button>

            <button
              type='button'
              onClick={() => setIsHelpModalOpen(true)}
              className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            >
              <HelpCircleIcon size={15} />
              <span className='hidden sm:block'>Help</span>
            </button>

            {/* Search */}
            {hasSpaces && (
              <div className='relative ml-auto w-full sm:w-56'>
                <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none' />
                <input
                  type='search'
                  placeholder='Search spaces…'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition'
                />
              </div>
            )}

            {/* View mode toggle */}
            {hasSpaces && (
              <div className='flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
                <button
                  type='button'
                  aria-label='Grid view'
                  onClick={() => handleSetViewMode('grid')}
                  className={join(
                    'flex items-center justify-center p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                  )}
                >
                  <GridIcon size={15} />
                </button>
                <button
                  type='button'
                  aria-label='List view'
                  onClick={() => handleSetViewMode('list')}
                  className={join(
                    'flex items-center justify-center p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                  )}
                >
                  <ListIcon size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {isSyncing && !hasSpaces && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <SpaceCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Spaces grid */}
          {!isSyncing || hasSpaces ? (
            <>
              {/* Pinned section */}
              {pinnedSpaces.length > 0 && (
                <section className='mb-8'>
                  <h2 className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'>
                    Pinned
                  </h2>
                  <div className={spacesContainerClass}>
                    {pinnedSpaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={space}
                        viewMode={viewMode}
                        onPin={handleTogglePin}
                        onDelete={setDeleteSpaceId}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent section */}
              {unpinnedSpaces.length > 0 && (
                <section>
                  <h2 className='text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'>
                    {pinnedSpaces.length > 0 ? 'Other Spaces' : 'Recent'}
                  </h2>
                  <div className={spacesContainerClass}>
                    {unpinnedSpaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={space}
                        viewMode={viewMode}
                        onPin={handleTogglePin}
                        onDelete={setDeleteSpaceId}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Search no results */}
              {search && !hasResults && (
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <SearchIcon className='size-10 text-gray-300 dark:text-gray-600 mb-3' />
                  <p className='text-gray-500 dark:text-gray-400'>
                    No spaces match &ldquo;{search}&rdquo;
                  </p>
                  <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='mt-2 text-sm text-emerald-600 hover:underline'
                  >
                    Clear search
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!search && !hasSpaces && !isSyncing && (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                  <LayoutDashboardIcon className='size-14 text-gray-300 dark:text-gray-600 mb-4' />
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                    No spaces yet
                  </h3>
                  <p className='text-gray-400 dark:text-gray-500 text-sm mb-6 max-w-xs'>
                    Create your first space to start visualizing your finances.
                  </p>
                  <button
                    type='button'
                    disabled={limitMet}
                    onClick={() => !limitMet && createNewSpace()}
                    className='flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors'
                  >
                    <PlusIcon size={16} />
                    Create Space
                  </button>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>

      {/* Bottom corner easter-egg */}
      <div className={join('fixed bottom-0 left-0 z-30 p-1')}>
        <DreamTrigger />
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <DeleteSpaceModal
        isOpen={Boolean(deleteSpaceId)}
        onClose={() => setDeleteSpaceId(undefined)}
        spaceId={deleteSpaceId}
        onDelete={(id) => {
          setSpaces((prevSpaces) => prevSpaces.filter((s) => s.id !== id));
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
