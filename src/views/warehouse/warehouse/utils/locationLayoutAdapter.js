import { parseShelfType, normalizeExtra } from './locationLayoutStorage';

function cleanName(name) {
  return String(name || '').replace(/^【[^】]+】/, '') || '-';
}

function getNodeChildren(node) {
  return Array.isArray(node && node.children) ? node.children : [];
}

function normalizePosition(item = {}) {
  return {
    ...item,
    id: item.id || item.positionId || item.hierarchyId,
    code: item.goodsCode || item.code || '',
    materialCode: item.goodsCode || item.materialCode || '',
    materialName: item.goodsName || item.materialName || '',
    storageDate: item.lastInboundTime || item.createTime || item.storageDate || '',
    status: String(item.status == null ? 0 : item.status)
  };
}

function matchPosition(position, columnNode, rowNode, layerNode) {
  const columnId = String(columnNode.id);
  const rowId = String(rowNode.id);
  const layerId = String(layerNode.id);
  const sameShelf = !position.shelfId || String(position.shelfId) === columnId;
  const sameRow = !position.rowId || String(position.rowId) === rowId;
  const sameLayer = String(position.columnId || position.hierarchyId || '') === layerId;
  return sameShelf && sameRow && sameLayer;
}

export function findNodeById(nodes, id, nodeType) {
  const targetId = String(id);
  const stack = Array.isArray(nodes) ? [...nodes] : [nodes].filter(Boolean);
  while (stack.length) {
    const node = stack.shift();
    if (String(node.id) === targetId && (!nodeType || String(node.nodeType) === String(nodeType))) return node;
    stack.push(...getNodeChildren(node));
  }
  return null;
}

export function buildShelfTypeMap(options = []) {
  return options.reduce((map, item) => {
    const key = item.value || item.dictValue || item.bizCode;
    if (key) map[String(key)] = item.bizCode || key;
    if (item.bizCode) map[String(item.bizCode)] = item.bizCode;
    return map;
  }, {});
}

export function getColumnShelfType(columnNode, shelfTypeMap = {}) {
  const extra = normalizeExtra(columnNode.extra);
  const raw = columnNode.shelfType || extra.shelfType || columnNode.dictValue || '';
  return shelfTypeMap[String(raw)] || raw || '';
}

export function buildShelvesFromWarehouse(warehouseNode, positions = [], shelfTypeOptions = []) {
  const shelfTypeMap = buildShelfTypeMap(shelfTypeOptions);
  const columns = getNodeChildren(warehouseNode).filter(node => String(node.nodeType) === '3');
  const normalizedPositions = (positions || []).map(normalizePosition);

  return columns.flatMap((columnNode, columnIndex) => {
    const rows = getNodeChildren(columnNode).filter(node => String(node.nodeType) === '4');
    const shelfType = getColumnShelfType(columnNode, shelfTypeMap);
    const parsedType = parseShelfType(shelfType);

    return rows.map((rowNode, rowIndex) => {
      const layers = getNodeChildren(rowNode).filter(node => String(node.nodeType) === '5');
      const viewLayers = (layers.length ? layers : Array.from({ length: parsedType.levelCount }, (_, index) => ({
        id: `${rowNode.id}_level_${index + 1}`,
        nodeCode: String(index + 1),
        nodeName: `【层】${String(index + 1).padStart(2, '0')}`
      }))).map((layerNode, layerIndex) => {
        const hit = normalizedPositions.find(position => matchPosition(position, columnNode, rowNode, layerNode));
        return {
          id: layerNode.id,
          level: layerIndex + 1,
          node: layerNode,
          containers: [hit || {
            id: layerNode.id,
            code: '',
            materialCode: '',
            materialName: '',
            storageDate: '',
            status: '0'
          }]
        };
      });

      return {
        id: `${columnNode.id}-${rowNode.id}`,
        name: `${cleanName(columnNode.nodeName || columnNode.label)}-${cleanName(rowNode.nodeName || rowNode.label)}`,
        columnId: columnNode.id,
        rowId: rowNode.id,
        columnCode: columnNode.nodeCode || columnNode.label || `S${columnIndex + 1}`,
        rowCode: rowNode.nodeCode || String(rowIndex + 1),
        shelfType,
        typeInfo: parsedType,
        width: parsedType.width,
        height: parsedType.length,
        position: { x: 0, y: 0 },
        layers: viewLayers,
        rawColumn: columnNode,
        rawRow: rowNode
      };
    });
  });
}

