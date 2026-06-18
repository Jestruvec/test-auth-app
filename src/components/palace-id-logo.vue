<script setup lang="ts">
import PalaceIdLogo from "@assets/svg/palace-id.svg";
</script>

<template>
  <div
    class="mx-auto p-0.5 rounded-full flex items-center justify-center w-22 h-10"
    style="background: linear-gradient(to right, #1c6cc7, #03b9ff)"
  >
    <div
      class="bg-tpc-bg-default rounded-full p-3 flex items-center justify-center"
    >
      <img :src="PalaceIdLogo.src" alt="Palace id logo" class="w-auto h-auto" />
    </div>
  </div>
</template>
