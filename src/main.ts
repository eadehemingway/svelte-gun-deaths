import App from './App.svelte'
import type { TemplateState } from '../template'

export const state: TemplateState = {
  theme: 'light',
}
export const data = { data: []}

let app;

export function update() {
  app.$set({ state, data: data.data })
}

export function draw() {
  app = new App({
    target: document.body,
    props: { state, data: data.data },
    intro: true,
  });
}
