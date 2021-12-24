<script lang="ts">
  import * as d3 from "d3";
  import { timeline } from "motion";
  import { onMount } from "svelte";
  import { findYOnPathFromX } from "./utils";
  import type { Dataset, DataRow, TemplateState } from "../template";

  export let state: TemplateState;
  export let data: Dataset<DataRow>;

  $: completed_data = data.map((d) => ({
    ...d,
    life_expectancy: Math.random() * 45 + 45,
  }));

  const oranges = [
    "rgb(136,51,6)",
    "rgb(185,132,20)",
    "rgb(219,115,4)",
    "rgb(229,94,5)",
    "rgb(153,103,27)",
  ];
  const base_line_y = 300;

  // Make line paths
  const start_coords = [100, base_line_y];
  const lineGenerator = d3.line().curve(d3.curveBasis);
  const xScale = d3.scaleLinear().domain([0, 90]).range([100, 800]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([base_line_y - 50, 50]);

  const randoms = {};

  function makeLivedLine(person, i) {
    randoms[i] = randoms[i] ? randoms[i] : Math.random();
    const end_x = xScale(person.life_expectancy);
    const mid_y = yScale(randoms[i]);
    const mid_one_x = xScale(person.life_expectancy / 4);
    const mid_two_x = xScale((person.life_expectancy / 4) * 3);

    return lineGenerator([
      start_coords,
      [mid_one_x, mid_y],
      [mid_two_x, mid_y],
      [end_x, base_line_y],
    ]);
  }

  // Animate lines
  const duration_overides = { 0: 4, 1: 2.5, 2: 2, 3: 2, 4: 2 };

  onMount(() => {
    let lives = document.querySelectorAll(".life");

    let sequence = [];

    for (let [i, life] of lives.entries()) {
      const circle = life.querySelector("circle");
      const orange_clip_rect = life.querySelector(".orange-clip rect");
      const black_clip_rect = life.querySelector(".black-clip rect");
      const path = circle.parentNode.querySelector("path");

      const person = completed_data[i];
      const y = findYOnPathFromX(path, xScale(person.age_at_death));
      const relative_y = base_line_y - y;

      const duration_overide = duration_overides[i];
      const duration_f = duration_overide || 0.1;
      const life_percent = person.age_at_death / person.life_expectancy;

      sequence.push(
        // Animate the orange line
        [
          orange_clip_rect,
          { width: xScale(person.age_at_death) + "px" },
          {
            at: duration_overide ? "+0" : "-0.01",
            duration: 1 * duration_f * life_percent,
          },
        ],
        // Animate the circle
        [
          circle,
          { opacity: 0.7 },
          { at: `-${0.1}`, duration: (0.5 * duration_f) / 2 },
        ],
        [
          circle,
          { transform: [`translateY(-${relative_y}px)`, "translateY(0)"] },
          {
            duration: (0.5 * duration_f) / 2,
            at: `+${(0.3 * duration_f) / 2}`,
          },
        ],
        // Animate the remainder of the line
        [
          black_clip_rect,
          {
            width: xScale(person.life_expectancy - person.age_at_death) + "px",
          },
          {
            at: "<",
            duration: 1 * duration_f * (1 - life_percent),
          },
        ]
      );
    }

    timeline(sequence, { delay: 0.5 });
  });
</script>

<main class={state.theme === "light" ? "light" : "dark"}>
  <svg width="100%" height="100%">
    {#each completed_data as person, i (i)}
      <g class="life">
        <clipPath class="orange-clip" id="orange-{person.id}">
          <rect x={0} y="0" height={base_line_y} width={0} />
        </clipPath>
        <clipPath class="black-clip" id="black-{person.id}">
          <rect
            x={xScale(person.age_at_death)}
            y="0"
            height={base_line_y}
            width={0}
          />
        </clipPath>

        <path
          d={makeLivedLine(person, i)}
          stroke="rgb(185,185,185)"
          stroke-width="1"
          fill="none"
          clip-path="url(#black-{person.id})"
          opacity="0.6"
        />
        <path
          d={makeLivedLine(person, i)}
          stroke={oranges[(i + 1) % 5]}
          stroke-width="1.5"
          clip-path="url(#orange-{person.id})"
          fill="none"
          opacity="0.6"
        />

        <circle
          r="2"
          cx={xScale(person.age_at_death)}
          cy={base_line_y}
          fill={oranges[(i + 1) % 5]}
          style="opacity: 0"
        />
      </g>
    {/each}
    <line
      x1="100"
      y1={base_line_y}
      x2="800"
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
