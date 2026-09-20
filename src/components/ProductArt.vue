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

    <g v-else-if="kind === 'watch'" transform="rotate(-12 160 140)">
      <rect x="132" y="24" width="56" height="218" rx="19" fill="#728579" />
      <path
        d="M143 30v36m34-36v36M143 212v22m34-22v22"
        stroke="#94a394"
        stroke-width="3"
      />
      <rect x="108" y="70" width="104" height="137" rx="28" fill="#354c46" />
      <rect x="116" y="78" width="88" height="121" rx="22" fill="#dbe2ce" />
      <rect x="212" y="111" width="6" height="22" rx="3" fill="#596b62" />
      <circle cx="160" cy="133" r="30" fill="#b8c7b0" />
      <path
        d="M160 108v25l18 12"
        fill="none"
        stroke="#405a50"
        stroke-width="5"
        stroke-linecap="round"
      />
      <circle cx="160" cy="133" r="4" fill="#405a50" />
      <rect x="143" y="176" width="34" height="5" rx="2" fill="#8fa18a" />
    </g>
    <g v-else-if="kind === 'phone'" transform="rotate(9 160 140)">
      <rect x="106" y="31" width="110" height="207" rx="19" fill="#4b655d" />
      <rect x="113" y="39" width="96" height="190" rx="14" fill="#d8dfca" />
      <circle cx="178" cy="97" r="26" fill="#b8c7ae" />
      <path
        d="M113 156q52-45 96 6v53q0 14-14 14h-68q-14 0-14-14z"
        fill="#92aa93"
      />
      <path
        d="M113 192q49-41 96-7v30q0 14-14 14h-68q-14 0-14-14z"
        fill="#6b8977"
      />
      <rect x="144" y="44" width="34" height="7" rx="4" fill="#4b655d" />
      <path
        d="M144 219h34"
        stroke="#e8ecdf"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="kind === 'earbuds'">
      <rect x="79" y="145" width="166" height="94" rx="35" fill="#c2c9b4" />
      <path d="M80 177h163" stroke="#a1ad99" stroke-width="3" />
      <path d="M80 155v-16c0-55 164-55 164 0v16z" fill="#e4e6d7" />
      <ellipse cx="162" cy="147" rx="67" ry="20" fill="#a9b9a6" />
      <g transform="rotate(-18 119 96)">
        <rect x="108" y="82" width="19" height="65" rx="9" fill="#f5f3e7" />
        <ellipse cx="117" cy="76" rx="26" ry="20" fill="#f5f3e7" />
        <ellipse cx="98" cy="75" rx="8" ry="11" fill="#65776b" />
      </g>
      <g transform="rotate(18 204 96)">
        <rect x="196" y="82" width="19" height="65" rx="9" fill="#f5f3e7" />
        <ellipse cx="204" cy="76" rx="26" ry="20" fill="#f5f3e7" />
        <ellipse cx="222" cy="75" rx="8" ry="11" fill="#65776b" />
      </g>
      <circle cx="162" cy="208" r="3" fill="#698770" />
    </g>
    <g v-else-if="kind === 'laptop'">
      <rect x="64" y="47" width="193" height="138" rx="9" fill="#586761" />
      <path d="M72 55h177v120H72z" fill="#dce3d4" />
      <circle cx="203" cy="94" r="24" fill="#b7c9b0" />
      <path d="M72 143q60-63 177 2v30H72z" fill="#93ab97" />
      <path d="M64 185h193l32 43H32z" fill="#c4c9c0" />
      <path d="M32 228h257l-9 10H42z" fill="#88988e" />
      <path d="M82 192h157l12 18H69z" fill="#9fae9f" />
      <path
        d="M96 193v16m27-16v16m27-16v16m27-16v16m27-16v16m27-16v16M75 201h169"
        stroke="#d5d9cd"
        stroke-width="3"
      />
      <path d="M132 215h56l7 10h-70z" fill="#e5e8dd" />
    </g>
    <g v-else-if="kind === 'mini-pc'">
      <path d="m77 109 120-30 60 40-121 35z" fill="#d9ddcf" />
      <path d="m77 109 59 45v80l-59-44z" fill="#a2b2a3" />
      <path d="m136 154 121-35v80l-121 35z" fill="#bfccb9" />
      <path d="m91 151 31 23m-31-10 31 23" stroke="#7b9180" stroke-width="4" />
      <path d="m154 189 31-9m14-4 12-3" stroke="#566f60" stroke-width="8" />
      <circle cx="239" cy="175" r="4" fill="#678572" />
      <path d="m135 105 25-6 17 12-25 7z" fill="#bdc8b6" />
    </g>
    <g v-else-if="kind === 'desktop'">
      <rect x="207" y="84" width="67" height="154" rx="7" fill="#64796d" />
      <rect x="217" y="96" width="45" height="125" rx="3" fill="#83988a" />
      <circle cx="239" cy="108" r="4" fill="#d8e0cc" />
      <path
        d="M227 132h24m-24 9h24m-24 9h24"
        stroke="#5a7063"
        stroke-width="3"
      />
      <path d="M117 184h18v45h-18z" fill="#82948a" />
      <path d="M89 228h74l9 10H80z" fill="#a9b6aa" />
      <rect x="39" y="57" width="162" height="135" rx="7" fill="#435c51" />
      <rect x="47" y="65" width="146" height="112" rx="2" fill="#d7e0cc" />
      <circle cx="157" cy="96" r="20" fill="#b0c3a7" />
      <path d="M47 145q51-56 146 0v32H47z" fill="#92aa92" />
    </g>
    <g v-else-if="kind === 'dress'">
      <path
        d="m126 49-36 15-28 52 34 18 17-32 4 34-40 99q83 21 166 0l-40-99 4-34 17 32 34-18-28-52-36-15q-34 30-68 0z"
        fill="#d2b9a1"
      />
      <path d="M126 49q34 55 68 0" fill="#f0e1ce" />
      <path d="M117 138h86" stroke="#b69d83" stroke-width="7" />
      <path
        d="m139 143-19 84m42-83v91m23-90 18 82"
        stroke="#bda58c"
        stroke-width="3"
      />
      <path d="m166 137 18 30 13-26-31-4-18 25-10-26z" fill="#b49b81" />
    </g>
    <g v-else-if="kind === 'pants'" transform="rotate(5 160 140)">
      <path d="M106 41h108l15 193-65 1-7-120-19 120-64-5z" fill="#83917c" />
      <path d="M106 41h108l2 17H103z" fill="#657b65" />
      <path
        d="m126 61-6 154m74-154 14 154M157 58v57m-52-45q19 16 32-9m55 0q11 21 23 12"
        fill="none"
        stroke="#a4b198"
        stroke-width="3"
      />
      <circle cx="161" cy="51" r="3" fill="#d7d5b9" />
      <path d="m76 217 63 6m25-1 64-1" stroke="#637862" stroke-width="8" />
    </g>
    <g v-else-if="kind === 'sneakers'">
      <g transform="translate(17 -25) rotate(-10 160 170)" opacity=".65">
        <path
          d="M65 144q15 14 32-10l24-31 38 15 31 45 61 21q19 8 10 29H61z"
          fill="#9dad97"
        />
        <path d="M61 208h202v15H59z" fill="#ede8d7" />
      </g>
      <path
        d="M58 170q31 29 58-18l25-30 37 27 25 38 50 17q24 8 21 27H55z"
        fill="#e4ddc8"
      />
      <path d="M58 170q22 20 33 10l-5 45H55z" fill="#82957f" />
      <path d="m142 143 41 29-16 18-33-30z" fill="#adbaa4" />
      <path
        d="m138 150 28-5m-18 17 29-4m-19 17 28-3"
        stroke="#f8f4e7"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path d="M55 226h220l-3 16H60z" fill="#bdbaaa" />
      <path d="M55 224h220v10H55z" fill="#f3eedf" />
    </g>
    <g v-else-if="kind === 'table'">
      <path d="m91 133 16 106h15l-5-104m85-1-5 105h15l16-106" fill="#9a8061" />
      <path d="M150 116h18v106h-18z" fill="#b59b77" />
      <ellipse cx="160" cy="132" rx="103" ry="35" fill="#b89b77" />
      <ellipse cx="160" cy="122" rx="103" ry="35" fill="#d3ba96" />
      <path
        d="M91 119q67-31 138 0M115 139q47 9 91-2"
        fill="none"
        stroke="#b89b76"
        stroke-width="2"
        opacity=".6"
      />
    </g>
    <g v-else-if="kind === 'bedding'">
      <path d="m84 112 150-4 37 111-177 18-46-22z" fill="#b2bda5" />
      <path d="m48 202 46 18 177-17v17L94 237l-46-22z" fill="#8e9f8a" />
      <path d="m84 108 148-4 12 48-178 14z" fill="#e3e2ca" />
      <rect
        x="98"
        y="78"
        width="117"
        height="57"
        rx="17"
        fill="#f0eedf"
        transform="rotate(-4 156 107)"
      />
      <path
        d="m102 87 102-6m-99 43 104-6"
        stroke="#d0d4be"
        fill="none"
        stroke-width="2"
      />
      <path
        d="m81 173 159-13m-164 30 170-13"
        stroke="#ccd2bc"
        stroke-width="3"
      />
    </g>
    <g v-else-if="kind === 'serum'">
      <rect x="110" y="103" width="101" height="134" rx="18" fill="#b5936a" />
      <path d="M129 104V87h63v17" fill="#927b59" />
      <rect x="133" y="62" width="55" height="31" rx="3" fill="#d9d4bc" />
      <path d="M145 62V42q0-24 16-24t16 24v20z" fill="#556957" />
      <rect x="121" y="145" width="79" height="57" rx="2" fill="#f2ebd8" />
      <path
        d="M161 156v31m0-11q-21 0-18-15 18 0 18 15m0 5q21 0 18-15-18 0-18 15"
        fill="none"
        stroke="#94a184"
        stroke-width="2"
      />
      <path
        d="M120 119v14"
        stroke="#d8bd94"
        stroke-width="5"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="kind === 'cleanser'">
      <path d="M112 51h100l-12 155h-77z" fill="#c1ceb5" />
      <path d="M112 51h100v13H113z" fill="#92aa8c" />
      <rect x="123" y="205" width="77" height="32" rx="5" fill="#718a71" />
      <rect x="128" y="100" width="66" height="67" rx="2" fill="#edf0df" />
      <path d="M161 116q-25 28 0 34 25-6 0-34z" fill="#afc5a5" />
      <path d="M139 180h43" stroke="#8ea685" stroke-width="3" />
    </g>
    <g v-else-if="kind === 'sunscreen'">
      <path d="M106 57h110l-13 144h-85z" fill="#e1c7a0" />
      <path d="M106 57h110v13H107z" fill="#cab08d" />
      <rect x="118" y="200" width="85" height="36" rx="5" fill="#7c9180" />
      <rect x="121" y="92" width="79" height="87" rx="2" fill="#f5edda" />
      <circle cx="160" cy="127" r="16" fill="#cfab74" />
      <path
        d="M160 102v-7m0 64v-7m25-25h7m-64 0h7m7-18-5-5m46 46-5-5m0-36 5-5m-46 46 5-5"
        stroke="#cfab74"
        stroke-width="3"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="kind === 'shampoo'">
      <rect x="102" y="87" width="118" height="151" rx="21" fill="#82967c" />
      <rect x="136" y="59" width="45" height="29" rx="4" fill="#405b4b" />
      <path d="M136 59V45h81v12h-48v4z" fill="#405b4b" />
      <rect x="116" y="130" width="90" height="68" rx="2" fill="#e6e5cd" />
      <path
        d="M160 144v43m0-21q-22 0-22-20 22 0 22 20m0 10q23 0 23-22-23 0-23 22"
        fill="none"
        stroke="#8ca27d"
        stroke-width="3"
      />
      <path
        d="M112 108v13"
        stroke="#acbba0"
        stroke-width="5"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="kind === 'cookies'">
      <path d="M81 76h111l10 152H70z" fill="#98ab82" />
      <path d="M81 76h111l1 13H80z" fill="#7e956a" />
      <rect x="89" y="112" width="96" height="76" fill="#f0ecd8" />
      <circle cx="137" cy="147" r="23" fill="#b2b689" />
      <path
        d="m126 139 4 4m17-11-3 4m-11 18 4-2m12 8 2-4"
        stroke="#7f8d60"
        stroke-width="4"
        stroke-linecap="round"
      />
      <ellipse cx="225" cy="225" rx="43" ry="12" fill="#b1aa7c" />
      <ellipse cx="225" cy="218" rx="43" ry="12" fill="#c4c59a" />
      <ellipse cx="219" cy="206" rx="40" ry="13" fill="#a5af7d" />
      <path
        d="m202 206 5-2m15 5 4-2m9-8 5 1"
        stroke="#75895c"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="kind === 'rice'">
      <path d="M99 57h123l15 179H85z" fill="#cbb891" />
      <path d="M99 57h123v16H98z" fill="#b59e76" />
      <rect x="106" y="105" width="106" height="91" fill="#f1ead5" />
      <path
        d="M157 174v-56m0 23-17-15m17 25 17-15m-17 26-17-15m17 26 17-15"
        fill="none"
        stroke="#9aa17c"
        stroke-width="3"
      />
      <ellipse
        cx="139"
        cy="123"
        rx="5"
        ry="9"
        transform="rotate(-40 139 123)"
        fill="#b8ad7f"
      />
      <ellipse
        cx="175"
        cy="134"
        rx="5"
        ry="9"
        transform="rotate(40 175 134)"
        fill="#b8ad7f"
      />
      <path d="M126 183h67" stroke="#a9a17f" stroke-width="2" />
    </g>
    <g v-else-if="kind === 'skincare'">
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
    <g v-else fill="none" stroke="#537168" stroke-width="3">
      <path d="M80 110 160 70 240 110 240 215 160 255 80 215Z" fill="#e4ddc8" />
      <path d="M80 110 160 150 240 110M160 150V255M120 90 200 130V175" />
      <path d="M98 187 133 204" />
    </g>
  </svg>
</template>
