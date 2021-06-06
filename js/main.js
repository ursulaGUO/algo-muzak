const ctx = new (window.AudioContext || window.webkitAudioContext)();
const ctx1 = new (window.AudioContext || window.webkitAudioContext)();
const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
const beat = new (window.AudioContext || window.webkitAudioContext)();

function adsr (opts) {
  const param = opts.param;
  const peak = opts.peak || 1;
  const hold = opts.hold || 0.8;
  const time = opts.time || ctx.currentTime;
  const dur = opts.duration || 1;
  const a = opts.attack || dur * 0.2;
  const d = opts.decay || dur * 0.2;
  const s = opts.sustain || dur * 0.3;
  const r = opts.release || dur * 0.3;

  const initVal = param.value;
  param.setValueAtTime(initVal, time);
  param.exponentialRampToValueAtTime(peak, time+a);
  param.linearRampToValueAtTime(hold, time+a+d);
  param.exponentialRampToValueAtTime(hold, time+a+d+s);
  param.linearRampToValueAtTime(initVal, time+a+d+s+r);
}

const param_i = {
  type: 'sine',
  frequency: 400
};

const param_beat = {
  type: 'sine',
  frequency: 170
};

function play_tone(time, duration, volume) {
  const t = time || ctx1.currentTime;
  const dur = duration || 0.25;
  const vol = volume || 0.2;
  
  
  const tone = new OscillatorNode(ctx, param_i);
  const tone1 = new OscillatorNode(ctx1, param_i);
  const tone2 = new OscillatorNode(ctx2, param_i);
  const beat_tone = new OscillatorNode(beat, param_beat);
  
  
  // processor nodes
  const lvl = new GainNode(ctx, {
    gain: vol 
  }); 
  const lvl1 = new GainNode(ctx1, {
    gain: vol 
  }); 
  const lvl2 = new GainNode(ctx2, {
    gain: vol 
  }); 
  const beat_lvl = new GainNode(beat, {
    gain: 0.1
  }); 
  
  
  
  
  // analyzer nodes
  const fft = new AnalyserNode(ctx, { fftSize: 2048 });
  const fft1 = new AnalyserNode(ctx1, { fftSize: 2048 });
  const fft2 = new AnalyserNode(ctx2, { fftSize: 2048 });
  const beat_fft = new AnalyserNode(beat, { fftSize: 2048 });
  //const fft1 = new AnalyserNode(ctx1, { fftSize: 2048 });
  
  
  
  // connect and play
  tone.connect(lvl);
  lvl.connect(fft);
  fft.connect(ctx.destination);

  tone1.connect(lvl1);
  lvl1.connect(fft1);
  fft1.connect(ctx1.destination);

  tone2.connect(lvl2);
  lvl2.connect(fft2);
  fft2.connect(ctx2.destination);
  //lvl1.connect(ctx1.destination);
  //fft.connect(ctx.destination);

  beat_tone.connect(beat_lvl);
  beat_lvl.connect(beat_fft);
  beat_fft.connect(beat.destination);


  // for (let i = 0; i < 16;) {
  //   for (let j = 0; j < 13; j++) {
  //     const time = ctx.currentTime + (i/4);
  //     const pitch = keys[j];
  //     const harmony_key1 = harmony_first(j);
  //     const harmony_key2 = harmony_second(j);
  //     tone1.frequency.setValueAtTime(keys[harmony_key1], time);
  //     tone2.frequency.setValueAtTime(keys[harmony_key2], time)
  //     //const freq = Math.random() * 600 - 150;
  //     tone.frequency.setValueAtTime(pitch, time);
  //     i += 1;
  //   }
  // }

  let time_t = 1;
  let i = 0;
  let b = 0;

  //climbing scale up
  while (i < 13) {
    tone1.frequency.setValueAtTime(keys[harmony_first(i)], time_t);
    tone2.frequency.setValueAtTime(keys[harmony_second(i)], time_t);
    tone.frequency.setValueAtTime(keys[i], time_t);
    if (time_t % 1 == 0) {
      beat_tone.frequency.setValueAtTime(200, time_t);
    } else {
      beat_tone.frequency.setValueAtTime(0, time_t);
    }
    i += 1;
    time_t += 1/4;
  }

  
  
  // const p = 0.8 // peak value for all tones
  // const v = 0.7 // sustained value for all tones

  // opt1 = {param: play, peak: p, hold: v};

  // adsr(lvl.gain, p,v, ctx.currentTime);
  // adsr(lvl1.gain, p,v, ctx1.currentTime);
  // adsr(lvl2.gain, p,v, ctx2.currentTime);

  //climb scale down
  let j = 11;
  while (j >= 0) {
    tone1.frequency.setValueAtTime(keys[harmony_first(j)], time_t);
    tone2.frequency.setValueAtTime(keys[harmony_second(j)], time_t);
    tone.frequency.setValueAtTime(keys[j], time_t);
    j -= 1;
    time_t += 1/8;
  }

  tone.start(ctx.currentTime);
  tone.stop(ctx.currentTime + 12);

  tone1.start(ctx1.currentTime);
  tone1.stop(ctx1.currentTime + 12);

  tone2.start(ctx2.currentTime);
  tone2.stop(ctx2.currentTime + 12);

  beat_tone.start(beat.currentTime);
  beat_tone.stop(beat.currentTime + 12);


  createWaveCanvas({ element: 'section', analyser: fft });
  createWaveCanvas({ element: 'section', analyser: fft1 });
  createWaveCanvas({ element: 'section', analyser: fft2 });
}




const major = [0,2,4,5,7,9,11,12];
const minor = [0,2,3,5,7,8,10,12];
const keys = [
  400.0, //0A
  466.0, //1A#
  493.0, //2B
  523.0, //3C
  554.0, //4C#
  587.0, //5D
  622.0, //6D#
  659.0, //7E
  698.0, //8F
  739.0, //9F#
  783.0, //10G   
  830.0, //11G#

  880.0, //12A   
  932.0, //13A#
  987.0, //13B
  1046.0, //14C
  1108.0, //15C#
  1174.0, //16D
  1244.0, //17D#
  1318.0, //18E
  1396.0, //19F
  1479.0, //20F#
  1567.0, //21G
  1661.0, //22g#
];

//const beat = 200;



//given an index of the key, return a nearest higher harmony note
function harmony_first(index) {
  return (index + 3) % 24;
}

//given an index of the key, return a second higher harmony note
function harmony_second(index) {
  return (index + 3) % 24;
}


function step(rootFreq, steps) {
  let tr2 = Math.pow(2,1/12);
  let rnd = rootFeq * Math.pow(tr2,steps);
  return Math.round(rnd * 100) / 100;
}


function get_random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


play_tone();


