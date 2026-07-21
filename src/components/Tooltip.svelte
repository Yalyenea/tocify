<script>
  import {fly} from 'svelte/transition';
  import {backOut} from 'svelte/easing';

  export let className = '';
  export let text = 'Tooltip text';
  export let position = 'top';
  export let width = 'w-48';
  export let isTextCopiable = false;

  export let color = 'bg-white';

  let isVisible = false;
  let timer = null;
  let isCopied = false;

  const delay = (func) => {
    return () => {
      timer = setTimeout(func, 300);
    };
  };

  const setVisible = () => {
    if (timer) clearTimeout(timer);
    isVisible = true;
  };

  const setInVisible = () => {
    isVisible = false;
    setTimeout(() => (isCopied = false), 300);
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    isCopied = true;
    setTimeout(() => (isCopied = false), 1500);
  };

  const toUnit = (val) => {
    if (typeof val === 'number') return `${val * 100}%`;
    
    if (!isNaN(val) && !val.includes('%') && !val.includes('px')) {
       const num = parseFloat(val);
       if (Math.abs(num) <= 1) {
         return `${num * 100}%`;
       }
       return `${val}%`;
    }
    return val;
  };

  $: isCustomPosition = position.includes(' ');
  $: customCoords = isCustomPosition ? position.split(' ').map(toUnit) : [];
  
  $: customStyle = isCustomPosition  ? `left: ${customCoords[0]}; top: ${customCoords[1]}; margin: 0;` : '';

  const getFlyParams = (pos) => {
    if (isCustomPosition) return { y: 8 };
    switch (pos) {
      case 'top':
        return {y: 8};
      case 'bottom':
        return {y: -8};
      case 'left':
        return {x: 8};
      case 'right':
        return {x: -8};
      default:
        return {y: 8};
    }
  };
</script>

<div class={'relative inline-block ' + className}>
  <div
    role="button"
    tabindex="0"
    class="inline-block cursor-pointer"
    on:mouseenter={setVisible}
    on:mouseleave={delay(setInVisible)}
  >
    <slot />
  </div>

  {#if isVisible}
    <button
      transition:fly={{...getFlyParams(position), duration: 200, easing: backOut}}
      on:mouseenter={setVisible}
      on:mouseleave={delay(setInVisible)}
      on:click={isTextCopiable ? copyText : null}
      style={customStyle}
      class={`
        absolute z-50 rounded-md bg-white p-2 text-left text-xs leading-5 text-slate-700 shadow-lg
        break-words whitespace-pre-line md:px-3 md:py-2 ${width} ${color}
        ${isTextCopiable ? 'cursor-copy' : ''}
        
        ${!isCustomPosition && position === 'top' ? 'bottom-full left-1/2 mb-2 -translate-x-1/2 transform' : ''}
        ${!isCustomPosition && position === 'bottom' ? 'top-full left-1/2 mt-2 -translate-x-1/2 transform' : ''}
        ${!isCustomPosition && position === 'left' ? 'right-full top-1/2 mr-2 -translate-y-1/2 transform' : ''}
        ${!isCustomPosition && position === 'right' ? 'left-full top-1/2 ml-2 -translate-y-1/2 transform' : ''}
      `}
    >
      <div class="relative z-10">
        {#if isCopied}
          <span class="inline-block text-[11px] font-semibold uppercase tracking-wide text-blue-600">Copied</span>
        {:else}
          {text}
        {/if}
      </div>
    </button>
  {/if}
</div>
