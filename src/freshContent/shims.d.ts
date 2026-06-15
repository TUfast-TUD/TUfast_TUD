declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'lottie-web/build/player/lottie_light_canvas' {
  const lottie: any
  export default lottie
}

declare module '*.scss' {
  const content: Record<string, any>
  export default content
}

declare module '*.sass' {
  const content: Record<string, any>
  export default content
}
