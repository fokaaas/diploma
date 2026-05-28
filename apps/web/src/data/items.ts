import type { Item } from '../types/domain'

export const ITEMS: Item[] = [
  { id: 'it-01', sku: 'DRN-FPV-7', name: 'FPV-дрон 7", аналогова система', unit: 'шт', category: 'БПЛА', stock: 28, minStock: 20, lastPrice: 14800, location: 'Склад · Київ' },
  { id: 'it-02', sku: 'DRN-BAT', name: 'Акумулятор LiPo 6S 1300mAh', unit: 'шт', category: 'БПЛА', stock: 154, minStock: 60, lastPrice: 1450, location: 'Склад · Київ' },
  { id: 'it-03', sku: 'REB-MOD', name: 'РЕБ-модуль автомобільний', unit: 'шт', category: 'РЕБ', stock: 3, minStock: 6, lastPrice: 38500, location: 'Склад · Дніпро', warn: true },
  { id: 'it-04', sku: 'TAC-MED', name: 'Аптечка тактична IFAK', unit: 'шт', category: 'Медицина', stock: 42, minStock: 30, lastPrice: 2200, location: 'Склад · Київ' },
  { id: 'it-05', sku: 'TAC-VEST', name: 'Розвантажувальна система (плитоноска)', unit: 'шт', category: 'Спорядження', stock: 11, minStock: 15, lastPrice: 3850, location: 'Склад · Київ', warn: true },
  { id: 'it-06', sku: 'OPT-THERM', name: 'Тепловізор монокулярний', unit: 'шт', category: 'Оптика', stock: 5, minStock: 4, lastPrice: 64200, location: 'Склад · Київ' },
  { id: 'it-07', sku: 'ENRG-STAT', name: 'Зарядна станція EcoFlow Delta', unit: 'шт', category: 'Енергозабезп.', stock: 8, minStock: 4, lastPrice: 26500, location: 'Склад · Київ' },
  { id: 'it-08', sku: 'VEH-PICKUP', name: 'Пікап (б/в, відновлений)', unit: 'од', category: 'Транспорт', stock: 1, minStock: 0, lastPrice: 480000, location: 'СТО · Київ' },
  { id: 'it-09', sku: 'COM-RADIO', name: 'Радіостанція Motorola DP4400e', unit: 'шт', category: 'Звʼязок', stock: 14, minStock: 8, lastPrice: 17200, location: 'Склад · Київ' },
  { id: 'it-10', sku: 'CLT-WINTER', name: 'Зимовий комплект (куртка+штани)', unit: 'комп', category: 'Спорядження', stock: 2, minStock: 10, lastPrice: 5200, location: 'Склад · Львів', warn: true },
]
