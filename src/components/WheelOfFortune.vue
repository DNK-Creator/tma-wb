<template>
  <div
    class="wheel-container"
    :class="[
      `indicator-${indicatorPosition}`,
      { 'wheel-container-indicator': displayIndicator },
      { 'wheel-container-shadow': displayShadow },
      { 'wheel-container-border': displayBorder },
    ]"
    :style="{ '--border-color': colorScheme === 'light' ? 'white' : 'rgb(60, 24, 51)' }"
  >

    <!-- BASE WHEEL -->
    <div
      v-if="baseDisplay"
      class="wheel-base-container"
      :class="[{ 'wheel-base-container-shadow': baseDisplayShadow }]"
      :style="{
        width: `${baseSize}vh`,
        height: `${baseSize}vh`,
        background: `${baseBackground}`,
        'border': `0.8vh solid var(--border-color)`
      }"
    >
      <div class="wheel-base">
        <slot name="baseContent"></slot>
      </div>
      <div v-if="baseDisplayIndicator" class="wheel-base-indicator"></div>
    </div>
    <div
      class="wheel"
      :class="[`easing-${easing}`]"
      :style="{
        width: `${size}vh`,
        height: `${size}vh`,
        transitionDuration: `${duration}s`,
        transform: `rotate(${this.startingAngle}deg)`,
      }"
    >
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="wheel-item"
        :style="{
          transform: `rotate(${itemAngle * index}deg) skewY(${-(
            90 - itemAngle
          )}deg)`,
        }"
      >
        <div
          class="content"
          :class="{ 'horizontal-content': horizontalContent }"
          :style="{
            transform: `skewY(${90 - itemAngle}deg) rotate(${
              itemAngle / 2
            }deg)`,
            background: item.background,
            opacity: item.opacity,
          }"
        >
          <span v-html="item.htmlContent"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WheelOfFortune",
  emits: ["wheel-start", "wheel-end"],
  props: {
    items: {
      type: Object,
      required: true,
      validator(value) {
        return value.length >= 10;
      },
    },
    colorScheme: {
      type: String,
      default: "light",
      required: true,
    },
    firstItemIndex: {
      type: Object,
      required: false,
      default() {
        return { value: 0 };
      },
    },
    centeredIndicator: {
      type: Boolean,
      required: false,
      default: false,
    },
    indicatorPosition: {
      type: String,
      required: false,
      default: "top",
      validator(value) {
        return ["top", "right", "bottom", "left"].includes(value);
      },
    },
    size: {
      type: Number,
      required: false,
      default: 300,
    },
    displayShadow: {
      type: Boolean,
      required: false,
      default: false,
    },
    duration: {
      type: Number,
      required: false,
      default: 4,
    },
    resultVariation: {
      type: Number,
      required: false,
      default: 0,
      validator(value) {
        return value >= 0 && value <= 100;
      },
    },
    easing: {
      type: String,
      required: false,
      default: "ease",
      validator(value) {
        return ["ease", "bounce"].includes(value);
      },
    },
    counterClockwise: {
      type: Boolean,
      required: false,
      default: false,
    },
    horizontalContent: {
      type: Boolean,
      required: false,
      default: false,
    },
    displayBorder: {
      type: Boolean,
      required: false,
      default: false,
    },
    displayIndicator: {
      type: Boolean,
      required: false,
      default: true,
    },
    baseDisplay: {
      type: Boolean,
      required: false,
      default: false,
    },
    baseSize: {
      type: Number,
      required: false,
      default: 100,
    },
    baseDisplayShadow: {
      type: Boolean,
      required: false,
      default: false,
    },
    baseDisplayIndicator: {
      type: Boolean,
      required: false,
      default: false,
    },

    baseBackground: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      itemSelected: null,
      processingLock: false,
    };
  },
  computed: {
    itemAngle: function () {
      return 360 / this.items.length;
    },
    startingAngle: function () {
      if (this.centeredIndicator) {
        return (
          -1 * this.firstItemIndex.value * this.itemAngle // убрал пол сектора
        );
      } else {
        return -1 * this.firstItemIndex.value * this.itemAngle;
      }
    },
    degreesVariation() {
      if (!this.resultVariation) return 0;

      const halfAngle       = this.itemAngle / 2;
      const variationFactor = this.resultVariation / 100;

      const minDegreesVariation = -halfAngle * variationFactor;
      const maxDegreesVariation =  halfAngle * variationFactor;

      // base random between min and max
      const baseRandom = Math.random() * (maxDegreesVariation - minDegreesVariation)
                      + minDegreesVariation;

      // extra wiggle up to 13°, before or after 50/50
      const signFlip   = Math.random() < 0.5 ? -1 : 1;
      const extraWiggle = Math.random() * 13 * signFlip;

      return Number((baseRandom + extraWiggle).toFixed(2));
    },
    counterClockWiseOperator: function () {
      return this.counterClockwise ? -1 : 1;
    },
  },
  mounted() {
    this.reset();
    document.querySelector(".wheel").addEventListener("transitionend", () => {
      this.processingLock = false;
      this.$emit("wheel-end", this.itemSelected);
    });
  },
  methods: {
    reset() {
      this.itemSelected = null;
      document.querySelector(
        ".wheel"
      ).style.transform = `rotate(${this.startingAngle}deg)`;
    },
    launchWheel() {
      if (this.processingLock && this.itemSelected != null) {
        return;
      }
      this.processingLock = true;
      const totalWeight = this.items.reduce(
        (sum, i) => sum + (i.weight || 0),
        0
      );
      let pointer = Math.random() * totalWeight;
      let wheelResultIndex = this.items.findIndex((i) => {
        pointer -= i.weight || 0;
        return pointer <= 0;
      });
      if (wheelResultIndex < 0) wheelResultIndex = this.items.length - 1;

      const wheelElt = document.querySelector(".wheel");
      this.itemSelected = this.items[wheelResultIndex];

      // spin to that index
      wheelElt.style.transform = `rotate(${
        this.counterClockWiseOperator * (360 * 3) -
        wheelResultIndex * this.itemAngle -
        this.itemAngle / 2 +
        this.degreesVariation
      }deg)`;

      this.$emit("wheel-start");
    },
  },
};
</script>

