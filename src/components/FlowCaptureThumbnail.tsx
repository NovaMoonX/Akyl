import useCaptureThumbnail from '../hooks/useCaptureThumbnail';

/**
 * Component that captures a thumbnail of the current space and stores it for
 * the homepage preview. Must be rendered inside the ReactFlow component to
 * access the flow instance.
 */
export default function FlowCaptureThumbnail() {
  useCaptureThumbnail();
  return null;
}
