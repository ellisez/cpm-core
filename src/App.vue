<template>
  <div style="justify-content:center">
    <text class="text">{{message}}</text>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        message: 'Hello Weex!'
      }
    }
  }
</script>

<style scoped>
  .text {
    color: #41B883;
    text-align: center;
    font-size: 100px;
  }
</style>