export function generateInitialLayout(shelves = []) {
  const gap = 1;
  const margin = 1;

  const sortCode = (a, b) => {
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return String(a).localeCompare(String(b), 'zh-CN', { numeric: true });
  };
  const columnCodes = [...new Set(shelves.map(shelf => shelf.columnCode || shelf.columnId || '1'))].sort(sortCode);
  const rowCodes = [...new Set(shelves.map(shelf => shelf.rowCode || shelf.rowId || '1'))].sort(sortCode);
  const columnIndexMap = columnCodes.reduce((map, code, index) => ({ ...map, [code]: index }), {});
  const rowIndexMap = rowCodes.reduce((map, code, index) => ({ ...map, [code]: index }), {});
  const columnWidths = Array.from({ length: columnCodes.length }, () => 0);
  const rowHeights = Array.from({ length: rowCodes.length }, () => 0);
  const measured = shelves.map(shelf => {
    const typeInfo = shelf.typeInfo || parseShelfType(shelf.shelfType);
    const w = Math.max(typeInfo.width || shelf.width || 10, 2);
    const h = Math.max(typeInfo.length || shelf.height || 2, 1);
    const columnKey = shelf.columnCode || shelf.columnId || '1';
    const rowKey = shelf.rowCode || shelf.rowId || '1';
    const columnIndex = columnIndexMap[columnKey] == null ? 0 : columnIndexMap[columnKey];
    const rowIndex = rowIndexMap[rowKey] == null ? 0 : rowIndexMap[rowKey];
    columnWidths[columnIndex] = Math.max(columnWidths[columnIndex], w);
    rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], h);
    return { shelf, w, h, columnIndex, rowIndex };
  });

  const columnOffsets = columnWidths.reduce((offsets, width, index) => {
    offsets[index] = index === 0 ? margin : offsets[index - 1] + columnWidths[index - 1] + gap;
    return offsets;
  }, []);
  const rowOffsets = rowHeights.reduce((offsets, height, index) => {
    offsets[index] = index === 0 ? margin : offsets[index - 1] + rowHeights[index - 1] + gap;
    return offsets;
  }, []);

  const layoutShelves = measured.map(({ shelf, w, h, columnIndex, rowIndex }) => {
    return {
      id: shelf.id,
      columnId: shelf.columnId,
      rowId: shelf.rowId,
      columnCode: shelf.columnCode,
      rowCode: shelf.rowCode,
      x: columnOffsets[columnIndex] || margin,
      y: rowOffsets[rowIndex] || margin,
      w,
      h,
      shelfType: shelf.shelfType
    };
  });

  const cols = Math.max(20, margin + columnWidths.reduce((sum, width) => sum + width, 0) + Math.max(columnWidths.length - 1, 0) * gap + margin);
  const rows = Math.max(12, margin + rowHeights.reduce((sum, height) => sum + height, 0) + Math.max(rowHeights.length - 1, 0) * gap + margin);
  const aisles = rows > 3 ? [{ id: 'aisle_main_1', x: 0, y: 0, w: cols, h: 1 }] : [];
  return {
    grid: { rows, cols, cellSize: 32 },
    shelves: layoutShelves,
    aisles
  };
}

export function applyLayoutToShelves(shelves = [], layout) {
  const layoutMap = new Map(((layout && layout.shelves) || []).map(item => [String(item.id), item]));
  return shelves.map(shelf => {
    const hit = layoutMap.get(String(shelf.id));
    if (!hit) return shelf;
    return {
      ...shelf,
      width: hit.w,
      height: hit.h,
      position: { x: hit.x, y: hit.y },
      layout: hit
    };
  });
}

export function resolveWarehouseLayout(warehouseDetail, shelves = []) {
  const extra = normalizeExtra(warehouseDetail && warehouseDetail.extra);
  const layout = extra.layout2d || generateInitialLayout(shelves);
  return {
    extra: { ...extra, layout2d: layout },
    layout,
    shelves: applyLayoutToShelves(shelves, layout)
  };
}
