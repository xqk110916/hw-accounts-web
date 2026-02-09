/**
 * 库位地图统一数据源
 * 所有数据集中在此文件管理,方便后续替换为真实数据
 */

// ==================== 基础配置 ====================
export const baseConfig = {
  balanceArea: '一号平衡区',  // 平衡区名称
  defaultWarehouseId: 'wh001' // 默认选中的库房ID
};

// ==================== 库房数据 ====================
export const warehouseData = [
  {
    id: 'wh001',
    name: '一号库房',
    width: 20,
    height: 15,
    description: '存放低放射性废物'
  },
  {
    id: 'wh002',
    name: '二号库房',
    width: 18,
    height: 12,
    description: '存放中放射性废物'
  },
  {
    id: 'wh003',
    name: '三号库房',
    width: 25,
    height: 18,
    description: '存放高放射性废物'
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
    }
  ]
};

// ==================== 数据获取方法 ====================

/**
 * 获取平衡区名称
 */
export function getBalanceAreaName() {
  return baseConfig.balanceArea;
}

/**
 * 获取库房列表
 */
export function getWarehouseList() {
  return warehouseData.map(w => ({
    id: w.id,
    name: w.name,
    width: w.width,
    height: w.height,
    description: w.description
  }));
}

/**
 * 根据ID获取库房详情(含货架数据)
 */
export function getWarehouseById(warehouseId) {
  const warehouse = warehouseData.find(w => w.id === warehouseId);
  if (!warehouse) return null;
  
  const shelves = shelfData[warehouseId] || [];
  
  return {
    ...warehouse,
    shelves: shelves
  };
}

/**
 * 获取默认库房ID
 */
export function getDefaultWarehouseId() {
  return baseConfig.defaultWarehouseId;
}

export default {
  baseConfig,
  warehouseData,
  shelfData,
  getBalanceAreaName,
  getWarehouseList,
  getWarehouseById,
  getDefaultWarehouseId
};
