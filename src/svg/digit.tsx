import React from "react"

interface Props {
  digit: string
  className?: string
  fill?: string
}

export default function DigitSVG({ digit, className = 'icon', fill = 'var(--primaryIconColor)' }: Props): React.JSX.Element {
  if (digit === '0') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 18.41 26.31">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-111.63261,-62.495585)">    <path d="m 120.83576,88.80492 q -2.82253,0 -4.89238,-1.607983 -2.05274,-1.625089 -3.18175,-4.567356 -1.12901,-2.942267 -1.12901,-6.962224 0,-4.037063 1.12901,-6.97933 1.12901,-2.959373 3.18175,-4.567356 2.06985,-1.625089 4.89238,-1.625089 2.82252,0 4.89237,1.625089 2.06985,1.607983 3.18176,4.567356 1.129,2.942267 1.129,6.97933 0,4.019957 -1.129,6.962224 -1.11191,2.942267 -3.18176,4.567356 -2.06985,1.607983 -4.89237,1.607983 z m 0,-2.736992 q 1.9501,0 3.35281,-1.248753 1.41982,-1.265859 2.17249,-3.592302 0.76978,-2.326444 0.76978,-5.559516 0,-3.250178 -0.76978,-5.576622 -0.75267,-2.343549 -2.17249,-3.592302 -1.40271,-1.265859 -3.35281,-1.265859 -1.95011,0 -3.36992,1.265859 -1.40271,1.248753 -2.17249,3.592302 -0.75267,2.326444 -0.75267,5.576622 0,3.233072 0.75267,5.559516 0.76978,2.326443 2.17249,3.592302 1.41981,1.248753 3.36992,1.248753 z" aria-label="0"></path>  </g></svg>
  )

  if (digit === '1') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 9.34 25.49">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-108.88325,-60.248789)">    <path d="m 118.22323,60.24879 v 25.48824 h -2.97648 V 63.430543 h -0.0171 l -6.3464,4.208126 v -3.147541 l 6.36351,-4.242338 z" aria-label="1"></path>  </g></svg>
  )

  if (digit === '2') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 16.75 25.9">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-110.88592,-55.372778)">    <path d="m 110.88592,81.271568 v -2.583036 l 9.06629,-8.279402 q 1.62509,-1.488239 2.63435,-2.617248 1.02637,-1.12901 1.50535,-2.2067 0.47897,-1.077691 0.47897,-2.377762 0,-1.573771 -0.63293,-2.719887 -0.63293,-1.146115 -1.79615,-1.761938 -1.16322,-0.615824 -2.78831,-0.615824 -1.74483,0 -2.97648,0.735567 -1.21454,0.718461 -1.86458,2.052744 -0.65003,1.317178 -0.65003,3.130435 h -2.87384 q 0,-2.548824 1.02637,-4.498931 1.04348,-1.950107 2.92516,-3.044904 1.88168,-1.111903 4.39629,-1.111903 2.39487,0 4.22523,0.99216 1.83037,0.975053 2.87385,2.719886 1.04347,1.727726 1.04347,4.002851 0,1.642195 -0.59871,3.096223 -0.59872,1.436921 -1.83037,2.890948 -1.21454,1.454027 -3.09622,3.164647 l -6.8938,6.26087 v 0.03421 h 12.57306 v 2.736992 z" aria-label="2"></path>  </g></svg>
  )

  if (digit === '3') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 17.79 26.31">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-107.54371,-53.128146)">    <path d="m 116.50736,79.437481 q -2.63436,0 -4.65289,-1.060585 -2.01853,-1.077691 -3.16465,-2.976479 -1.14611,-1.898788 -1.14611,-4.379188 h 3.11333 q 0,1.796152 0.68424,3.079117 0.68425,1.282965 1.98432,1.967213 1.30007,0.667142 3.11333,0.667142 1.74483,0 3.06201,-0.598717 1.33429,-0.598717 2.06985,-1.693514 0.75268,-1.111903 0.75268,-2.600143 0,-1.368496 -0.804,-2.377762 -0.78688,-1.009266 -2.2067,-1.57377 -1.4027,-0.564505 -3.28439,-0.564505 h -2.05274 v -2.736992 h 2.05274 q 1.6422,0 2.87385,-0.513186 1.24875,-0.513186 1.933,-1.436921 0.70135,-0.940841 0.70135,-2.189594 0,-1.436921 -0.65004,-2.463293 -0.65003,-1.043478 -1.83036,-1.590877 -1.16322,-0.564504 -2.7541,-0.564504 -1.62509,0 -2.80541,0.615823 -1.16323,0.615823 -1.79616,1.761939 -0.63293,1.146115 -0.63293,2.754098 h -2.97647 q 0,-2.309337 1.04347,-4.071276 1.06059,-1.779045 2.90806,-2.771205 1.86457,-0.992159 4.27655,-0.992159 2.34355,0 4.20812,0.923735 1.86458,0.923734 2.94227,2.531717 1.07769,1.607983 1.07769,3.69494 0,1.933001 -1.23164,3.438346 -1.21455,1.48824 -3.35282,2.138276 v 0.05132 q 1.62509,0.273699 2.82252,1.111903 1.21454,0.838204 1.88169,2.086957 0.66714,1.231646 0.66714,2.736992 0,2.223806 -1.16322,3.951533 -1.14612,1.71062 -3.14755,2.685673 -1.98432,0.957948 -4.51603,0.957948 z" aria-label="3"></path>  </g></svg>
  )

  if (digit === '4') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 19.86 25.49">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-116.39007,-54.746973)">    <path d="m 116.39008,74.076982 v -2.531718 l 12.19672,-16.79829 h 1.88168 v 3.455453 h -1.09479 l -9.49395,13.10335 v 0.03421 h 16.37064 v 2.736993 z m 13.01782,6.158232 V 73.324309 72.126875 54.746974 h 2.94227 v 25.48824 z" aria-label="4"></path>  </g></svg>
  )

  if (digit === '5') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 17.29 25.83">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-112.88932,-54.313334)">    <path d="m 121.6648,80.143699 q -2.44619,0 -4.3963,-1.009266 -1.9501,-1.026372 -3.11332,-2.771205 -1.16323,-1.744832 -1.26586,-3.951532 h 3.07911 q 0.13685,1.436921 0.88953,2.56593 0.76977,1.129009 2.00142,1.779045 1.24875,0.650035 2.80542,0.650035 1.6593,0 2.89095,-0.769779 1.24875,-0.769779 1.9501,-2.104062 0.70136,-1.35139 0.70136,-3.079117 0,-1.727726 -0.66714,-3.06201 -0.66715,-1.334283 -1.86458,-2.086956 -1.19743,-0.769779 -2.78831,-0.769779 -2.10406,0 -3.60941,0.85531 -1.50535,0.838204 -2.10406,2.463293 h -2.95938 l 0.85531,-14.540272 h 14.71134 v 2.736993 h -11.92302 l -0.61583,8.262295 h 0.0342 q 1.21454,-1.300071 2.70278,-1.915895 1.48824,-0.632929 3.2844,-0.632929 1.76193,0 3.21596,0.632929 1.45403,0.63293 2.49751,1.796152 1.06058,1.163221 1.62509,2.754098 0.58161,1.573771 0.58161,3.472559 0,2.56593 -1.07769,4.533143 -1.06059,1.967214 -2.97648,3.079117 -1.9159,1.111903 -4.46472,1.111903 z" aria-label="5"></path>  </g></svg>
  )

  if (digit === '6') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 17.38 26.31">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-110.08977,-57.582606)">    <path d="m 118.95079,83.891941 q -2.12117,0 -3.76337,-0.803992 -1.64219,-0.803991 -2.78831,-2.343549 -1.12901,-1.556665 -1.72772,-3.797577 -0.58162,-2.240912 -0.58162,-5.131861 0,-3.215965 0.5474,-5.833214 0.5474,-2.617249 1.67641,-4.498931 1.14612,-1.881682 2.89095,-2.890948 1.76194,-1.009266 4.15681,-1.009266 2.2238,0 3.90021,0.85531 1.69351,0.838204 2.71989,2.360656 1.04347,1.522452 1.28296,3.55809 h -3.01069 q -0.35923,-1.84747 -1.57377,-2.942267 -1.19743,-1.094797 -3.13044,-1.094797 -2.2067,0 -3.66072,1.265859 -1.43692,1.265859 -2.15538,3.489665 -0.70136,2.2067 -0.70136,5.063436 h 0.0342 q 0.58161,-0.99216 1.55667,-1.71062 0.99216,-0.735567 2.2238,-1.12901 1.24876,-0.410549 2.61725,-0.410549 2.30934,0 4.10549,1.111904 1.81326,1.094796 2.85674,3.010691 1.04348,1.898788 1.04348,4.327869 0,2.514612 -1.0948,4.447612 -1.07769,1.933001 -2.99359,3.027798 -1.91589,1.077691 -4.4305,1.077691 z m 0,-2.736992 q 1.53956,0 2.78831,-0.76978 1.26586,-0.786885 2.00142,-2.104062 0.75268,-1.334284 0.75268,-2.942267 0,-1.607983 -0.71846,-2.890948 -0.71846,-1.300071 -1.95011,-2.052744 -1.23165,-0.769779 -2.77121,-0.769779 -1.16322,0 -2.18959,0.444761 -1.00927,0.444761 -1.77904,1.231646 -0.76978,0.786886 -1.21454,1.830364 -0.42766,1.043478 -0.42766,2.240912 0,1.590877 0.73557,2.908055 0.75267,1.317177 2.00142,2.104062 1.24876,0.76978 2.77121,0.76978 z" aria-label="6"></path>  </g></svg>
  )

  if (digit === '7') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 16.35 25.49">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-109.22548,-59.894438)">    <path d="m 110.98742,85.382683 11.49537,-22.734142 v -0.01711 h -13.25731 v -2.736992 h 16.35353 v 2.908054 l -11.35852,22.580186 z" aria-label="7"></path>  </g></svg>
  )

  if (digit === '8') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 17.31 26.31">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-109.37245,-57.318026)">    <path d="m 118.02819,83.627361 q -2.53172,0 -4.48183,-0.923735 -1.9501,-0.923735 -3.06201,-2.548824 -1.1119,-1.625089 -1.1119,-3.712046 0,-1.71062 0.71846,-3.113328 0.73557,-1.419815 1.96722,-2.326444 1.24875,-0.923735 2.78831,-1.111903 v 0.01711 q -1.98432,-0.35923 -3.26729,-1.915894 -1.28296,-1.573771 -1.28296,-3.831789 0,-1.967214 1.00926,-3.506772 1.00927,-1.556664 2.7541,-2.446186 1.74483,-0.889523 3.96864,-0.889523 2.2067,0 3.95153,0.889523 1.74483,0.889522 2.73699,2.446186 1.00927,1.539558 1.00927,3.506772 0,2.240912 -1.28296,3.814683 -1.28297,1.57377 -3.23308,1.933 v -0.01711 q 1.53956,0.188168 2.77121,1.111903 1.24875,0.923735 1.96721,2.34355 0.73557,1.402708 0.73557,3.096222 0,2.086957 -1.11191,3.712046 -1.1119,1.625089 -3.06201,2.548824 -1.9501,0.923735 -4.48182,0.923735 z m 0,-2.736992 q 1.71062,0 2.95937,-0.564505 1.26586,-0.564505 1.95011,-1.590877 0.70135,-1.043478 0.70135,-2.42908 0,-1.436921 -0.71846,-2.548824 -0.71846,-1.111903 -1.98432,-1.744833 -1.26586,-0.632929 -2.90805,-0.632929 -1.6422,0 -2.92516,0.632929 -1.26586,0.63293 -2.00143,1.744833 -0.71846,1.111903 -0.71846,2.548824 0,1.385602 0.70136,2.42908 0.70135,1.026372 1.96721,1.590877 1.26586,0.564505 2.97648,0.564505 z m 0,-12.145403 q 1.40271,0 2.46329,-0.547399 1.06059,-0.547398 1.6593,-1.539558 0.59872,-0.99216 0.59872,-2.292231 0,-1.300071 -0.59872,-2.275125 -0.58161,-0.975053 -1.64219,-1.522452 -1.06059,-0.547398 -2.4804,-0.547398 -1.41982,0 -2.49751,0.547398 -1.06058,0.547399 -1.6593,1.522452 -0.59871,0.975054 -0.59871,2.275125 0,1.300071 0.59871,2.292231 0.59872,0.975054 1.67641,1.539558 1.07769,0.547399 2.4804,0.547399 z" aria-label="8"></path>  </g></svg>
  )

  if (digit === '9') return (
    <svg className={className} fill={fill} xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg1" viewBox="0 0 17.38 26.31">  <defs id="defs1"></defs>  <g id="layer1" transform="translate(-110.88354,-61.818823)">    <path d="m 118.92344,88.128162 q -2.2067,0 -3.91732,-0.838204 -1.71062,-0.85531 -2.7712,-2.377762 -1.04348,-1.539558 -1.28297,-3.55809 h 3.0107 q 0.35923,1.84747 1.59087,2.942267 1.23165,1.094797 3.16465,1.094797 2.2067,0 3.64362,-1.265859 1.45403,-1.265859 2.17249,-3.489665 0.71846,-2.223806 0.71846,-5.063436 h -0.0342 q -0.58161,0.975054 -1.55667,1.676408 -0.95795,0.701354 -2.18959,1.077691 -1.21454,0.35923 -2.58304,0.35923 -2.29223,0 -4.10549,-1.077691 -1.81325,-1.094797 -2.85673,-2.993585 -1.04348,-1.898788 -1.04348,-4.310763 0,-2.514612 1.07769,-4.430506 1.0948,-1.915895 3.01069,-2.976479 1.933,-1.077691 4.43051,-1.077691 2.12117,0 3.76336,0.803992 1.6422,0.803991 2.77121,2.360655 1.14611,1.539559 1.72772,3.780471 0.59872,2.240912 0.59872,5.13186 0,3.215966 -0.5645,5.833215 -0.56451,2.617249 -1.71062,4.498931 -1.14612,1.881682 -2.90806,2.890948 -1.76194,1.009266 -4.15681,1.009266 z m 0.37634,-12.179615 q 1.16322,0 2.17249,-0.427655 1.02637,-0.444762 1.79615,-1.214541 0.76978,-0.786885 1.19743,-1.813257 0.44476,-1.026372 0.44476,-2.223806 0,-1.607983 -0.75267,-2.890948 -0.73556,-1.300072 -1.98432,-2.052745 -1.24875,-0.769779 -2.7712,-0.769779 -1.53956,0 -2.80542,0.769779 -1.24875,0.752673 -2.00142,2.052745 -0.73557,1.300071 -0.73557,2.92516 0,1.607983 0.71846,2.890948 0.71846,1.265859 1.95011,2.018532 1.24875,0.735567 2.7712,0.735567 z" aria-label="9"></path>  </g></svg>
  )

  return <></>
}