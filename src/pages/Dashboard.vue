<template>
  <div>
    <h1>Dashboard</h1>
    <p>This is the Dashboard page.</p>
    <p>Status: {{ node.status }}</p>
    <p>Connected: {{ node.connected }}</p>
    <p v-if="node.peerList.length > 0">Peers: {{ node.peerList.map(({ id }) => id).join(', ') }}</p>
    <button @click="toggleBlocks">Toggle Blocks</button>
    <button @click=toggleMining>{{ !mining ? 'Start' : 'Stop' }}</button>
  </div>
  <h3>Mining {{ mining }}</h3>
  <ul v-if="showBlocks" class="blocks">
    <li v-for="(item, index) in lastFiveBlocks" :key=item.hash>

      <ul>
        <li>Hash: {{ item.hash }}</li>
        <li>Index: {{ blocks.length + index }}</li>

        <!-- <li>Nonce: {{ item.nonce }}</li>
        <li>Transactions: {{ item.transactions }}</li>
        <li>Timestamp: {{ item.timestamp }}</li> -->
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Ref, ref } from '@vue/reactivity';
import node from '../node/index'
import { Block } from '../blockchain/block';
import { computed, onMounted } from 'vue';
let blocks: Ref<Block[]> = ref([]);
let showBlocks = ref(true);
let mining = ref(false);

const lastFiveBlocks = computed(() => {
  if (blocks.value.length < 6) return blocks.value;
  return blocks.value.slice(blocks.value.length - 6, blocks.value.length - 1)
})


let x: any;
onMounted(() => {
  if (node.blockchain) blocks.value = [...node.blockchain!.chain];
})

function toggleBlocks() {
  showBlocks.value = !showBlocks.value;
  ;
}
function startMining() {

  x = setInterval(() => {
    node.mineBlock();
    blocks.value.push(node.blockchain!.chain[node.blockchain!.chain.length - 1]);
  }, 1000);
}

function toggleMining() {
  if (mining.value) {
    mining.value = false;

    clearInterval(x);
  } else {
    mining.value = true;

    startMining();
  }

}
</script>

<style lang="scss">
ul {
  display: flex;
  flex-direction: column;
}

li {
  font-size: 1rem;
}
</style>
  