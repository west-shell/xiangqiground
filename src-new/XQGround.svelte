<script lang="ts">
  /**
   * XQGround.svelte - 中国象棋棋盘的 Svelte 组件包装
   *
   * 用法：
   * ```svelte
   * <XQGround
   *   config={{ fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w", movable: { color: "red" } }}
   *   onMove={(from, to, captured) => console.log(from, to)}
   *   onSelect={(key) => console.log("selected", key)}
   * />
   * ```
   */
  import { onMount, onDestroy, tick } from "svelte";
  import { XQGround } from "./api";
  import type { XQConfig, Key, Piece } from "./types";

  interface Props {
    config?: XQConfig;
    onMove?: (from: Key, to: Key, captured?: Piece | null) => void;
    onSelect?: (key: Key | null) => void;
    class?: string;
    style?: string;
  }

  let {
    config = {},
    onMove,
    onSelect,
    class: className = "",
    style = "",
  }: Props = $props();

  let containerEl: HTMLDivElement;
  let ground: XQGround | null = null;

  $effect(() => {
    // 监听 config 变化
    if (ground) {
      ground.set(config);
    }
  });

  $effect(() => {
    // 监听 onMove/onSelect 回调变化
    if (ground && onMove) {
      ground.set({
        movable: {
          events: {
            after: (from: Key, to: Key, captured?: Piece | null) => {
              onMove(from, to, captured);
            },
          },
        },
      });
    }
    if (ground && onSelect) {
      ground.set({
        events: {
          select: onSelect,
        },
      });
    }
  });

  onMount(async () => {
    await tick();
    ground = new XQGround(containerEl, config);

    if (onMove) {
      ground.set({
        movable: {
          events: {
            after: (from: Key, to: Key, captured?: Piece | null) => {
              onMove(from, to, captured);
            },
          },
        },
      });
    }
    if (onSelect) {
      ground.set({
        events: {
          select: onSelect,
        },
      });
    }
  });

  onDestroy(() => {
    if (ground) {
      ground.destroy();
      ground = null;
    }
  });

  /** 导出实例方法 */
  function getGround(): XQGround | null {
    return ground;
  }
</script>

<div
  bind:this={containerEl}
  class="xqg-svelte-wrapper {className}"
  {style}
  role="application"
  aria-label="中国象棋棋盘"
>
</div>

<style>
  .xqg-svelte-wrapper {
    width: 100%;
    height: 100%;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .xqg-svelte-wrapper :global(.xqg-piece) {
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .xqg-svelte-wrapper :global(.xqg-piece:hover) {
    filter: brightness(1.15);
  }

  .xqg-svelte-wrapper :global(.xqg-board) {
    user-select: none;
    touch-action: none;
  }
</style>
