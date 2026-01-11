/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  /**
   * Ziggy helper global.
   * Disponible en runtime si tienes Ziggy instalado/configurado.
   */
  function route(
    name?: string,
    params?: any,
    absolute?: boolean,
    config?: any
  ): any
}

export {}
