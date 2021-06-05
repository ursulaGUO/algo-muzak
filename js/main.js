const ctx = new (window.AudioContext || window.webkitAudioContext)();
const ctx1 = new (window.AudioContext || window.webkitAudioContext)();
const ctx2 = new (window.AudioContext || window.webkitAudioContext)();


function play_tone(time, duration, volume) {
  const t = time || ctx1.currentTime;
  const dur = duration || 0.25;
  const vol = volume || 0.2;
  const param = {
    type: 'sawtooth',
    frequency: 440
  };
  
  const tone = new OscillatorNode(ctx, param);
  const tone1 = new OscillatorNode(ctx1, param);
  const tone2 = new OscillatorNode(ctx2, param);
  
  
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
  
  
  
  
  // analyzer nodes
  const fft = new AnalyserNode(ctx, { fftSize: 2048 });
  const fft1 = new AnalyserNode(ctx1, { fftSize: 2048 });
  const fft2 = new AnalyserNode(ctx2, { fftSize: 2048 });
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


  for (let i = 0; i < 80; i++) {
    const time = ctx.currentTime + (i/4);
    const i_major = get_random(0,7);
    const i_major_key = minor[i_major];
    const pitch = keys[i_major_key];
    const harmony_key1 = harmony_first(i_major_key);
    const harmony_key2 = harmony_second(i_major_key);
    tone1.frequency.setValueAtTime(keys[harmony_key1], time);
    tone2.frequency.setValueAtTime(keys[harmony_key2], time)
    //const freq = Math.random() * 600 - 150;
    tone.frequency.setValueAtTime(pitch, time);
  }

  // for (let i = 0; i < 4; i ++) {
  //   const time = ctx1.currentTime + 4;
  //   const i_minor = get_random(0,7);
  //   const i_minor_key = minor[i_minor];
  //   const harmony = keys[i_minor_key];
  //   tone1.frequency.setValueAtTime(harmony, time);
  // }
  

  tone.start(ctx.currentTime);
  tone.stop(ctx.currentTime + 20);

  tone1.start(ctx1.currentTime);
  tone1.stop(ctx1.currentTime + 20);

  tone2.start(ctx2.currentTime);
  tone2.stop(ctx2.currentTime + 20);


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
];

//given an index of the key, return a nearest higher harmony note
function harmony_first(index) {
  return (index + 4) % 12;
}

//given an index of the key, return a second higher harmony note
function harmony_second(index) {
  return (index + 8) % 12;
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


