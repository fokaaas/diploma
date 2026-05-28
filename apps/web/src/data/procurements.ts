import type { Procurement } from '../types/domain'

export const PROCUREMENTS: Procurement[] = [
  { id: 'PR-2026-0301', date: '26 трав. 2026', supplier: 'cp-302', status: 'ordered', amount: 592000, request: 'R-2026-0148', funding: ['CN-2026-0512', 'CN-2026-0510'], lines: 'FPV-дрон 7" ×40' },
  { id: 'PR-2026-0300', date: '25 трав. 2026', supplier: 'cp-302', status: 'paid', amount: 174000, request: 'R-2026-0148', funding: ['CN-2026-0511'], lines: 'АКБ LiPo 6S ×120' },
  { id: 'PR-2026-0299', date: '24 трав. 2026', supplier: 'cp-301', status: 'received', amount: 115500, request: 'R-2026-0147', funding: ['CN-2026-0510'], lines: 'РЕБ-модуль ×3' },
  { id: 'PR-2026-0298', date: '24 трав. 2026', supplier: 'cp-301', status: 'received', amount: 256800, request: 'R-2026-0147', funding: ['CN-2026-0510'], lines: 'Тепловізор ×4' },
  { id: 'PR-2026-0297', date: '22 трав. 2026', supplier: 'cp-303', status: 'closed', amount: 132000, request: 'R-2026-0146', funding: ['CN-2026-0511'], lines: 'Аптечки IFAK ×60' },
  { id: 'PR-2026-0296', date: '21 трав. 2026', supplier: 'cp-303', status: 'closed', amount: 77000, request: 'R-2026-0146', funding: ['CN-2026-0511'], lines: 'Плитоноски ×20' },
  { id: 'PR-2026-0295', date: '20 трав. 2026', supplier: 'cp-301', status: 'closed', amount: 137600, request: 'R-2026-0145', funding: ['CN-2026-0507'], lines: 'Радіостанції ×8' },
  { id: 'PR-2026-0294', date: '19 трав. 2026', supplier: 'cp-302', status: 'draft', amount: 290000, request: 'R-2026-0141', funding: [], lines: 'АКБ LiPo 6S ×200' },
]
