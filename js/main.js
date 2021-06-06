const ctx = new (window.AudioContext || window.webkitAudioContext)();
const fft = new AnalyserNode(ctx, { fftSize: 2048 });


/*tone_set sets the paramenters for a new tone osc*/
function tone_set (type, pitch, time, duration) {
	const t = time || ctx.currentTime;
	const dur = duration || 1;
	const osc = new OscillatorNode(ctx, {
		type: type || "sine",
		frequency: pitch || 440
	});
	const lvl = new GainNode(ctx, { gain: 0.001 });

	osc.connect(lvl);
	lvl.connect(ctx.destination);
	lvl.connect(fft);
	osc.start(t);
	osc.stop(t + dur);
	adsr({param: lvl.gain, duration: dur, time: t});
}


/*adsr implements the adsr envelope with specified parameters */
function adsr (opts) {
	const param = opts.param;
	const peak = opts.peak || 1;
	const hold = opts.hold || 0.7;
	const time = opts.time || ctx.currentTime;
	const dur = opts.duration || 0.25;
	const a = opts.attack || dur * 0.2;
	const d = opts.decay || dur * 0.1;
	const s = opts.sustain || dur * 0.5;
	const r = opts.release || dur * 0.2;

	const initVal = param.value;
	param.setValueAtTime(initVal, time);
	param.linearRampToValueAtTime(peak, time+a);
	param.linearRampToValueAtTime(hold, time+a+d);
	param.linearRampToValueAtTime(hold, time+a+d+s);
	param.linearRampToValueAtTime(initVal, time+a+d+s+r);
}

