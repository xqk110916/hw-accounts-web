<template>
  <WarehouseGridMap2D
    :warehouse-name="warehouseName"
    :shelves="shelves"
    :layout="layout"
    :editable="false"
    :selected-shelf="selectedShelf"
    @shelf-select="$emit('shelf-select', $event)"
    @container-click="$emit('container-click', $event)"
  />
</template>

<script>
import WarehouseGridMap2D from './WarehouseGridMap2D.vue';

export default {
  name: 'LocationMap2D',
  components: { WarehouseGridMap2D },
  props: {
    warehouseName: { type: String, default: '库房' },
    warehouseWidth: { type: Number, default: 20 },
    warehouseHeight: { type: Number, default: 15 },
    shelves: { type: Array, default: () => [] },
    layout: { type: Object, default: null },
    dateColorMap: { type: Object, default: () => ({}) },
    selectedShelf: { type: Object, default: null }
  }
};
</script>
