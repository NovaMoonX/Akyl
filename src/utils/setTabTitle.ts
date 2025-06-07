export default function setTabTitle(title?: string) {
  document.title = title ? `${title} - Akyl` : 'Akyl';
}
