<script lang="ts">
  import * as d3 from "d3";
  import { draw } from "svelte/transition";
  import * as easingFns from "svelte/easing";
  import type { TemplateState } from "../template";
  import { findYOnPathFromX } from "./utils";

  const base_line_y = 250;
  const start_coords = [100, base_line_y];

  let dummy_data = [
    // {
    //   name: "jarule",
    //   age_at_death: 30,
    //   life_expectancy: 90,
    //   visible: false,
    //   path: undefined,
    // },
    { name: "ja", age_at_death: 90, life_expectancy: 100, visible: false, path: undefined },
  ];

  export let state: TemplateState;

  const lineGenerator = d3.line().curve(d3.curveBasis);
  const xScale = d3.scaleLinear().domain([0, 100]).range([100, 600]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([200, 50]);

  function makeLivedLine(person) {
    const end_x = xScale(person.life_expectancy);
    // const mid_y = yScale(Math.random());
    const mid_y = yScale(0.9);
    const mid_x = xScale(person.life_expectancy / 2);

    return lineGenerator([start_coords, [mid_x, mid_y], [end_x, base_line_y]]);
  }


  const duration = 2000;
  const delay = 400;
  const animateIn = (node, { path, person, x, y, i }) => {
    const relative_y = base_line_y - y;
    const relative_delay = i * delay;
    const duration_until_point =
      duration * (person.age_at_death / person.life_expectancy);


    return {
      delay: relative_delay + duration_until_point,
      duration: 500,
      css: (t) => `transform: translateY(${t * relative_y - relative_y}px)`,
    };
  };
</script>

<main class={state.theme === "light" ? "light" : "dark"}>
  <svg width="100%" height="100%">
    <g>
      {#each dummy_data as person, i (i)}
        <path
          d={makeLivedLine(person)}
          stroke="black"
          stroke-width="1"
          fill="none"
          transition:draw={{
            duration,
            delay: i * delay,
            easing: easingFns.linear,
          }}
          bind:this={person.path}
        />
        <circle
          r="2"
          cx={xScale(person.age_at_death)}
          cy="250"
          fill="orange"
          in:animateIn={{
            path: person.path,
            person,
            x: xScale(person.age_at_death),
            y: findYOnPathFromX(person.path, xScale(person.age_at_death)),
            i,
          }}
        />
      {/each}
    </g>
    <line x1="100" y1={base_line_y} x2="600" y2={base_line_y} stroke="black" />
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
    background-color: lightyellow;
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
