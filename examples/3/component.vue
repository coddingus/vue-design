<script>
export default {
    methods: {
        handler() {
            alert('ok')
        }
    }
}
</script>
<template>
    <div @click="handler">click me</div>
</template>