<template>
  <div class="container">
    <nav>
      <ul>
        <li>
          <router-link to="/connections">Connections</router-link>
        </li>
        <li>
          <router-link to="/dashboard">Dashboard</router-link>
        </li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">


</script>
<style lang="scss">
ul {
  list-style:  none;
  display: flex;
  flex-direction: row;
  li {
    margin: 0 1em;
  }
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

</style>
