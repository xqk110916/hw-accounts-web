/**
 * 库位地图统一数据源
 * 现已对接后端接口
 */

import { getAllBalanceAreas } from '@/api/warehouse/balanceArea';
import { getWarehouseListByBalanceArea } from '@/api/warehouse/warehouse';
import { getHierarchyDetail, getHierarchyListByNodeType, getPositionMap } from '@/api/warehouse/locationMap';
import { normalizeExtra, getLocalExtra, parseShelfType } from '../utils/locationLayoutStorage';
import { generateInitialLayout, applyLayoutToShelves } from '../utils/locationLayoutAdapter';

// ==================== 默认本地布局/样式配置 ====================

export const balanceAreaConfig = [
  {
    id: 'ba001',
    name: '一号平衡区',
    position: { x: -6, y: 0, z: 0 },   // 3D场景中的位置
    color: 0x4a90d9,
    warehouseIds: ['wh001', 'wh002', 'wh003']
  },
  {
    id: 'ba002',
    name: '二号平衡区',
    position: { x: 6, y: 0, z: 0 },
    color: 0x27ae60,
    warehouseIds: []
  },
  {
    id: 'ba003',
    name: '三号平衡区',
    position: { x: 0, y: 0, z: 7 },
    color: 0xe67e22,
    warehouseIds: []
  }
];

// ==================== 基础配置 ====================
export const baseConfig = {
  balanceArea: '一号平衡区',  // 平衡区名称
  defaultWarehouseId: 'wh001', // 默认选中的库房ID
  defaultBalanceAreaId: 'ba001'
};

// ==================== 库房数据 ====================
export const warehouseData = [
  {
    id: 'wh001',
    name: '一号库房',
    width: 20,
    height: 15,
    description: '存放低放射性废物',
    position: { x: -3.5, y: 0, z: -2 },  // 3D场景中的位置
    shelfLayout: { rows: 2, cols: 3 }     // 货架布局：2行3列
  },
  {
    id: 'wh002',
    name: '二号库房',
    width: 18,
    height: 12,
    description: '存放中放射性废物',
    position: { x: 0, y: 0, z: -2 },
    shelfLayout: { rows: 2, cols: 2 }
  },
  {
    id: 'wh003',
    name: '三号库房',
    width: 25,
    height: 18,
    description: '存放高放射性废物',
    position: { x: 3.5, y: 0, z: -2 },
    shelfLayout: { rows: 3, cols: 3 }
  }
];

