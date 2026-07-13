<template>
	<div>
		<h1>
			{{ greeting }}
		</h1>
		<button type="button" @click="incrementCounter">Click me!</button>
		<p>Counter: {{ counter }}</p>
	</div>
</template>

<script setup lang="ts">
// Define reactive data and props
import { ref } from "vue";

const version = 3;
const greeting = ref(`Hello, Vue ${version}!`);
const counter = ref(0);
const doubled = computed(() => counter.value * 2);

// Define a function
const incrementCounter = () => {
	counter.value++;
};

const _zero = doubled.value + counter.value;
</script>