<style lang="scss">
.wheel-container,
.wheel-base,
.wheel-base-container,
.wheel-base-indicator {
  transition: transform 1s ease-in-out;
}
.wheel-container {
  user-select: none;
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: 50%;
  margin-top: 15%;
  margin-bottom: -20%;
  cursor: grab;
  --border-color: rgb(60, 24, 51);

  &-indicator:before {
    content: "";
    position: absolute;
    z-index: 4;
    width: 0;
    height: 0;
    margin-left: 21.5vh; // half the size of the wheel
    border-left: 10px solid transparent; // the figure of indicator
    border-right: 10px solid transparent;
    border-top: 10px solid var(--border-color);
    transform: translateX(-50%);
  }

  &.indicator-top {
    transform: rotate(0deg);
  }
  &.indicator-right {
    transform: rotate(90deg);
    .wheel-base {
      transform: rotate(-90deg);
    }
  }
  &.indicator-bottom {
    transform: rotate(180deg);
    .wheel-base {
      transform: rotate(-180deg);
    }
  }
  &.indicator-left {
    transform: rotate(270deg);
    .wheel-base {
      transform: rotate(-270deg);
    }
  }

  &-border {
    border: 7px solid var(--border-color);
    // if light theme then white
  }

  &-shadow {
    box-shadow: 5px 5px 15px -5px #000000;
  }
}
.wheel-base-container {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 0.8vh solid var(--border-color);
  // if light theme then white
  transform: translate(-50%, -50%);

  &-shadow {
    box-shadow: 5px 5px 15px -5px #000000;
  }

  .wheel-base {
    position: absolute;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  .wheel-base-indicator {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
  .wheel-base-indicator:before {
    /* &-indicator:before { */
    content: "";
    position: absolute;
    z-index: 1;
    top: -20px;
    margin-left: 45px;
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-bottom: 20px solid black;
    transform: translateX(-50%);
  }
}

.wheel {
  background: white;
  border-radius: 50%;
  margin: auto;
  overflow: hidden;

  &.easing-ease {
    transition: transform cubic-bezier(0.65, 0, 0.35, 1); // ease in out cubic
  }

  &.easing-bounce {
    transition: transform cubic-bezier(0.49, 0.02, 0.52, 1.12);
  }

  &-border:after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
    border-radius: 50%;
    background-image: linear-gradient(
      to left,
      black 33%,
      rgba(255, 255, 255, 0) 0%
    );
    background-position: bottom;
    background-size: 3px 1px;
    /* background:linear-gradient(red,purple,orange); */
    -webkit-mask: radial-gradient(transparent 65%, #000 66%);
    mask: radial-gradient(transparent 65%, #000 66%);
  }

  &-item {
    overflow: hidden;
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 50%;
    transform-origin: 0% 100%;
    border: 1px solid var(--border-color);
  }

  &-item:nth-child(odd) {
    background-color: #9356A0;
  }
  &-item:nth-child(even) {
    background-color: #6D4A96;
  }

  .content {
    position: absolute;
    left: -100%;
    width: 200%; height: 200%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 20px;
    text-align: center;

    &.horizontal-content {
      font-family: Pusia Bold;
      letter-spacing: 1px;
      left: initial;
      right: 55%;
      width: 53%;
      height: 130%;
      align-content: center;
      align-items: center;
      justify-items: center;
      justify-content: center;
      text-align: center;
      span {
        display: block;
        transform: rotate(270deg);
      }
    }
  }
}

</style>
