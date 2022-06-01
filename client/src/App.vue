<script setup lang="ts">
import { Chart, LinearScale, PointElement } from "chart.js";
import { onMounted } from "vue";
import {
    ForceDirectedGraphController,
    EdgeLine,
    DendogramController,
} from "chartjs-chart-graph";

Chart.register(
    ForceDirectedGraphController,
    EdgeLine,
    LinearScale,
    PointElement,
    DendogramController
);
const data = `https://raw.githubusercontent.com/sgratzl/chartjs-chart-graph/master/samples/tree.json`;

function createChart(nodes, id, type, orientation) {
    new Chart(
        (document.getElementById(id) as HTMLCanvasElement).getContext("2d"),
        {
            type,
            data: {
                labels: nodes.map((d) => d.name),
                datasets: [
                    {
                        pointBackgroundColor: "steelblue",
                        pointRadius: 5,
                        data: nodes.map((d) => Object.assign({}, d)),
                    },
                ],
            },
            options: {
                tree: {
                    orientation,
                },
                legend: {
                    display: false,
                },
                layout: {
                    padding: {
                        left: 5,
                        top: 5,
                        bottom: 5,
                        right: 5,
                    },
                },
            },
        }
    );
}

onMounted(() => {
    fetch(data)
        .then((r) => r.json())
        .then((nodes) => {
            createChart(nodes, "dr", "dendogram", "radial");
        });
});
</script>

<template>
    <div><canvas id="dr"></canvas></div>
</template>

<style>
body {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(3, 1fr);
}
</style>
