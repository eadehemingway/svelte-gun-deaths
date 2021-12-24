import App from './App.svelte'
import type { TemplateState } from '../template'

export const state: TemplateState = {
  numCircles: 25,
  theme: 'light',
}
export const data = {};

let app;

export function update() {
  app.$set({ state })
}

export function draw() {
  app = new App({
    target: document.body,
    props: { state }
  });
}
