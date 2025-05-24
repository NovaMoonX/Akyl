import { useLocation } from 'react-router';

export default function useURL() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  return { spaceId: firstSegment || '', pathSegments };
}