// ==================== 货架数据 ====================
// 按库房ID组织的货架数据
export const shelfData = {
  // 一号库房的货架
  'wh001': [
    {
      id: 'wh001_shelf_1',
      name: 'A-01',
      position: { x: 2, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'c1_1_1', code: 'C111', materialCode: 'MAT-001', materialName: '核废料A类', storageDate: '2026-01-10' },
            { id: 'c1_1_2', code: 'C112', materialCode: 'MAT-002', materialName: '核废料B类', storageDate: '2026-01-15' },
            { id: 'c1_1_3', code: 'C113', materialCode: 'MAT-003', materialName: '放射性废渣', storageDate: '2026-01-18' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'c1_2_1', code: 'C121', materialCode: 'MAT-004', materialName: '低放废物', storageDate: '2026-01-22' },
            { id: 'c1_2_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c1_2_3', code: 'C123', materialCode: 'MAT-005', materialName: '中放废物', storageDate: '2026-01-25' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'c1_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c1_3_2', code: 'C132', materialCode: 'MAT-006', materialName: '核废料A类', storageDate: '2026-01-28' },
            { id: 'c1_3_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        }
      ]
    },
    {
      id: 'wh001_shelf_2',
      name: 'A-02',
      position: { x: 7, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'c2_1_1', code: 'C211', materialCode: 'MAT-007', materialName: '核废料B类', storageDate: '2026-01-10' },
            { id: 'c2_1_2', code: 'C212', materialCode: 'MAT-008', materialName: '放射性废渣', storageDate: '2026-01-15' },
            { id: 'c2_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'c2_2_1', code: 'C221', materialCode: 'MAT-009', materialName: '低放废物', storageDate: '2026-01-18' },
            { id: 'c2_2_2', code: 'C222', materialCode: 'MAT-010', materialName: '中放废物', storageDate: '2026-01-22' },
            { id: 'c2_2_3', code: 'C223', materialCode: 'MAT-011', materialName: '核废料A类', storageDate: '2026-01-25' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'c2_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c2_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c2_3_3', code: 'C233', materialCode: 'MAT-012', materialName: '核废料B类', storageDate: '2026-01-28' }
          ]
        }
      ]
    },
    {
      id: 'wh001_shelf_3',
      name: 'A-03',
      position: { x: 12, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'c3_1_1', code: 'C311', materialCode: 'MAT-013', materialName: '放射性废渣', storageDate: '2026-01-10' },
            { id: 'c3_1_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c3_1_3', code: 'C313', materialCode: 'MAT-014', materialName: '低放废物', storageDate: '2026-01-15' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'c3_2_1', code: 'C321', materialCode: 'MAT-015', materialName: '中放废物', storageDate: '2026-01-18' },
            { id: 'c3_2_2', code: 'C322', materialCode: 'MAT-016', materialName: '核废料A类', storageDate: '2026-01-22' },
            { id: 'c3_2_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'c3_3_1', code: 'C331', materialCode: 'MAT-017', materialName: '核废料B类', storageDate: '2026-01-25' },
            { id: 'c3_3_2', code: 'C332', materialCode: 'MAT-018', materialName: '放射性废渣', storageDate: '2026-01-28' },
            { id: 'c3_3_3', code: 'C333', materialCode: 'MAT-019', materialName: '低放废物', storageDate: '2026-01-10' }
          ]
        }
      ]
    },
    {
      id: 'wh001_shelf_4',
      name: 'A-04',
      position: { x: 2, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'c4_1_1', code: 'C411', materialCode: 'MAT-020', materialName: '中放废物', storageDate: '2026-01-15' },
            { id: 'c4_1_2', code: 'C412', materialCode: 'MAT-021', materialName: '核废料A类', storageDate: '2026-01-18' },
            { id: 'c4_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'c4_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c4_2_2', code: 'C422', materialCode: 'MAT-022', materialName: '核废料B类', storageDate: '2026-01-22' },
            { id: 'c4_2_3', code: 'C423', materialCode: 'MAT-023', materialName: '放射性废渣', storageDate: '2026-01-25' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'c4_3_1', code: 'C431', materialCode: 'MAT-024', materialName: '低放废物', storageDate: '2026-01-28' },
            { id: 'c4_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c4_3_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        }
      ]
    },
    {
      id: 'wh001_shelf_5',
      name: 'A-05',
      position: { x: 7, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'c5_1_1', code: 'C511', materialCode: 'MAT-025', materialName: '中放废物', storageDate: '2026-01-10' },
            { id: 'c5_1_2', code: 'C512', materialCode: 'MAT-026', materialName: '核废料A类', storageDate: '2026-01-15' },
            { id: 'c5_1_3', code: 'C513', materialCode: 'MAT-027', materialName: '核废料B类', storageDate: '2026-01-18' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'c5_2_1', code: 'C521', materialCode: 'MAT-028', materialName: '放射性废渣', storageDate: '2026-01-22' },
            { id: 'c5_2_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c5_2_3', code: 'C523', materialCode: 'MAT-029', materialName: '低放废物', storageDate: '2026-01-25' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'c5_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c5_3_2', code: 'C532', materialCode: 'MAT-030', materialName: '中放废物', storageDate: '2026-01-28' },
            { id: 'c5_3_3', code: 'C533', materialCode: 'MAT-031', materialName: '核废料A类', storageDate: '2026-01-10' }
          ]
        }
      ]
    },
    {
      id: 'wh001_shelf_6',
      name: 'A-06',
      position: { x: 12, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'c6_1_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c6_1_2', code: 'C612', materialCode: 'MAT-032', materialName: '核废料B类', storageDate: '2026-01-15' },
            { id: 'c6_1_3', code: 'C613', materialCode: 'MAT-033', materialName: '放射性废渣', storageDate: '2026-01-18' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'c6_2_1', code: 'C621', materialCode: 'MAT-034', materialName: '低放废物', storageDate: '2026-01-22' },
            { id: 'c6_2_2', code: 'C622', materialCode: 'MAT-035', materialName: '中放废物', storageDate: '2026-01-25' },
            { id: 'c6_2_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'c6_3_1', code: 'C631', materialCode: 'MAT-036', materialName: '核废料A类', storageDate: '2026-01-28' },
            { id: 'c6_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'c6_3_3', code: 'C633', materialCode: 'MAT-037', materialName: '核废料B类', storageDate: '2026-01-10' }
          ]
        }
      ]
    }
  ],
  
  // 二号库房的货架
  'wh002': [
    {
      id: 'wh002_shelf_1',
      name: 'B-01',
      position: { x: 2, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'b1_1_1', code: 'B111', materialCode: 'MAT-101', materialName: '中放废物', storageDate: '2026-01-12' },
            { id: 'b1_1_2', code: 'B112', materialCode: 'MAT-102', materialName: '核废料A类', storageDate: '2026-01-16' },
            { id: 'b1_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'b1_2_1', code: 'B121', materialCode: 'MAT-103', materialName: '核废料B类', storageDate: '2026-01-20' },
            { id: 'b1_2_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b1_2_3', code: 'B123', materialCode: 'MAT-104', materialName: '放射性废渣', storageDate: '2026-01-24' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'b1_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b1_3_2', code: 'B132', materialCode: 'MAT-105', materialName: '低放废物', storageDate: '2026-01-27' },
            { id: 'b1_3_3', code: 'B133', materialCode: 'MAT-106', materialName: '中放废物', storageDate: '2026-01-12' }
          ]
        }
      ]
    },
    {
      id: 'wh002_shelf_2',
      name: 'B-02',
      position: { x: 7, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'b2_1_1', code: 'B211', materialCode: 'MAT-107', materialName: '核废料A类', storageDate: '2026-01-16' },
            { id: 'b2_1_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b2_1_3', code: 'B213', materialCode: 'MAT-108', materialName: '核废料B类', storageDate: '2026-01-20' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'b2_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b2_2_2', code: 'B222', materialCode: 'MAT-109', materialName: '放射性废渣', storageDate: '2026-01-24' },
            { id: 'b2_2_3', code: 'B223', materialCode: 'MAT-110', materialName: '低放废物', storageDate: '2026-01-27' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'b2_3_1', code: 'B231', materialCode: 'MAT-111', materialName: '中放废物', storageDate: '2026-01-12' },
            { id: 'b2_3_2', code: 'B232', materialCode: 'MAT-112', materialName: '核废料A类', storageDate: '2026-01-16' },
            { id: 'b2_3_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        }
      ]
    },
    {
      id: 'wh002_shelf_3',
      name: 'B-03',
      position: { x: 2, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'b3_1_1', code: 'B311', materialCode: 'MAT-113', materialName: '低放废物', storageDate: '2026-01-12' },
            { id: 'b3_1_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b3_1_3', code: 'B313', materialCode: 'MAT-114', materialName: '中放废物', storageDate: '2026-01-16' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'b3_2_1', code: 'B321', materialCode: 'MAT-115', materialName: '核废料A类', storageDate: '2026-01-20' },
            { id: 'b3_2_2', code: 'B322', materialCode: 'MAT-116', materialName: '核废料B类', storageDate: '2026-01-24' },
            { id: 'b3_2_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'b3_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b3_3_2', code: 'B332', materialCode: 'MAT-117', materialName: '放射性废渣', storageDate: '2026-01-27' },
            { id: 'b3_3_3', code: 'B333', materialCode: 'MAT-118', materialName: '低放废物', storageDate: '2026-01-12' }
          ]
        }
      ]
    },
    {
      id: 'wh002_shelf_4',
      name: 'B-04',
      position: { x: 7, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'b4_1_1', code: 'B411', materialCode: 'MAT-119', materialName: '中放废物', storageDate: '2026-01-16' },
            { id: 'b4_1_2', code: 'B412', materialCode: 'MAT-120', materialName: '核废料A类', storageDate: '2026-01-20' },
            { id: 'b4_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'b4_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b4_2_2', code: 'B422', materialCode: 'MAT-121', materialName: '核废料B类', storageDate: '2026-01-24' },
            { id: 'b4_2_3', code: 'B423', materialCode: 'MAT-122', materialName: '放射性废渣', storageDate: '2026-01-27' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'b4_3_1', code: 'B431', materialCode: 'MAT-123', materialName: '低放废物', storageDate: '2026-01-12' },
            { id: 'b4_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'b4_3_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        }
      ]
    }
  ],
  
  // 三号库房的货架
  'wh003': [
    {
      id: 'wh003_shelf_1',
      name: 'C-01',
      position: { x: 2, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd1_1_1', code: 'D111', materialCode: 'MAT-201', materialName: '核废料A类', storageDate: '2026-01-11' },
            { id: 'd1_1_2', code: 'D112', materialCode: 'MAT-202', materialName: '核废料B类', storageDate: '2026-01-14' },
            { id: 'd1_1_3', code: 'D113', materialCode: 'MAT-203', materialName: '放射性废渣', storageDate: '2026-01-17' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd1_2_1', code: 'D121', materialCode: 'MAT-204', materialName: '低放废物', storageDate: '2026-01-21' },
            { id: 'd1_2_2', code: 'D122', materialCode: 'MAT-205', materialName: '中放废物', storageDate: '2026-01-23' },
            { id: 'd1_2_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd1_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd1_3_2', code: 'D132', materialCode: 'MAT-206', materialName: '核废料A类', storageDate: '2026-01-26' },
            { id: 'd1_3_3', code: 'D133', materialCode: 'MAT-207', materialName: '核废料B类', storageDate: '2026-01-29' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_2',
      name: 'C-02',
      position: { x: 7, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd2_1_1', code: 'D211', materialCode: 'MAT-208', materialName: '放射性废渣', storageDate: '2026-01-11' },
            { id: 'd2_1_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd2_1_3', code: 'D213', materialCode: 'MAT-209', materialName: '低放废物', storageDate: '2026-01-14' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd2_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd2_2_2', code: 'D222', materialCode: 'MAT-210', materialName: '中放废物', storageDate: '2026-01-17' },
            { id: 'd2_2_3', code: 'D223', materialCode: 'MAT-211', materialName: '核废料A类', storageDate: '2026-01-21' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd2_3_1', code: 'D231', materialCode: 'MAT-212', materialName: '核废料B类', storageDate: '2026-01-23' },
            { id: 'd2_3_2', code: 'D232', materialCode: 'MAT-213', materialName: '放射性废渣', storageDate: '2026-01-26' },
            { id: 'd2_3_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_3',
      name: 'C-03',
      position: { x: 12, y: 2 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd3_1_1', code: 'D311', materialCode: 'MAT-214', materialName: '低放废物', storageDate: '2026-01-11' },
            { id: 'd3_1_2', code: 'D312', materialCode: 'MAT-215', materialName: '中放废物', storageDate: '2026-01-14' },
            { id: 'd3_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd3_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd3_2_2', code: 'D322', materialCode: 'MAT-216', materialName: '核废料A类', storageDate: '2026-01-17' },
            { id: 'd3_2_3', code: 'D323', materialCode: 'MAT-217', materialName: '核废料B类', storageDate: '2026-01-21' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd3_3_1', code: 'D331', materialCode: 'MAT-218', materialName: '放射性废渣', storageDate: '2026-01-23' },
            { id: 'd3_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd3_3_3', code: 'D333', materialCode: 'MAT-219', materialName: '低放废物', storageDate: '2026-01-26' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_4',
      name: 'C-04',
      position: { x: 2, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd4_1_1', code: 'D411', materialCode: 'MAT-220', materialName: '中放废物', storageDate: '2026-01-14' },
            { id: 'd4_1_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd4_1_3', code: 'D413', materialCode: 'MAT-221', materialName: '核废料A类', storageDate: '2026-01-17' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd4_2_1', code: 'D421', materialCode: 'MAT-222', materialName: '核废料B类', storageDate: '2026-01-21' },
            { id: 'd4_2_2', code: 'D422', materialCode: 'MAT-223', materialName: '放射性废渣', storageDate: '2026-01-23' },
            { id: 'd4_2_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd4_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd4_3_2', code: 'D432', materialCode: 'MAT-224', materialName: '低放废物', storageDate: '2026-01-26' },
            { id: 'd4_3_3', code: 'D433', materialCode: 'MAT-225', materialName: '中放废物', storageDate: '2026-01-29' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_5',
      name: 'C-05',
      position: { x: 7, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd5_1_1', code: 'D511', materialCode: 'MAT-226', materialName: '核废料A类', storageDate: '2026-01-11' },
            { id: 'd5_1_2', code: 'D512', materialCode: 'MAT-227', materialName: '核废料B类', storageDate: '2026-01-14' },
            { id: 'd5_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd5_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd5_2_2', code: 'D522', materialCode: 'MAT-228', materialName: '放射性废渣', storageDate: '2026-01-17' },
            { id: 'd5_2_3', code: 'D523', materialCode: 'MAT-229', materialName: '低放废物', storageDate: '2026-01-21' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd5_3_1', code: 'D531', materialCode: 'MAT-230', materialName: '中放废物', storageDate: '2026-01-23' },
            { id: 'd5_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd5_3_3', code: 'D533', materialCode: 'MAT-231', materialName: '核废料A类', storageDate: '2026-01-26' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_6',
      name: 'C-06',
      position: { x: 12, y: 6 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd6_1_1', code: 'D611', materialCode: 'MAT-232', materialName: '核废料B类', storageDate: '2026-01-14' },
            { id: 'd6_1_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd6_1_3', code: 'D613', materialCode: 'MAT-233', materialName: '放射性废渣', storageDate: '2026-01-17' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd6_2_1', code: 'D621', materialCode: 'MAT-234', materialName: '低放废物', storageDate: '2026-01-21' },
            { id: 'd6_2_2', code: 'D622', materialCode: 'MAT-235', materialName: '中放废物', storageDate: '2026-01-23' },
            { id: 'd6_2_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd6_3_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd6_3_2', code: 'D632', materialCode: 'MAT-236', materialName: '核废料A类', storageDate: '2026-01-26' },
            { id: 'd6_3_3', code: 'D633', materialCode: 'MAT-237', materialName: '核废料B类', storageDate: '2026-01-29' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_7',
      name: 'C-07',
      position: { x: 2, y: 10 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd7_1_1', code: 'D711', materialCode: 'MAT-238', materialName: '放射性废渣', storageDate: '2026-01-11' },
            { id: 'd7_1_2', code: 'D712', materialCode: 'MAT-239', materialName: '低放废物', storageDate: '2026-01-14' },
            { id: 'd7_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd7_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd7_2_2', code: 'D722', materialCode: 'MAT-240', materialName: '中放废物', storageDate: '2026-01-17' },
            { id: 'd7_2_3', code: 'D723', materialCode: 'MAT-241', materialName: '核废料A类', storageDate: '2026-01-21' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd7_3_1', code: 'D731', materialCode: 'MAT-242', materialName: '核废料B类', storageDate: '2026-01-23' },
            { id: 'd7_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd7_3_3', code: 'D733', materialCode: 'MAT-243', materialName: '放射性废渣', storageDate: '2026-01-26' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_8',
      name: 'C-08',
      position: { x: 7, y: 10 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd8_1_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd8_1_2', code: 'D812', materialCode: 'MAT-244', materialName: '低放废物', storageDate: '2026-01-14' },
            { id: 'd8_1_3', code: 'D813', materialCode: 'MAT-245', materialName: '中放废物', storageDate: '2026-01-17' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd8_2_1', code: 'D821', materialCode: 'MAT-246', materialName: '核废料A类', storageDate: '2026-01-21' },
            { id: 'd8_2_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd8_2_3', code: 'D823', materialCode: 'MAT-247', materialName: '核废料B类', storageDate: '2026-01-23' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd8_3_1', code: 'D831', materialCode: 'MAT-248', materialName: '放射性废渣', storageDate: '2026-01-26' },
            { id: 'd8_3_2', code: 'D832', materialCode: 'MAT-249', materialName: '低放废物', storageDate: '2026-01-29' },
            { id: 'd8_3_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        }
      ]
    },
    {
      id: 'wh003_shelf_9',
      name: 'C-09',
      position: { x: 12, y: 10 },
      width: 4,
      height: 3,
      layers: [
        {
          level: 1,
          containers: [
            { id: 'd9_1_1', code: 'D911', materialCode: 'MAT-250', materialName: '中放废物', storageDate: '2026-01-11' },
            { id: 'd9_1_2', code: 'D912', materialCode: 'MAT-251', materialName: '核废料A类', storageDate: '2026-01-14' },
            { id: 'd9_1_3', code: '', materialCode: '', materialName: '', storageDate: '' }
          ]
        },
        {
          level: 2,
          containers: [
            { id: 'd9_2_1', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd9_2_2', code: 'D922', materialCode: 'MAT-252', materialName: '核废料B类', storageDate: '2026-01-17' },
            { id: 'd9_2_3', code: 'D923', materialCode: 'MAT-253', materialName: '放射性废渣', storageDate: '2026-01-21' }
          ]
        },
        {
          level: 3,
          containers: [
            { id: 'd9_3_1', code: 'D931', materialCode: 'MAT-254', materialName: '低放废物', storageDate: '2026-01-23' },
            { id: 'd9_3_2', code: '', materialCode: '', materialName: '', storageDate: '' },
            { id: 'd9_3_3', code: 'D933', materialCode: 'MAT-255', materialName: '中放废物', storageDate: '2026-01-26' }
          ]
        }
      ]
    }
  ]
};

// ==================== 数据获取方法 ====================

let balanceAreaPending = null;
const warehouseListPending = new Map();
const warehouseDetailPending = new Map();

function getWarehouseListPendingKey(balanceAreaId) {
  return balanceAreaId == null || balanceAreaId === '' ? '__all__' : String(balanceAreaId);
}

function sortByCode(a, b) {
  const av = a == null ? '' : String(a);
  const bv = b == null ? '' : String(b);
  const an = Number(av);
  const bn = Number(bv);
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
  return av.localeCompare(bv, 'zh-CN', { numeric: true });
}

function normalizePosition(item = {}) {
  const inboundGoods = item.inboundGoodsEntity || {};
  const storageDate = item.lastInboundTime || item.storageDate || item.createTime || inboundGoods.createTime || '';
  const valueOrEmpty = value => (value === null || typeof value === 'undefined' ? '' : value);
  const normalizedGoods = {
    ...inboundGoods,
    taskNum: inboundGoods.taskNum || item.taskNum || '',
    goodCode: inboundGoods.goodCode || inboundGoods.goodsCode || item.goodsCode || item.materialCode || '',
    goodsName: inboundGoods.goodsName || inboundGoods.goodName || inboundGoods.materialName || item.goodsName || item.materialName || '',
    containerCode: inboundGoods.containerCode || item.containerCode || item.containerNo || item.goodsCode || item.code || '',
    materialTypes: inboundGoods.materialTypes || item.materialTypes || '',
    grossWeight: valueOrEmpty(inboundGoods.grossWeight || item.grossWeight),
    tareWeight: valueOrEmpty(inboundGoods.tareWeight || item.tareWeight),
    netWeight: valueOrEmpty(inboundGoods.netWeight || item.netWeight),
    weightUnit: inboundGoods.weightUnit || item.weightUnit || '',
    productionUnit: inboundGoods.productionUnit || item.productionUnit || '',
    boxNum: inboundGoods.boxNum || item.boxNum || '',
    sealCode1: inboundGoods.sealCode1 || item.sealCode1 || '',
    sealCode2: inboundGoods.sealCode2 || item.sealCode2 || ''
  };
  return {
    ...item,
    inboundGoodsEntity: normalizedGoods,
    id: item.id || item.positionId || item.hierarchyId || item.columnId,
    code: normalizedGoods.containerCode,
    materialCode: normalizedGoods.goodCode,
    materialName: normalizedGoods.goodsName,
    storageDate,
    lastInboundTime: item.lastInboundTime || storageDate,
    status: String(item.status == null ? 0 : item.status),
    taskNum: normalizedGoods.taskNum,
    materialTypes: normalizedGoods.materialTypes,
    grossWeight: normalizedGoods.grossWeight,
    tareWeight: normalizedGoods.tareWeight,
    netWeight: normalizedGoods.netWeight,
    weightUnit: normalizedGoods.weightUnit
  };
}

function buildShelvesFromPositions(positions = []) {
  const grouped = new Map();

  positions.map(normalizePosition).forEach(position => {
    const shelfId = position.shelfId || position.shelfCode || 'unknownShelf';
    const rowId = position.rowId || position.rowCode || 'unknownRow';
    const shelfKey = `${shelfId}-${rowId}`;
    if (!grouped.has(shelfKey)) {
      const shelfType = position.shelfType || '';
      const parsedType = parseShelfType(shelfType);
      grouped.set(shelfKey, {
        id: shelfKey,
        name: `${position.shelfCode || shelfId}-${position.rowCode || rowId}`,
        columnId: shelfId,
        rowId,
        columnCode: position.shelfCode || String(shelfId),
        rowCode: position.rowCode || String(rowId),
        shelfType,
        typeInfo: parsedType,
        width: parsedType.width,
        height: parsedType.length,
        position: { x: 0, y: 0 },
        layers: [],
        rawPositions: []
      });
    }

    const shelf = grouped.get(shelfKey);
    shelf.rawPositions.push(position);
    shelf.layers.push({
      id: position.columnId || position.hierarchyId || position.id,
      level: shelf.layers.length + 1,
      node: {
        id: position.columnId || position.hierarchyId || position.id,
        nodeCode: position.columnCode,
        nodeName: position.columnCode
      },
      columnCode: position.columnCode,
      containers: [position]
    });
  });

  return Array.from(grouped.values()).map(shelf => ({
    ...shelf,
    layers: shelf.layers
      .sort((a, b) => sortByCode(a.columnCode || a.level, b.columnCode || b.level))
      .map((layer, index) => ({ ...layer, level: index + 1 }))
  })).sort((a, b) => {
    const columnResult = sortByCode(a.columnCode, b.columnCode);
    return columnResult || sortByCode(a.rowCode, b.rowCode);
  });
}

/**
 * 获取平衡区列表
 */
export async function getBalanceAreaList() {
  if (balanceAreaPending) return balanceAreaPending;

  balanceAreaPending = (async () => {
    try {
      const res = await getAllBalanceAreas();
      const colors = [0x4a90d9, 0x27ae60, 0xe67e22, 0x9b59b6, 0x1abc9c];
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
        return list.map((item, index) => ({
          ...item,
          id: item.id || item.code,
          name: item.name,
          position: balanceAreaConfig[index]?.position || { x: (index - 1) * 6, y: 0, z: 0 },
          color: balanceAreaConfig[index]?.color || colors[index % colors.length],
          warehouseIds: typeof item.warehouseIds !== 'undefined' ? item.warehouseIds : balanceAreaConfig[index]?.warehouseIds || []
        }));
      }
    } catch (err) {
      console.error('获取平衡区列表失败', err);
    }
    return [];
  })().finally(() => {
    balanceAreaPending = null;
  });

  return balanceAreaPending;
}

/**
 * 获取平衡区名称
 */
export function getBalanceAreaName() {
  return '平衡区';
}

/**
 * 获取库房列表（可按平衡区过滤）
 */
export async function getWarehouseList(balanceAreaId) {
  const pendingKey = getWarehouseListPendingKey(balanceAreaId);
  if (warehouseListPending.has(pendingKey)) return warehouseListPending.get(pendingKey);

  const pending = (async () => {
    try {
      const params = balanceAreaId ? { balanceAreaId } : {};
      const res = await getWarehouseListByBalanceArea(params);
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
        const normalized = list.map((w, index) => ({
          ...w,
          id: w.id || w.warehouseId || w.warehouseCode,
          name: w.name || w.warehouseName || w.nodeName,
          width: w.width || 20,
          height: w.height || 15,
          description: w.remark || w.description,
          position: warehouseData[index % warehouseData.length]?.position || { x: (index - 1) * 3.5, y: 0, z: -2 },
          shelfLayout: warehouseData[index % warehouseData.length]?.shelfLayout || { rows: 2, cols: 3 }
        }));
        return normalized;
      }
    } catch (err) {
      console.error('获取库房列表失败', err);
    }

    try {
      const res = await getHierarchyListByNodeType(2);
      const list = Array.isArray(res.data) ? res.data : [];
      const normalized = list
        .filter(item => !balanceAreaId || String(item.parentId || item.balanceAreaId) === String(balanceAreaId))
        .map((item, index) => ({
          ...item,
          id: item.id || item.warehouseId,
          name: item.warehouseName || item.nodeName,
          width: 20,
          height: 15,
          description: item.remark,
          position: warehouseData[index % warehouseData.length]?.position || { x: (index - 1) * 3.5, y: 0, z: -2 },
          shelfLayout: { rows: 2, cols: 3 }
        }));
      return normalized;
    } catch (error) {
      console.error('按节点类型获取库房失败', error);
    }
    return [];
  })().finally(() => {
    warehouseListPending.delete(pendingKey);
  });

  warehouseListPending.set(pendingKey, pending);
  return pending;
}

function resolveExtra(detail) {
  const detailExtra = normalizeExtra(detail.extra);
  if (detailExtra.layout2d) return detailExtra;
  const localExtra = getLocalExtra(detail.id);
  return localExtra.layout2d ? localExtra : detailExtra;
}

/**
 * 根据ID获取库房详情(含货架数据)
 */
export async function getWarehouseById(warehouseId) {
  const pendingKey = String(warehouseId);
  if (warehouseDetailPending.has(pendingKey)) return warehouseDetailPending.get(pendingKey);

  const pending = (async () => {
    try {
      const positionRes = await getPositionMap({ nodeId: warehouseId, nodeType: '2' });
      const positions = Array.isArray(positionRes.data) ? positionRes.data : [];
      const baseShelves = buildShelvesFromPositions(positions);

      let detail = { id: warehouseId };
      try {
        const detailRes = await getHierarchyDetail(warehouseId);
        detail = detailRes.data || detail;
      } catch (error) {
        console.error('获取库房布局详情失败', error);
      }

      const extra = resolveExtra({ ...detail, id: detail.id || warehouseId });
      const layout = extra.layout2d || generateInitialLayout(baseShelves);
      const shelves = applyLayoutToShelves(baseShelves, layout);
      const gridCols = layout.grid ? layout.grid.cols : 20;
      const gridRows = layout.grid ? layout.grid.rows : 12;
      const warehouse = {
        ...detail,
        id: detail.id || warehouseId,
        name: detail.warehouseName || detail.nodeName || positions[0]?.warehouseName || '库房',
        width: gridCols,
        height: gridRows,
        shelves,
        layout2d: layout,
        extra: { ...extra, layout2d: layout },
        shelfLayout: {
          rows: Math.max(1, Math.ceil(Math.sqrt(shelves.length || 1))),
          cols: Math.max(1, Math.ceil(Math.sqrt(shelves.length || 1)))
        }
      };
      return warehouse;
    } catch (error) {
      console.error('获取库房详情失败', error);
      return null;
    }
  })().finally(() => {
    warehouseDetailPending.delete(pendingKey);
  });

  warehouseDetailPending.set(pendingKey, pending);
  return pending;
}

/**
 * 获取默认库房ID
 */
export function getDefaultWarehouseId() {
  return '';
}

export default {
  baseConfig,
  balanceAreaConfig,
  warehouseData,
  shelfData,
  getBalanceAreaList,
  getBalanceAreaName,
  getWarehouseList,
  getWarehouseById,
  getDefaultWarehouseId
};