/*get_random produces a random integer number between min and max */
function get_random(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

/*  =========== Constants and variables ============= */
const start_time = 1;
const major = [0, 2, 4, 5, 7, 9, 11, 12];
const minor = [0, 2, 3, 5, 7, 8, 10, 12];
const tempo = 80 * 2 // bpm
const beat = 60/tempo;
const beatLengths = [beat, beat/3, beat/2, beat*2];
const bar  = beat * 4;
const base = [440, 329, 349, 392]; //contains F G E A
let start_node_i = get_random(0,3);
let start_node = base[start_node_i];
console.log(start_node);
const scale = minor;
const notes = [
	0, 0, 2, 2, 4, 4, 2, 2, 0, 0
]
let end_time = 0.0;
const A_harm = [0,3,7,10]; 
const F_harm = [0,4,7,11]; 
const G_harm = [0,3,7,12]; 
const E_harm = [0,3,7,10];
const arrA = [0, 1, 3];
const arrF = [0, 2, 4];
const arrG = [0, 2, 3];
const arrE = [0, 1, 3];
/*  =========== Constants and variables ============= */



/*step function returns the frequency of the not that is n steps up the root 
frequency*/
function step (root, steps) {
	let tr2 = Math.pow(2, 1 / 12);
	let rnd = root * Math.pow(tr2, steps);
	return Math.round(rnd * 100) / 100;
}


/*harmony_first function returns the frequency of the first harmony note 
frequency of a given root note*/
function harmony_first (root) {
  return step(root, 4);
}

/*harmony_second function returns the frequency of the first harmony note 
frequency of a given root note*/
function harmony_second (root) {
  return step(root, 8);
}

function count_step(root_note, new_note) {
	let c = Math.pow(2, 1 / 12);
	let div = new_note / root_note;
	return Math.round(Math.log(div) / Math.log(c));
}

/*minor_tf returns true if a root is in the minor, false if not*/
function minor_tf(root) {
	steps = count_step(440,root);
	if (steps > 0) {
		while (steps >= 12) {
			steps -= 12;
		}
	} else {
		while (steps < 0) {
			steps += 12;
		}
	}
	for (let i = 0; i < major.length; i += 1) {
		if (steps == minor[i]) {
			return true;
		}
	}
	return false;
}

/*major_step steps only to major keyes*/ 
function minor_step (root, steps) {
	let i = 0;
	let new_note = step(root, 0);
	while (i < steps) {
		new_note = step(new_note,1);
		if (minor_tf(new_note)) {
			i += 1;
		}
	}
	return new_note;
}

/*beat_play function creates the background beat with given number of bars*/
function beat_play(num_bars, start_beat_time) {
	let flag = 0;
	for(let i = 0; i < num_bars * 4; i++) {
		const finished_beats = i * beat;
		const time = finished_beats + start_beat_time;
		end_time = time + 1/4;
		if (flag % 4 == 0 || flag % 4 == 1) {
			tone_set('triangle', 130, time, beat/2);
		} else if (flag % 4 == 2){
			tone_set('triangle', 220, time, beat/4);
		}
		flag += 1;
	}
}


/*plays harmony of 4 or 3 notes with given root and start time*/
function harmony_4_3_play (root, harmony_start_time, repeat) {
	len = repeat;

	let in_one_scale = count_step(440, root) % 12;
	if (in_one_scale < 0) {
		in_one_scale += 12;
	} else if (in_one_scale >= 12) {
		in_one_scale -= 12;
	}


	if (in_one_scale == 0) {//A
		for (let i = 0; i < len; i += 1) { 
			const steps = A_harm[i];
			tone_set('sine', step(root, steps), harmony_start_time, beat/2);
		}
	} else if (in_one_scale == 8 ) { //F
		for (let i = 0; i < len; i += 1) {
			const steps = F_harm[i];
			tone_set('sine', step(root, steps), harmony_start_time, beat/2);
		}
	} else if (in_one_scale == 10 ) { //G
		for (let i = 0; i < len; i += 1) {
			const steps = G_harm[i];
			tone_set('sine', step(root, steps), harmony_start_time, beat/2);
		}
	} else if (in_one_scale == 7) { //G E
		for (let i = 0; i < len; i += 1) {
			const steps = E_harm[i];
			tone_set('sine', step(root, steps), harmony_start_time, beat/2);
		}
	}


}



/*scale_3_play plays 3 consecutive minor notes and goes back to original note */
function scale_3_play(root_note, start_s3p_time, arr){
	const time = start_s3p_time;
	let i = 0;
	let j = 0;
	for (; i < arr.length; i += 1) {
		tone_set('sine', step(root_note, arr[i]), time + beat * i, beat/2);
		if (i == arr.length - 1) {
			for (; j < 3; j += 1) {
				harmony_4_3_play(root_note, time + beat * i + beat * j, 4);
			}
		}
	}
	harmony_4_3_play(root_note, time + beat * (i + j + 1) , 3);
}

/*node_to_arr conncects the 4 harmony root frequencies to their arrays*/
function node_to_arr(freq) {
	if (freq == 329) {
		return arrE;
	} else if (freq == 440) {
		return arrA;
	} else if (freq == 349) {
		return arrF;
	} else if (freq == 392) {
		return arrG;
	}
}

/*jump1 performs a pattern of keys*/ 
function jump1(root, start_time) {
	tone_set('sine', minor_step(root, 0), start_time, beat/4);
	tone_set('sine', minor_step(root, 4), start_time + beat * 0.5, beat/2);
	tone_set('sine', minor_step(root, 4), start_time + beat * 1, beat);
	tone_set('sine', minor_step(root, 2), start_time + beat * 1.5, beat/4);
	tone_set('sine', minor_step(root, 3), start_time + beat * 2, beat/2);
	tone_set('sine', minor_step(root, 2), start_time + beat * 2.5, beat/2);
	tone_set('sine', minor_step(root, 1), start_time + beat * 3, beat/2);
	tone_set('sine', minor_step(root, 0), start_time + beat * 3.5, beat/2);
}


/*jump2 performs a pattern of keys*/ 
function jump2(root, start_time, j) {
	tone_set('sine', minor_step(root, 0), start_time, beat/8);
	tone_set('sine', minor_step(root, j), start_time + beat * 0.5, beat);
	tone_set('sine', minor_step(root, 0), start_time + beat * 1.5, beat/8);
	tone_set('sine', minor_step(root, j), start_time + beat * 2, beat);
	tone_set('sine', minor_step(root, 0), start_time + beat * 3, beat/8);
	tone_set('sine', minor_step(root, j), start_time + beat * 3.5, beat);
}

/*jump3 performs a pattern of keys*/ 
function jump3(root, start_time) {
	tone_set('sine', minor_step(root, 0), start_time, beat/4);
	tone_set('sine', minor_step(root, 4), start_time + beat * 0.5, beat/2);
	tone_set('sine', minor_step(root, 4), start_time + beat * 1, beat);
	tone_set('sine', minor_step(root, 2), start_time + beat * 1.5, beat/4);
	tone_set('sine', minor_step(root, 3), start_time + beat * 2, beat/2);
	tone_set('sine', minor_step(root, 2), start_time + beat * 2.5, beat/2);
	tone_set('sine', minor_step(root, 1), start_time + beat * 3, beat/2);
	tone_set('sine', minor_step(root, -1), start_time + beat * 3.5, beat/2);
	tone_set('sine', minor_step(root, 3), start_time + beat * 3, beat/2);
	tone_set('sine', minor_step(root, -1), start_time + beat * 3.5, beat/2);
	tone_set('sine', minor_step(root, 0), start_time, beat/4);
}

/*intro performs a pattern of keys*/ 
function intro(root, start_time) {
	tone_set('sine', minor_step(root, 0), start_time, beat/4);
	tone_set('sine', minor_step(root, 1), start_time + beat * 1, beat/2);
	tone_set('sine', minor_step(root, 0), start_time + beat * 2, beat/4);
	tone_set('sine', minor_step(root, 1), start_time + beat * 2 + bar, beat * 2);
	tone_set('sine', minor_step(root, 0), start_time + beat * 4 + bar, beat/2);
}

/*time arrangement for the whole song */
function whole_song() {
	root = minor_step(440, get_random(-22,22));
	intro(root, start_time);
	intro(root, start_time + bar * 2 + beat * 4);
	jump2(root, start_time + bar * 5 + beat * 8, 3);
	jump2(minor_step(root,1), start_time + bar * 7 + beat * 8, 3);
	scale_3_play(start_node, start_time + bar * 5 + beat * 8, node_to_arr(start_node));
	scale_3_play(base[(start_node_i + 1) % 4], start_time + bar * 7 + beat * 8, node_to_arr(start_node));
	jump1(root, start_time + bar * 9 + beat * 8);
	
}


/*starts to play the whole song */
whole_song();
beat_play(bar * 8 + 5 * beat,start_time);
createWaveCanvas({ element: 'section', analyser: fft });
createFrequencyCanvas({
	element:'section',
	analyser:fft,
	scale:5,
	color:'magenta'
});
