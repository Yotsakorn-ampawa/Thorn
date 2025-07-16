
import React, { useState, useRef } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

export default function PMStudio() {
  const [fileName, setFileName] = useState('');
  const [tempo, setTempo] = useState(120);
  const synth = useRef(new Tone.PolySynth().toDestination());
  const part = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }
    try {
      setFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      if (part.current) part.current.dispose();
      part.current = new Tone.Part((time, note) => {
        synth.current.triggerAttackRelease(note.name, note.duration, time, note.velocity);
      }, midi.tracks[0].notes).start(0);
      Tone.Transport.bpm.value = tempo;
      Tone.Transport.start();
    } catch (err) {
      console.error("Error loading MIDI file:", err);
    }
  };

  const handleTempoChange = (e) => {
    const newTempo = parseInt(e.target.value);
    setTempo(newTempo);
    Tone.Transport.bpm.rampTo(newTempo, 0.5);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h1>🎹 PM Studio</h1>
      <input type="file" accept=".midi,.mid" onChange={handleFileUpload} style={{ marginBottom: '1rem' }} />
      <p>Now Playing: {fileName || "(no file)"}</p>
      <label>Tempo: {tempo} BPM</label>
      <input type="range" min="60" max="200" value={tempo} onChange={handleTempoChange} style={{ width: '100%' }} />
    </div>
  );
}
