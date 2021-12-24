<script lang="ts">
  import * as d3 from "d3";
  import { timeline } from "motion";
  import { draw } from "svelte/transition";
  import * as easingFns from "svelte/easing";
  import type { Dataset, DataRow, TemplateState } from "../template";
  import { findYOnPathFromX } from "./utils";

  export let state: TemplateState;
  export let data: Dataset<DataRow>;

  $: data_with_paths =
    data.map((d) => ({
      ...d,
      path: undefined,
      life_expectancy: Math.random() * 25 + 60,
    })) || [];

  setTimeout(() => {
    let circles = document.querySelectorAll("circle");

    for (let [i, circle] of circles.entries()) {
      const path = circle.parentNode.querySelector("path");
      const person = data_with_paths[i];
      const y = findYOnPathFromX(path, xScale(person.age_at_death));
      const relative_y = base_line_y - y;
      const relative_delay = getDelay(i);
      const duration_until_point =
        getDuration(i) *
        (parseInt(person.age_at_death) / person.life_expectancy) - 1000;

      const sequence = [
        [circle, { opacity: 1}, { duration: 0.1}],
        [circle, { transform: [`translateY(-${relative_y}px)`, "translateY(0)"] }, { at: "+0"}]
      ]

      timeline(sequence, {
        duration: 1,
        delay: (relative_delay + duration_until_point) / 1000,
      });
    }
  }, 1000);

  const oranges = [
    "rgb(136,51,6)",
    "rgb(185,132,20)",
    "rgb(219,115,4)",
    "rgb(229,94,5)",
    "rgb(153,103,27)",
  ];
  const base_line_y = 250;
  const start_coords = [100, base_line_y];
  const durations = [4000, 2000, 1500, 1000, 1000];
  const delay = 400;

  function getDuration(i) {
    return i < durations.length ? durations[i] : 200;
  }

  function getDelay(i) {
    if (i == 0) return 0;
    const duration_so_far = durations
      .slice(0, i)
      .reduce((acc, cur) => acc + cur);
    if (i < durations.length) {
      return duration_so_far + delay;
    }
    return duration_so_far + (i/20) * delay;
  }

  const lineGenerator = d3.line().curve(d3.curveBasis);
  const xScale = d3.scaleLinear().domain([0, 100]).range([100, 600]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([200, 100]);

  const randoms = {};

  function makeLivedLine(person, i) {
    const random = randoms[i] ? randoms[i] : Math.random();
    randoms[i] = random;

    const end_x = xScale(person.life_expectancy);
    const mid_y = yScale(random);
    const mid_one_x = xScale(person.life_expectancy / 4);
    const mid_two_x = xScale((person.life_expectancy / 4) * 3);

    return lineGenerator([
      start_coords,
      [mid_one_x, mid_y],
      [mid_two_x, mid_y],
      [end_x, base_line_y],
    ]);
  }

  const animateDots = (node, { person, i }) => {
    const path = node.parentNode.querySelector("path");
    const y = findYOnPathFromX(path, xScale(person.age_at_death));
    // const y = 20;
    const relative_y = base_line_y - y;
    const relative_delay = getDelay(i);
    const duration_until_point =
      getDuration(i) * (person.age_at_death / person.life_expectancy);

    return {
      delay: relative_delay + duration_until_point,
      duration: 1000,
      css: (t) => `
        transform: translateY(${t * relative_y - relative_y}px);
        opacity: ${t === 0 ? 0 : 1};
      `,
      easing: easingFns.quintIn,
    };
  };

  function getWhiteLineDelay(person, i) {
    const delay = getDelay(i);
    if (i === 0) return delay + 500;
    return delay;
  }
</script>

<main class={state.theme === "light" ? "light" : "dark"}>
  <svg width="100%" height="100%">
    {#each data_with_paths as person, i (i)}
      <g>
        <clipPath id="orange-{person.id}">
          <rect
            x={0}
            y="0"
            height={base_line_y}
            width={xScale(person.age_at_death)}
          />
        </clipPath>
        <clipPath id="black-{person.id}">
          <rect
            x={xScale(person.age_at_death)}
            y="0"
            height={base_line_y}
            width={800}
          />
        </clipPath>
        <path
          d={makeLivedLine(person, i)}
          stroke="rgb(185,185,185)"
          stroke-width="0.5"
          fill="none"
          clip-path="url(#black-{person.id})"
          transition:draw={{
            duration: getDuration(i),
            delay: getWhiteLineDelay(person, i),
            easing: easingFns.linear,
          }}
        />
        <path
          d={makeLivedLine(person, i)}
          stroke={oranges[(i + 1) % 5]}
          stroke-width="1"
          clip-path="url(#orange-{person.id})"
          fill="none"
          transition:draw={{
            duration: getDuration(i),
            delay: getDelay(i),
            easing: easingFns.linear,
          }}
        />
        <circle
          r="2"
          cx={xScale(person.age_at_death)}
          cy={base_line_y}
          fill={oranges[(i + 1) % 5]}
          style="opacity: 0"
        />
        <!-- bind:this={circles[i]} -->
      </g>
    {/each}
    <line
      x1="100"
      y1={base_line_y}
      x2="600"
      y2={base_line_y}
      stroke="white"
      stroke-width="0.5"
    />
  </svg>
</main>

<style>
  :global(html),
  :global(body),
  main {
    height: 100%;
    margin: 0;
  }
  main.light {
    background-color: rgb(20, 20, 20);
  }
  main.dark {
    background-color: darkblue;
  }
  svg {
    display: block;
  }
  svg > g {
    transform-origin: 400px 400px;
  }
</style>
