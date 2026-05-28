import type { Counterparty } from '../types/domain'

export const COUNTERPARTIES: Counterparty[] = [
  { id: 'cp-101', code: 'CP-101', type: 'unit', name: '93 ОМБр «Холодний Яр»', form: 'юр. особа', contact: 'м-р Лисенко О.', phone: '+380 67 555 0192', channel: 'Signal', note: 'м. Дніпро · сектор Покровськ', requests: 6, lastInteraction: '24 трав. 2026' },
  { id: 'cp-102', code: 'CP-102', type: 'unit', name: '24 ОМБр ім. короля Данила', form: 'юр. особа', contact: 'к-н Іванчук Т.', phone: '+380 50 211 0044', channel: 'Telegram', note: 'Часів Яр', requests: 4, lastInteraction: '23 трав. 2026' },
  { id: 'cp-103', code: 'CP-103', type: 'unit', name: '425 ОШБ «Скеля»', form: 'юр. особа', contact: 'ст. с-т Дорош М.', phone: '+380 95 100 8810', channel: 'Telegram', note: "Куп'янський напрямок", requests: 3, lastInteraction: '21 трав. 2026' },
  { id: 'cp-104', code: 'CP-104', type: 'unit', name: '37 ОБрМП', form: 'юр. особа', contact: 'м-р Кравченко В.', phone: '+380 63 884 1102', channel: 'Signal', note: 'Запорізький напрямок', requests: 2, lastInteraction: '15 трав. 2026' },
  { id: 'cp-201', code: 'CP-201', type: 'donor', name: 'Олег Шевченко', form: 'фіз. особа', contact: 'Олег Шевченко', phone: '+380 67 333 1010', channel: 'Email', note: 'Регулярний донор з листоп. 2024', requests: 12, lastInteraction: '25 трав. 2026' },
  { id: 'cp-202', code: 'CP-202', type: 'donor', name: 'ТОВ «Аква-Сіті»', form: 'юр. особа', contact: 'Левко Гриценко', phone: '+380 50 200 4140', channel: 'Email', note: 'Партнер з 2024 р.', requests: 5, lastInteraction: '22 трав. 2026' },
  { id: 'cp-203', code: 'CP-203', type: 'donor', name: 'Громада «Львів-Захід»', form: 'неюр. особа', contact: 'Ірина Сташків', phone: '+380 96 882 4421', channel: 'Telegram', note: 'Збір через парафію', requests: 8, lastInteraction: '20 трав. 2026' },
  { id: 'cp-301', code: 'CP-301', type: 'supplier', name: 'ФОП Бондар А. М. (РЕБ-обладнання)', form: 'ФОП', contact: 'Андрій Бондар', phone: '+380 67 411 9920', channel: 'Phone', note: 'Київ. Передоплата 50%', requests: 9, lastInteraction: '26 трав. 2026' },
  { id: 'cp-302', code: 'CP-302', type: 'supplier', name: 'ТОВ «Дрон-Технолоджис»', form: 'юр. особа', contact: 'Костянтин Білий', phone: '+380 50 700 3380', channel: 'Email', note: 'FPV-комплектуючі', requests: 14, lastInteraction: '24 трав. 2026' },
  { id: 'cp-303', code: 'CP-303', type: 'supplier', name: 'ФОП Гаврилюк С. С. (тактичний одяг)', form: 'ФОП', contact: 'Сергій Гаврилюк', phone: '+380 63 100 7752', channel: 'Phone', note: 'м. Хмельницький', requests: 7, lastInteraction: '18 трав. 2026' },
]
