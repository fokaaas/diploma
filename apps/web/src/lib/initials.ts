/** "Олена Гриценко" → "ОГ" */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
}
