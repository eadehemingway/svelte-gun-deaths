<script lang="ts">

  import type { TemplateState } from "../template";

  export let state: TemplateState;
</script>

<main class={state.theme === "light" ? "light" : "dark"}>
  <svg width="100%" height="100%">
    <g>
      {#each Array(state.numCircles) as _, i (i)}
        <circle
          cx={Math.floor(10 + Math.random() * 85) + "%"}
          cy={Math.floor(10 + Math.random() * 75) + "%"}
          r={Math.floor(Math.random() * 100)}
          fill={`hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`}
        />
      {/each}
    </g>
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
