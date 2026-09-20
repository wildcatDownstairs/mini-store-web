<script setup>
defineProps({ kind: String, dark: Boolean });
</script>
<template>
  <svg
    viewBox="0 0 320 280"
    aria-hidden="true"
    class="product-art"
    :style="{
      '--object': dark ? '#3a5353' : '#c3c2a0',
      '--object-light': dark ? '#66817b' : '#e6e3c4',
    }"
  >
    <ellipse cx="163" cy="243" rx="86" ry="11" fill="#233d36" opacity=".10" />
    <g v-if="kind === 'lamp'">
      <path d="M150 105h20v128h-20z" fill="var(--object)" />
      <ellipse cx="160" cy="236" rx="59" ry="9" fill="var(--object)" />
      <path d="M68 116a92 92 0 0 1 184 0z" fill="var(--object-light)" />
      <path d="M68 116h184v11H68z" fill="var(--object)" />
      <ellipse cx="160" cy="127" rx="91" ry="5" fill="#f5ecd1" />
      <path
        d="M87 103a76 76 0 0 1 50-67"
        fill="none"
        stroke="white"
        stroke-opacity=".3"
        stroke-width="7"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="kind === 'headphones'" transform="rotate(-12 160 140)">
      <path
        d="M78 151V115a82 82 0 0 1 164 0v36"
        stroke="#303d3d"
        stroke-width="24"
        fill="none"
      />
      <path
        d="M82 109a78 78 0 0 1 156 0"
        stroke="#677371"
        stroke-width="13"
        fill="none"
      />
      <rect x="66" y="132" width="49" height="93" rx="22" fill="#263332" />
      <rect x="205" y="132" width="49" height="93" rx="22" fill="#263332" />
      <rect x="67" y="144" width="31" height="65" rx="15" fill="#53645e" />
      <rect x="222" y="144" width="31" height="65" rx="15" fill="#53645e" />
    </g>
    <g v-else-if="kind === 'bag'">
      <path
        d="M116 103V70a44 44 0 0 1 88 0v34"
        fill="none"
        stroke="#a68c67"
        stroke-width="13"
      />
      <path d="m84 90 151 5 13 143-173-2z" fill="var(--object-light)" />
      <path d="m84 90 18 7-10 129 156 12-173-2z" fill="#ab9a73" opacity=".45" />
      <path d="m117 94-5 53m90-53 5 53" stroke="#b6a17d" stroke-width="7" />
      <rect x="137" y="159" width="46" height="25" rx="2" fill="#f8f5e8" />
      <text
        x="160"
        y="175"
        text-anchor="middle"
        fill="#74755c"
        font-family="serif"
        font-size="12"
      >
        nami
      </text>
    </g>
    <g v-else-if="kind === 'mug'">
      <ellipse cx="157" cy="222" rx="60" ry="15" fill="#8b9d90" />
      <path
        d="M211 124h19c47 0 38 69-6 69h-14"
        stroke="#9daa9c"
        stroke-width="15"
        fill="none"
      />
      <path d="M91 110h128l-9 105c-3 24-105 24-110 0z" fill="var(--object)" />
      <ellipse cx="155" cy="110" rx="64" ry="17" fill="var(--object-light)" />
      <ellipse cx="155" cy="111" rx="51" ry="11" fill="#665342" />
      <path
        d="m108 130 5 72"
        stroke="white"
        stroke-opacity=".25"
        stroke-width="9"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="kind === 'kettle'">
      <path
        d="M200 113c69-38 81 67 10 68"
        fill="none"
        stroke="#344c47"
        stroke-width="14"
      />
      <path d="M105 123 80 106 48 75 61 118l37 51" fill="#536b60" />
      <path d="M114 93h80l26 119c5 29-132 31-128 1z" fill="#536b60" />
      <ellipse cx="154" cy="97" rx="44" ry="10" fill="#8d9b85" />
      <rect x="144" y="75" width="20" height="19" rx="6" fill="#40564e" />
    </g>
    <g v-else-if="kind === 'tea' || kind === 'coffee'">
      <path
        d="M105 55h113l10 180H94z"
        :fill="kind === 'tea' ? '#91a37e' : '#bb9572'"
      />
      <path d="M105 55h113v17H104z" fill="#283d30" opacity=".25" />
      <rect x="111" y="98" width="96" height="93" fill="#f8f2df" />
      <text
        x="159"
        y="132"
        text-anchor="middle"
        font-family="serif"
        font-size="23"
        fill="#426447"
      >
        {{ kind === "tea" ? "森の茶" : "山 岚" }}
      </text>
      <path d="M131 150h56m-43 10h29" stroke="#85916d" />
      <text x="158" y="178" text-anchor="middle" font-size="9" fill="#6d7455">
        MORI PANTRY
      </text>
    </g>
    <g v-else-if="kind === 'keyboard'" transform="rotate(-12 160 145)">
      <rect x="29" y="86" width="263" height="132" rx="12" fill="#747c8b" />
      <rect x="27" y="78" width="263" height="129" rx="12" fill="#e2dfd7" />
      <g v-for="row in 4" :key="row">
        <rect
          v-for="col in 10"
          :key="col"
          :x="19 + col * 25"
          :y="66 + row * 26"
          width="20"
          height="20"
          rx="3"
          :fill="col === 10 ? '#dd8a69' : '#faf8ef'"
        />
      </g>
      <rect x="102" y="170" width="117" height="20" rx="3" fill="#beb7a8" />
    </g>
    <g v-else-if="kind === 'shirt'">
      <path
        d="m117 52-58 30-28 60 46 24 20-30-10 103h146l-10-103 20 30 46-24-28-60-58-30-42 19z"
        fill="var(--object-light)"
      />
      <path d="m117 52 42 19 44-19-20 45-23-17-22 17z" fill="var(--object)" />
      <path d="M160 81v157" stroke="#a9af9b" stroke-width="2" />
      <circle
        v-for="y in [110, 139, 168, 197, 223]"
        :key="y"
        cx="166"
        :cy="y"
        r="2"
        fill="#939b84"
      />
    </g>
    <g v-else-if="kind === 'speaker'">
      <rect x="84" y="66" width="150" height="170" rx="38" fill="#c08866" />
      <rect x="94" y="77" width="130" height="144" rx="30" fill="#ddb18e" />
      <path
        v-for="i in 13"
        :key="i"
        :d="`M107 ${85 + i * 9}h103`"
        stroke="#af7c5e"
        stroke-width="2"
        stroke-dasharray="2 4"
      />
      <path
        d="M130 68V47h65v23"
        fill="none"
        stroke="#8c684d"
        stroke-width="9"
      />
    </g>
    <g v-else-if="kind !== 'package'">
      <rect x="94" y="98" width="72" height="139" rx="15" fill="#d4b595" />
      <rect x="114" y="62" width="34" height="39" rx="4" fill="#45564b" />
      <rect x="112" y="61" width="66" height="10" rx="3" fill="#45564b" />
      <rect x="177" y="136" width="50" height="101" rx="9" fill="#e1d5b8" />
      <rect x="183" y="123" width="38" height="20" fill="#bdaa80" />
      <rect x="102" y="143" width="56" height="53" fill="#f7efe2" />
      <text
        x="130"
        y="174"
        text-anchor="middle"
        font-family="serif"
        fill="#60745e"
      >
        KINU
      </text>
    </g>
    <g v-if="kind === 'package'" fill="none" stroke="#537168" stroke-width="3">
      <path d="M80 110 160 70 240 110 240 215 160 255 80 215Z" fill="#e4ddc8" />
      <path d="M80 110 160 150 240 110M160 150V255M120 90 200 130V175" />
      <path d="M98 187 133 204" />
    </g>
  </svg>
</template>
